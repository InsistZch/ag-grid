/** @odoo-module **/
const isShowPurchaseColumns = (gridOptions) => {
    // 显示和隐藏

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

    noDailyProcurement.checked = true
    noNowProcurement.checked = true

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

    console.log(gridOptions)

    noDailyProcurement.onclick = () => {
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
    }

    noNowProcurement.onclick = () => {
        if (!noNowProcurement.checked) {
            gridOptions.api.forEachNode(v => {
                if (v.key == null && v.data.orderDate != v.data.creationDate) {
                    gridOptions.api.applyTransaction({ remove: [v.data] });
                }
            })

        } else {
            gridOptions.rowData.forEach((v) => {
                if (gridOptions.api.getRowNode(v.id) == undefined) {
                    if (v.key == null && v.orderDate != v.creationDate) {
                        gridOptions.api.applyTransaction({ add: [v] });
                    }
                }
            })
        }
    }
}

export default isShowPurchaseColumns