/** @odoo-module **/
import index from '../../../data/index.js'
const data = () => {
    let data = []
    for (const play_object of index.plan_day_record_show) {
        const json = play_object['cus_loc_info']
        // 计算总份数
        const obj = {}
        obj['cl1'] = play_object['dinner_type'] == 'dn2' ? '午餐' : play_object['dinner_type'] == 'dn3' ? '晚餐' :'夜餐'
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
                    }
                }
                const d_data = init_dish_detailed(play_object.manual_material_qty,count)
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
const headHookLimit = (userId,dinner_type) => {
    for (const dinner_mode of index.dinner_mode) {
        if(userId == dinner_mode.cus_loc_id && dinner_type == dinner_mode.dinner_type){
            return dinner_mode.dinner_qty_upper_limit_kc
        }
    }
    return 0
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
                    str += dish_process_category.name
                    obj['dish_process_category_name'] = dish_process_category.name
                }else{
                    obj['dish_process_category_name'] = ''
                }
                break
            }
        }
        str += json.dish_qty.toFixed(2)
        obj['dish_qty'] = json.dish_qty
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
                    str += dish_process_category.name
                    break;
                }
            }
            
            str += ((count * 0.01) * dish_bom.gbom_qty_high).toFixed(2)
            arr_data['dish_qty'] = ((count * 0.01) * dish_bom.gbom_qty_high).toFixed(2)
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


// 通过文字，获取菜品
export {
    data,dish_detailed,duibi,headHookLimit
}

export default {
    data,dish_detailed,duibi,headHookLimit
}