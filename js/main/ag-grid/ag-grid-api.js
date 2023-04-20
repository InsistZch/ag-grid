/** @odoo-module **/
import agGridRow from "./ag-grid-row.js"
import index from '../../../data/index.js'
import saveData from "../saveData/index.js"
import { add_dish_bom_id, add_material_id, add_material_item_bom_unit_ratio_id } from "../tool.js"
import m from "./specialMeal.js"
import copiesNumber from '../ag_common/CopiesNumber.js'
import { countMaterialData } from './ag-grid-row.js'
import mealcopies from './special_fast_data.js'
import { init_mp } from "./ag-grid-row.js"
import countID from './countID.js'
import { customFrom as customFromDom, resetPurchaseData } from './../otherApi/index.js'
import { changedValuetoData, anew_top_cost } from './ag_common.js'
// import 

// 添加对应数据
const addData = (e, i, el) => {
    el.innerHTML +=
        i == 0 ? `<option value="${e.id}" selected>${e.name}</option>` :
            `<option value="${e.id}">${e.name}</option>`
}
// 添加material_item中的数据
// 计算表单中份数，成本
// 判断当前数值是否大于限制数字，如果超过，则按照限制的最大数字变动
const calculateCopies = (data) => {
    // 初始化份数数据
    let Copies = 0
    // 找到所有客户
    const cus_locs = Object.keys(data).filter(v => !isNaN(v))
    for (const c_item of cus_locs) {
        Copies += Number(data[c_item])
    }
    // console.log(Copies, data['Copies'])
    const d = countMaterialData({
        material_items: data['dish_key_id']['material_item'],
        dish_key_id: data['dish_key_id']['id'],
        oldCopies: data['Copies'],
        newCopies: Copies,
        update: data.update
    })
    data['Copies'] = Copies
    data['whole'] = d[0]
    data['dish_key_id']['material_item'] = d[1]
    // console.log(d[2])
    data['costPrice'] = d[2]
    return data
}
let copiesChangedjudeg = false
// 40 -> 30  60 -> 70
let copiesChanged = (e, ratio) => {
    e.api.forEachNode(v => nodeRowData(v, e, ratio, e.data.type))
    e.api.refreshCells({ force: true })

}
// v => 循环数据
// e => 本行数据
// ratio => 比率
const nodeRowData = (v, e, ratio, type) => {
    // 去除不同数据
    if (v.data == undefined || v.data.cl1 != e.data.cl1) return
    // 去除配置
    if (v.data.configure) return
    // 去除快餐或者特色餐
    if (type == "快餐") {
        if (v.data.specialMealColor != undefined) return
    } else {
        if (v.data.specialMealColor == undefined && v.data.type != "汤粥") return
    }
    if (v.data.type == "汤粥") {
        const arr = mealcopies().filter(v => v.cl1 == e.data.cl1).map(v => v[e.colDef.field])
        v.data[e.colDef.field] = 0
        for (const item of arr) {
            v.data[e.colDef.field] += item
        }
        return
    }
    // 去除当前值为0的数据
    if (v.data[`${e.colDef.field}`] == 0) return

    v.data[`${e.colDef.field}`] = Number(v.data[`${e.colDef.field}`])
    let value = 0
    if (e.oldValue == 0) {
        value = e.newValue
    } else {
        value = copiesNumber(Math.ceil(v.data[`${e.colDef.field}`] + (v.data[`${e.colDef.field}`] * ratio)))
    }
    v.data[e.colDef.field] = value

    // const rowNode = e.api.getRowNode(v.data.id)
    // rowNode.setDataValue(e.colDef.field, value)
    // await rowNode.setData(calculateCopies(v.data))
    // console.log(v.data)
}



// 修改特色餐 上面的份数也需要变动 总份数不变
// 汤面总数为 特色餐 + 普通餐
// cellRenderer > onCellValueChanged
const onCellValueChanged = async (e, gridOptions) => {

    const saveDataBtn = document.querySelector('#saveDataBtn')
    saveDataBtn.classList.remove('btn-outline-primary')
    saveDataBtn.classList.add('btn-outline-danger')
    // saveDataBtn.innerText = "数据已经变化，如退出请按“更新”按钮"
    saveDataBtn.innerText = "请保存"
    // let newDate = new Date() * 1
    // console.log(e)
    // dish _ type
    if (!isNaN(e.colDef.field)) {
        if (e.newValue == undefined || e.newValue == null || String(e.newValue).trim() == "") { // 当新值不为undefined
            e.data[`${e.colDef.field}`] = 0
            e.newValue = 0
        }
        // console.log(e.newValue)
        if (isNaN(e.newValue)) { // 不是数字
            e.data[`${e.colDef.field}`] = e.oldValue
            const rowNode = await gridOptions.api.getRowNode(e.data.id)
            await rowNode.setDataValue(e.colDef.field, e.oldValue)
            return
        }

        const meal_price = init_mp().find(v => v.cl1 == e.data.cl1)
        // console.log(meal_price)

        if (meal_price[e.colDef.field] == 0 || meal_price[e.colDef.field] == null) {
            if (e.newValue != 0 && e.newValue != null) {
                let price = prompt("请输入餐标：")
                while (isNaN(price) || Number(price) <= 0) {
                    if (price == null || price.trim() == "") {
                        e.data[`${e.colDef.field}`] = e.oldValue
                        break
                    }
                    price = prompt("请重新输入")
                }
                meal_price[e.colDef.field] = Number(price)
                const rowNode = await gridOptions.api.getRowNode(`price-${e.data.dinner_type}`)
                if (rowNode != undefined) {
                    await rowNode.setDataValue(e.colDef.field, Number(price))
                }
            }
        }

        if (parseInt(e.newValue) < 0) {
            e.newValue = 0
            e.data[`${e.colDef.field}`] = 0
        }
        // console.log(e)
        // console.log(e.newValue)
        // const scale = (parseInt(e.newValue) - parseInt(e.oldValue)) / e.data['Copies']
        // console.log(copiesNumber(Math.ceil(e.newValue)) - parseInt(e.oldValue))

        // console.log(e.newValue)
        // console.log(Copies)
        // 进入该if只有两种可能
        // 第一，改变了快餐
        // 第二，改变了特色
        // 增加比例
        let ratio = 0
        if (e.oldValue != 0) {
            ratio = ((copiesNumber(Math.ceil(e.newValue)) - parseInt(e.oldValue)) / parseInt(e.oldValue))
        }

        // console.log(e.newValue, e.oldValue, ratio)
        // 餐标 => 不可改变
        // 成本 => 自动改变 
        // 份数 => 用户改变
        // 要确认变动是否与份数相关
        if (e.data.configure && !e.data.fixed) {
            if (e.data.type != "餐标" && e.data.type != "%") {
                // 当份数改变时
                e.data.Copies = e.data['Copies'] + Math.ceil(e.newValue) - parseInt(e.oldValue)
                copiesChangedjudeg = true
                copiesChanged(e, ratio)

            }
        } else {
            // console.log(e.data)
            let Copies = e.data['Copies'] + copiesNumber(Math.ceil(e.newValue)) - parseInt(e.oldValue)
            e.data[`${e.colDef.field}`] = copiesNumber(e.data[`${e.colDef.field}`])
            // console.log(e.data.type)
            // 先改变份数 再改变菜品份数
            // console.log(copiesChangedjudeg)
            if (e.data.type == "特色" && !e.data.configure) {
                // let ratio = ((copiesNumber(Math.ceil(e.newValue)) - parseInt(e.oldValue)) / parseInt(e.oldValue == 0 ? 1 : e.oldValue))

                let count = 0
                e.api.forEachNode(v => {
                    if (v.data == null || v.data.cl1 != e.data.cl1 || v.data.configure) return
                    if (v.data.type == "特色") {
                        count += Number(v.data[e.colDef.field])
                    }
                    if (v.data.specialMealColor == e.data.specialMealColor && v.data.type != "特色") {
                        if (v.data[e.colDef.field] > 0) {
                            v.data[e.colDef.field] = copiesNumber(v.data[e.colDef.field] + (v.data[e.colDef.field] * ratio))
                        }
                    }
                })
                let CopiesCount = 0
                let kuaiNewCount = 0, kuaiOldCount = 0
                for (const item of mealcopies()) {
                    if (item.cl1 == e.data.cl1) {
                        // console.log(item.cl1)
                        // console.log(1, `type: ${item.type},item: ${item[e.colDef.field]}, newValue: ${e.newValue}, oldValue: ${e.oldValue}`)
                        if (item.type == "特色") {
                            const rowNode = e.api.getRowNode(`copies-${e.data.dinner_type}-1`)
                            item[e.colDef.field] = count
                            rowNode && await rowNode.setDataValue(e.colDef.field, count)
                        } else {
                            // 快餐
                            const rowNode = e.api.getRowNode(`copies-${e.data.dinner_type}-0`)
                            kuaiOldCount = item[e.colDef.field]
                            // 快餐减去
                            if (item[e.colDef.field] - (e.newValue - e.oldValue) <= 0) {
                                item[e.colDef.field] = 0
                            } else {
                                item[e.colDef.field] = item[e.colDef.field] - (e.newValue - e.oldValue);
                                // if(e.newValue == 0) item[e.colDef.field] = 0;
                                // else
                            }
                            kuaiNewCount = item[e.colDef.field]

                            rowNode && await rowNode.setDataValue(e.colDef.field, item[e.colDef.field])
                        }
                        // console.log(2, `type: ${item.type},item: ${item[e.colDef.field]}, newValue: ${e.newValue}, oldValue: ${e.oldValue}`)
                        // console.log(item.type, item[e.colDef.field], e.newValue, e.oldValue)
                        CopiesCount += item[e.colDef.field]
                    }
                }
                // new - old / old
                ratio = (kuaiNewCount - kuaiOldCount) / (kuaiOldCount == 0 ? 1 : kuaiOldCount)
                // console.log(kuaiNewCount, kuaiOldCount)
                e.api.forEachNode(async v => {
                    if (v.data == null || v.data.cl1 != e.data.cl1 || v.data.configure) return
                    if (v.data.specialMealID != undefined || v.data.specialMealColor != undefined) return
                    if (v.data[e.colDef.field] == 0) return
                    if (v.data.type == "汤粥") {
                        v.data[e.colDef.field] = CopiesCount
                        return
                    }

                    const value = copiesNumber(Math.ceil(v.data[`${e.colDef.field}`] + (v.data[`${e.colDef.field}`] * ratio)))
                    // console.log(value)
                    const rowNode = await e.api.getRowNode(v.data.id)
                    await rowNode.setDataValue(e.colDef.field, value)
                    // v.data[e.colDef.field] = value
                })
            }

            const countMaterialData = agGridRow.countMaterialData({
                material_items: e.data['dish_key_id']['material_item'],
                dish_key_id: e.data['dish_key_id']['id'],
                oldCopies: e.data['Copies'],
                newCopies: Copies,
                update: e.data.update
            })
            // console.log(Copies)
            e.data['Copies'] = Copies
            e.data['whole'] = countMaterialData[0]
            e.data['dish_key_id']['material_item'] = countMaterialData[1]
            e.data['costPrice'] = isNaN(countMaterialData[2]) ? 0 : countMaterialData[2]
        }
        // 当前数据 101
        resetPurchaseData.Change(gridOptions, e)

    } else if (e.colDef.headerName == '菜品') {
        let needRowdata = [];
        let spRowdata = [];

        e.api.forEachNode((v, index) => {
            if (v.data == null) return
            if (v.data.teseMatchRowId === -1 && e.rowIndex !== index && v.data.dinner_type == e.data.dinner_type) needRowdata.push(v.data)
            if (e.data.teseMatchRowId == v.data.teseMatchRowId && e.rowIndex !== index && v.data.dinner_type == e.data.dinner_type) spRowdata.push(v.data)
            if (e.rowIndex == index) {
                (v.data.teseMatchRowId == -1) ? spRowdata = [] : needRowdata = []
            }
        })
        needRowdata.forEach((data) => {
            if (data.dish === e.newValue) {
                const rowNode = e.api.getRowNode(v.data.id)
                rowNode.setDataValue(e.colDef.field, e.oldValue)
            }
        })
        spRowdata.forEach((data) => {
            if (data.dish === e.newValue) {
                const rowNode = e.api.getRowNode(v.data.id)
                rowNode.setDataValue(e.colDef.field, e.oldValue)
            }
        })

        if (e.newValue == null || e.newValue == undefined || e.newValue.trim() == "") {
            e.data[`${e.colDef.field}`] = e.oldValue
        }

        for (const item of index.dish_key) {
            if (item.name == e.newValue) {
                // console.log(item, e.data)
                // console.log(item.dish_top_category_id != e.data.dish_key_id.dish_top_category_id)
                // console.log(item.name != e.data.dish)
                if (item.dish_top_category_id != e.data.dish_key_id.dish_top_category_id && item.name != e.oldValue) {
                    // console.log(item, e.data)
                    e.data[`${e.colDef.field}`] = e.oldValue
                }
            }
        }
        // console.log(e.data)
        const arr = ["早餐", "中餐", "晚餐", "夜餐"]
        for (const item of arr) {
            if (e.newValue == item) {
                e.data[`${e.colDef.field}`] = e.oldValue
            }
        }
        const d = countMaterialData({
            material_items: e.data.dish_key_id.material_item,
            dish_key_id: e.data.dish_key_id.id,
            oldCopies: e.data['Copies'],
            newCopies: e.data['Copies']
        })
        e.data['costPrice'] = d[2]
        e.data['dname'] = `${e.newValue}_${e.data.type}`

        console.log(e.data.whole)
        resetPurchaseData.Change(gridOptions, e)

    } else if (e.colDef.headerName == '配量汇总') {
        // 全部删除 
        if (e.newValue == null || e.newValue == '') {
            // console.log('删除')
            await new Promise((resolve, reject) => {
                customFromDom({
                    parent: '#isDeleteRow',
                    cancel: ['#isDeleteRow_cancel1', '#isDeleteRow_cancel2'],
                    sure: "#isDeleteRow_sure",
                    deleteData: [],
                    cancelFun: () => {
                        const rowNode = e.api.getRowNode(e.data.id)
                        e.data[`${e.colDef.field}`] = e.oldValue
                        resolve()
                        rowNode.setData(e.data)
                    },
                    sureFun: () => {
                        resetPurchaseData.Change(gridOptions, e)
                        e.data.dish_key_id.material_item = []
                        const rowNode = e.api.getRowNode(e.data.id)
                        rowNode.setDataValue('whole', "")
                        rowNode.setDataValue('costPrice', 0)
                        resolve()
                        return true
                    }
                })
            })
            return
        }

        // 只添加空格
        if (e.newValue.trim() == e.oldValue.trim()) return

        e.data.update = true
        let d1 = e.newValue

        if (d1[d1.length - 1] != " ") d1 += ' '
        // console.log(e)

        let cancelDelete = true
        let material_data = d1.split(' ')
        if(material_data.length < (e.oldValue + " ").split(" ").length){
            await new Promise((resolve, reject) => {
                customFromDom({
                    parent: '#isDeleteRow',
                    cancel: ['#isDeleteRow_cancel1', '#isDeleteRow_cancel2'],
                    sure: "#isDeleteRow_sure",
                    deleteData: [],
                    cancelFun: () => {
                        const rowNode = e.api.getRowNode(e.data.id)
                        e.data[`${e.colDef.field}`] = e.oldValue
                        rowNode.setData(e.data)
                        resolve(false)
                    },
                    sureFun: () => {
                        resolve(true)
                        return true
                    }
                })
            }).then((deleteValue) => cancelDelete = deleteValue)
        }
        // console.log(material_data)
        if (cancelDelete) {
            e.data.dish_key_id.material_item = []
            for (const material of material_data) {
                // let isTrue = true
                if (material.trim() == "") continue

                // 鸭肉片23.58斤 鸭肉片 23.58 斤
                let d = material.match(/([\u4e00-\u9fa5]{0,6})?(.*\d*\.?\d+?)?([\u4e00-\u9fa5a-zA-Z]+)?/)
                console.log(d)

                // 输入数据错误，则跳出循环
                if (d == null) {
                    e.data[`${e.colDef.field}`] = e.oldValue
                    return
                }
                // 假设现在是一个新食材

                // 如果当前单位不为material_purchase_unit_category中数据
                // 只有全部不等于才会返回true
                // 当前单位在material_purchase_unit_category中找不到
                const judeg = index.material_purchase_unit_category.every(v => v.name != d[3])
                // console.log(d[3], judeg)
                if (judeg && d[3] != "" && d[3] != undefined) {
                    e.data[`${e.colDef.field}`] = e.oldValue
                    break
                }
                // 单个食材所需数据
                const materialObj = {}
                const process_category = index.dish_process_category.sort((a, b) => a.name.length - b.name.length)
                // 确认食材是否存在
                let isExistMaterial = false
                await new Promise(resolve => {
                    // 
                    // 检查食材是否存在切配方式
                    // 分两种情况
                    // 小米 颗粒 辣 小米
                    // 猪肉片 猪肉片片

                    // 查看食材是否存在
                    const materials = index.material_item.filter(v => {
                        return d[1].includes(v.name.split('-')[0])
                    })
                    // console.log(d[1], materials)

                    // 切配方式为可能存在
                    const mate = materials.filter(v => {
                        const name = v.name.split('-')[0]
                        if (name == d[1]) {
                            materialObj['material_item'] = { ...v, name }
                            materialObj['process_category'] = {
                                id: 14,
                                name: ''
                            }
                            materialObj['name'] = v.name
                            return true
                        } else {
                            for (const item of process_category) {
                                if (name + item.name == d[1]) {
                                    materialObj['material_item'] = { ...v, name }
                                    materialObj['process_category'] = { ...item }
                                    materialObj['name'] = v.name
                                    return true
                                }
                            }
                            return false
                        }
                        // return name == d[1]
                    })

                    // console.log(mate, materialObj)


                    // 食材存在
                    if (mate.length > 0) {
                        isExistMaterial = true
                        // 如果出现两个食材则返回原值
                        let count = 0
                        for (const item of e.data.dish_key_id.material_item) {
                            if (materialObj['material_item'].name == item.name.split('-')[0]) {
                                e.data[`${e.colDef.field}`] = e.oldValue
                                if (count++ > 1) {
                                    const rowNode = gridOptions.api.getRowNode(e.data.id)
                                    rowNode.setDataValue(e.colDef.field, e.oldValue)
                                    return
                                }
                            }
                        }
                        resolve(materialObj)
                    }

                    // 食材不存在
                    // 创建食材
                    if (mate == undefined || mate.length == 0) {
                        let isCreate = confirm(`尚无${d[1]}食品，是否创建？`)
                        if (isCreate) {
                            const customName = document.querySelector('#customName')

                            // 添加可选数据
                            let customFrom = document.querySelector('#customFrom')
                            let customPhase = document.querySelector('#customPhase')


                            let customSection = document.querySelector('#customSection')
                            index.dish_process_category.forEach((e, i) => addData(e, i, customSection));

                            let customCompany = document.querySelector('#customCompany')
                            index.material_purchase_unit_category.forEach((e, i) => addData(e, i, customCompany))

                            const dateSpan = document.querySelector('.date') // 日计划
                            const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
                            const planDate = new Date(planDateHtml)
                            const date = new Date()
                            const demandDate = `${date.getFullYear()}-${planDate.getMonth() + 1 < 10 ? `0${planDate.getMonth() + 1}` : planDate.getMonth() + 1}-${planDate.getDate() < 10 ? `0${planDate.getDate()}` : planDate.getDate()}`
                            const nowDate = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
                            customName.value = d[1]
                            customFromDom({
                                parent: "#material_modal",
                                cancel: ["#material_modal_cancel1", "#material_modal_cancel2"],
                                sure: "#material_modal_sure",
                                deleteData: ["#customCompany", "#customSection"],
                                cancelFun: () => {
                                    e.data[`${e.colDef.field}`] = e.oldValue
                                    gridOptions.api.refreshCells({ force: true })
                                },
                                sureFun: (_parent) => {
                                    // console.log(customPhase, customPhase.value)
                                    const customPhaseValue = customPhase.querySelector(`option[value="${customPhase.value}"]`).innerText
                                    let name = `${customName.value}-${customFrom.value}-${customPhaseValue}`
                                    const customPrice = _parent.querySelector('#customPrice')
                                    const topCategory = document.getElementsByName('topCategoryCheck')
                                    const customPurchaseCategory = document.getElementsByName('customPurchaseCategory')
                                    const customOrder = document.querySelector('#customOrder')

                                    const plan_day_purchase_ahead_days = Math.ceil(((new Date(planDate) - new Date(customOrder.value)) / (1000 * 3600 * 24)))

                                    let topCategoryValue = ''
                                    let customPurchaseCategoryValue = ''
                                    topCategory.forEach((topCategoryCheck) => {
                                        if (topCategoryCheck.checked == true) {
                                            topCategoryValue = topCategoryCheck.value
                                        }
                                    })
                                    customPurchaseCategory.forEach((customPurchaseCategoryCheck) => {
                                        if (customPurchaseCategoryCheck.checked == true) {
                                            customPurchaseCategoryValue = customPurchaseCategoryCheck.value
                                        }
                                    })

                                    let m_id = add_material_id()
                                    let r_id = add_material_item_bom_unit_ratio_id()
                                    index.material_item_bom_unit_ratio.push({
                                        id: r_id,
                                        main_unit_bom_unit_ratio: 1,
                                        material_id: m_id,
                                        purchase_unit_id: customCompany.value,
                                    })
                                    //  添加数据
                                    const obj1 = {
                                        bom_unit_ratio_ids: [m_id],
                                        id: m_id,
                                        name,
                                        form: customFrom.value,
                                        phase: customPhase.value,
                                        main_price: customPrice.value,
                                        main_unit_id: customCompany.value,
                                        // top_category_id:2,
                                        material_price_alert: Number(customPrice.value) + 3,
                                        repeat_tag: true,
                                        top_category_id: topCategoryValue,
                                        plan_day_purchase_ahead_days: -plan_day_purchase_ahead_days,
                                        purchase_freq: customPurchaseCategoryValue
                                    }
                                    // 记载数据
                                    // console.log(obj1)
                                    saveData.new_material_item_list.push(obj1)
                                    materialObj['material_item'] = { ...obj1 }
                                    index.material_item.push(obj1)
                                    // console.log(e)
                                    const obj = {
                                        id: add_dish_bom_id(),
                                        material_id: m_id,
                                        dish_key_id: e.data.dish_key_id['id'],
                                        process_id: customSection.value,
                                        gbom_qty_high: 0,
                                        gbom_qty_mid: 0,
                                        gbom_qty_low: 0,
                                        unit_id: customCompany.value
                                    }
                                    index.dish_bom.push(obj)
                                    // console.log(obj)
                                    // saveData.new_or_update_dish_bom_list.new.push(obj)
                                    let dish_process_category_name = customCompany.querySelector(`option[value="${customCompany.value}"]`).innerText
                                    let customSectionValue = customSection.querySelector(`option[value="${customSection.value}"]`).innerText
                                    customSectionValue = customSectionValue == "无" || customSectionValue == d[2] ? "" : customSectionValue
                                    // 切片方式
                                    materialObj['process_category'] = {
                                        id: customCompany.value,
                                        name: dish_process_category_name,
                                    }

                                    console.log(dish_process_category_name)
                                    e.data.dish_key_id.material_item.push({
                                        ...obj1,
                                        dish_process_category_name: customSectionValue,
                                        unit_id: customCompany.value,
                                        unit_name: dish_process_category_name,
                                        main_unit_bom_unit_ratio: 1,
                                        dish_qty: 0,
                                    })

                                    const str = customName.value + customSectionValue + 0 + dish_process_category_name
                                    // e.data[`${e.colDef.field}`] = e.data[`${e.colDef.field}`].replace(data_name, str)
                                    // e.data
                                    // const strs = e.data[`${e.colDef.field}`].split(' ')
                                    const strs = e.value.split(' ')

                                    for (const s_key in strs) {
                                        if (strs[s_key].includes(customName.value)) {
                                            strs[s_key] = str
                                        }
                                    }
                                    e.data[`${e.colDef.field}`] = strs.join(' ')
                                    e.newValue = e.data[`${e.colDef.field}`]
                                    d[2] = 0
                                    d[3] = dish_process_category_name
                                    // gridOptions.api.refreshCells({ force: true })

                                    isExistMaterial = false
                                    resolve()
                                    return true
                                },
                                initFun: (_parent) => {
                                    const customPrice = _parent.querySelector('#customPrice')
                                    const topCategory = _parent.querySelector('#topCategory')
                                    const customOrder = _parent.querySelector('#customOrder')
                                    const customPurchaseCategory = _parent.querySelector('#customPurchaseCategory')
                                    const limitNumber = () => {
                                        if (isNaN(customPrice.value) || Number(customPrice.value) < 1) {
                                            customPrice.value = 1
                                        }
                                    }
                                    customPrice.onkeydown = () => limitNumber()
                                    customPrice.onwheel = () => limitNumber()
                                    topCategory.innerHTML = ''
                                    index.material_top_category.forEach(v => {
                                        topCategory.innerHTML += v.id == 1 ?
                                            `<div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name='topCategoryCheck' id="topCategoryCheck${v.id}" value="${v.id}" checked>
                                                    <label class="form-check-label" for="topCategoryCheck${v.id}">${v.name}</label>
                                            </div>`:
                                            `<div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name='topCategoryCheck' id="topCategoryCheck${v.id}" value="${v.id}">
                                                    <label class="form-check-label" for="topCategoryCheck${v.id}">${v.name}</label>
                                            </div>`
                                    })

                                    customOrder.min = nowDate
                                    customOrder.max = demandDate
                                    customOrder.value = nowDate
                                    customOrder.onkeyup = () => {
                                        if (customOrder.value == '' || (customOrder.value < customOrder.min && customOrder.value < customOrder.max)) {
                                            customOrder.value = nowDate
                                        }
                                    }

                                    customPurchaseCategory.innerHTML = ''
                                    index.purchase_category.forEach(v => {
                                        customPurchaseCategory.innerHTML += v.id == 1 ?
                                            `<div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name='customPurchaseCategory' id="customPurchaseCategory${v.id}" value="${v.name}" checked>
                                                <label class="form-check-label" for="customPurchaseCategory${v.id}">${v.name_cn}</label>
                                        </div>`:
                                            `<div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name='customPurchaseCategory' id="customPurchaseCategory${v.id}" value="${v.name}">
                                                <label class="form-check-label" for="customPurchaseCategory${v.id}">${v.name_cn}</label>
                                        </div>`
                                    })
                                }
                            })
                        } else {
                            e.data[`${e.colDef.field}`] = e.oldValue
                            gridOptions.api.refreshCells({ force: true })
                        }
                    }
                })
                await new Promise(resolve => {
                    // 判断是否有数量以及单位
                    if (isExistMaterial) {
                        // console.log('1')
                        // if(isNaN(d[2]) && d[2] != undefined){
                        //     const oldwhole = e.oldValue.split(" ")
                        //     for (const item of oldwhole) {
                        //         if(item.includes(d[1])){

                        //         }
                        //     }
                        // }
                        if (d[2] == undefined || d[3] == undefined) {
                            let dishes_name = document.querySelector('#write_Side_dishes_name')
                            let dishes_section = document.querySelector('#write_Side_dishes_section')
                            let dishes_quantity = document.querySelector('#write_Side_dishes_quantity')
                            let dishes_company = document.querySelector('#write_Side_dishes_company')
                            let dishes_category = document.querySelector('#write_Side_dishes_category')

                            // console.log(name, material_item)
                            // 定义变量
                            // 查看是否带切片方式
                            let section_str = materialObj.process_category.name
                            const m = index.material_item.filter(v => v.name.split('-')[0] == materialObj.material_item.name)
                            //写入自定义dom操作 配菜

                            console.log(e)
                            customFromDom({
                                parent: "#write_Side_dishes",
                                cancel: ["#write_Side_dishes_cancel1", "#write_Side_dishes_cancel2"],
                                sure: "#write_Side_dishes_sure",
                                deleteData: ["#write_Side_dishes_section", "#write_Side_dishes_company", "#write_Side_dishes_category"],
                                initFun: () => {
                                    // 插入对应数据
                                    dishes_name.value = materialObj.material_item.name
                                    process_category.forEach(v => {
                                        dishes_section.innerHTML += v.name == section_str ?
                                            `<option value="${v.id}" selected>${v.name}</option>` :
                                            `<option value="${v.id}">${v.name}</option>`
                                    })

                                    index.material_purchase_unit_category.forEach((v, i) => addData(v, i, dishes_company))

                                    // 菜品可能是鲜品也可能是冻品
                                    for (const m_item of m) {
                                        dishes_category.innerHTML += `
                                        <option value="${m_item.id}">${m_item.form}</option>`
                                    }

                                    dishes_quantity.value = d[2] != undefined && d[2].trim() != "" ? d[2] : 0

                                    // console.log(m, d[1])
                                },
                                cancelFun: () => {
                                    e.data[`${e.colDef.field}`] = e.oldValue
                                    gridOptions.api.refreshCells({ force: true })
                                },
                                sureFun: () => {
                                    let section = dishes_section.querySelector(`option[value="${dishes_section.value}"]`)
                                    section = section.innerText == "无" ? "" : section.innerText

                                    let number = dishes_quantity.value.trim() == "" ? 0 : dishes_quantity.value

                                    let compamy = dishes_company.querySelector(`option[value="${dishes_company.value}"]`).innerText
                                    // console.log(compamy)
                                    for (const m_item of m) {
                                        if (m_item.id == dishes_category.value) {
                                            e.data.dish_key_id.material_item.push({
                                                ...m_item,
                                                dish_process_category_name: section,
                                                unit_id: dishes_company.value,
                                                unit_name: compamy,
                                                dish_qty: number,
                                                // material_id: m_item.id,
                                                // process_id: process_category.id,
                                                // unit_id: unit_category.id
                                            })
                                            break
                                        }
                                    }

                                    materialObj['process_category'] = {
                                        name: section,
                                        id: Number(dishes_section.value)
                                    }
                                    // 替换原数据
                                    let str = ""
                                    // for (let item of e.data[`${e.colDef.field}`].split(' ')) {
                                    for (let item of e.newValue.split(' ')) {

                                        if (item.trim() == "") continue
                                        const dish_str = dishes_name.value + section + number + compamy + " "
                                        // console.log(dish_str)

                                        if (item.includes(materialObj['material_item'].name)) {
                                            str += dish_str
                                            continue
                                        }
                                        // if(dish_str.includes(item.replace(/\d+(\.\d+)?/, number))){
                                        //     str += dish_str
                                        //     continue
                                        // }
                                        console.log(item)
                                        str += item + " "
                                    }
                                    d[2] = number
                                    d[3] = compamy
                                    console.log(str)
                                    // e.data[`${e.colDef.field}`] = e.data[`${e.colDef.field}`].replace(`/${data_name}(\d+)?(.+)? /`, )
                                    e.data[`${e.colDef.field}`] = str
                                    e.newValue = e.data[`${e.colDef.field}`]
                                    gridOptions.api.refreshCells({ force: true })
                                    resolve()
                                    return true
                                }
                            })
                        } else {
                            resolve()
                        }
                    } else {
                        // console.log(materialObj)
                        resolve()
                    }
                })
                await new Promise(resolve => {
                    // console.log(materialObj)
                    // 获取当前食材bom_unit_ratio_ids转换比数据
                    const unit_ratio_Arr = index.material_item_bom_unit_ratio.filter(v => {
                        for (const id of materialObj['material_item'].bom_unit_ratio_ids) {
                            if (id == v.id) return true
                        }
                        return false
                    })
                    // 获取当前食材bom_unit_ratio_ids单位
                    for (const arr_item of unit_ratio_Arr) {
                        const units = index.material_purchase_unit_category.find(v => v.id == arr_item.purchase_unit_id)
                        arr_item['unit_id'] = units.id
                        arr_item['unit_name'] = units.name
                    }
                    materialObj['unit_ratio_Arr'] = [...unit_ratio_Arr]
                    // console.log(unit_ratio_Arr)

                    // 对比当前食材单位是否为已存在单位
                    let isUnit = true
                    for (const arr_item of unit_ratio_Arr) {
                        if (arr_item.unit_name == d[3]) {
                            isUnit = false
                            materialObj['unitObj'] = { ...arr_item }
                        }
                    }
                    // console.log(d)
                    // 如果当前单位不存在则创建转换比
                    if (isUnit) {
                        // 添加食品单位
                        customFromDom({
                            parent: "#foodUnit",
                            cancel: ["#foodUnit_cancel1", "#foodUnit_cancel2"],
                            sure: "#foodUnit_sure",
                            deleteData: [],
                            cancelFun() {
                                e.data[`${e.colDef.field}`] = e.oldValue
                                gridOptions.api.refreshCells({ force: true })
                            },
                            sureFun(_parent) {
                                const ratio = _parent.querySelector('#foodUnit_ratio')
                                const unitName = _parent.querySelector('#foodUnit_unitName')
                                if (ratio.value == null || ratio.value.trim() == "") {
                                    return false
                                }
                                // const material_item = e.data.dish_key_id.material_item.find(v => {
                                //     return v.name.split('-')[0] == d[1]
                                // })
                                const id = add_material_item_bom_unit_ratio_id()
                                let material_id = materialObj['material_item'].id
                                // 插入数据表内数据
                                const obj = {
                                    "id": id,
                                    "material_id": material_id,
                                    name: index.material_item.filter(e => e.id + '' === material_id + '')[0].name,
                                    "purchase_unit_id": unitName.getAttribute('unitID'),
                                    "main_unit_bom_unit_ratio": Number(ratio.value)
                                }
                                // console.log(material_item, d[1])
                                materialObj['unitObj'] = {
                                    "material_id": materialObj['material_item'].id,
                                    "purchase_unit_id": unitName.getAttribute('unitID'),
                                    "main_unit_bom_unit_ratio": Number(ratio.value),
                                    unit_id: unitName.getAttribute('unitID'),
                                    unit_name: unitName.value

                                }
                                materialObj['material_item']['bom_unit_ratio_ids'].push(id)
                                index.material_item_bom_unit_ratio.push(obj)
                                // 插入存储表格
                                saveData.new_material_to_unit_ratio.push(obj)
                                // 插入展示表数据
                                resolve()
                                return true
                            },
                            initFun(_parent) {
                                const unitName = _parent.querySelector('#foodUnit_unitName')
                                const ratio = _parent.querySelector('#foodUnit_ratio')
                                ratio.value = 1
                                ratio.onkeyup = (e) => {
                                    if (isNaN(ratio.value) || parseFloat(ratio.value) < 0) {
                                        ratio.value = 1
                                    }
                                    if (ratio.value.trim() == "") {
                                        ratio.focus()
                                    }
                                }
                                const unit_category = index.material_purchase_unit_category.find(v => v.name == d[3])
                                unitName.onkeyup = (e) => {
                                    console.log(e)
                                }
                                unitName.value = unit_category.name
                                unitName.setAttribute('unitID', unit_category.id)
                            },
                        })
                    } else {
                        resolve()
                    }
                })

                // console.log(materialObj, e.data.dish_key_id.material_item)
                // 添加数据
                if (isExistMaterial) {
                    // 添加数据
                    const material_itemIndex = e.data.dish_key_id.material_item.findIndex(v => v.id == materialObj['material_item'].id)

                    // console.log(material_itemIndex)
                    let num = d[2].match(/(\+|-)?\d+\.?\d*?/)[0]

                    console.log(num)

                    // -1为找不到当前数据则新增
                    console.log(d)
                    const obj = {
                        ...materialObj['material_item'],
                        process_id: materialObj['process_category'].id,
                        dish_process_category_name: materialObj['process_category'].name,

                        name: materialObj['name'],
                        dish_qty: num,
                        main_unit_bom_unit_ratio: materialObj['unitObj'].main_unit_bom_unit_ratio,
                        material_id: materialObj['unitObj'].material_id,
                        purchase_unit_id: materialObj['unitObj'].purchase_unit_id,
                        unit_id: materialObj['unitObj'].unit_id,
                        unit_name: materialObj['unitObj'].unit_name,
                    }
                    // console.log(materialObj['material_item'], obj, d[2])
                    if (material_itemIndex == -1) {
                        e.data.dish_key_id.material_item.push({ ...obj })
                    } else {
                        e.data.dish_key_id.material_item[material_itemIndex] = { ...obj }
                    }
                }
            }
            // console.log(e.data.dish_key_id.material_item)
        } else {
            return
        }
        const [whole, , costPrice] = countMaterialData({
            material_items: [...e.data.dish_key_id.material_item],
            dish_key_id: e.data.dish_key_id.id,
            oldCopies: e.data.Copies,
            newCopies: e.data.Copies,
            update: e.data.update
        })
        // console.log(e.data)
        e.data.costPrice = costPrice
        e.data.whole = whole
        const rowNode = await e.api.getRowNode(e.data.id)
        await rowNode.setData(e.data)

        
        resetPurchaseData.Change(gridOptions, e)
        gridOptions.api.refreshCells({ force: true })
        // if (e.newValue.split(' ').length < e.oldValue.split(' ').length && e.newValue == null) {
        //     // console.log('删除')
        //     customFromDom({
        //         parent: '#isDeleteRow',
        //         cancel: ['#isDeleteRow_cancel1', '#isDeleteRow_cancel2'],
        //         sure: "#isDeleteRow_sure",
        //         deleteData: [],
        //         cancelFun: () => {
        //             e.data[`${e.colDef.field}`] = e.oldValue
        //             gridOptions.api.refreshCells({ force: true })
        //         },
        //         sureFun: () => {
        //             resetPurchaseData.Change(gridOptions, e)
        //             return true
        //         }
        //     })
        // } else {
        //     let needChange = true
        //     e.newValue.split(' ') && e.newValue.split(' ').forEach((newv) => {
        //         if (newv != '' && !newv.match(/([0-9]+)/)) {
        //             needChange = false
        //         }
        //     })
        //     console.log(needChange,e)
        //     needChange && resetPurchaseData.Change(gridOptions, e)
        // }
        // console.log(e.data)
        // for (const {data} of e.node.parent.allLeafChildren) {
        //     const rowNode = gridOptions.api.getRowNode(data.id)
        //     rowNode.setDataValue('whole', data.whole)
        // }
        // e.api.forEachNode(v => {
        //     if(v.data == null || e.data.configure) return
        //     if(v.data.cl1 != e.data.cl1) return
        //     const rowNode = gridOptions.api.getRowNode(v.data.id)
        //     rowNode.setDataValue('whole', v.data.whole)
        // })
    } else if (e.colDef.headerName == "成本价") {

    }
    // console.log(new Date() * 1 - newDate)
    changedValuetoData(e, gridOptions)

    // await rowNode.setData(e.data)/
    // console.log(new Date() * 1 - newDate)
    // gridOptions.api.refreshCells({force:true})
}

const getContextMenuItems = (params, gridOptions) => {
    let specialMeal = m()
    if (params.node.data == undefined) return

    // console.log(params.column.colId)
    const result = [
        {
            name: '向下新增一行',
            action: () => {

                const data = [{}]
                for (const key in params.node.data) {
                    if (!isNaN(key)) {
                        data[0][`${key}`] = 0
                    }
                }
                data[0] = {
                    ...data[0],
                    ...addRowPublicPart(params)
                }
                // data[0][]
                customFromDom({
                    parent: "#Meal",
                    deleteData: ["#MealCategory"],
                    cancel: ["#Meal_cancel1", "#Meal_cancel2"],
                    sure: "#Meal_sure",
                    initFun(_parent) {
                        let MealCategory = _parent.querySelector('#MealCategory')
                        index.dish_top_category.forEach(v => {
                            MealCategory.innerHTML += v.name_cn == params.node.data['type'] ?
                                `<option value="${v.id}" selected>${v.name_cn}</option>` :
                                `<option value="${v.id}">${v.name_cn}</option>`
                        })
                    },
                    sureFun(_parent) {
                        const MealCategory = _parent.querySelector('#MealCategory')
                        const value = MealCategory.querySelector(`option[value="${MealCategory.value}"]`).innerText
                        data[0]['type'] = value
                        data[0]['sales_type'] = sales_type(value)
                        data[0]['teseMatchRowId'] = -1
                        console.log(MealCategory)
                        if (specialMeal.Catering[params.node.data.dinner_type] <= specialMeal.colors.length && value == "特色") {
                            data[0]['specialMealID'] = specialMeal.Catering[params.node.data.dinner_type]
                            data[0]['specialMealColor'] = specialMeal.colors[specialMeal.Catering[params.node.data.dinner_type] - 1]
                            specialMeal.Catering[params.node.data.dinner_type]++

                        }

                        data[0]['dish_key_id'] = {
                            dish_top_category_id: MealCategory.value,
                            material_item: []
                        }
                        // const id = parseInt(gridOptions.api.getDisplayedRowAtIndex(params.node.rowIndex).rowIndex) + 1
                        // console.log(params)
                        gridOptions.api.expandAll()

                        gridOptions.api.applyTransaction({ add: data, addIndex: params.node.rowIndex + 1 })

                        return true
                    }
                })

            }
        },
        {
            name: '新增特色餐',
            action: () => {
                if (specialMeal.Catering[params.node.data.dinner_type] <= specialMeal.colors.length) {
                    const data = [{}]
                    for (const key in params.node.data) {
                        if (!isNaN(key)) {
                            data[0][`${key}`] = 0
                        }
                    }
                    const { id } = index.dish_top_category.find(v => v.name_cn == "特色")

                    data[0] = {
                        ...data[0],
                        ...addRowPublicPart(params)
                    }
                    data[0]['dish_key_id'] = {
                        dish_top_category_id: id,
                        material_item: []
                    }
                    data[0]['type'] = "特色"
                    data[0]['sales_type'] = sales_type("特色")
                    data[0]['specialMealID'] = specialMeal.Catering[params.node.data.dinner_type]
                    data[0]['specialMealColor'] = specialMeal.colors[specialMeal.Catering[params.node.data.dinner_type] - 1]
                    specialMeal.Catering[params.node.data.dinner_type] += 1
                    gridOptions.api.applyTransaction({ add: data })
                }

            }
        },
        {
            name: '新增特色餐配菜',
            action: () => {
                // console.log(params)
                if (specialMeal.Catering[params.node.data.dinner_type] == 1) return
                const data = [{}]
                for (const key in params.node.data) {
                    if (!isNaN(key)) {
                        data[0][`${key}`] = 0
                    }
                }
                data[0] = {
                    ...data[0],
                    ...addRowPublicPart(params)
                }
                customFromDom({
                    parent: "#SpecialMeal",
                    deleteData: ["#SpecialMealCategory"],
                    cancel: ["#SpecialMealCategory_cancel1", "#SpecialMealCategory_cancel2"],
                    sure: "#SpecialMealCategorys_sure",
                    initFun(_parent) {
                        let SpecialMealCategory = _parent.querySelector('#SpecialMealCategory')
                        let MealCategory = _parent.querySelector('#MealCategory22')

                        for (let index = 1; index < specialMeal.Catering[params.node.data.dinner_type]; index++) {
                            SpecialMealCategory.innerHTML += `
                            <option value="${index}">特色${index}</option>`
                        }
                        // console.log(_parent, MealCategory)
                        index.dish_top_category.forEach(v => {
                            if (v.name_cn == "特色") return
                            MealCategory.innerHTML += v.name_cn == params.node.data['type'] ?
                                `<option value="${v.id}" selected>${v.name_cn}</option>` :
                                `<option value="${v.id}">${v.name_cn}</option>`
                        })
                    },
                    sureFun(_parent) {
                        const SpecialMealCategory = _parent.querySelector('#SpecialMealCategory')
                        const MealCategory = _parent.querySelector('#MealCategory22')
                        const value = MealCategory.querySelector(`option[value="${MealCategory.value}"]`)

                        data[0]['dish_key_id'] = {
                            dish_top_category_id: MealCategory.value,
                            material_item: []
                        }
                        data[0]['type'] = value.innerText
                        data[0]['sales_type'] = sales_type(value.innerText)
                        data[0]['specialMealColor'] = specialMeal.colors[SpecialMealCategory.value - 1]

                        let teseMatchRowId = -1;

                        params.api.forEachNode((v) => {
                            if (v.data && v.data.specialMealColor == data[0]['specialMealColor'] && v.data.teseMatchRowId !== -1) {
                                teseMatchRowId = v.data.teseMatchRowId
                            }
                        })

                        data[0]["teseMatchRowId"] = teseMatchRowId

                        gridOptions.api.expandAll()
                        gridOptions.api.applyTransaction({ add: data, addIndex: params.node.rowIndex + 1 })

                        return true
                    }
                })
            }
        },
        {
            name: '删除本行',
            action: () => {
                console.log(params)
                customFromDom({
                    parent: '#isDeleteRow',
                    cancel: ['#isDeleteRow_cancel1', '#isDeleteRow_cancel2'],
                    sure: "#isDeleteRow_sure",
                    deleteData: [],
                    sureFun: () => {
                        const selRows = gridOptions.api.getRowNode(params.node.id)
                        gridOptions.api.applyTransaction({ remove: [selRows] });
                        console.log(params)
                        // 重新计算成本比例
                        anew_top_cost(params)
                        const arr = []
                        let category = null
                        // gridOptions.api.forEachNode(v => {
                        //     if(v.data == undefined) return
                        //     if(v.data.id == params.node.data.id) return
                        //     arr.push(v.data)
                        // })
                        // console.log(arr)
                        for (const item of gridOptions.api.getColumnDefs()) {
                            if (item.headerName == "类别") {
                                category = { ...item }
                            }
                            arr.push(item)
                        }
                        gridOptions.api.setColumnDefs([category])
                        gridOptions.api.setColumnDefs(arr)
                        // await gridOptions.api.setRowData(arr)
                        // gridOptions.api.setServerSideDatasource(arr)
                        return true
                    }
                })

            }
        },

        // ...params.defaultItems
    ]
    // 点击添加备注  => 弹窗
    // 确认修改后 => 添加至当前备注行 => 每添加一次备注 需要添加@符号
    // if (params.column.colId === "whole") {
    //     result.push({
    //         name: '修改备注',
    //         action: () => {
    //             customFromDom({
    //                 parent: "#add_remarks",
    //                 cancel: ["#add_remarks_cancel1", "#add_remarks_cancel2"],
    //                 sure: "#add_remarks_sure",
    //                 deleteData: ["#add_remarks_category"],
    //                 initFun(_parent) {
    //                     console.log(params)
    //                     const addRemarksCategory = _parent.querySelector('#add_remarks_category')
    //                     const addRemarksButton = _parent.querySelector('#add_remarks_button')
    //                     const remarks = params.node.data.remarks.split(' ')
    //                     console.log(remarks)
    //                     if(remarks.length == 1 && remarks[0].trim() == ""){
    //                         addRemarksCategory.innerHTML += `
    //                         <li class="list-group-item">
    //                             <div class="input-group flex-nowrap">
    //                                 <input type="text" class="form-control">
    //                                 <span class="input-group-text"><button type="button" class="btn-close"></button></span>
    //                             </div>
    //                         </li>`
    //                     }else{
    //                         for (const item of remarks) {
    //                             if(item.trim() == "") continue
    //                             addRemarksCategory.innerHTML += `
    //                             <li class="list-group-item">
    //                                 <div class="input-group flex-nowrap">
    //                                     <input type="text" class="form-control" value="${item}">
    //                                     <span class="input-group-text"><button type="button" class="btn-close"></button></span>
    //                                 </div>
    //                             </li>`
    //                         }
    //                     }
    //                     let addRemarkCloseButtons = _parent.querySelectorAll('.btn-close')

    //                     let delLI = (item) => {
    //                         let delLi = item.parentNode.parentNode.parentNode
    //                         delLi.parentNode.removeChild(delLi)
    //                     }

    //                     addRemarksButton.onclick = () => {
    //                         const li = document.createElement("li")
    //                         li.className = 'list-group-item'
    //                         const addRemarksLi = addRemarksCategory.appendChild(li)
    //                         addRemarksLi.innerHTML = `
    //                             <div class="input-group flex-nowrap">
    //                                 <input type="text" class="form-control">
    //                                 <span class="input-group-text"><button type="button" class="btn-close btn-outline-primary"></button></span>
    //                             </div>`

    //                         addRemarkCloseButtons = _parent.querySelectorAll('.btn-close')
    //                         for (const item of addRemarkCloseButtons) {
    //                             item.onclick = () => { delLI(item) }
    //                         }
    //                     }

    //                     for (const item of addRemarkCloseButtons) {
    //                         item.onclick = () => { delLI(item) }
    //                     }


    //                 },
    //                 sureFun(_parent) {
    //                     const formControlAll = _parent.querySelectorAll('.form-control')
    //                     let remarks = '';
    //                     for (const item of formControlAll) {
    //                         remarks += item.value + ' '
    //                     }
    //                     const rowNode = params.api.getRowNode(params.node.data.id)
    //                     rowNode.setDataValue('remarks', remarks)
    //                     // params.node.data.remarks = remarks
    //                     // gridOptions.api.refreshCells({ force: true })
    //                     return true
    //                 },
    //             })
    //         }
    //     })
    // }
    return result
}
// 添加行信息的公共添加部分
const addRowPublicPart = (params) => {
    const obj = {}
    obj['Copies'] = 0
    obj['cl1'] = params.node.data['cl1']
    obj['dish'] = ""
    obj['dinner_type'] = params.node.data['dinner_type']
    obj['whole'] = ""
    obj['edit'] = true
    obj['configure'] = false
    obj['fixed'] = true
    obj['costPrice'] = 0
    obj['update'] = false
    obj['id'] = countID()
    obj['isNewAdd'] = true
    obj['note'] = ""
    return obj
}

// 添加sales_type信息
const sales_type = (value) => {
    switch (value) {
        case "快餐":
            return 'kuai';
        case "特色":
            return 'special';
        case "大荤":
            return 'special';
        case "小荤":
            return 'special';
        case "素菜":
            return 'special';
        case "汤粥":
            return 'special';
        case "绿豆汤":
            return 'green_bean_soup';
        case "简餐":
            return 'mini_business_meal';
        case "商务餐":
            return 'business_meal';
        case "泡面":
            return 'instance_noodle';
        case "香肠":
            return 'sausage';
        case "打包":
            return 'packed';
        case "其他":
            return 'other_sales';
        default:
            return 'other_sales';
    }
}


const getRowStyle = params => {
    if (params.data != undefined) {
        if (params.data.specialMealColor != undefined) {
            return {
                // backgroundColor: params.data.specialMealColor,
                borderBottom: `solid 2px ${params.data.specialMealColor}`,
                // boxShadow: `2px 2px 2px ${params.data.specialMealColor}`
                // textDecoration: "underline 2px #000"
                // textDecoration: `underline 2px ${params.data.SpecialMealCategory} !important`,
                // color: "#ddd",
            }
        } else if (params.data.type == "餐标") {
            return {
                backgroundColor: "#bfbfbf33",
                color: "#666",
                fontStyle: "italic",
                fontWeight: "600",
                // display: params.data.show ? "flex" : "none"
            }
        } else if (params.data.configure) {
            if (params.data.type == "快餐" || params.data.type == "特色") {
                return {
                    fontWeight: "600",
                }
            }
        }
    }
}

const onCellClicked = params => {
    // if(params.colDef.field == "dish"){
    //     // console.log(params)
    //     if(Restrictions(params)) return;
    //     if(params.data.configure || params.data.dish == "" || params.data.dish == undefined) return
    //     const { dish_family_id } = index.dish_key.find(v => v.id == params.data.dish_key_id.id)
    //     const arr = index.dish_family.filter(v => v.id == dish_family_id)
    //     console.log(arr)
    // }

}

// const onPasteStart = params => {
//     console.log(params)
// }

export default {
    onCellValueChanged, getContextMenuItems, getRowStyle, onCellClicked
}

export {
    changedValuetoData
}