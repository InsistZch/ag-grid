/** @odoo-module **/
const purchase = (elStr, func) =>{
    let isShow = true
    document.querySelector(elStr).onclick = async e => {
        await func(isShow)
        isShow = !isShow
    }
}

export default purchase