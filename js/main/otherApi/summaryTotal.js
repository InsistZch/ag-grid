/** @odoo-module **/
const summaryTotal = (elStr, func) => {
    
    let isShow = true
    elStr.forEach(el => {
        document.querySelector(el).onclick = async e => {
            await func(isShow)
            isShow = !isShow
        }
    });

}

export default summaryTotal