/** @odoo-module **/
import index from '../../../data/index.js'
import specialMeal from './specialMeal.js'
// 拿到餐标 => 客户信息 菜品信息 
const data = () => {
    let data = []

    // data.push(...mealPrice())
    for (const play_object of index.plan_day_record_show) {
        const json = play_object['cus_loc_info']
        // 计算总份数
        const obj = {}
        obj['cl1'] = play_object['dinner_type'] == 'dn2' ? '午餐' : play_object['dinner_type'] == 'dn3' ? '晚餐' : play_object['dinner_type'] == 'dn5' ? '夜餐' : '早餐'
        obj['dinner_type'] = play_object['dinner_type']
        let count = 0;
        for (const play_object_item of Object.keys(json)) {
            const item2 = play_object_item.split('_')[1]
            // console.log(item2, json[play_object_item])
            obj[`${item2}`] = json[play_object_item]
            count += json[play_object_item]
        }
        obj['Copies'] = count
        
        // 生成data
        for (const dish_key of index.dish_key) {
            // 获取菜品数据
            // 能拿到dish_key play_object
            // 其他 冻品 鲜肉 半成品
            // console.log(dish_key.material_tag)
            if(play_object.dish_key_id == dish_key.id){
                obj['dish'] = dish_key.name
                
                // 获取类别
                for (const dish_top_category of index.dish_top_category) {
                    if(dish_key.dish_top_category_id == dish_top_category.id){
                        obj['type'] = dish_top_category.name_cn
                        if(dish_top_category.name_cn == "特色" && specialMeal.index <= specialMeal.colors.length){
                            obj['specialMealID'] = specialMeal.index
                            obj['specialMealColor'] = specialMeal.colors[specialMeal.index - 1]
                            specialMeal.index ++
                        }
                    }
                }
                // console.log(play_object.manual_material_qty)
                const d_data = init_dish_detailed(play_object.manual_material_qty, count)
                obj['whole'] = d_data[0]
                obj['dish_key_id'] = {
                    id:dish_key.id,
                    dish_top_category_id:dish_key.dish_top_category_id,
                    material_item: d_data[1]
                }
                
            }
        }
        
        data.push(obj)
    }
    // console.log(data)
    return data
}

//3139803  3507
// 对比用户是否想吃该菜品
const duibi = (cus_loc_id, dish_id, dinner_type) => {
    let obj1 = {}
    let obj2 = {}
    
    // 用户喜好表
    for (const dinner_mode of index.dinner_mode) {
        if(dinner_mode.cus_loc_id == cus_loc_id && dinner_mode.dinner_type == dinner_type){
            obj2 = {...dinner_mode}
        }
    }
    // 菜品表格
    for (const dish_key of index.dish_key) {
        if(dish_key.id == dish_id){
            obj1 = {...dish_key}
        }
    }
    // console.log(obj1, obj2)
    // 判断当前是否什么菜
    // is_fish 鱼
    // is_organ 器官，内脏
    // is_semi_finished 半成品
    // is_fried 油炸
    // is_shrimp 虾
    // is_color_additive 颜色添加剂
    if(obj1['is_fish'] == true && obj2['is_fish'] == false){
        return ['鱼',false]
    }else if(obj1['is_organ'] == true && obj2['is_organ'] == false){
        return ['内脏',false]
    }else if(obj1['is_semi_finished'] == true && obj2['is_semi_finished'] == false){
        return ['半成品',false]
    }else if(obj1['is_fried'] == true && obj2['is_fried'] == false){
        return ['油炸',false]
    }else if(obj1['is_shrimp'] == true && obj2['is_shrimp'] == false){
        return ['虾',false]
    }else if(obj1['is_color_additive'] == true && obj2['is_color_additive'] == false){
        return ['色素',false]
    }else{
        return ['',true]
    }

}
// 厨师长限制
// userId dinner_type
const headHookLimit = (userId, dinner_type, type) => {
    // console.log(type)
    for (const dinner_mode of index.dinner_mode) {
        if(userId == dinner_mode.cus_loc_id && dinner_type == dinner_mode.dinner_type){
            if(type == "特色" || type.includes("特色")){
                return dinner_mode.dinner_qty_upper_limit_ts
            }else if(type == "汤粥"){
                return dinner_mode.dinner_qty_upper_limit_kc + dinner_mode.dinner_qty_upper_limit_ts
            }else{
                return dinner_mode.dinner_qty_upper_limit_kc
            }
        }
    }
    return 0
}

// 加入餐价格
const mealPrice = () => {
    let data = []
    const userIds = Object.keys(index.plan_day_record_show[0]['cus_loc_info']).map(v => v.split('_')[1])
    const dinner_types = [...index.plan_day_record_show.reduce((pre, v) => {
        pre.add(v.dinner_type)
        return pre
    }, new Set())]
    for (const type_item of dinner_types) {
        let obj = {}
        for (const id of userIds) {
            const dinner_mode_data = index.dinner_mode.find(v => v.cus_loc_id == id && type_item == v.dinner_type)
            obj[id] = dinner_mode_data == undefined ? 0 : dinner_mode_data.price
        }
        obj['cl1'] = type_item == 'dn2' ? '午餐' : type_item == 'dn3' ? '晚餐' : type_item == 'dn5' ? '夜餐' : '早餐'
        obj['dinner_type'] = type_item
        obj['edit'] = false
        obj['Copies'] = 0
        obj['whole'] = ""
        obj['type'] = "餐标"
        // obj['specialMealColor'] = "#00000090"
        data.push(obj)
    }
    return data
}


// manual_material_qty_json => 菜品信息
/*
material_id => material_item
unit_id     => material_purchase_unit_category
process_id  => dish_process_category
dish_qty    => 每100份 所需总量
*/
// count => 总量
// 初始化获取菜品详细信息
const init_dish_detailed = (manual_material_qty,count) => {
    // console.log(manual_material_qty)
    // console.log(manual_material_qty_json, count)
    // 获取当前菜品详细配料
    let str = ""
    let arr = []
    for (const json of manual_material_qty) {
        // 查找材料名称
        let obj = {}
        for (const material_item of index.material_item) {
            
            if(material_item.id == json.material_id){
                // console.log(material_item)
                obj = {...material_item}
                obj['material_id'] = material_item.id
                str += material_item.name.split('-')[0]
                break
            }
        }
        // 查找切配方式
        for (const dish_process_category of index.dish_process_category) {
            if(dish_process_category.id == json.process_id){
                obj['process_id'] = dish_process_category.id
                if(dish_process_category.name != '无'){
                    if(str[str.length - 1] != dish_process_category.name){
                        str += dish_process_category.name
                    }
                    
                    obj['dish_process_category_name'] = dish_process_category.name
                }else{
                    obj['dish_process_category_name'] = ''
                }
                break
            }
        }
        str += Math.ceil(json.dish_qty)
        // console.log(json.dish_qty)
        obj['dish_qty'] = Math.ceil(json.dish_qty)
        // 查找单位
        for (const material_purchase_unit_category of index.material_purchase_unit_category) {
            if(material_purchase_unit_category.id == json.unit_id){
                obj['unit_name'] = material_purchase_unit_category.name
                obj['unit_id'] = material_purchase_unit_category.id
                str += material_purchase_unit_category.name + ' '
                break
            }
        }
        // console.log()
        arr.push(obj)
    }
    return [str,arr]
}

// 获取菜品详细信息
const dish_detailed = (dish_key,count) => {
    // 获取当前菜品详细配料
    let str = ""
    let arr = []
    for (const dish_bom of index.dish_bom) {
        if(dish_key.id == dish_bom.dish_key_id){
            // console.log(dish_bom)
            // 获取到当前菜品的原材料数据
            let arr_data = {}
            for (const material_item of index.material_item) {
                if(dish_bom.material_id == material_item.id){
                    // 获取原材料详细信息
                    // console.log(3, material_item)
                    const value = material_item.name.split('-')[0]
                    arr_data = {...material_item}
                    arr_data['material_id'] = material_item.id
                    // arr.push(material_item)
                    str += value
                    break
                }
            }
            for (const dish_process_category of index.dish_process_category) {
                if(dish_process_category.id == dish_bom.process_id){
                    // console.log(123, dish_process_category)
                    arr_data['process_id'] = dish_process_category.id
                    if(dish_process_category.name == "无"){
                        arr_data.dish_process_category_name = "";
                        break;
                    }
                    arr_data.dish_process_category_name = dish_process_category.name
                    
                    if(str[str.length - 1] != dish_process_category.name){
                        str += dish_process_category.name
                    }
                    break;
                }
            }
            
            str += Math.ceil((count * 0.01) * dish_bom.gbom_qty_high)
            arr_data['dish_qty'] = Math.ceil((count * 0.01) * dish_bom.gbom_qty_high)
            for (const material_purchase_unit_category of index.material_purchase_unit_category) {
                if(material_purchase_unit_category.id == dish_bom.unit_id){
                    // console.log(5, material_purchase_unit_category)
                    
                    str += material_purchase_unit_category.name + ' '
                    arr_data['unit_name'] = material_purchase_unit_category.name
                    arr_data['unit_id'] = material_purchase_unit_category.id
                }
            }
            // console.log(arr_data)
            arr.push(arr_data)
        }
    }
    return [str,arr]
}


// 统计配量信息
// 食品原食材如果有数量 则同比增加
// 食品原食材没有数量 则去表中查询
// 用户自添加食材如果有数量 则同比增加
// 用户自添加食材如果没有数量 则不增加
// 两种统计方式，一种为菜品原始食材 一种用户自加食材
/*
{
    material_items: [material_item] => 食材列表
    dish_key_id:    string|number   => 菜品id
    oldCopies:      string|number   => 原份数
    newCopies:      string|number   => 新份数
}
*/
const countMaterialData = ({
    material_items,
    dish_key_id,
    oldCopies,
    newCopies
}) => {
    // console.log(dish_key_id)
    // console.log('111')
    // 选出食品原食材
    const m_arr = []
    const [,arr] = dish_detailed({id:dish_key_id}, newCopies)
    // console.log(material_items, arr)

    for (const item of material_items) {
        // 寻找该食材是否为食品原食材
        const ingredients = arr.find(v => v.id == item.id)
        // 是原食材进入if 不是原食材进入else
        if(ingredients != undefined){
            // 如果原食材没有数量则进入if 有数量则进入else
            if(isNaN(item.dish_qty) || parseInt(item.dish_qty) == 0){
                m_arr.push({...ingredients})
            }else{
                // 增加比例
                const scale = (newCopies - oldCopies) / oldCopies
                item.dish_qty = Math.ceil(parseInt(item.dish_qty) + (parseInt(item.dish_qty) * scale))
                m_arr.push({...item})
            }
        }else{
            // 如果自定义食材没有数量则进入if 否则进入else
            if(isNaN(item.dish_qty) || parseInt(item.dish_qty) == 0){
                item.dish_qty = 0
                m_arr.push({...item})
            }else{
                // 增加比例
                const scale = (newCopies - oldCopies) / oldCopies
                item.dish_qty = Math.ceil(parseInt(item.dish_qty) + (parseInt(item.dish_qty) * scale))
                m_arr.push({...item})
            }
        }
    }
    // whole字段
    const str = m_arr.map(v => {
        const name = v.name.split('-')[0]
        if(name[name.length - 1] == v.dish_process_category_name){
            return v.name.split('-')[0] + v.dish_qty + v.unit_name
        }else{
            return v.name.split('-')[0] + v.dish_process_category_name + v.dish_qty + v.unit_name
        }
        
    }).join(' ')

    return [str, m_arr]
}

// 通过文字，获取菜品
export {
    data,dish_detailed,duibi,headHookLimit,countMaterialData,mealPrice
}

export default {
    data,dish_detailed,duibi,headHookLimit,countMaterialData,mealPrice
}