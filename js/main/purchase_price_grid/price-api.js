/** @odoo-module **/
import { changedValuetoData } from './../ag-grid/ag_common.js'
import mealcopies from './../ag-grid/special_fast_data.js'
import {cost_proportion, countCostPrice} from './../ag-grid/ag-grid-row.js'

const onCellValueChanged = (params, agOption) => {
    if(params.colDef.field == "price"){
        if(isNaN(params.newValue) || Number(params.newValue) <= 0){
            const rowNode = params.api.getRowNode(params.data.id)
            rowNode.setDataValue('price', params.oldValue)
            return
        }
        // 重新计算头部成本
        // 重新计算本行成本
        // 重新计算本餐成本
        const arr = []
        agOption.api.forEachNode(v => {
            if(v.data == null || v.data.config) return
           
            arr.push(v.data)
            for (const item of v.data.dish_key_id.material_item) {
                if(item.id == params.data.materialId){
                    // console.log(item)
                    item.main_price = Number(params.newValue)
                    const rowNode = agOption.api.getRowNode(v.data.id)
                    rowNode.setData(v.data)
                    rowNode.setDataValue('costPrice', countCostPrice(v.data.dish_key_id.material_item, v.data.Copies))
                    changedValuetoData(v, agOption)
                }
            }
        })
        const d = cost_proportion(arr, mealcopies())
        // console.log(arr)
        agOption.api.setPinnedTopRowData([d[2]])
        
        // agOption.api.refreshCells({force:true})
    }
}


const getRowId = (params) => params.data.id;

export {
    onCellValueChanged, getRowId
}

export default {
    onCellValueChanged, getRowId
}