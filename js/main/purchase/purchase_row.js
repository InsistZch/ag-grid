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
            const allOldwholeId = []
            const newwholeId = []
            const oldwholeId = e.data.wholeId
            e.data.dish_key_id.material_item.forEach((mitem) => {
                newwholeId.push(mitem.id)

            })
            agOption.api.forEachNode((row) => {
                if (row.key == null && e.rowIndex != row.rowIndex) {
                    allOldwholeId.push(...row.data.wholeId)
                }
            })
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
                    console.log(puri)
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
                    console.log(allOldwholeId, n)
                    if (allOldwholeId.indexOf(n) < 0) {
                        purAddItem.push(e.data.dish_key_id.material_item[i])
                    }
                    if (allOldwholeId.indexOf(n) >= 0) {
                        purUpDataItem.push({ puriId: n, num: e.data.dish_key_id.material_item[i].dish_qty })
                    }

                })

                oldwholeId.forEach(o => {
                    console.log(o)
                    cdeldata.push(o)
                });

                console.log(purAddItem, purUpDataItem)
            }
            if (!isNaN(e.colDef.field)) {
                const newValue = e.data.whole.split(" ")
                const oldValue = e.data.isMountWhole.split(" ")

                console.log(newValue, oldValue)

                const updata = []
                newValue.forEach((newv, i) => {
                    const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                    oldValue.forEach(oldv => {
                        const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
                        const num = + (newv != '' && newv.match(/([0-9]+)/)[0]) - (oldv != '' && oldv.match(/([0-9]+)/)[0])
                        if (newvName == oldvName && newv != oldv) {
                            updata.push({ newvName, num })
                        }
                    })
                });
                console.log(updata)
                e.data.dish_key_id.material_item.forEach((puri) => {
                    const puriname = `${puri.name.split('-')[0]}${puri.dish_process_category_name}`
                    updata.forEach((updata) => {
                        console.log(puri,updata.newvName)
                        if (puriname == updata.newvName) {
                            purUpDataItem.push({ puriId: puri.id, num: updata.num })
                        }
                    })

                })
                console.log(purUpDataItem)
            }
            // const newValue = e.newValue.split(" ")
            // const oldValue = e.oldValue.split(" ")

            // let allwhole = ``
            // agOption.api.forEachNode((row) => {
            //     if (row.key == null && e.rowIndex != row.rowIndex) {
            //         allwhole += `${row.data.whole} `

            //     }
            // })
            // const allOldValue = allwhole.split(" ")

            // if (newValue.length >= oldValue.length) {
            //     const add = newValue
            //     const updata = []
            //     oldValue.forEach(oldv => {
            //         newValue.forEach((newv, i) => {
            //             const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
            //             const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
            //             if (newvName == oldvName) {
            //                 add.splice(i, 1)
            //             }
            //             if (newvName == oldvName && newv != oldv) {
            //                 const num = newv.match(/([0-9]+)/)[0] - oldv.match(/([0-9]+)/)[0]
            //                 updata.push({ name: newvName, num })
            //             }
            //         })
            //     });
            //     allOldValue.forEach(oldv => {
            //         newValue.forEach((newv, i) => {
            //             const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
            //             const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
            //             if (newvName == oldvName) {
            //                 add.splice(i, 1)
            //                 const num = +(newv.match(/([0-9]+)/)[0])
            //                 updata.push({ name: newvName, num })
            //             }
            //         })
            //     });

            //     const purAddItem = []
            //     const purUpDataItem = []
            //     const wholeId = []
            //     e.data.dish_key_id.material_item.forEach((puri) => {
            //         const puriname = `${puri.name.split('-')[0]}${puri.dish_process_category_name}`
            //         add.forEach((add) => {
            //             const name = add.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0]
            //             if (puriname == name) {
            //                 purAddItem.push(puri)
            //             }
            //         })
            //         updata.forEach((updata) => {
            //             const name = updata.name
            //             if (puriname == name) {
            //                 purUpDataItem.push({ puri, num: updata.num })
            //             }
            //         })

            //         // wholeId.push(puri.id)
            //     })

            //     //添加
            const materialItemD = getCountMaterial(agOption, purAddItem)
            d = materialItemD

            //     // 修改
            purUpDataItem.forEach(({ puriId, num }) => {
                rowData.forEach(v => {
                    if (puriId == v.id) {
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

            // } else {
            //     const deldata = []
            //     oldValue.forEach((oldv, i) => {
            //         const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
            //         const num = oldv != '' && oldv.match(/([0-9]+)/)[0]
            //         if (newValue == '') {
            //             if (oldvName != '' && num != '') deldata.push({ name: oldvName, num, oldindex: i, needDel: true })
            //         } else {
            //             newValue.forEach((newv) => {
            //                 const newvName = (newv != '' && newv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
            //                 if (oldvName != '' && newvName != '' && newvName != oldvName) {
            //                     deldata.push({ name: oldvName, num, oldindex: i, needDel: true })
            //                 }
            //             })
            //         }
            //     });

            //     allOldValue.forEach(oldv => {
            //         const oldvName = (oldv != '' && oldv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0])
            //         deldata.forEach((del) => {
            //             if (del.name == oldvName) {
            //                 del.needDel = false
            //             }
            //         })

            //     });

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
            // deldata.forEach(({ oldindex }) => {
            //     e.data.wholeId.splice(oldindex, 1)
            // })
            // }
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
            main_unit_id: v.main_unit_id,
            purchase_unit_id: v.purchase_unit_id,
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