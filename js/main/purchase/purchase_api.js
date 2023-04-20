/** @odoo-module **/

import refreshWholeCol from "../otherApi/refreshWholeCol.js";
import resetPurchaseData from '../otherApi/resetPurchaseData.js'
import isShowPurchaseColumns from "./isShowPurchaseColumns.js";
import { customFrom as customFromDom, isShowColumns as newisShowColumns } from './../otherApi/index.js'
import index from '../../../data/index.js'

/** @odoo-module **/
const getRowId = (params) => params.data.id;

const getContextMenuItems = (e, purchaseOption, agOption) => {
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

                                            add_meal_unit.innerHTML += `<option value="${name}" data=${JSON.stringify(item)}>${name}</option>`
                                            // console.log(item, get_item)
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
                            const tomorrowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : date.getDate() + 1}`
                            const thirdDayDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 2 < 10 ? `0${date.getDate() + 2}` : date.getDate() + 2}`

                            const material = _parent.querySelector('#material')
                            const add_meal_order = _parent.querySelector('#add_meal_order')
                            const add_meal_unit = _parent.querySelector('#add_meal_unit')
                            if (add_meal_unit.querySelector(`option[value="${add_meal_unit.value}"]`) == null) {
                                const mask = document.querySelector('.mask')
                                mask.style.display = 'block'
                                const alert = (message, type) => {
                                    const div = document.createElement('div')
                                    div.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
                                    mask.innerHTML = '';
                                    mask.append(div)
                                }
                                alert('没有食材!', 'warning')

                                const timer = setTimeout(() => {
                                    mask.style.display = 'none'
                                }, 2000)
                                // 清空定时器
                                for (let i = 1; i < timer; i++) {
                                    clearTimeout(i);
                                }

                                return
                            }
                            const unitData = JSON.parse(add_meal_unit.querySelector(`option[value="${add_meal_unit.value}"]`).getAttribute('data'))

                            const orderDate = new Date(planDate.getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(unitData.plan_day_purchase_ahead_days))
                            const theOrderDate = `${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`

                            if (material.value.trim() == "" || addMaterialObj == {}) return true

                            const { name } = index.material_top_category.find(e => e.id == addMaterialObj.top_category_id)

                            const obj = {
                                material: addMaterialObj.name.split('-')[0],
                                creationDate: nowDate,
                                orderDate: theOrderDate,
                                demandDate: demandDate,
                                quantity: addMaterialObj.purchase_freq == "day" ? (Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(1)) : 0,
                                stock: 1000,
                                // standardPrice: Number(addMaterialObj.main_price / unitData.main_unit_bom_unit_ratio).toFixed(1),
                                // marketPrice: Number(addMaterialObj.material_price_alert / unitData.main_unit_bom_unit_ratio).toFixed(1),
                                standardPrice: Number(addMaterialObj.main_price).toFixed(1),
                                marketPrice: Number(addMaterialObj.material_price_alert).toFixed(1),
                                shouldOrder: Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(1),
                                today: "",
                                Order: nowDate == theOrderDate ? (Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(1)) : 0,
                                deliveryDate: "3-25",
                                tomorrow: tomorrowDate == theOrderDate ? Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(1) : 0,
                                thirdDay: thirdDayDate == theOrderDate ? Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(1) : 0,
                                unit: add_meal_unit.value,
                                purchase_unit_id: index.material_purchase_unit_category.find(v => v.name == add_meal_unit.value).id,
                                main_unit_id: index.material_item.find(v => v.name = addMaterialObj.name.split('-')[0]).main_unit_id,
                                supplier: "",
                                remarks: "",
                                id: purchaseOption.rowData.length + 1,
                                purchase_freq: addMaterialObj.purchase_freq,
                                category_name: name,
                                newAdd: true,
                            }
                            // purchaseOption.api.applyTransaction({
                            //     add: [obj], addIndex: e.node.rowIndex + 1
                            // })
                            purchaseOption.rowData.push(obj)
                            let showData = []

                            const noDailyProcurement = document.querySelector('#noDailyProcurement')

                            if (noDailyProcurement.checked == true && noNowProcurement.checked == true) {
                                showData = purchaseOption.rowData
                            } else if (noDailyProcurement.checked == true && noNowProcurement.checked == false) {
                                purchaseOption.rowData.forEach((v) => {
                                    if (v.creationDate == v.orderDate) {
                                        showData.push(v)
                                    }
                                })
                            } else if (noDailyProcurement.checked == false && noNowProcurement.checked == true) {
                                purchaseOption.rowData.forEach((v) => {
                                    if (v.purchase_freq == 'day') {
                                        showData.push(v)
                                    }
                                })
                            }

                            purchaseOption.api.setRowData(showData)
                            isShowPurchaseColumns(purchaseOption)
                            // console.log(purchaseOption)
                            return true
                        }
                    })
                }
            }
        },
        {
            name: '删除食材',
            action: () => {
                purchaseOption.rowData.forEach((v, i) => {
                    if (v.id == e.node.data.id) {
                        purchaseOption.rowData.splice(i, 1)
                    }
                })

                purchaseOption.api.setRowData(purchaseOption.rowData)

            }
        }
    ]
    return result
}

const onCellValueChanged = (e, purchaseOption) => {


    if (e.colDef.headerName == '下单' || e.colDef.headerName == '明天' || e.colDef.headerName == '后天') {
        let newValue = 0;
        const rowNode = purchaseOption.api.getRowNode(e.data.id)
        if (e.newValue == 0 || e.newValue == null || e.newValue == undefined) {
            rowNode.setDataValue(e.colDef.field, newValue)
        } else if (isNaN(e.newValue)) {
            rowNode.setDataValue(e.colDef.field, e.oldValue)
        } else {
            newValue = Number(e.newValue)
            if (String(e.newValue).indexOf(".") > 0) newValue = Number(newValue) >= 10 ? Math.ceil(Number(newValue)) : Number(newValue).toFixed(2)
            rowNode.setDataValue(e.colDef.field, newValue)
            e.data.shouldOrder = newValue
        }
    } else if (e.colDef.headerName == '下单日期') {
        const d = new Date()
        const minD = new Date(`${d.getFullYear()}-${e.data.creationDate}`)
        const maxD = new Date(`${d.getFullYear()}-${e.data.demandDate}`)
        const newD = new Date(`${d.getFullYear()}-${e.newValue}`)
        console.log(e, minD, maxD, newD)

        const timeText = /^(\d{2})-(\d{2})$/
        const rowNode = e.api.getRowNode(e.data.id)
        if (e.newValue == '' || newD < minD || newD > maxD || !timeText.test(e.newValue)) {
            rowNode.setDataValue(e.colDef.field, e.oldValue)
        } else {
            const nowDate = `${d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1}-${d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()}`
            const tomorrowDate = `${d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1}-${d.getDate() + 1 < 10 ? `0${d.getDate() + 1}` : d.getDate() + 1}`
            const thirdDayDate = `${d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1}-${d.getDate() + 2 < 10 ? `0${d.getDate() + 2}` : d.getDate() + 2}`

            rowNode.setDataValue('Order', e.newValue == nowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('tomorrow', e.newValue == tomorrowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('thirdDay', e.newValue == thirdDayDate ? rowNode.data.shouldOrder : 0)
            // console.log(this.params.api.getColumnDefs())
            // this.params.api.setColumnDefs(this.params.api.getColumnDefs())

        }
        e.api.refreshCells({ force: true })
    }
}

const onCellClicked = (e, purchaseOption, agOption) => {
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
    // console.log(arr)
    return arr
}



export {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}

export default {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}
