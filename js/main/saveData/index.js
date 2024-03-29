/** @odoo-module **/

let data = {}

resetSavedData()
export default data


export function resetSavedData() {

    Object.assign(data,
        {
            new_material_item_list: [],

            new_dish_key_list: [],

            new_material_to_unit_ratio: [],

            add_dish_key_list: [],
            // 日成本比例数据
            day_cost_proportion: {
                init_sales: false,
                init_cost: false,
                init_cost_ratio: false,

                complete_sales: false,
                complete_cost: false,
                complete_cost_ratio: false,
            }
        })

}