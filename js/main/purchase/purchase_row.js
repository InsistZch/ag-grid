/** @odoo-module **/
import { getCountMaterial } from "../otherApi/getMaterial.js"
import index from './../../../data/index.js'


const row = (agOption) => {
    const rowData = []
    const d = getCountMaterial(agOption)

    d.forEach((v, i) => {
        const {name}  = (index.material_top_category.find(e => e.id == v.top_category_id))
        const unitName = index.material_purchase_unit_category.find(e => e.id == v.main_unit_id)
        let obj = {
            material: v.name.split('-')[0],
            demandDate: "3-23",
            quantity: v.dish_qty,
            stock: 1000,
            standardPrice: v.main_price,
            marketPrice: v.material_price_alert,
            shouldOrder: v.dish_qty,
            today: "",
            Order: Number(v.dish_qty).toFixed(1),
            deliveryDate: "3-25",
            tomorrow: "",
            thirdDay: "",
            unit: unitName.name,
            supplier: "",
            remarks: "",
            id: i,
            category_name: name
        }
        rowData.push(obj)
    })
    return rowData
}

export default row