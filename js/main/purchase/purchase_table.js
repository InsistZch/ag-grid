/** @odoo-module **/

import col from "./purchase_col.js";
import row from "./purchase_row.js";
import { getRowId } from './purchase_api.js';
import GroupRowInnerRenderer from './GroupRowInnerRenderer.js'

const gridOptions = (agOption) => {  
    return {
        columnDefs: col,
        rowData: row(agOption),
        defaultColDef: {
            editable: false,//单元表格是否可编辑
            // enableRowGroup: true,
            // sortable: true, //开启排序
            resizable: true,//是否可以调整列大小，就是拖动改变列大小
            // filter: true,  //开启刷选
            minWidth: 50,
            flex: 1,
            // floatingFilter: true,
            suppressSizeToFit: true,
            menuTabs: []
        },
        sideBar: {
            toolPanels: [
                {
                  id: 'columns',
                  labelDefault: 'Columns',
                  labelKey: 'columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
                  toolPanelParams: {
                    suppressRowGroups: true,
                    suppressValues: true,
                    suppressPivots: true,
                    suppressPivotMode: true,
                    suppressColumnFilter: true,
                    suppressColumnSelectAll: true,
                    suppressColumnExpandAll: true,
                  },
                },
            ],
            defaultToolPanel: 'columns',
        },
        groupDisplayType: 'groupRows',
        groupRowRendererParams: {
            suppressCount: true,
            innerRenderer: GroupRowInnerRenderer,
            editable:false
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
};
export default gridOptions