/** @odoo-module **/
class CustomColumnsToolPanel {
    init(params) {
        const eDiv = document.createElement('div')
        // params.api.forEachNode(v => {
        //     console.log(v)
        // })
        // console.log(params.columnApi.getAllDisplayedVirtualColumns())
        // eDiv.classList.add('el_columns')
        // console.log(params.api.getColumns)
        this.params = params
        const dataObj = [
            {
                id: "demandDate",
                name: "需求日期"
            },
            {
                id: "quantity",
                name: "需量"
            },
            {
                id: "stock",
                name: "库存"
            },
            {
                id: "standardPrice",
                name: "标准单位"
            },
            {
                id: "marketPrice",
                name: "市场价"
            },{
                id: "shouldOrder",
                name: "应下单"
            },{
                id: "Order",
                name: "下单"
            }
            
            
        ]
        
        dataObj.forEach(v => {
            const createLabel = document.createElement('label')
            createLabel.classList.add('el_columns_item')
            createLabel.innerHTML =`
                <input type="checkbox" id="${v.id}"/>
                <span>${v.name}</span>
            `
            eDiv.appendChild(createLabel)
        })

        // eDiv.innerHTML = `
        // <label class="el_columns_item">
        //     <input type="checkbox" id="cb_demand_date"/>
        //     <span>需求日期</span>
        // </label>
        // <label class="el_columns_item">
        //     <input type="checkbox" id="cb_demand_measure"/>
        //     <span>需量</span>
        // </label>
        // <label class="el_columns_item">
        //     <input type="checkbox" id="cb_inventory"/>
        //     <span>库存</span>
        // </label>
        // <label class="el_columns_item">
        //     <input type="checkbox" id="cb_standard_unit_price"/>
        //     <span>标准单价</span>
        // </label>
        // <label class="el_columns_item">
        //     <input type="checkbox" id="cb_market_price"/>
        //     <span>市场价</span>
        // </label>
        // <label class="el_columns_item">
        //     <input type="checkbox" id="cb_should_be_placed"/>
        //     <span>应下单</span>
        // </label>
        // <label class="el_columns_item">
        //     <input type="checkbox" id="cb_be_placed"/>
        //     <span>下单</span>
        // </label>`

        this.eDiv = eDiv
    }

    getGui() {
        // console.log(this.params.columnApi.getColumnState())
        return this.eDiv
    }
}

export default CustomColumnsToolPanel