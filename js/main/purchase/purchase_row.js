/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from './../../../data/index.js'
// import moment from './../../../node_modules/moment/dist/moment.js'


const row = (agOption) => {
    const rowData = []
    const d = getCountMaterial(agOption)

    d.forEach((v, i) => {
        const {name}  = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)
        let obj = {
            material: v.name.split('-')[0],
            demandDate: moment().add(v.plan_day_purchase_ahead_days,'days').format("MM-DD"),
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
            category_name: name
        }
        if(v.plan_day_purchase_ahead_days != 2){
            obj.Order = 0
        }
        rowData.push(obj)
    })
    return rowData
}

export default row