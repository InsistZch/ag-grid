/** @odoo-module **/
import { cost_proportion } from './ag-grid-row.js'
import mealcopies from './special_fast_data.js'


// 餐配置信息的抽象方法
// name => 配置信息数据字段名称
// type => 表格显示名称
// edit => 是否可以编辑
// fixed => 是否为固定展示信息
// configure => 是否为配置信息

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

const anew_top_cost = (e) => {
    // 表头比例设置
    const arr = []

    e.api.forEachNode(v => {
        if(v.data == null) return
        if(v.data.configure == true || v.data.edit == false) return
        arr.push(v.data)
    })
    const d = cost_proportion(arr, mealcopies())
    // console.log(gridOptions.rowData, arr, mealcopies(), d)
    e.api.setPinnedTopRowData([d[2]])
}
// configure => 是否为配置信息
// edit  => 可否输入
// 加入餐标


export {
    changedValuetoData,
    anew_top_cost   
}