/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from '../../../data/index.js'

const row = (agOption) => {
    let d = []
    let rowData = []
    const dateSpan = document.querySelector('.date') // 日计划
    const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
    const planDate = new Date(planDateHtml)
    const demandDate = moment(planDate).format("YYYY-MM-DD")
    const nowDate = moment().format("YYYY-MM-DD")

    const numFormat = (num) => {
        return Number(Number(num) >= 10 ? Math.ceil(num) : Number(num).toFixed(2))
    }

    d = getCountMaterial(agOption)
    d.forEach((v, i) => {
        const { name } = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)

        const orderDate = moment(new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate() + Number(v.plan_day_purchase_ahead_days))).format('YYYY-MM-DD')
        let obj = {
            material: v.name.split('-')[0],
            creationDate: nowDate,
            orderDate: orderDate,
            demandDate: demandDate,
            quantity: numFormat(v.dish_qty),
            shouldOrder: v.purchase_freq == "day" ? numFormat(v.dish_qty) : 0,
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            today: "",
            Order: v.purchase_freq == "day" ? numFormat(v.dish_qty) : 0,
            deliveryDate: moment().format("YYYY-MM-DD"),
            tomorrow: v.purchase_freq == "day" ? numFormat(v.dish_qty) : 0,
            thirdDay: v.purchase_freq == "day" ? numFormat(v.dish_qty) : 0,
            unit: unitName.name,
            main_unit_id: v.main_unit_id,
            purchase_unit_id: v.purchase_unit_id,
            supplier: "",
            remarks: "",
            id: i,// !v.demandDate 是从配量汇总生成 v.demandDate == demandDate 需求日期是计划日期
            category_name: name,
            purchase_freq: v.purchase_freq
        }
        rowData.push(obj)
    })
    return rowData
}

export default row