/** @odoo-module **/
import {resetWindowData} from "./otherApi/addWindowData";
import {resetPreServerdData} from "./ag-grid/preserved_dishes";
import {resetMCData} from "./ag-grid/special_fast_data";
import {resetSavedData} from "./saveData";
import {resetSpecialMealData} from "./ag-grid/specialMeal";
import {reset_purchase_rowdata} from "./purchase/purchase_row";


export  function resetAllData() {
    resetWindowData()
    resetPreServerdData()
    resetMCData()
    resetSavedData()
    resetSpecialMealData()
    reset_purchase_rowdata()
}