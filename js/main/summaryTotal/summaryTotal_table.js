/** @odoo-module **/
import col from "./summaryTotal_col.js";
import row from "./summaryTotal_row.js";
import GroupRowInnerRenderer from './GroupRowInnerRenderer.js'
import { getRowId } from "./summaryTotal_api.js";

const gridOptions = (agOption) => {
    const obj = {
        columnDefs: col,
        rowData: row(agOption),
        enableRangeSelection: true,
        defaultColDef: {
            editable: false,
            minWidth: 60,
            width: 60,
            flex: 1,
            suppressSizeToFit: true,
            lockPosition: true,
            lockPinned: true,
            menuTabs: []
        },
        groupDisplayType: 'groupRows',
        groupDefaultExpanded: -1,
        groupRowRendererParams: {
            suppressCount: true,
            innerRenderer: GroupRowInnerRenderer,
            editable: false
        },
        paginationAutoPageSize: true, //根据网页高度自动分页（前端分页）
        getRowId
        // localeText:locale,
        // context: {},

    }
    console.log(obj.rowData)
    return obj
};
export default gridOptions