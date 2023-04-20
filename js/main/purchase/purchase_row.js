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

    const numFormat = (num) => {
        return (Number(num) >= 10 ? Math.ceil(num) : Number(num).toFixed(1))
    }

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
        // console.log(rowData)
        if (e) {
            const allOldwholeId = []
            const newwholeRI = [] // 新的配量汇总的main_unit_bom_unit_ratio 和 id
            const oldwholeId = e.data.wholeId

            // 是不是改变快餐和特色
            console.log(e)
            if (e.data.dish_key_id) {
                e.data.dish_key_id.material_item.forEach((mitem) => {
                    console.log(mitem)
                    newwholeRI.push({
                        mainRatio: mitem.main_unit_bom_unit_ratio,
                        id: mitem.id

                    })

                })
            } else {
                agOption.rowData.forEach((row) => {
                    row.dish_key_id.material_item.forEach((mitem) => {
                        newwholeRI.push({
                            mainRatio: mitem.main_unit_bom_unit_ratio,
                            id: mitem.id
                        })
                    })
                })
            }
            agOption.api.forEachNode((row) => {
                if (row.key == null && e.rowIndex != row.rowIndex) {
                    row.data.wholeId && allOldwholeId.push(...row.data.wholeId)
                }
            })

            // // 新的配量汇总的id
            const newwholeId = []
            newwholeRI.forEach((nwId) => {
                newwholeId.push(nwId.id)
            })

            const purAddItem = []
            const purUpDataItem = []
            const deldata = []
            if (e.colDef.headerName == '配量汇总') {
                if (e.newValue == null) e.newValue = ""
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
                    // newvName != false 新值为空不进行判断
                    if (newvName != false && (oldValue.map(ov => ov != '' && ov.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])).indexOf(newvName) < 0) {
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
                // 加入的食材是增加进入采购单还是修改采购单
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
                    let puriMainRatio = 1
                    add.forEach((add) => {
                        if (puriname == add.newvName) {
                            purAddItem.push(puri)
                        }
                    })
                    updata.forEach((updata) => {
                        if (puriname == updata.newvName) {
                            puriMainRatio = puri.main_unit_bom_unit_ratio
                            console.log(puriMainRatio)
                            purUpDataItem.push({ puriId: puri.id, num: (updata.num) / puriMainRatio })
                        }
                    })
                })

                oldwholeId.forEach((oldI, i) => {
                    if (newwholeId.includes(oldI) == false) {
                        const unit_id = index.material_purchase_unit_category.find(v => v.name == oldValue[i].match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[1]).id
                        const unit = index.material_item_bom_unit_ratio.find(v => v.purchase_unit_id == unit_id && v.material_id == oldI)
                        const unitMR = unit.main_unit_bom_unit_ratio
                        const num = oldValue[i].match(/([0-9]+)/)[0]
                        deldata.push({ oldI, num: (+num) / unitMR, oldindex: i, needDel: true })
                    }
                })
                // 删除食材采购单食材食材还是减少数量
                allOldwholeId.forEach(aAldI => {
                    deldata.forEach((del) => {
                        if (del.oldI == aAldI) {
                            del.needDel = false
                        }
                    })
                });

                // console.log(deldata)
            }
            if (e.colDef.headerName == '菜品') {

                newwholeId.forEach((n, i) => {
                    if (allOldwholeId.indexOf(n) < 0) {
                        purAddItem.push(e.data.dish_key_id.material_item[i])
                    }
                    if (allOldwholeId.indexOf(n) >= 0) {
                        const mainRatio = newwholeRI[i].mainRatio
                        purUpDataItem.push({ puriId: n, num: (e.data.dish_key_id.material_item[i].dish_qty) / mainRatio })
                    }

                })
                oldwholeId.forEach((oldI, i) => {
                    const oldValue = e.data.isMountWhole.split(" ")
                    // deldata.push({ oldI, num: (+num) / unitMR, oldindex: i, needDel: true })
                    // oldValue.forEach((oldv, i) => {\
                    const unit_id = index.material_purchase_unit_category.find(v => v.name == oldValue[i].match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[1]).id
                    const unit = index.material_item_bom_unit_ratio.find(v => v.purchase_unit_id == unit_id && v.material_id == oldI)
                    const unitMR = unit != undefined ? unit.main_unit_bom_unit_ratio : 0
                    const num = oldValue[i] != '' && oldValue[i].match(/([0-9]+)/)[0]
                    deldata.push({ oldI, num: (+num) / unitMR, oldindex: i, needDel: true })

                    // })
                })
                // 删除食材采购单食材食材还是减少数量
                console.log(allOldwholeId)
                allOldwholeId.forEach(aAldI => {
                    deldata.forEach((del) => {
                        if (del.oldI == aAldI) {
                            del.needDel = false
                        }
                    })
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
                            const puriMainRatio = puri.main_unit_bom_unit_ratio
                            purUpDataItem.push({ puriId: puri.id, num: (updata.num) / puriMainRatio })
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
                        v.Order = nowDate == v.orderDate ? numFormat((+v.Order) + num) : 0
                        v.tomorrow = tomorrowDate == v.orderDate ? numFormat((+v.tomorrow) + num) : 0
                        v.thirdDay = thirdDayDate == v.orderDate ? numFormat((+v.thirdDay) + num) : 0
                        v.shouldOrder = numFormat((+ v.shouldOrder) + num)

                        if (v.Order < 0 || v.tomorrow < 0 || v.thirdDay < 0 || v.shouldOrder < 0) {
                            v.Order = 0
                            v.tomorrow = 0
                            v.thirdDay = 0
                            v.shouldOrder = 0
                        }
                    }
                })
            })

            console.log(deldata)

            deldata.forEach(({ num, oldindex, needDel }) => {
                rowData.forEach((v, i) => {
                    if (e.data.wholeId[oldindex] == v.id) {
                        console.log(oldindex)
                        if (needDel == true) {
                            rowData.splice(i, 1)
                        } else {
                            v.Order = nowDate == v.orderDate ? numFormat((+v.Order) - num) : 0
                            v.tomorrow = tomorrowDate == v.orderDate ? numFormat((+v.tomorrow) - num) : 0
                            v.thirdDay = thirdDayDate == v.orderDate ? numFormat((+v.thirdDay) - num) : 0
                            v.shouldOrder = numFormat((+ v.shouldOrder) - num)

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

            console.log(purAddItem, purUpDataItem, rowData)

            // cdeldata.forEach((c) => {
            //     rowData.forEach((v, i) => {
            //         if (c == v.id) {
            //             rowData.splice(i, 1)
            //         }
            //     })
            // })

            e.data.wholeId = newwholeId
            e.data.isMountWhole = e.data.whole

        }
    }
    d.forEach((v, i) => {
        const { name } = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)

        const orderDate = new Date(planDate.getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(v.plan_day_purchase_ahead_days))
        const theOrderDate = `${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`

        const id = (i + "").split('summary_data')[0]
        let obj = {
            material: v.name.split('-')[0],
            creationDate: v.creationDate ? `${v.creationDate.split('-')[1]}-${v.creationDate.split('-')[2]}` : nowDate,
            orderDate: v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate,
            demandDate: v.demandDate ? `${v.demandDate.split('-')[1]}-${v.demandDate.split('-')[2]}` : demandDate,
            quantity: v.purchase_freq == "day" ? numFormat(v.dish_qty) : 0,
            shouldOrder: Number(v.dish_qty.toFixed(1)),
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            today: "",
            Order: (v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == nowDate ? numFormat(v.dish_qty) : 0,
            deliveryDate: moment().format("MM-DD"),
            tomorrow: (v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == tomorrowDate ? numFormat(v.dish_qty) : 0,
            thirdDay: (v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == thirdDayDate ? numFormat(v.dish_qty) : 0,
            unit: unitName.name,
            main_unit_id: v.main_unit_id,
            purchase_unit_id: v.purchase_unit_id,
            supplier: "",
            remarks: "",
            id: !v.demandDate || `${v.demandDate.split('-')[1]}-${v.demandDate.split('-')[2]}` == demandDate ? (id) : `noDaliy${id}`,
            category_name: name,
            purchase_freq: v.purchase_freq
        }
        rowData.push(obj)
    })

    purchaseData.data = rowData
    return rowData
}

export default row