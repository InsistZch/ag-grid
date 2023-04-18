/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from './../../../data/index.js'
import purchase_data from './purchase_data.js'

// export function reset_purchase_rowdata() {
//     purchase_rowdata = []
//     isOneData = false

// }

const row = (agOption, e) => {

    const purchaseData = purchase_data

    let rowData = []
    let d = [] // plan + place
    const dateSpan = document.querySelector('.date') // 日计划
    const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
    const planDate = new Date(planDateHtml)
    const demandDate = `${planDate.getMonth() + 1 < 10 ? `0${planDate.getMonth() + 1}` : planDate.getMonth() + 1}-${planDate.getDate() < 10 ? `0${planDate.getDate()}` : planDate.getDate()}`

    const date = new Date()
    const nowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
    const tomorrowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : date.getDate() + 1}`
    const thirdDayDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 2 < 10 ? `0${date.getDate() + 2}` : date.getDate() + 2}`

    if (purchaseData.isOneData == false) {
        purchaseData.isOneData = true
        const purchase_summary_data = index.purchase_summary_data
        let purD = []
        let wholeD = []

        let purItem = []
        let needWhole = true
        purchase_summary_data.forEach(purData => {
            index.material_item.forEach(item => {
                if (purData.material_id == item.id) {
                    index.material_item_bom_unit_ratio.forEach((unit) => {
                        if (purData.material_id == unit.material_id && purData.main_unit_id == unit.purchase_unit_id) {
                            item.main_unit_bom_unit_ratio = unit.main_unit_bom_unit_ratio
                        }
                    })
                    item.dish_qty = purData.purchase_qty
                    // 使用数据中的日期 不使用自动生成的日期
                    item.creationDate = purData.creationDate
                    item.demandDate = purData.demandDate
                    item.orderDate = purData.orderDate
                    item.purchase_unit_id = purData.purchase_unit_id
                    purItem.push(item)
                }
            })
            if (demandDate == `${purData.demandDate.split('-')[1]}-${purData.demandDate.split('-')[2]}`) {
                needWhole = false // 数据中有plan 就不从配量汇总获取
            }
        });

        purD = getCountMaterial(agOption, purItem)
        if (needWhole == true) {
            wholeD = getCountMaterial(agOption)
        }
        d = new Map([...purD, ...wholeD])
    } else {
        rowData = purchaseData.data
        if (e) {
            const allOldwholeId = []
            const newwholeId = []
            const oldwholeId = e.data.wholeId
            if (e.data.dish_key_id) {
                e.data.dish_key_id.material_item.forEach((mitem) => {
                    newwholeId.push(mitem.id)
                    agOption.api.forEachNode((row) => {
                        if (row.key == null && e.rowIndex != row.rowIndex) {
                            row.data.wholeId && allOldwholeId.push(...row.data.wholeId)
                        }
                    })
                })
            } else {
                agOption.rowData.forEach((row) => {
                    row.dish_key_id.material_item.forEach((mitem) => {
                        newwholeId.push(mitem.id)
                    })
                })
            }

            const purAddItem = []
            const purUpDataItem = []
            const deldata = []
            const cdeldata = []
            if (e.colDef.headerName == '配量汇总') {
                const newValue = e.newValue.split(" ")
                const oldValue = e.oldValue.split(" ")
                let add = []
                const updata = []
                let allwhole = ''
                agOption.api.forEachNode((row) => {
                    if (row.key == null && e.rowIndex != row.rowIndex) {
                        allwhole += `${row.data.whole} `
                    }
                })
                const allOldValue = allwhole.split(" ")
                newValue.forEach((newv, i) => {
                    const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                    if ((oldValue.map(o => o != '' && o.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])).indexOf(newvName) < 0) {
                        add.push({ newvName, num: + newv.match(/([0-9]+)/)[0] })
                    }
                    oldValue.forEach(oldv => {
                        const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        const num = + (newv != '' && newv.match(/([0-9]+)/)[0]) - (oldv != '' && oldv.match(/([0-9]+)/)[0])
                        if (newvName == oldvName && newv != oldv) {
                            updata.push({ newvName, num })
                        }
                    })
                });


                const isadd = []
                add.forEach((a) => {
                    if ((allOldValue.map(o => o != '' && o.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])).indexOf(a.newvName) >= 0) {
                        updata.push(a)
                    } else {
                        isadd.push(a)
                    }
                })
                add = isadd

                e.data.dish_key_id.material_item.forEach((puri) => {
                    const puriname = `${puri.name.split('-')[0]}${puri.dish_process_category_name}`
                    add.forEach((add) => {
                        if (puriname == add.newvName) {
                            purAddItem.push(puri)
                        }
                    })
                    updata.forEach((updata) => {
                        if (puriname == updata.newvName) {
                            purUpDataItem.push({ puriId: puri.id, num: updata.num })
                        }
                    })

                    console.log(purUpDataItem)

                })

                if (newValue.length < oldValue.length) {
                    oldValue.forEach((oldv, i) => {
                        const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        const num = oldv != '' && oldv.match(/([0-9]+)/)[0]
                        if (newValue == '') {
                            if (oldvName != '' && num != '') deldata.push({ name: oldvName, num, oldindex: i, needDel: true })
                        } else {
                            newValue.forEach((newv) => {
                                const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                                if (oldvName != '' && newvName != '' && newvName != oldvName) {
                                    deldata.push({ name: oldvName, num, oldindex: i, needDel: true })
                                }
                            })
                        }
                    });

                    allOldValue.forEach(oldv => {
                        const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        deldata.forEach((del) => {
                            if (del.name == oldvName) {
                                del.needDel = false
                            }
                        })

                    });
                }
            }
            if (e.colDef.headerName == '菜品') {

                newwholeId.forEach((n, i) => {
                    if (allOldwholeId.indexOf(n) < 0) {
                        purAddItem.push(e.data.dish_key_id.material_item[i])
                    }
                    if (allOldwholeId.indexOf(n) >= 0) {
                        purUpDataItem.push({ puriId: n, num: e.data.dish_key_id.material_item[i].dish_qty })
                    }

                })

                oldwholeId.forEach(o => {
                    cdeldata.push(o)
                });

            }
            if (!isNaN(e.colDef.field) && e.data.whole != "") {
                const newValue = e.data.whole.split(" ")
                const oldValue = e.data.isMountWhole.split(" ")


                const updata = []
                newValue.forEach((newv) => {
                    const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                    oldValue.forEach((oldv, i) => {
                        const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        const num = + (newv != '' && newv.match(/([0-9]+)/)[0]) - (oldv != '' && oldv.match(/([0-9]+)/)[0])
                        if (newvName == oldvName && newv != oldv) {
                            updata.push({ newvName, num, wholeId: e.data.wholeId[i] })
                        }
                    })
                });
                e.data.dish_key_id.material_item.forEach((puri) => {
                    // const puriname = `${puri.name.split('-')[0]}${puri.dish_process_category_name}`
                    updata.forEach((updata) => {
                        if (puri.id == updata.wholeId) {
                            purUpDataItem.push({ puriId: puri.id, num: updata.num })
                        }
                    })

                })
            }
            if (!isNaN(e.colDef.field) && e.data.whole == "" && (e.data.type == "特色" || e.data.type == "快餐") && !e.data.dish_key_id) {
                // let rowAllWhole = ''
                // let rowAllIsMountWhole = ''

                // agOption.rowData.forEach((row) => {
                //     rowAllWhole += row.whole + " "
                //     rowAllIsMountWhole += row.isMountWhole + " "
                // })
                // const newValue = rowAllWhole.split(" ")
                // const oldValue = rowAllIsMountWhole.split(" ")

            }

            const materialItemD = getCountMaterial(agOption, purAddItem)
            d = materialItemD

            //     // 修改
            purUpDataItem.forEach(({ puriId, num }) => {
                rowData.forEach(v => {
                    if (puriId == v.id) {
                        // v.quantity = (+v.quantity) + num
                        v.Order = v.purchase_freq == "day" ? (nowDate == v.orderDate ? (+v.Order) + num : 0) : 0
                        v.tomorrow = v.purchase_freq == "day" ? (tomorrowDate == v.orderDate ? (+v.tomorrow) + num : 0) : 0
                        v.thirdDay = v.purchase_freq == "day" ? (thirdDayDate == v.orderDate ? (+v.thirdDay) + num : 0) : 0
                        v.shouldOrder = (+ v.shouldOrder) + num

                        if (v.Order < 0 || v.tomorrow < 0 || v.thirdDay < 0 || v.shouldOrder < 0) {
                            v.Order = 0
                            v.tomorrow = 0
                            v.thirdDay = 0
                            v.shouldOrder = 0
                        }
                    }
                })
            })

            deldata.forEach(({ num, oldindex, needDel }) => {
                rowData.forEach((v, i) => {

                    if (e.data.wholeId[oldindex] == v.id) {
                        if (needDel == true) {
                            rowData.splice(i, 1)
                        } else {

                            v.Order = v.purchase_freq == "day" ? (nowDate == v.orderDate ? (+v.Order) - num : 0) : 0
                            v.tomorrow = v.purchase_freq == "day" ? (tomorrowDate == v.orderDate ? (+v.tomorrow) - num : 0) : 0
                            v.thirdDay = v.purchase_freq == "day" ? (thirdDayDate == v.orderDate ? (+v.thirdDay) - num : 0) : 0
                            v.shouldOrder = (+ v.shouldOrder) + num

                            if (v.Order < 0 || v.tomorrow < 0 || v.thirdDay < 0 || v.shouldOrder < 0) {
                                v.Order = 0
                                v.tomorrow = 0
                                v.thirdDay = 0
                                v.shouldOrder = 0
                            }
                        }
                    }
                })
            })

            cdeldata.forEach((c) => {
                rowData.forEach((v, i) => {
                    if (c == v.id) {
                        rowData.splice(i, 1)
                    }
                })
            })

            e.data.wholeId = newwholeId
            e.data.isMountWhole = e.data.whole

        }
    }
    d.forEach((v, i) => {
        const { name } = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)

        const orderDate = new Date(planDate.getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(v.plan_day_purchase_ahead_days))
        const theOrderDate = `${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`

        let obj = {
            material: v.name.split('-')[0],
            creationDate: v.creationDate ? `${v.creationDate.split('-')[1]}-${v.creationDate.split('-')[2]}` : nowDate,
            orderDate: v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate,
            demandDate: v.demandDate ? `${v.demandDate.split('-')[1]}-${v.demandDate.split('-')[2]}` : demandDate,
            quantity: v.purchase_freq == "day" ? (v.dish_qty) : 0,
            shouldOrder: Number(v.dish_qty.toFixed(1)),
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            today: "",
            Order: (v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == nowDate ? Number(v.dish_qty.toFixed(1)) : 0,
            deliveryDate: moment().format("MM-DD"),
            tomorrow: (v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == tomorrowDate ? Number(v.dish_qty.toFixed(1)) : 0,
            thirdDay: (v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == thirdDayDate ? Number(v.dish_qty.toFixed(1)) : 0,
            unit: unitName.name,
            main_unit_id: v.main_unit_id,
            purchase_unit_id: v.purchase_unit_id,
            supplier: "",
            remarks: "",
            id: !v.demandDate || `${v.demandDate.split('-')[1]}-${v.demandDate.split('-')[2]}` == demandDate ? i : `noDaliy${i}`,
            category_name: name,
            purchase_freq: v.purchase_freq
        }
        rowData.push(obj)
    })

    purchaseData.data = rowData
    return rowData
}

export default row