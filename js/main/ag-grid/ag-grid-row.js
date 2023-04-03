/** @odoo-module **/
import index from '../../../data/index.js'
import m from './specialMeal.js'
import init_mp from './meal_price.js'
import { mealAbstract, mealPrice } from './ag_common.js'
import countID from './countID.js'
import saveData from '../saveData/index.js'
import copiesNumber from "../ag_common/CopiesNumber.js";


// 拿到餐标 => 客户信息 菜品信息 

/*
dislodge => String[]
*/
const data = () => {
    let specialMeal = m()
    // console.log(specialMeal)
    let data = []
    // 设置用户id与当前餐类别
    // cus_loc_ids = Object.keys(index.plan_day_record_show[0]['cus_loc_info']).map(v => v.split('_')[1])
    // dinner_types = [...index.plan_day_record_show.reduce((pre, v) => {
    //     pre.add(v.dinner_type)
    //     return pre
    // }, new Set())]



    // data.push(...mealCopies())
    // data.push(...mealPrice())


    let plan = index.plan_day_record_show

    // 按照表里的id排序
    plan.sort((a, b) => {
        return a.id - b.id
    })

    for (const play_object of plan) {
        const json = play_object['cus_loc_info']
        // 计算总份数
        const obj = {}
        obj['cl1'] = play_object['dinner_type'] == 'dn2' ? '午餐' : play_object['dinner_type'] == 'dn3' ? '晚餐' : play_object['dinner_type'] == 'dn5' ? '夜餐' : '早餐'
        obj['dinner_type'] = play_object['dinner_type']
        obj['sales_type'] = play_object.sales_type
        let count = 0;
        for (const play_object_item of Object.keys(json)) {
            const item2 = play_object_item.split('_')[1]
            // console.log(item2, json[play_object_item])
            json[play_object_item] = copiesNumber(json[play_object_item])
            obj[`${item2}`] = json[play_object_item]
            // obj[`${item2}`] = 0  
            count += json[play_object_item]
        }
        obj['Copies'] = count
        // obj['Copies'] = 0

        // 生成data
        // let isShow = true;

        for (const dish_key of index.dish_key) {
            // 获取菜品数据
            // 能拿到dish_key play_object
            // 其他 冻品 鲜肉 半成品
            // console.log(dish_key.material_tag)

            if (play_object.dish_key_id == dish_key.id) {
                obj['dish'] = dish_key.name

                // data.forEach((d) => {
                //     if (dish_key.name === d.dish && d.teseMatchRowId == -1 && play_object.dinner_type == data.dinner_type) {
                //         isShow = false
                //     }
                // })

                // 获取类别
                for (const dish_top_category of index.dish_top_category) {
                    if (dish_key.dish_top_category_id == dish_top_category.id) {
                        // console.log(dish_key)
                        obj['type'] = dish_top_category.name_cn
                        // console.log(dish_top_category)
                        if (dish_top_category.name_cn == "特色" && specialMeal.Catering[obj['dinner_type']] <= specialMeal.colors.length) {
                            obj['specialMealID'] = specialMeal.Catering[obj['dinner_type']]
                            obj['specialMealColor'] = specialMeal.colors[specialMeal.Catering[obj['dinner_type']] - 1]
                            specialMeal.Catering[obj['dinner_type']]++
                        }
                    }
                }
                // console.log(play_object.manual_material_qty)
                const d_data = init_dish_detailed(play_object.manual_material_qty, count)
                obj['id'] = countID()
                obj['whole'] = d_data[0]
                obj['costPrice'] = d_data[2]
                obj['dish_key_id'] = {
                    id: dish_key.id,
                    dish_top_category_id: dish_key.dish_top_category_id,
                    material_item: d_data[1]
                }


            }
        }
        obj['dname'] = obj['dish'] + "_" + obj['type']
        obj['edit'] = true
        obj['configure'] = false
        obj['fixed'] = true
        obj['update'] = false
        obj['isNewAdd'] = false
        obj['note'] = play_object['note'] == false ? "" : play_object['note']
        obj['teseMatchRowId'] = play_object['tese_match_row_id']
        
        if(obj['teseMatchRowId'] != -1){
            // console.log(obj)
            index.plan_day_record_show.forEach(v => {
                if(obj['teseMatchRowId'] == v.id){
                    // console.log(v)
                    obj['specialMealColor'] = specialMeal.colors[specialMeal.Catering[obj['dinner_type']] - 2]
                }
            })
        }
        data.push(obj)
        // if (isShow) {
        
        // }
    }
    // data.unshift(cost_proportion(data)[2])

    // data.forEach((d) => {
    //     if(d.teseMatchRowId != -1){
    //         // d.specialMealColor = "#2a598a66"
    //         data.forEach((a)=>{
    //             console.log(a.id)
    //             console.log(d.teseMatchRowId)
    //             if (a.id === d.teseMatchRowId){
    //             }
    //         })
    //     }
    //  })
    // console.log(data)
    return data
}

//3139803  3507
// 对比用户是否想吃该菜品
const duibi = (cus_loc_id, dish_id, dinner_type, material_item) => {
    let obj1 = {}
    let obj2 = {}

    // 用户喜好表
    for (const dinner_mode of index.dinner_mode) {
        if (dinner_mode.cus_loc_id == cus_loc_id && dinner_mode.dinner_type == dinner_type) {
            obj2 = { ...dinner_mode }
        }
    }
    // 菜品表格
    for (const dish_key of index.dish_key) {
        if (dish_key.id == dish_id) {
            obj1 = { ...dish_key }
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
    if (obj1['is_fish'] == true && obj2['is_fish'] == false) {
        return ['鱼', false]
    } else if (obj1['is_organ'] == true && obj2['is_organ'] == false) {
        return ['内脏', false]
    } else if (obj1['is_semi_finished'] == true && obj2['is_semi_finished'] == false) {
        return ['半成品', false]
    } else if (obj1['is_fried'] == true && obj2['is_fried'] == false) {
        return ['油炸', false]
    } else if (obj1['is_shrimp'] == true && obj2['is_shrimp'] == false) {
        return ['虾', false]
    } else if (obj1['is_color_additive'] == true && obj2['is_color_additive'] == false) {
        return ['色素', false]
    } else if (obj2['dislike_material_ids'] != undefined && obj2['dislike_material_ids'].length > 0) {
        // console.log(obj2)
        // 找到当前食材
        const items = index.material_item.filter(v => {
            for (const id of obj2['dislike_material_ids']) {
                return id == v.id
            }
        })
        for (const ts of items) {
            for (const item of material_item) {
                if (ts.id == item.id) {
                    return [ts.name.split('-')[0], false]
                }
            }
        }
        return ['', true]
    } else {
        return ['', true]
    }

}
// 厨师长限制
// userId dinner_type
const headHookLimit = (userId, dinner_type, type) => {
    // console.log(type)
    let limit = 0
    for (const dinner_mode of index.dinner_mode) {
        if (userId == dinner_mode.cus_loc_id && dinner_type == dinner_mode.dinner_type) {
            if (type == "特色" || type.includes("特色")) {
                limit = dinner_mode.dinner_qty_upper_limit_ts
            } else if (type == "汤粥") {
                limit = dinner_mode.dinner_qty_upper_limit_kc + dinner_mode.dinner_qty_upper_limit_ts
            } else {
                limit = dinner_mode.dinner_qty_upper_limit_kc
            }
        }
    }
    return limit
}



// 加入餐配置
const mealCopies = (edit = false, fixed = true, types = {
    t1: "快餐配置",
    t2: "特色配置"
}) => {
    let fastConfiguration = mealAbstract({
        name: 'dinner_qty_upper_limit_kc',
        type: types.t1,
        edit,
        fixed,
        configure: true,
    })

    fastConfiguration = setCopies(fastConfiguration)
    // fastConfiguration['id'] = `copies-${fastConfiguration.dinner_mode}-1`
    let specialConfiguration = mealAbstract({
        name: 'dinner_qty_upper_limit_ts',
        type: types.t2,
        edit,
        fixed,
        configure: true,
    })

    specialConfiguration = setCopies(specialConfiguration)
    // specialConfiguration['id'] = `copies-${specialConfiguration.dinner_mode}-2`
    return [
        ...fastConfiguration,
        ...specialConfiguration,
    ]
}

// 设置份数
const setCopies = (objs) => {

    for (const obj of objs) {
        obj['Copies'] = 0
        for (const key of Object.keys(obj)) {
            if (!isNaN(key)) {
                // obj[key] = 0
                obj['Copies'] += obj[key]
            }
        }
    }
    // console.log(objs)
    return objs
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
const init_dish_detailed = (manual_material_qty, count) => {
    // console.log(manual_material_qty)
    // console.log(manual_material_qty_json, count)
    count = count == 0 ? 1 : count
    // 获取当前菜品详细配料
    let str = ""
    let arr = []
    let costPrice = 0
    for (const json of manual_material_qty) {
        // 查找材料名称
        let obj = {}
        for (const material_item of index.material_item) {

            if (material_item.id == json.material_id) {
                // console.log(material_item)
                obj = { ...material_item }
                obj['material_id'] = material_item.id
                str += material_item.name.split('-')[0]
                break
            }
        }
        // 查找切配方式
        for (const dish_process_category of index.dish_process_category) {
            if (dish_process_category.id == json.process_id) {
                obj['process_id'] = dish_process_category.id
                if (dish_process_category.name != '无') {
                    if (str[str.length - 1] != dish_process_category.name) {
                        str += dish_process_category.name
                    }
                    obj['dish_process_category_name'] = dish_process_category.name
                } else {
                    obj['dish_process_category_name'] = ''
                }
                break
            }
        }

        const [{ main_unit_bom_unit_ratio }] = index.material_item_bom_unit_ratio.filter(v => v.material_id == obj.id && v.purchase_unit_id == json.unit_id)
        // console.log(ratio)
        // console.log(obj.name, obj.main_price, main_unit_bom_unit_ratio)
        obj['main_unit_bom_unit_ratio'] = main_unit_bom_unit_ratio == 0 ? 1 : main_unit_bom_unit_ratio
        // str += 0

        obj.main_price = Number(Number(obj.main_price).toFixed(2))
        if ((obj.main_price / main_unit_bom_unit_ratio) >= 5 && Number(json.dish_qty) < 10) {

            json.dish_qty = Number(json.dish_qty.toFixed(1))
            obj['dish_qty'] = Number(json.dish_qty.toFixed(1))
            str += Number(json.dish_qty.toFixed(1))
        } else {
            json.dish_qty = Math.ceil(json.dish_qty)
            obj['dish_qty'] = Math.ceil(json.dish_qty)
            str += Math.ceil(json.dish_qty)
        }
        // console.log(json)
        // obj['dish_qty'] = 0
        // console.log(obj, json)

        costPrice += (obj.main_price * obj['dish_qty']) / (count * main_unit_bom_unit_ratio)

        // 查找单位
        for (const material_purchase_unit_category of index.material_purchase_unit_category) {
            if (material_purchase_unit_category.id == json.unit_id) {
                obj['unit_name'] = material_purchase_unit_category.name
                obj['unit_id'] = material_purchase_unit_category.id
                str += material_purchase_unit_category.name + ' '
                break
            }
        }
        // console.log()
        arr.push(obj)
    }
    costPrice = Number(Number(costPrice).toFixed(2))
    // console.log(arr)
    return [str, arr, costPrice]
}
// 
// 获取菜品详细信息
const dish_detailed = (dish_key, count) => {
    // 获取当前菜品详细配料
    let str = ""
    let arr = []
    for (const dish_bom of index.dish_bom) {
        if (dish_key.id == dish_bom.dish_key_id) {
            // console.log(dish_bom)
            // 获取到当前菜品的原材料数据
            let arr_data = {}
            for (const material_item of index.material_item) {
                if (dish_bom.material_id == material_item.id) {
                    // 获取原材料详细信息
                    // console.log(3, material_item)
                    const value = material_item.name.split('-')[0]
                    arr_data = { ...material_item }
                    arr_data['material_id'] = material_item.id
                    // arr.push(material_item)
                    str += value
                    break
                }
            }
            for (const dish_process_category of index.dish_process_category) {
                if (dish_process_category.id == dish_bom.process_id) {
                    // console.log(123, dish_process_category)
                    arr_data['process_id'] = dish_process_category.id
                    if (dish_process_category.name == "无") {
                        arr_data.dish_process_category_name = "";
                        break;
                    }
                    arr_data.dish_process_category_name = dish_process_category.name

                    if (str[str.length - 1] != dish_process_category.name) {
                        str += dish_process_category.name
                    }
                    break;
                }
            }
            // 添加当前菜品转换比等信息


            // console.log(arr_data)

            // console.log(arr_data['dish_qty'], arr_data.main_price)
            // costPrice += json.dish_qty * obj.main_price

            // console.log(arr_data)

            for (const material_purchase_unit_category of index.material_purchase_unit_category) {
                if (material_purchase_unit_category.id == dish_bom.unit_id) {
                    // console.log(5, material_purchase_unit_category)


                    arr_data['unit_name'] = material_purchase_unit_category.name
                    arr_data['unit_id'] = material_purchase_unit_category.id
                    // console.log(arr_data)
                    const ratio = index.material_item_bom_unit_ratio.find(v => v.material_id == arr_data.material_id && v.purchase_unit_id == arr_data.unit_id)
                    // arr_data['main_unit_bom_unit_ratio'] = ratio.main_unit_bom_unit_ratio
                    // console.log(arr_data, dish_bom)
                    const qty = (count * 0.01) * dish_bom.gbom_qty_high
                    if (arr_data.main_price / ratio.main_unit_bom_unit_ratio >= 5 && qty < 10) {
                        str += Math.ceil(qty.toFixed(1))
                        arr_data['dish_qty'] = qty.toFixed(1)
                    } else {
                        str += Math.ceil(qty)
                        arr_data['dish_qty'] = Math.ceil(qty)
                    }

                    str += material_purchase_unit_category.name + ' '
                    arr_data['material_id'] = ratio.material_id
                    arr_data['purchase_unit_id'] = ratio.purchase_unit_id
                    break
                }
            }


            arr.push(arr_data)
        }
    }
    return [str, arr]
}

// 成本占比

const cost_proportion = (data, mealCopies) => {
    // console.log(data, mealCopies)

    // 找到每个用户
    const cus_loc = Object.keys(data[0]).filter(v => !isNaN(v))
    // console.log(cus_loc)

    // // console.log(costPrices)

    // // 算出每个用户的销售额 份数x单价   份数 => 快餐、特色
    //     // 餐标 => 单价
    // []
    const mealPrices = init_mp()

    // new Map => (cus_loc_id, {})
    const sales_volume = cus_loc.reduce((pre, v) => {
        // 找出当前用户的快餐与特色份数
        // mealPrices为餐标数据  mealCopies为份数数据

        // new map => (cl1, total) => 餐别 销售额统计
        let sales = new Map()
        for (const p_item of mealPrices) {
            let category_total = 0
            for (const c_item of mealCopies) {
                if (p_item.dinner_type == c_item.dinner_type) {
                    category_total += p_item[v] * c_item[v]
                }
            }
            sales.set(p_item.dinner_type, category_total)
        }
        // console.log(sales)
        const obj = {
            total: 0
        }
        sales.forEach((v, i) => {
            obj[i] = v
            obj.total += v
        })
        pre.set(v, obj)
        return pre
    }, new Map())

    // 算出每个用户的成本价
    // new Map => (cus_loc_id, cost) => 用户id 成本价格
    const costPrices = cus_loc.reduce((pre, v) => {
        let costPrice = 0
        // 循环每一行数据，找到每一行数据成本价
        // 当前用户份数，乘以成本价 得出此用户当前菜品成本价
        for (const data_item of data) {
            // if(sales_volume.get(v)[data_item.dinner_type] == 0) continue

            costPrice += data_item[v] * data_item['costPrice']
        }
        pre.set(v, Number(costPrice.toFixed(2)))
        return pre
    }, new Map())
    // 计算出成本占比
    const costs = {}
    let cost_totle_obj = {
        cost_price: 0,
        sales_volume: 0,
    }

    for (const loc_item of cus_loc) {

        // 计算前初始化设置，确保分母不为零
        // const sales_volume_total = sales_volume.get(loc_item).total == 0 ? 1 : sales_volume.get(loc_item).total

        if (sales_volume.get(loc_item).total == 0) {
            costs[loc_item] = "0.0%"
        } else {
            costs[loc_item] = ((costPrices.get(loc_item) / sales_volume.get(loc_item).total) * 100).toFixed(1) + "%"
        }

        cost_totle_obj.cost_price += costPrices.get(loc_item)
        cost_totle_obj.sales_volume += sales_volume.get(loc_item).total
    }
    // console.log(cost_totle_obj) 
    // const sv = cost_totle_obj.sales_volume == 0 ? 1 : cost_totle_obj.sales_volume
    if (cost_totle_obj.sales_volume == 0) {
        costs['costPrice'] = '0.0' + "%"
    } else {
        costs['costPrice'] = ((cost_totle_obj.cost_price / cost_totle_obj.sales_volume) * 100).toFixed(1) + "%"
    }
    costs['edit'] = false
    costs['configure'] = true
    costs['fixed'] = false
    costs['whole'] = day_cost_whole(cost_totle_obj);
    costs['type'] = "%"
    let mealCopiesCount = mealCopies.reduce((pre, v) => pre += Number(v.Copies), 0)
    costs['Copies'] = mealCopiesCount
    costs['dish'] = (index.planed_cost_ratio_dict.average * 100).toFixed(1) + "%"

    if (!saveData.day_cost_proportion.init_cost_ratio) {
        saveData.day_cost_proportion.init_cost_ratio = Number(costs['costPrice'].split('%')[0])
    }
    if (!saveData.day_cost_proportion.init_sales) {
        saveData.day_cost_proportion.init_sales = Number(cost_totle_obj.sales_volume)
    }
    if (!saveData.day_cost_proportion.init_cost) {
        saveData.day_cost_proportion.init_cost = cost_totle_obj.cost_price
    }
    saveData.day_cost_proportion.complete_cost = cost_totle_obj.cost_price
    saveData.day_cost_proportion.complete_sales = cost_totle_obj.sales_volume
    // console.log([costPrices, sales_volume, costs])
    // 成本数据 销售数据 总占比数据
    return [costPrices, sales_volume, costs]
}
// 周成本和月成本  => 日成本的whole字段

const day_cost_whole = (cost_totle) => {
    // 计算周成本
    // console.log(cost_totle)    
    const nowDate = new Date()
    const week = index.plan_day_summary_info.week_summary.find(v => {
        const week_time = v.week.split('_')
        const week_start = new Date(week_time[0])
        const week_end = new Date(week_time[1])
        if (nowDate.getFullYear() == week_start.getFullYear() || nowDate.getFullYear() == week_end.getFullYear()) {
            if (nowDate.getMonth() == week_start.getMonth() || nowDate.getMonth() == week_end.getMonth()) {
                if (nowDate.getDate() >= week_start.getDate() && nowDate.getDate() <= week_end.getDate()) {
                    return true
                }
                return false
            }
            return false
        }
        return false
    })
    // console.log(week)
    let week_sales = 0, week_cost = 0, week_cost_proportion = "0%";
    if (week != undefined) {
        // 获取销售额和成本
        week_sales = week.planed_sales + cost_totle.sales_volume
        week_cost = week.planed_cost + cost_totle.cost_price

    } else {
        week_sales = cost_totle.sales_volume
        week_cost = cost_totle.cost_price
    }
    week_cost_proportion = week_sales == 0 ? "0%" : ((week_cost / week_sales) * 100).toFixed(2) + "%"


    // console.log(cost_totle, week, week_sales, week_cost)
    // 计算月成本
    // 获取销售额和成本
    const month_sales = index.plan_day_summary_info.month_summary.planed_sales + cost_totle.sales_volume
    const month_cost = index.plan_day_summary_info.month_summary.planed_cost + cost_totle.cost_price
    // 成本比例
    const month_cost_proportion = month_sales == 0 ? "0%" : ((month_cost / month_sales) * 100).toFixed(2) + "%"
    return `周成本：${week_cost_proportion} | 月成本：${month_cost_proportion}`
}


// 统计配量信息
// 食品原食材如果有数量 则同比增加
// 食品原食材没有数量 则去表中查询
// 用户自添加食材如果有数量 则同比增加
// 用户自添加食材如果没有数量 则不增加
// 两种统计方式，一种为菜品原始食材 一种用户自加食材

// 食材价格大于5元，保留一位小数点
/*
{
    material_items: [material_item] => 食材列表
    dish_key_id:    string|number   => 菜品id
    oldCopies:      string|number   => 原份数
    newCopies:      string|number   => 新份数
}
*/
// 食材小于10斤 并且大于等于5元 则保留一位小数点
// 食材小于1斤 保留一位小数点
const countMaterialData = ({
    material_items,
    dish_key_id,
    oldCopies,
    newCopies,
    update = false
}) => {
    // console.log(dish_key_id)
    // console.log('111')
    // 选出食品原食材
    // console.log(newCopies, oldCopies)
    const m_arr = []
    const [, arr] = dish_detailed({ id: dish_key_id }, newCopies)
    // console.log(arr)
    let costPrice = 0;
    // console.log(update)
    // 如果用户没有修改则进入该方法计算
    if (newCopies == 0) {
        costPrice = 0
        const str = materialToString(material_items, (item) => {
            item.dish_qty = 0
        })

        return [str, material_items, costPrice]
    }
    if (update) {
        // console.log(material_items, arr)
        for (const item of [...material_items]) {
            // 寻找该食材是否为食品原食材 
            const ingredients = arr.find(v => v.id == item.id)
            // console.log(ingredients)
            // 是原食材进入if 不是原食材进入else
            if (ingredients != undefined) {
                // 如果原食材没有数量则进入if 有数量则进入else
                // console.log(ingredients) 
                // console.log(item)
                if (isNaN(item.dish_qty) || parseInt(item.dish_qty) == 0) {
                    // console.log(519, ingredients)
                    m_arr.push({ ...ingredients })
                } else {
                    // 增加比例
                    const old = oldCopies == 0 ? 1 : oldCopies
                    const scale = (newCopies - oldCopies) / old
                    // console.log(scale,item.dish_qty)

                    let dish = 0
                    if (item.main_price / item.main_unit_bom_unit_ratio >= 5 && Number(item.dish_qty) < 10) {
                        dish = Number((Number(item.dish_qty) + (Number(item.dish_qty) * scale)).toFixed(1))
                    }
                    else if (Number(item.dish_qty) < 1) {
                        dish = (Number(item.dish_qty) + (Number(item.dish_qty) * scale)).toFixed(1)
                    }
                    else {
                        dish = Math.ceil(Number(item.dish_qty) + (Number(item.dish_qty) * scale))
                    }
                    if (oldCopies == 0) {
                        dish = Number(newCopies)
                    }
                    item.dish_qty = dish < 0 ? 0 : dish
                    m_arr.push({ ...item })
                }
            } else {
                // 如果自定义食材没有数量则进入if 否则进入else
                if (isNaN(item.dish_qty) || parseInt(item.dish_qty) == 0) {
                    item.dish_qty = 0
                    m_arr.push({ ...item })
                } else {
                    // 增加比例
                    const old = oldCopies == 0 ? 1 : oldCopies
                    const scale = (newCopies - oldCopies) / old
                    // console.log(scale, item.dish_qty)
                    let dish = 0
                    if (item.main_price / item.main_unit_bom_unit_ratio >= 5 && Number(item.dish_qty) < 10) {
                        dish = Number((Number(item.dish_qty) + (Number(item.dish_qty) * scale)).toFixed(1))
                    }
                    else if (Number(item.dish_qty) < 1) {
                        dish = (Number(item.dish_qty) + (Number(item.dish_qty) * scale)).toFixed(1)
                    }
                    else {
                        dish = Math.ceil(Number(item.dish_qty) + (Number(item.dish_qty) * scale))
                    }
                    if (oldCopies == 0) {
                        dish = Number(newCopies)
                    }
                    item.dish_qty = dish < 0 ? 0 : dish
                    m_arr.push({ ...item })
                }
            }

        }

    } else {
        for (const item of [...material_items]) {
            // 寻找该食材是否为食品原食材 
            const ingredients = arr.find(v => v.id == item.id)
            if (ingredients != null) {
                m_arr.push(ingredients)
            } else {
                // 增加比例
                const old = oldCopies == 0 ? 1 : oldCopies
                const scale = (newCopies - oldCopies) / old
                // console.log(scale, item.dish_qty)
                let dish = 0
                if (item.main_price / item.main_unit_bom_unit_ratio >= 5 && Number(item.dish_qty) < 10) {
                    dish = Number((Number(item.dish_qty) + (Number(item.dish_qty) * scale)).toFixed(1))
                }
                else if (Number(item.dish_qty) < 1) {
                    dish = (Number(item.dish_qty) + (Number(item.dish_qty) * scale)).toFixed(1)
                }
                else {
                    dish = Math.ceil(Number(item.dish_qty) + (Number(item.dish_qty) * scale))
                }
                item.dish_qty = dish < 0 ? 0 : dish
                m_arr.push({ ...item })
            }
        }
    }
    // newCopies = newCopies == 0 ? 1 : newCopies
    // console.log(m_arr)
    // const materialQuantity = m_arr.every(v => Number(v.dish_qty) == 0)
    if (newCopies == 0) {
        costPrice = 0
    } else {
        costPrice = countCostPrice(m_arr, newCopies)
    }
    // console.log(m_arr)
    // costPrice = Number(costPrice.toFixed(2))
    // whole字段
    const str = materialToString(m_arr)
    // console.log(m_arr)
    return [str, m_arr, costPrice]
}

// material_items => String
const materialToString = (material_items, func = () => { }) => {
    return material_items.map(v => {
        func(v)
        const name = v.name.split('-')[0]
        if (name[name.length - 1] == v.dish_process_category_name) {
            return v.name.split('-')[0] + v.dish_qty + v.unit_name
        } else {
            return v.name.split('-')[0] + v.dish_process_category_name + v.dish_qty + v.unit_name
        }

    }).join(' ')
}
// 计算costPrice
const countCostPrice = (m_arr, newCopies) => {
    let costPrice = 0
    for (const m_item of m_arr) {
        // console.log(item, item.dish_qty, item.main_price)
        m_item['main_price'] = Number(m_item['main_price'])
        // console.log(m_item)
        let main_unit_bom_unit_ratio = index.material_item_bom_unit_ratio.find(v => v.material_id == m_item.id && v.purchase_unit_id == m_item.unit_id)

        main_unit_bom_unit_ratio = main_unit_bom_unit_ratio == undefined ? 1 : main_unit_bom_unit_ratio.main_unit_bom_unit_ratio
        m_item['main_unit_bom_unit_ratio'] = main_unit_bom_unit_ratio
        // console.log(m_item)
        // console.log(m_item.main_price, m_item.dish_qty, newCopies, m_item.main_unit_bom_unit_ratio)
        // console.log((m_item.main_price  * m_item.dish_qty) / (newCopies * m_item.main_unit_bom_unit_ratio))
        costPrice += (m_item.main_price * m_item.dish_qty) / (newCopies * m_item.main_unit_bom_unit_ratio)
    }
    return Number(costPrice.toFixed(2))
}

// 通过文字，获取菜品
export {
    data, dish_detailed, duibi, headHookLimit, countMaterialData, mealPrice, mealCopies, cost_proportion, countCostPrice
}

export default {
    data, dish_detailed, duibi, headHookLimit, countMaterialData, mealPrice, mealCopies, cost_proportion, countCostPrice
}