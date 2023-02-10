/** @odoo-module **/
import agGridApi from './ag-grid-api.js'
import col from './ag-grid-col.js'
import {data} from './ag-grid-row.js'
const gridOptions = {
    columnDefs: col(),
    rowData: data(),
    defaultColDef: {
        editable: true,//单元表格是否可编辑
        // enableRowGroup: true,
        // sortable: true, //开启排序
        resizable: true,//是否可以调整列大小，就是拖动改变列大小
        // filter: true,  //开启刷选
        // flex:1,
    },
    rowSelection: 'multiple', // 开启多行选择
    // groupSelectsChildren: true,
    suppressRowClickSelection: true,
    suppressAggFuncInHeader: true,
    enableRangeSelection: true,
    enableRangeHandle: true,
    undoRedoCellEditing: true,
    enterMovesDown:true,
    suppressCopyRowsToClipboard: true,
    rowMultiSelectWithClick: true,
    // suppressCellSelection: true,
    groupDisplayType: 'groupRows',
    isGroupOpenByDefault:(params) => {
        return params.field == 'cl1'
    },
    getContextMenuItems:(e) => agGridApi.getContextMenuItems(e,gridOptions),
    // editType: 'fullRow',
    onGridReady: function (params) {
        //表格创建完成后执行的事件
        // console.log(params)
        // gridOptions.api.sizeColumnsToFit();//调整表格大小自适应
    },
    onCellValueChanged: (e) => agGridApi.onCellValueChanged(e,gridOptions),
    // paginationAutoPageSize: true, //根据网页高度自动分页（前端分页）
};

export default gridOptions