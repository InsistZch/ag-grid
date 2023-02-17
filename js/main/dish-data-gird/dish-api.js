/** @odoo-module **/
const menuTabs = params => {
    console.log(params)
}

const postProcessPopup = params => {
    // console.log(params)
    // const ePopup = params.ePopup;

    // let oldTopStr = ePopup.style.top;
    // let oldLeftStr = ePopup.style.left;
    // // remove 'px' from the string (AG Grid uses px positioning)
    // oldTopStr = oldTopStr.substring(0, oldTopStr.indexOf('px'));
    // oldLeftStr = oldLeftStr.substring(0, oldLeftStr.indexOf('px'));

    // const oldTop = parseInt(oldTopStr);
    // const oldLeft = parseInt(oldLeftStr);

    // const newTop = oldTop + 50;
    // const newLeft = oldLeft + 50;

    // ePopup.style.top = newTop + 'px';
    // ePopup.style.top = newLeft + 'px';
}

export{
    menuTabs, postProcessPopup
}
export default {
    menuTabs, postProcessPopup
}