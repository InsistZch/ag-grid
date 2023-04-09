/** @odoo-module **/

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
                    let addMaterialObj = {}
                    customFromDom({
                        parent: "#add_meal",
                        deleteData: [],
                        cancel: ["#add_meal_cancel1", "#add_meal_cancel2"],
                        sure: "#add_meal_sure",
                        initFun(_parent) {
                            const material = _parent.querySelector("#material")
                            const materialDishFood = _parent.querySelector('#materialDishFood')
                            const add_meal_order = _parent.querySelector('#add_meal_order')
                            const add_meal_unit = _parent.querySelector('#add_meal_unit')
                            material.value = ""
                            materialDishFood.innerHTML = ""
                            add_meal_unit.innerHTML = ""
                            add_meal_order.value = 0
                            material.onkeyup = () => {
                                if (material.value.trim() == "") {
                                    materialDishFood.innerHTML = ""
                                    return
                                }
                                const arr = index.material_item.reduce((pre, v) => {
                                    if (v.name.includes(material.value)) {
                                        pre.push(v)
                                    }
                                    return pre
                                }, [])
                                add_meal_unit.innerHTML = ""
                                materialDishFood.innerHTML = ""
                                addMaterialObj = {}
                                for (const item of arr) {
                                    const { name } = index.material_purchase_unit_category.find(v => v.id == item.main_unit_id)
                                    const createDiv = document.createElement('div')
                                    createDiv.classList.add('food_item')
                                    createDiv.innerHTML = `${item.name.split('-')[0]} <span>价格：${Number(item.main_price).toFixed(1)} / ${name}</span>`
                                    createDiv.onclick = () => {
                                        add_meal_unit.innerHTML = ""
                                        material.value = item.name.split('-')[0]
                                        addMaterialObj = { ...item }
                                        add_meal_unit.innerHTML += `<option value="${name}" data=${JSON.stringify(item)}>${name}</option>`
                                        for (const get_item of getUnitObj(item)) {
                                            const { name } = index.material_purchase_unit_category.find(v => v.id == get_item.purchase_unit_id)
                                            add_meal_unit.innerHTML += `<option value="${name}" data=${JSON.stringify(get_item)}>${name}</option>`
                                        }
                                        materialDishFood.innerHTML = ""
                                    }
                                    materialDishFood.appendChild(createDiv)
                                }
                                for (const item of index.material_item) {
                                    const { name } = index.material_purchase_unit_category.find(v => v.id == item.main_unit_id)
                                    if (item.name.split('-')[0] == material.value) {
                                        addMaterialObj = { ...item }
                                        add_meal_unit.innerHTML += `<option value="${name}" data=${JSON.stringify(item)}>${name}</option>`
                                        for (const get_item of getUnitObj(item)) {
                                            const { name } = index.material_purchase_unit_category.find(v => v.id == get_item.purchase_unit_id)
                                            add_meal_unit.innerHTML += `<option value="${name}" data=${JSON.stringify(get_item)}>${name}</option>`
                                        }
                                        break
                                    }
                                }
                            }
                        },
                        sureFun(_parent) {

                            const dateSpan = document.querySelector('.date') // 日计划
                            const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
                            const planDate = new Date(planDateHtml)
                            const demandDate = `${planDate.getMonth() + 1 < 10 ? `0${planDate.getMonth() + 1}` : planDate.getMonth() + 1}-${planDate.getDate() < 10 ? `0${planDate.getDate()}` : planDate.getDate()}`

                            const date = new Date()
                            const nowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`

                            const material = _parent.querySelector('#material')
                            const add_meal_order = _parent.querySelector('#add_meal_order')
                            const add_meal_unit = _parent.querySelector('#add_meal_unit')
                            const unitData = JSON.parse(add_meal_unit.querySelector(`option[value="${add_meal_unit.value}"]`).getAttribute('data'))
                            console.log(unitData)

                            const orderDate = new Date(new Date().getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(unitData.plan_day_purchase_ahead_days))
                            const theOrderDate = `${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`

                            if (material.value.trim() == "" || addMaterialObj == {}) return true
                            const { name } = index.material_top_category.find(e => e.id == addMaterialObj.top_category_id)
                            gridOptions.api.applyTransaction({
                                add: [{
                                    material: addMaterialObj.name.split('-')[0],
                                    creationDate: nowDate,
                                    orderDate:theOrderDate,
                                    demandDate: demandDate,
                                    quantity: Number(addMaterialObj.dish_qty).toFixed(1),
                                    stock: 1000,
                                    standardPrice: Number(addMaterialObj.main_price / unitData.main_unit_bom_unit_ratio).toFixed(1),
                                    marketPrice: Number(addMaterialObj.material_price_alert / unitData.main_unit_bom_unit_ratio).toFixed(1),
                                    shouldOrder: Number(addMaterialObj.dish_qty).toFixed(1),
                                    today: "",
                                    Order: Number(add_meal_order.value).toFixed(1),
                                    deliveryDate: "3-25",
                                    tomorrow: "",
                                    thirdDay: "",
                                    unit: add_meal_unit.value,
                                    supplier: "",
                                    remarks: "",
                                    id: e.node.rowIndex + 1,
                                    category_name: name
                                }], addIndex: e.node.rowIndex + 1
                            })
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
                agOption.api.setColumnDefs(refreshWholeCol.refreshWhole(e.data.material, agOption))
                agOption.api.clearRangeSelection()
            }
        });
    });
}

// 获取食材转化比信息
const getUnitObj = (material) => {
    const ids = [...material.bom_unit_ratio_ids]
    let idsIndex = ids.length - 1
    if (idsIndex < 0) return []
    const arr = index.material_item_bom_unit_ratio.filter(v => {
        if (idsIndex < 0) return false
        if (v.id == ids[idsIndex]) {
            idsIndex--
            return true
        }
    })
    return arr
}

export {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}

export default {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}
