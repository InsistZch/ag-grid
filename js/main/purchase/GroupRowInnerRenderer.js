/** @odoo-module **/
import {get_purchase_row_data_list} from "../tool.js";

class GroupRowInnerRenderer {
    init(params) {
        // console.log(params)
        const eGui = document.createElement('div')

        const span = document.createElement('span')

        const btnOrder = document.createElement('button')
        // const btnOrderAll = document.querySelector('#purchase_order_all')

        btnOrder.classList.add('el_btn')
        btnOrder.style.cssText = `margin-left: 5rem;`

        const orderConsole = async (arr) => {
            let nowD = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

            let ans_arr = get_purchase_row_data_list(nowD, arr)
            console.log(ans_arr)
            if (params.context && params.context.owl_widget.DownloadPurchaseOrderInCategory) {
                await params.context.owl_widget.DownloadPurchaseOrderInCategory(ans_arr)
            }

        }
        btnOrder.onclick = async () => {
            const arr = params.node.allLeafChildren.map(v => v.data)
            console.log('局部下载采购单')
            await orderConsole(arr)
        }

        // btnOrderAll.onclick = () => {
        //     const arr = []
        //     params.api.forEachNode((e)=>{
        //         e.data != undefined && arr.push(e.data)
        //     })
        //     orderConsole(arr)
        // }

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