/** @odoo-module **/
import { mealCopies } from "./ag-grid-row.js"

let is_load = false
let mealcopies
const init_mc = () => {

    if (!is_load) {
        mealcopies = mealCopies(true, false, {
            t1: "快餐",
            t2: "特色"
        })
        is_load = true
    }

    return mealcopies
}

export default init_mc