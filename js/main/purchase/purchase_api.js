import refreshWholeCol from "../otherApi/refreshWholeCol.js";

/** @odoo-module **/
const getRowId = (params) => params.data.id;

const getContextMenuItems = (e, gridOptions) => {
    if (e.node.data && e.node.data == undefined) return

    // console.log(e.column.colId)
    const result = [
        {
            name: '添加食材',
            action: () => {
                console.log(e, gridOptions)
                const data = [{}]
                gridOptions.api.applyTransaction({ add: data, addIndex: e.node.rowIndex + 1 })
            }
        },
        {
            name: '删除食材',
            action: () => {
                const selRows = gridOptions.api.getRowNode(e.node.id)
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

const onCellClicked = (e, gridOptions, agOption) => {
    agOption.rowData.forEach(row => {
        row.dish_key_id.material_item.forEach(item => {
            if (item.name.split("-")[0] == (e.data.material)) {
                agOption.api.setColumnDefs(refreshWholeCol.refreshWhole(e.data.material))
            }
        });
    });
}

export {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}

export default {
    getRowId, getContextMenuItems, onCellValueChanged, onCellClicked
}
