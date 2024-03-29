/** @odoo-module **/
class GroupRowInnerRenderer {
    init(params) {
        // console.log(params)
        const eGui = document.createElement('div')

        const span = document.createElement('span')

        const btnOrder = document.createElement('button')
        // const btnOrderAll = document.querySelector('#purchase_order_all')
        
        btnOrder.classList.add('el_btn')
        btnOrder.style.cssText = `margin-left: 5rem;`

        span.innerHTML = `<span style="font-weight: 600;">${params.value}</span>`
        btnOrder.innerHTML = `<span class='el_btn_span'>&#8250;</span>下单`
        eGui.appendChild(span)
        eGui.appendChild(btnOrder)

        this.eGui = eGui
    }

    // 插入页面
    getGui() {
        return this.eGui;
    }
}

export default GroupRowInnerRenderer