/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from './../../../data/index.js'
// import moment from './../../../node_modules/moment/dist/moment.js'

const row = (agOption) => {
    const rowData = []
    const d = getCountMaterial(agOption)

    const dateSpan = document.querySelector('.date') // 日计划
    const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
    const planDate = new Date(planDateHtml)
    const demandDate = `${planDate.getMonth() + 1 < 10 ? `0${planDate.getMonth() + 1}` : planDate.getMonth() + 1}-${planDate.getDate() < 10 ? `0${planDate.getDate()}` : planDate.getDate()}`

    const date = new Date()
    const nowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
    d.forEach((v, i) => {
        const { name } = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)

        const orderDate = new Date(new Date().getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(v.plan_day_purchase_ahead_days))
        const theOrderDate = `${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`
        // console.log(orderDate.getMonth(), orderDate.getDate())

        let obj = {
            material: v.name.split('-')[0],
            creationDate: nowDate,
            orderDate: theOrderDate,
            // demandDate: moment().add(v.plan_day_purchase_ahead_days, 'days').format("MM-DD"),
            demandDate: demandDate,
            quantity: v.dish_qty,
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            shouldOrder: v.dish_qty,
            today: "",
            Order: Number(v.dish_qty).toFixed(1),
            deliveryDate: moment().format("MM-DD"),
            tomorrow: "",
            thirdDay: "",
            unit: unitName.name,
            supplier: "",
            remarks: "",
            id: i,
            category_name: name,
            purchase_freq_id:v.purchase_freq_id
        }
        if (v.plan_day_purchase_ahead_days != -2) {
            obj.Order = 0
        }
        rowData.push(obj)
    })
    return rowData
}

export default row