/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from './../../../data/index.js'
// import moment from './../../../node_modules/moment/dist/moment.js'

const row = (agOption, purchase_summary_data) => {
    let rowData = []
    const d = getCountMaterial(agOption)

    const dateSpan = document.querySelector('.date') // 日计划
    const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
    const planDate = new Date(planDateHtml)
    const demandDate = `${planDate.getMonth() + 1 < 10 ? `0${planDate.getMonth() + 1}` : planDate.getMonth() + 1}-${planDate.getDate() < 10 ? `0${planDate.getDate()}` : planDate.getDate()}`

    const date = new Date()
    const nowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
    const tomorrowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : date.getDate() + 1}`
    const thirdDayDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 2 < 10 ? `0${date.getDate() + 2}` : date.getDate() + 2}`

    d.forEach((v, i) => {
        const { name } = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)

        const orderDate = new Date(new Date().getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(v.plan_day_purchase_ahead_days))
        const theOrderDate = `${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`

        let obj = {
            material: v.name.split('-')[0],
            creationDate: nowDate,
            orderDate: theOrderDate,
            demandDate: demandDate,
            quantity: v.dish_qty,
            shouldOrder: v.purchase_freq =="day" ? (v.dish_qty) : 0,
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            today: "",
            Order:  v.purchase_freq =="day" ? (theOrderDate == nowDate ? v.dish_qty : 0) : 0,
            deliveryDate: moment().format("MM-DD"),
            tomorrow: v.purchase_freq =="day" ? (theOrderDate == tomorrowDate ? v.dish_qty : 0) : 0,
            thirdDay: v.purchase_freq =="day" ? (theOrderDate == thirdDayDate ? v.dish_qty : 0) : 0,
            unit: unitName.name,
            supplier: "",
            remarks: "",
            id: i,
            category_name: name,
            purchase_freq: v.purchase_freq
        }
        rowData.push(obj)
    })
    // purchase_summary_data有数据，则录入purchase_summary_data中的数据，如果没有，则通过配量汇总生成
    if (purchase_summary_data != '' && purchase_summary_data != undefined) {
        rowData = purchase_summary_data
    }
    return rowData
}

export default row