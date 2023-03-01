/** @odoo-module **/
import { mealPrice } from "./ag-grid-row.js"

let is_load = false
let meal_price
const init_mp = () => {

    if (!is_load) {
        meal_price = mealPrice()
        is_load = true
    }
    return meal_price
}

export default init_mp