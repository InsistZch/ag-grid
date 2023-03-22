/** @odoo-module **/
let isfetch = false;

let m = {}

let init_specialMeal = () => {
    return {
        "Catering": {
            "dn1": 1,
            "dn2": 1,
            "dn3": 1,
            "dn5": 1
        },
        "colors": ["#2a598a66", "#a7773066", "#3e6b2766", "#6b6d7166", "#b2525266"]
    }
}

const specialMeal = async () => {
    if(!isfetch) {
        isfetch = !isfetch
        m = init_specialMeal()
    }

    return m
}

export default specialMeal


export let resetSpecialMealData = () => {

    isfetch = false
}