/** @odoo-module **/
const saveCurrentRowData = (elStr, func) =>{
    document.querySelector(elStr).onclick = async e => {
        await func()

    }
}

export default saveCurrentRowData