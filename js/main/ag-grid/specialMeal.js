/** @odoo-module **/
let isfetch = false;

let m = {}

const specialMeal = async () => {
    if(!isfetch){

        isfetch = !isfetch
        const meal = await fetch('./js/main/ag-grid/specialMeal.json').then(v => v.text())
        m = {...JSON.parse(meal)}
        return m

    }
    
    return m
}

export default specialMeal
