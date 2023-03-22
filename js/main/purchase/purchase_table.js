/** @odoo-module **/

import col from "./purchase_col.js";
import row from "./purchase_row.js";

const gridOptions = (agOption) => {  
    return {
        columnDefs: col,
        rowData: row(agOption),
        defaultColDef: {
            // editable: false,//单元表格是否可编辑
            // enableRowGroup: true,
            // sortable: true, //开启排序
            resizable: true,//是否可以调整列大小，就是拖动改变列大小
            // filter: true,  //开启刷选
            minWidth: 200,
            flex: 1,
            // floatingFilter: true,
            suppressSizeToFit: true,
            menuTabs: []
        },
        // onGridReady: function (params) {
        //     //表格创建完成后执行的事件
        //     // console.log(params)
        //     params.api.sizeColumnsToFit();//调整表格大小自适应
        //     // gridOptions.api.setPinnedTopRowData([cost_proportion(d)[2]])
            
        // },
        // // suppressColumnMoveAnimation:false,
        // onCellValueChanged: (params) => onCellValueChanged(params, agOption),
        // onCellClicked,
        // pagination: true,
        // menuTabs: params => api.menuTabs(params),
        paginationAutoPageSize: true, //根据网页高度自动分页（前端分页）
        // getRowId,
        // localeText:locale,
        // context: {},
    }
};
export default gridOptions