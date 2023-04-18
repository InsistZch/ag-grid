/** @odoo-module **/
let make_add_function = () => {

    let id = 1;

    return () => {
        return `virtual_${id++}`;
    }

}

const add_material_id = make_add_function();
const add_dish_bom_id = make_add_function();
const add_dish_key_id = make_add_function();
const add_material_item_bom_unit_ratio_id = make_add_function();



export {
    add_material_id,
    add_dish_bom_id,
    add_dish_key_id,
    add_material_item_bom_unit_ratio_id
}

export function get_purchase_row_data_list(date, arr) {

    let ans_arr = []
    arr.forEach(r => {
        let obj = {
            mname: r.material,
            category_name: r.category_name,
            purchase_unit_id: r.purchase_unit_id,
            main_unit_id: r.main_unit_id,
            purchase_qty: r.quantity,
            remarks: r.remarks,
            standardPrice: r.standardPrice,
            creationDate: `${r.creationDate}`,
            orderDate: `${r.orderDate}`,
            demandDate: `${r.demandDate}`,
        }

        if (obj.creationDate.split('-').length == 2) {
            Object.assign(obj, {
                creationDate: `${date.getFullYear()}-${r.creationDate}`,
                orderDate: `${date.getFullYear()}-${r.orderDate}`,
                demandDate: `${date.getFullYear()}-${r.demandDate}`,
            })
        }


        ans_arr.push(obj)
    })
    return ans_arr
}