/** @odoo-module **/
import { mealCopies } from "./ag-grid-row.js"

const init_mc = () => {

    let is_load = false
    let mealcopies
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