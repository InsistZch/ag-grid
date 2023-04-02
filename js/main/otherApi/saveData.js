/** @odoo-module **/
const saveCurrentRowData = (elStr, func) =>{
    const el = document.querySelector(elStr)
    el.onclick = async e => {
        await func(el)

    }
}

export default saveCurrentRowData