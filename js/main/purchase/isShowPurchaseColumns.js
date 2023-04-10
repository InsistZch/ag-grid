/** @odoo-module **/
const isShowPurchaseColumns = (gridOptions) => {
    // 显示和隐藏

    let cols = gridOptions.columnApi.getColumnState()
    const createLabels = document.querySelectorAll(".el_columns_item")
    const inps = document.querySelectorAll('.el_columns_item input')

    const noDailyProcurement = document.querySelector('#noDailyProcurement')

    cols.forEach((col) => {
        inps.forEach((inp) => {
            if (inp.id === col.colId) {
                inp.checked = !col.hide
            }
        })
    });

    noDailyProcurement.checked = true

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
        if (!noDailyProcurement.checked) {
            gridOptions.api.forEachNode(v => {
                if (v.key == null && v.data.purchase_freq != 'day') {
                    gridOptions.api.applyTransaction({ remove: [v.data] });
                }
            })

        } else {
            gridOptions.rowData.forEach((v) => {
                console.log(v)
                if(gridOptions.api.getRowNode(v.id) == undefined){
                    console.log(v)
                    gridOptions.api.applyTransaction({ add: [v] });
                }
            })
        }
    }
}

export default isShowPurchaseColumns