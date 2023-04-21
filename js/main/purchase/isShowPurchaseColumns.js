/** @odoo-module **/
import index from './../../../data/index.js'
const isShowPurchaseColumns = (gridOptions) => {
    // 显示和隐藏
    console.log('1')
    if (gridOptions.api) {

        let cols = gridOptions.columnApi.getColumnState()
        const createLabels = document.querySelectorAll(".el_columns_item")
        const inps = document.querySelectorAll('.el_columns_item input')

        const noDailyProcurement = document.querySelector('#noDailyProcurement')
        const noNowProcurement = document.querySelector('#noNowProcurement')

        cols.forEach((col) => {
            inps.forEach((inp) => {
                if (inp.id === col.colId) {
                    inp.checked = !col.hide
                }
            })
        });

        // 非日采购 和 非今日采购
        noDailyProcurement.checked = index.user_settings.is_plan_day_purchase_default_not_show_plan_week
        noNowProcurement.checked = index.user_settings.is_plan_day_later_than_today_ready_PO_show
        const nowDate = moment().format("YYYY-MM-DD")
        const dateSpan = document.querySelector('.date') // 日计划
        const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
        const planDate = new Date(planDateHtml)
        const demandDate = moment(planDate).format("YYYY-MM-DD")

        // 显示隐藏非今日采购和非今日采购和不需要显示的数据逻辑
        const isOrNOShow = () => {

            if (!noDailyProcurement.checked) {
                gridOptions.api.forEachNode(v => {
                    if (v.key == null && v.data.purchase_freq != 'day') {
                        gridOptions.api.applyTransaction({ remove: [v.data] });
                    }
                })

            } else {
                gridOptions.rowData.forEach((v) => {
                    if (gridOptions.api.getRowNode(v.id) == undefined) {
                        if (v.key == null && v.purchase_freq != 'day') {
                            gridOptions.api.applyTransaction({ add: [v] });
                        }
                    }
                })
            }

            if (!noNowProcurement.checked) {
                // 从显示的数据中找 gridOptions.api.forEachNode
                gridOptions.api.forEachNode(v => {
                    if (v.key == null && nowDate != v.data.orderDate && v.data.purchase_freq == 'day') {
                        gridOptions.api.applyTransaction({ remove: [v.data] });
                    }
                })

            } else {
                // 从所有数据中找 gridOptions。rowData
                gridOptions.rowData.forEach((v) => {
                    if (gridOptions.api.getRowNode(v.id) == undefined) {
                        if (v.key == null && (nowDate != v.orderDate) && v.purchase_freq == 'day') {
                            gridOptions.api.applyTransaction({ add: [v] });
                        }
                    }
                })
            }

            // 像这个非日采购,如果今日下单数量是0,且不是当前的日计划日期,不需要发给前端
            gridOptions.api.forEachNode(v => {
                // id 为 noDaliyxxx的话就是 不是当前的日计划日期
                if (((v.key == null) && (v.data.purchase_freq != 'day') && (v.data.Order == 0) && (v.data.demandDate == demandDate)) || ((v.key == null) && (new Date(v.data.demandDate) < new Date(nowDate)))) {
                    gridOptions.api.applyTransaction({ remove: [v.data] });
                }
            })
        }
        isOrNOShow()

        createLabels.forEach((createLabel) => {
            createLabel.onclick = function (e) {
                e.stopPropagation()
                cols = gridOptions.columnApi.getColumnState()
                if (e.pointerType == "") return
                const inp = this.querySelector('input')
                cols.forEach((col) => {
                    if (inp.id === col.colId) {
                        gridOptions.columnApi.applyColumnState({
                            state: [
                                {
                                    colId: col.colId,
                                    hide: !col.hide,
                                }
                            ]
                        });
                        String(e.target) == "[object HTMLDivElement]" && (inp.checked = !inp.checked)
                    }
                });
            }
        })

        noDailyProcurement.onclick = () => {
            isOrNOShow()
        }

        noNowProcurement.onclick = () => {
            isOrNOShow()
        }
    }

}

export default isShowPurchaseColumns