/** @odoo-module **/
const isShowPurchaseColumns = (gridOptions) => {
// 显示和隐藏

    let cols = gridOptions.columnApi.getColumnState()
    const createLabels = document.querySelectorAll(".el_columns_item")
    const inps = document.querySelectorAll('.el_columns_item input')

    cols.forEach((col) => {
        inps.forEach((inp) => {
            if (inp.id === col.colId) {
                inp.checked = !col.hide
            }
        })
    });

    createLabels.forEach((createLabel) => {
        createLabel.onclick = function (e) {
            cols = gridOptions.columnApi.getColumnState()
            e.stopPropagation()
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
                }
            });
        }
    })
}

export default isShowPurchaseColumns