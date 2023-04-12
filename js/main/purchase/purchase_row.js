/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from './../../../data/index.js'

const row = (agOption) => {
    const dateSpan = document.querySelector('.date') // 日计划
    const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
    const planDate = new Date(planDateHtml)
    const demandDate = `${planDate.getFullYear()}-${planDate.getMonth() + 1 < 10 ? `0${planDate.getMonth() + 1}` : planDate.getMonth() + 1}-${planDate.getDate() < 10 ? `0${planDate.getDate()}` : planDate.getDate()}`

    let rowData = []

    const purchase_summary_data = index.purchase_summary_data
    let purD = []
    let wholeD = []
    let d = []

    let purItem = []
    let needWhole = true
    purchase_summary_data.forEach(purData => {
        index.material_item.forEach(item => {
            if (purData.material_id == item.id) {
                index.material_item_bom_unit_ratio.forEach((unit)=>{
                    if(purData.material_id == unit.material_id && purData.main_unit_id == unit.purchase_unit_id){
                        item.main_unit_bom_unit_ratio = unit.main_unit_bom_unit_ratio
                    }
                })
                item.dish_qty = purData.main_qty
                item.creationDate = purData.creationDate
                item.demandDate = purData.demandDate
                item.orderDate = purData.orderDate
                purItem.push(item)
            }
        })
        if (demandDate == purData.demandDate) {
            needWhole = false
        }
    });

    purD = getCountMaterial(agOption,purItem)
    if (needWhole == true) {
        wholeD = getCountMaterial(agOption)
    }
    d = new Map([...purD, ...wholeD])

    const date = new Date()
    const nowDate = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
    const tomorrowDate = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : date.getDate() + 1}`
    const thirdDayDate = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 2 < 10 ? `0${date.getDate() + 2}` : date.getDate() + 2}`

    d.forEach((v, i) => {
        const { name } = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)

        const orderDate = new Date(planDate.getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(v.plan_day_purchase_ahead_days))
        const theOrderDate = `${orderDate.getFullYear()}-${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`

        let obj = {
            material: v.name.split('-')[0],
            creationDate: v.creationDate || nowDate,
            orderDate: v.orderDate || theOrderDate,
            demandDate: v.demandDate || demandDate,
            quantity: v.dish_qty,
            shouldOrder: v.purchase_freq == "day" ? (v.dish_qty) : 0,
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            today: "",
            Order: v.purchase_freq == "day" ? ((v.orderDate || theOrderDate) == nowDate ? v.dish_qty : 0) : 0,
            deliveryDate: moment().format("MM-DD"),
            tomorrow: v.purchase_freq == "day" ? ((v.orderDate || theOrderDate) == tomorrowDate ? v.dish_qty : 0) : 0,
            thirdDay: v.purchase_freq == "day" ? ((v.orderDate || theOrderDate) == thirdDayDate ? v.dish_qty : 0) : 0,
            unit: unitName.name,
            supplier: "",
            remarks: "",
            id: i,
            category_name: name,
            purchase_freq: v.purchase_freq
        }
        rowData.push(obj)
    })
    return rowData
}

export default row