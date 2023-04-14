/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from './../../../data/index.js'
import purchase_data from './purchase_data.js'

let purchase_rowdata = []
let isOneData = false

const row = (agOption, e) => {
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

    if (isOneData == false) {
        isOneData = true
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
                    item.dish_qty = purData.main_qty
                    // 使用数据中的日期 不使用自动生成的日期
                    item.creationDate = purData.creationDate
                    item.demandDate = purData.demandDate
                    item.orderDate = purData.orderDate
                    purItem.push(item)
                }
            })
            if (demandDate == purData.demandDate) {
                needWhole = false // 数据中有plan 就不从配量汇总获取
            }
        });

        purD = getCountMaterial(agOption, purItem)
        if (needWhole == true) {
            wholeD = getCountMaterial(agOption)
        }
        d = new Map([...purD, ...wholeD])
    } else {
        rowData = purchase_rowdata.data
        if (e) {
            const newValue = e.newValue.split(" ")
            const oldValue = e.oldValue.split(" ")

            let allwhole = ``
            agOption.api.forEachNode((row) => {
                if (row.key == null && e.rowIndex != row.rowIndex) {
                    allwhole += `${row.data.whole} `

                }
            })
            const allOldValue = allwhole.split(" ")

            if (newValue.length >= oldValue.length) {
                const add = newValue
                const updata = []
                oldValue.forEach(oldv => {
                    newValue.forEach((newv, i) => {
                        const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        if (newvName == oldvName) {
                            add.splice(i, 1)
                        }
                        if (newvName == oldvName && newv != oldv) {
                            const num = newv.match(/([0-9]+)/)[0] - oldv.match(/([0-9]+)/)[0]
                            updata.push({ name: newvName, num })
                        }
                    })
                });
                allOldValue.forEach(oldv => {
                    newValue.forEach((newv, i) => {
                        const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        if (newvName == oldvName) {
                            add.splice(i, 1)
                            const num = +(newv.match(/([0-9]+)/)[0])
                            updata.push({ name: newvName, num })
                        }
                    })
                });
                const purAddItem = []
                const purUpDataItem = []
                const wholeId = []
                e.data.dish_key_id.material_item.forEach((puri) => {
                    const puriname = `${puri.name.split('-')[0]}${puri.dish_process_category_name}`
                    add.forEach((add) => {
                        const name = add.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0]
                        if (puriname == name) {
                            purAddItem.push(puri)
                        }
                    })
                    updata.forEach((updata) => {
                        const name = updata.name
                        if (puriname == name) {
                            purUpDataItem.push({ puri, num: updata.num })
                        }
                    })

                    wholeId.push(puri.id)
                })

                //添加
                const materialItemD = getCountMaterial(agOption, purAddItem)
                d = materialItemD
                e.data.wholeId = wholeId

                // 修改
                purUpDataItem.forEach(({ puri, num }) => {
                    const puriname = puri.name.split('-')[0]
                    rowData.forEach(v => {
                        if (puriname == v.material) {
                            console.log(v, puri, num)
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

            } else {
                const deldata = []
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

                deldata.forEach(({ name, num, oldindex, needDel }) => {
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
                deldata.forEach(({oldindex}) => {
                    e.data.wholeId.splice(oldindex, 1)
                })
            }
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
            quantity: v.dish_qty,
            shouldOrder: v.purchase_freq == "day" ? (v.dish_qty) : 0,
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            today: "",
            Order: v.purchase_freq == "day" ? ((v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == nowDate ? v.dish_qty : 0) : 0,
            deliveryDate: moment().format("MM-DD"),
            tomorrow: v.purchase_freq == "day" ? ((v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == tomorrowDate ? v.dish_qty : 0) : 0,
            thirdDay: v.purchase_freq == "day" ? ((v.orderDate ? `${v.orderDate.split('-')[1]}-${v.orderDate.split('-')[2]}` : theOrderDate) == thirdDayDate ? v.dish_qty : 0) : 0,
            unit: unitName.name,
            supplier: "",
            remarks: "",
            id: i,
            category_name: name,
            purchase_freq: v.purchase_freq
        }
        rowData.push(obj)
    })

    purchase_rowdata = new purchase_data(rowData)
    return rowData
}

export default row