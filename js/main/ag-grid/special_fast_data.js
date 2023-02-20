/** @odoo-module **/
import { mealCopies } from "./ag-grid-row.js"

const mc = () => {
    const mealcopies = mealCopies(true, false, {
        t1: "快餐",
        t2: "特色"
    })
    return () => mealcopies
}

export default mc()()