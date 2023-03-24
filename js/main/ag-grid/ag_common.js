/** @odoo-module **/
import index from "../../../data/index.js";
import copiesNumber from "../ag_common/CopiesNumber.js";
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
// 处理数据改变后 份数，成本，头部成本比例
const changedValuetoData = async (e, gridOptions) => {
    const rowNode = await gridOptions.api.getRowNode(e.data.id)
    // console.log(e.data.type, e.data.Copies)    
    await rowNode.setData(e.data)
    // gridOptions.api.refreshCells({force:true})
    // console.log(new Date() * 1 - newDate)
    // console.log(gridOptions)

    anew_top_cost(gridOptions)

    let cl1s = []
    gridOptions.api.forEachNode(async v => {
        if(v.data == null) return
        if(v.data.type == "%" && v.data.cl1 == e.data.cl1){
            cl1s.push(v.data.cl1)
        }
    })
    for (const c_item of cl1s) {
        // 成本所需数据
        const costs_data = []
        let dinner_type = ""
        let index = 0
        gridOptions.api.forEachNode((v, i) => {
            if(v.data == null) return
            if(v.data.configure && v.data.cl1 == c_item && v.data.type == "%") {
                console.log(i)
                index = i == 1 ? 0 : i
            }
            if(v.data.configure || !v.data.edit) return
            if(v.data.cl1 == c_item){
                costs_data.push(v.data)
                dinner_type = v.data.dinner_type
            }
        })
        console.log(index)
        const sales_data = []
        // 销售额所需数据
        for (const meal_item of mealcopies()) {
            if(meal_item.cl1 == c_item){
                sales_data.push(meal_item)
            }
        }
        const d = cost_proportion(costs_data, sales_data)
        // await gridOptions.api.forEachNode(async v => {
        //     if(v.data == null) return
        //     if(v.data.cl1 == c_item && v.data.type == "%"){
        //         await gridOptions.api.applyTransactionAsync({remove: [v.data]})
        //     }
        // })
        const costRow = gridOptions.api.getRowNode(`cost-${e.data.dinner_type}`)

        if(costRow != undefined){
            gridOptions.api.applyTransactionAsync({remove: [costRow]})
        }
        const obj = {
            ...d[2],
            cl1: c_item,
            dinner_type,
            id: costPlusOne(dinner_type)
        }
        await gridOptions.api.applyTransactionAsync({add: [obj], addIndex: index})
    }
}
// configure => 是否为配置信息
// edit  => 可否输入
// 加入餐标
const mealPrice = () => {
    return mealAbstract({
        name:'price',
        type:"餐标",
        edit: false,
        fixed: false,
        configure: true
    })
}

export {
    mealPrice,
    mealAbstract,
    changedValuetoData
}