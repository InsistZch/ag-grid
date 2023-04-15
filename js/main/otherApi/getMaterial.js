/** @odoo-module **/
const getMaterial = (agOption) => {
    const material = new Map()
    agOption.api.forEachNode(v => {
        if (v.data == null || v.data.config) return
        for (const item of v.data.dish_key_id.material_item) {
            material.set(item.id, item)
        }
    })
    // console.log(material)
    return [material, agOption]
}

/*
dish_qty: 260
id: 360246
main_price: 9.8
main_unit_id: 9
main_unit_bom_unit_ratio: 1
material_id: 360246
name: "三黄鸡-鲜品-食材"
process_id: 5
top_category_id: 1
unit_id: 9
unit_name: "斤"
*/

/*
dish_qty
main_price
main_unit_id
top_category_id
name
material_price_alert
*/
// 需要把食材全部转换成主要单位
//  
const getCountMaterial = (agOption, purItem) => {
    const material = new Map()
    if (purItem != undefined) {
        purItem.forEach(item => {
            const dish_qty = Number(((item.dish_qty || 0) / item.main_unit_bom_unit_ratio).toFixed(1))
            const main_price = Number((item.main_price / item.main_unit_bom_unit_ratio).toFixed(1))
            console.log()
            material.set(item.id, {
                dish_qty,
                main_price: main_price,
                main_unit_id: item.main_unit_id,
                purchase_unit_id:item.purchase_unit_id,
                name: item.name,
                material_price_alert: Number(item.material_price_alert.toFixed(1)),
                top_category_id: item.top_category_id,
                plan_day_purchase_ahead_days: item.plan_day_purchase_ahead_days,
                purchase_freq: item.purchase_freq,
                demandDate: item.demandDate,
                creationDate: item.creationDate,
                orderDate: item.orderDate,
            })
        });
    } else {
        agOption.api.forEachNode(v => {
            if (v.data == null || v.data.config) return
            for (const item of v.data.dish_key_id.material_item) {
                if (material.has(item.id)) {
                    const obj = material.get(item.id)
                    obj.dish_qty += Number((item.dish_qty / item.main_unit_bom_unit_ratio).toFixed(1))
                } else {
                    const dish_qty = Number((item.dish_qty / item.main_unit_bom_unit_ratio).toFixed(1))
                    const main_price = Number((item.main_price / item.main_unit_bom_unit_ratio).toFixed(1))
                    material.set(item.id, {
                        dish_qty,
                        main_price: main_price,
                        main_unit_id: item.main_unit_id,
                        purchase_unit_id:item.main_unit_id,
                        name: item.name,
                        material_price_alert: Number(item.material_price_alert.toFixed(1)),
                        top_category_id: item.top_category_id,
                        plan_day_purchase_ahead_days: item.plan_day_purchase_ahead_days,
                        purchase_freq: item.purchase_freq
                    })
                }
            }
        })
    }


    return material
}


export {
    getMaterial,
    getCountMaterial
}

export default {
    getMaterial,
    getCountMaterial
}