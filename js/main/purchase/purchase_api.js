import refreshWholeCol from "../otherApi/refreshWholeCol.js";
import { customFrom as customFromDom } from './../otherApi/index.js'
import index from '../../../data/index.js'

/** @odoo-module **/
const getRowId = (params) => params.data.id;

const getContextMenuItems = (e, gridOptions) => {
    if (e.node && e.node.data == undefined) return

    const result = [
        {
            name: '添加食材',
            action: () => {
                if (e.node !== null && e.column !== null && e.value !== null) {
                    customFromDom({
                        parent: "#add_meal",
                        deleteData: ["#add_meal_category"],
                        cancel: ["#add_meal_cancel1", "#add_meal_cancel2"],
                        sure: "#add_meal_sure",
                        initFun(_parent) {
                            console.log(e)
                            let material = _parent.querySelector('#material')
                            index.material_item.forEach(v => {
                                material.innerHTML += v.name == e.node.data['material'] ?
                                    `<option value="${v.id}" selected>${v.name}</option>` :
                                    `<option value="${v.id}">${v.name}</option>`
                            })

                        },
                        sureFun(_parent) {
                            const MealCategory = _parent.querySelector('#MealCategory')
                            const rowData = [{}]
                            if (e.value == null) {
                                rowData[0]["category_name"] = e.node.key
                            } else {
                                rowData[0]["category_name"] = e.node.data.category_name
                            }
                            gridOptions.api.applyTransaction({ add: rowData, addIndex: e.node.rowIndex + 1 })
                            return true
                        }
                    })

                }
            }
        },
        {
            name: '删除食材',
            action: () => {
                const selRows = gridOptions.api.getRowNode(e.node.id)
                gridOptions.api.applyTransaction({ remove: [selRows] });
            }
        }
    ]
    return result
}

const onCellValueChanged = (e, gridOptions) => {

    if (e.colDef.headerName == '下单') {
        let newValue = 0;
        const rowNode = gridOptions.api.getRowNode(e.data.id)
        if (e.newValue == 0 || e.newValue == null || e.newValue == undefined) {
            rowNode.setDataValue(e.colDef.field, newValue)
        } else if (isNaN(e.newValue)) {
            rowNode.setDataValue(e.colDef.field, e.oldValue)
        } else {
            newValue = Number(e.newValue)
            if (e.newValue.indexOf(".") > 0) newValue = newValue.toFixed(1)
            rowNode.setDataValue(e.colDef.field, newValue)
        }
    }
}

const onCellClicked = (e, gridOptions, agOption) => {
    agOption.rowData.forEach(row => {
        row.dish_key_id.material_item.forEach(item => {
            if (item.name.split("-")[0] == (e.data.material)) {
                agOption.api.setColumnDefs(refreshWholeCol.refreshWhole(e.data.material))
            }
        });
    });
}

export {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}

export default {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}
