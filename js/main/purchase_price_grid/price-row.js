/** @odoo-module **/
import data from "../../../data/index.js"
/*
{
    materialName => String
    price        => Number
    unit         => String
}
*/


export default (material_items) => {
    const arr = []
    let index = 0
    for (const [,v] of material_items) {
        const {name} = data.material_purchase_unit_category.find(unit => unit.id == v.main_unit_id)
        arr.push({
            materialName: v.name.split('-')[0],
            price: v.main_price,
            unit: name,
            materialId: v.id,
            id: index++
        })
    }
    return arr
}