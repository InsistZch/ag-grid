
class CustomColumnsToolPanel {
    init(params){
        const eDiv = document.createElement('div')
        console.log(params)
        eDiv.classList.add('el_columns')
        console.log(params.api.getColumns)
        eDiv.innerHTML = `
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>需求日期</span>
        </label>
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>需量</span>
        </label>
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>库存</span>
        </label>
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>标准单价</span>
        </label>
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>市场价</span>
        </label>
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>应下单</span>
        </label>
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>下单</span>
        </label>
        <label class="el_columns_item">
            <input type="checkbox"/>
            <span>需求日期</span>
        </label>`
        
        
        this.eDiv = eDiv
    }

    getGui(){
        return this.eDiv
    }
}

export default CustomColumnsToolPanel