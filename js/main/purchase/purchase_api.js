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
                            const demandDate = moment(planDate).format("YYYY-MM-DD")

                            const date = new Date()
                            const nowDate = moment().format("YYYY-MM-DD")
                            const tomorrowDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)).format("YYYY-MM-DD")
                            const thirdDayDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)).format("YYYY-MM-DD")

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

                            const orderDate = moment(new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate() + Number(unitData.plan_day_purchase_ahead_days))).format('YYYY-MM-DD')
                            console.log(orderDate)

                            if (material.value.trim() == "" || addMaterialObj == {}) return true

                            const { name } = index.material_top_category.find(e => e.id == addMaterialObj.top_category_id)

                            const obj = {
                                material: addMaterialObj.name.split('-')[0],
                                creationDate: nowDate,
                                orderDate: orderDate,
                                demandDate: demandDate,
                                quantity: addMaterialObj.purchase_freq == "day" ? (Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(2)) : 0,
                                stock: 1000,
                                // standardPrice: Number(addMaterialObj.main_price / unitData.main_unit_bom_unit_ratio).toFixed(1),
                                // marketPrice: Number(addMaterialObj.material_price_alert / unitData.main_unit_bom_unit_ratio).toFixed(1),
                                standardPrice: Number(addMaterialObj.main_price).toFixed(1),
                                marketPrice: Number(addMaterialObj.material_price_alert).toFixed(1),
                                shouldOrder: Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(2),
                                today: "",
                                Order: nowDate == orderDate ? (Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(2)) : 0,
                                deliveryDate: "3-25",
                                tomorrow: tomorrowDate == orderDate ? Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(2) : 0,
                                thirdDay: thirdDayDate == orderDate ? Number(add_meal_order.value) >= 10 ? Math.ceil(Number(add_meal_order.value)) : +Number(add_meal_order.value).toFixed(2) : 0,
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

                            if (noDailyProcurement.checked == true && noNowProcurement.checked == false) {
                                purchaseOption.rowData.forEach((v) => {
                                    if (nowDate == v.orderDate) {
                                        showData.push(v)
                                    }
                                })
                            } else if (noDailyProcurement.checked == false && noNowProcurement.checked == true) {
                                purchaseOption.rowData.forEach((v) => {
                                    if (v.purchase_freq == 'day') {
                                        showData.push(v)
                                    }
                                })
                            } else if (noDailyProcurement.checked == false && noNowProcurement.checked == false) {
                                purchaseOption.rowData.forEach((v) => {
                                    if (v.purchase_freq == 'day' && nowDate == v.orderDate) {
                                        showData.push(v)
                                    }
                                })
                            }
                            else {
                                showData = purchaseOption.rowData
                            }
                            console.log(showData)
                            purchaseOption.api.setRowData(showData)
                            isShowPurchaseColumns(purchaseOption)
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
            if (String(e.newValue).indexOf(".") > 0) newValue = Number(newValue) >= 10 ? (Math.ceil(Number(newValue))) : Number(Number(newValue).toFixed(2))
            rowNode.setDataValue(e.colDef.field, newValue)
            e.data.shouldOrder = newValue
        }
    } else if (e.colDef.headerName == '下单日期') {
        const nowDate = moment().format("YYYY-MM-DD")
        const date = new Date()
        const minD = new Date(nowDate)
        const maxD = new Date(e.data.demandDate)
        let newD = new Date(e.newValue)
        console.log(newD, maxD, minD)

        // 可以输入 01-01 也可1000-01-01
        const timeTextTow = /^(\d{2})-(\d{2})$/
        if (timeTextTow.test(e.newValue)) {
            e.newValue = moment(new Date(`${date.getFullYear()}-${e.newValue}`)).format("YYYY-MM-DD")
            newD = new Date(e.newValue)
        }

        const timeTextThrid = /^(\d{4})-(\d{2})-(\d{2})$/

        const rowNode = e.api.getRowNode(e.data.id)
        if (e.newValue == '' || newD < minD || newD > maxD || !timeTextThrid.test(e.newValue)) {
            console.log(newD < minD, newD > maxD, timeTextThrid.test(e.newValue))
            rowNode.setDataValue(e.colDef.field, e.oldValue)
        } else {
            console.log(e.newValue)
            const nowDate = moment().format("YYYY-MM-DD")
            const tomorrowDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)).format("YYYY-MM-DD")
            const thirdDayDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)).format("YYYY-MM-DD")
            rowNode.setDataValue('Order', e.newValue == nowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('tomorrow', e.newValue == tomorrowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('thirdDay', e.newValue == thirdDayDate ? rowNode.data.shouldOrder : 0)

        }
        e.api.refreshCells({ force: true })
    }
}

const onCellClicked = (e, purchaseOption, agOption) => {
    let isNeedMaterial = false
    agOption.rowData.forEach(row => {
        row.dish_key_id.material_item.forEach(item => {
            if (item.name.split("-")[0] == (e.data.material)) {
                isNeedMaterial = true
                agOption.api.setColumnDefs(refreshWholeCol.refreshWhole(e.data.material, agOption))
                agOption.api.clearRangeSelection()
            }
        });
    });
    console.log(isNeedMaterial)
    if (isNeedMaterial == false) {
        agOption.api.setColumnDefs(refreshWholeCol.refreshWhole('', agOption))
    }

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
