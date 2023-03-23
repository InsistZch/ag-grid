import getMaterial from "../otherApi/getMaterial.js"


const row = (agOption) => {
    const rowData = []
    const [d,] = getMaterial(agOption)
    d.forEach((v, i) => {
        let obj = {
            material: v.name.split('-')[0],
            demandDate: "3-23",
            quantity: v.dish_qty,
            stock: 1000,
            standardPrice: (v.main_price / v.main_unit_bom_unit_ratio).toFixed(1),
            marketPrice: (v.material_price_alert).toFixed(1),
            shouldOrder: v.dish_qty,
            today: "",
            Order: v.dish_qty,
            deliveryDate: "3-25",
            tomorrow:"",
            thirdDay:"",
            unit: v.unit_name,
            supplier: "",
            remarks: "",
            id: i,
        }
        rowData.push(obj)
    })
    return rowData
}

export default row