/** @odoo-module **/
import agGridApi from './ag-grid-api.js'
import col,{Restrictions} from './ag-grid-col.js'
import {data} from './ag-grid-row.js'
import GroupRowInnerRenderer from './GroupRowInnerRenderer.js'


const init_grid_options = () => {

    const gridOptions = {
        columnDefs: col(),
        rowData: data(),
        defaultColDef: {
            editable: params => {
                // console.log(params)
                    if(Restrictions(params)){
                        return false
                    }
                // console.log(params)
                return true
            },//单元表格是否可编辑
            // enableRowGroup: true,
            // sortable: true, //开启排序
            resizable: true,//是否可以调整列大小，就是拖动改变列大小
            // filter: true,  //开启刷选
            // flex:1,
        },
        // rowSelection: 'multiple', // 开启多行选择
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
        // autoGroupColumnDef:{
        //     headerName:'分组别名',
        //     minWdith: 60,
        //     pinned: 'left',
        //     field: 'cl1',
        //     cellRendererParams: {
        //         suppressCount: true,
        //     }
        // },
        groupRowRendererParams: {
            suppressCount: true,
            innerRenderer: GroupRowInnerRenderer,
            editable:false
        },
        groupDefaultExpanded: -1,
        getContextMenuItems:(e) => agGridApi.getContextMenuItems(e,gridOptions),
        // editType: 'fullRow',
        onGridReady: function (params) {
            //表格创建完成后执行的事件
            // console.log(params)
            // gridOptions.api.sizeColumnsToFit();//调整表格大小自适应
        },
        onCellValueChanged: (e) => agGridApi.onCellValueChanged(e,gridOptions),
        getRowStyle: params => agGridApi.getRowStyle(params),
        onCellClicked: params => agGridApi.onCellClicked(params),
        // onPasteStart: params => agGridApi.onPasteStart(params),
        // paginationAutoPageSize: true, //根据网页高度自动分页（前端分页）
    };

    return gridOptions;


}


export default init_grid_options