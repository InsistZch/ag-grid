/** @odoo-module **/
import col from "./dish-col.js";
import data from './dish-row.js';

const gridOptions = (dish_top_category_id,onCellDoubleClicked,onCellClicked) => {
    return {
        columnDefs: col,
        rowData: data(dish_top_category_id),
        defaultColDef: {
            editable: false,//单元表格是否可编辑
            enableRowGroup: true,
            // sortable: true, //开启排序
            resizable: true,//是否可以调整列大小，就是拖动改变列大小
            // filter: true,  //开启刷选
            minWidth: 200,
            floatingFilter: true,
        },
        suppressColumnMoveAnimation:false,
        
        onCellDoubleClicked,
        onCellClicked,
        pagination: true,
        rowSelection: 'single',
        paginationAutoPageSize: true, //根据网页高度自动分页（前端分页）
    }
};
export default gridOptions