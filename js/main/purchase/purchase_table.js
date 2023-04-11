/** @odoo-module **/
import col from "./purchase_col.js";
import row from "./purchase_row.js";
import { getRowId, getContextMenuItems, onCellValueChanged, onCellClicked } from './purchase_api.js';
import GroupRowInnerRenderer from './GroupRowInnerRenderer.js'

const gridOptions = (agOption,purchase_summary_data) => {
    const obj = {
        columnDefs: col,
        rowData: row(agOption,purchase_summary_data),
        enableRangeSelection: true,
        defaultColDef: {
            editable: false,//单元表格是否可编辑
            // enableRowGroup: true,
            // sortable: true, //开启排序
            // resizable: true,//是否可以调整列大小，就是拖动改变列大小
            // filter: true,  //开启刷选
            minWidth: 60,
            width: 60,
            // maxWidth: 60,
            flex: 1,
            // floatingFilter: true,
            suppressSizeToFit: true,
            // pinned: "left",
            lockPosition: true,
            lockPinned: true,
            menuTabs: []
        },
        getContextMenuItems: (e) => getContextMenuItems(e, obj, agOption),
        onCellValueChanged: (e) => onCellValueChanged(e, obj),
        onCellClicked: (e) => onCellClicked(e, obj, agOption),
        groupDisplayType: 'groupRows',
        groupDefaultExpanded: -1,
        groupRowRendererParams: {
            suppressCount: true,
            innerRenderer: GroupRowInnerRenderer,
            editable: false
        },
        // // suppressColumnMoveAnimation:false,
        // onCellValueChanged: (params) => onCellValueChanged(params, agOption),
        // onCellClicked,
        // pagination: true,
        // menuTabs: params => api.menuTabs(params),
        paginationAutoPageSize: true, //根据网页高度自动分页（前端分页）
        getRowId
        // localeText:locale,
        // context: {},

    }
    return obj
};
export default gridOptions