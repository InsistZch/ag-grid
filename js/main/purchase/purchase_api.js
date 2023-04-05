/** @odoo-module **/
const getRowId = (params) => params.data.id;

const getContextMenuItems = (params) => {
    if (params.node.data == undefined) return

    // console.log(params.column.colId)
    const result = [
        {
            name: '添加食材',
        },
        {
            name: '删除食材'
        }
    ]
    return result
}

const onCellValueChanged = (e, gridOptions) => {

    if (e.colDef.headerName == '下单') {
        const rowNode = gridOptions.api.getRowNode(e.data.id)
        if (isNaN(e.newValue)) {
            rowNode.setDataValue(e.colDef.field, e.oldValue)
        } else {
            const newValue = Number(e.newValue).toFixed(1)
            console.log(newValue)
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
