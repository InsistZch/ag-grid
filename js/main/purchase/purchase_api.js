/** @odoo-module **/
const getRowId = (params) => params.data.id;

const getContextMenuItems = (params,gridOptions ) => {
    if (params.node.data == undefined) return

    // console.log(params.column.colId)
    const result = [
        {
            name: '添加食材',
        },
        {
            name: '删除食材',
            action: () => {
                console.log("删除食材")
                const selRows = gridOptions.api.getRowNode(params.node.id)
                gridOptions.api.applyTransaction({ remove: [selRows] });
            }
        }
    ]
    return result
}

const onCellValueChanged = (e, gridOptions) => {

    if (e.colDef.headerName == '下单') {
        let newValue = 0;
        const rowNode = gridOptions.api.getRowNode(e.data.id)
        if (e.newValue == 0 || e.newValue == null || e.newValue == undefined) {
            rowNode.setDataValue(e.colDef.field, newValue)
        } else if (isNaN(e.newValue)) {
            rowNode.setDataValue(e.colDef.field, e.oldValue)
        } else {
            newValue = Number(e.newValue)
            if (e.newValue.indexOf(".") > 0) newValue = newValue.toFixed(1)
            rowNode.setDataValue(e.colDef.field, newValue)
        }
    }
}

export {
    getRowId, getContextMenuItems, onCellValueChanged
}

export default {
    getRowId, getContextMenuItems, onCellValueChanged
}
