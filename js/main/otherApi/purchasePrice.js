/** @odoo-module **/
import customFrom from './customFrom.js'
import priceTable from './../purchase_price_grid/price-table.js'
export default (elStr, func = () => {}) => {
    document.querySelector(elStr).onclick = () => {
        const [material, agOption] = func()
        customFrom({
            parent:'#purchase_price',
            cancel: ['#purchase_price_cancel1', '#purchase_price_cancel2'],
            sure: "#purchase_price_sure",
            deleteData: ["#purchase_price_table"],
            initFun(){
                // const d = priceRow(material)
                const option = priceTable(material,agOption)
                const eGridDiv = document.querySelector('#purchase_price_table');
                new agGrid.Grid(eGridDiv, option);
                // console.log(material)
            },
            sureFun(){
                agOption.api.refreshCells({force:true})
                return true
            }
        })
    } 
}