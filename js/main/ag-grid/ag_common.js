/** @odoo-module **/
import index from "../../../data/index.js";
import {copiesNumber} from "../otherApi/index.js";
import countID from './countID.js'


// 餐配置信息的抽象方法
// name => 配置信息数据字段名称
// type => 表格显示名称
// edit => 是否可以编辑
// fixed => 是否为固定展示信息
// configure => 是否为配置信息
const mealAbstract = ({
                          name,
                          type,
                          edit,
                          fixed,
                          configure
                      }) => {
    let data = []
    // 获取所有用户id
    const userIds = Object.keys(index.plan_day_record_show[0]['cus_loc_info']).map(v => v.split('_')[1])
    // 获取当前餐别
    const dinner_types = [...index.plan_day_record_show.reduce((pre, v) => {
        pre.add(v.dinner_type)
        return pre
    }, new Set())]
    for (const type_item of dinner_types) {
        let obj = {}
        for (const id of userIds) {
            const dinner_mode_data = index.dinner_mode.find(v => v.cus_loc_id == id && type_item == v.dinner_type)
            obj[id] = dinner_mode_data == undefined ? 0 : copiesNumber(dinner_mode_data[name])
        }
        obj['cl1'] = type_item == 'dn2' ? '午餐' : type_item == 'dn3' ? '晚餐' : type_item == 'dn5' ? '夜餐' : '早餐'
        obj['dinner_type'] = type_item
        obj['edit'] = edit
        obj['Copies'] = 0
        obj['whole'] = ""
        obj['id'] = countID()
        obj['fixed'] = fixed
        obj['configure'] = configure
        obj['type'] = type
        obj['update'] = false
        // obj['specialMealColor'] = "#00000090"
        data.push(obj)
    }
    return data
}

// configure => 是否为配置信息
// edit  => 可否输入
// 加入餐标
const mealPrice = () => {
    return mealAbstract({
        name:'price',
        type:"餐标",
        edit: false,
        configure: false
    })
}

export {
    mealPrice,
    mealAbstract,
}