/** @odoo-module **/
import col from "./purchase_col.js";
import row from "./purchase_row.js";
import { getRowId, getContextMenuItems, onCellValueChanged } from './purchase_api.js';
import GroupRowInnerRenderer from './GroupRowInnerRenderer.js'
// import CustomColumnsToolPanel from "./CustomColumnsToolPanel.js";
// import CustomStatsToolPanel from './CustomStatsToolPanel.js'

const gridOptions = (agOption) => {
    const obj =  {
        columnDefs: col,
        rowData: row(agOption),
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
        // suppressDragLeaveHidesColumns: true,
        // sideBar: {
        //     toolPanels: [
        //         {
        //           id: 'columns',
        //           labelDefault: '列显示与隐藏',
        //           labelKey: 'columns',
        //           iconKey: 'columns',
        //         //   toolPanel: CustomColumnsToolPanel,
        //           minWidth: 100,
        //           width: 120,
        //           maxWidth: 150,
        //           toolPanelParams: {
        //             suppressRowGroups: true,
        //             suppressValues: true,
        //             suppressPivots: true,
        //             suppressPivotMode: true,
        //             suppressColumnFilter: true,
        //             suppressColumnSelectAll: true,
        //             suppressColumnExpandAll: true,
        //           },
        //         },

        //         {
        //             id: 'customStats',
        //             labelDefault: '保存订单',
        //             labelKey: 'customStats',
        //             iconKey: 'columns',
        //             toolPanel: CustomStatsToolPanel,
        //             minWidth: 100,
        //             width: 120,
        //             maxWidth: 150,
        //         },
        //     ],
        //     position: 'top',
        //     defaultToolPanel: 'columns',
        // },
        getContextMenuItems: (e) => getContextMenuItems(e),
        onCellValueChanged: (e) => onCellValueChanged(e,obj),
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
        getRowId,
        // localeText:locale,
        // context: {},

    }
    return obj
};
export default gridOptions