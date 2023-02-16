/** @odoo-module **/
import col from "./dish-col.js";
import data from './dish-row.js';
import api from './dish-api.js';
import locale from '../locale/index.js'

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
            menuTabs: ["generalMenuTab"]
        },
        getMainMenuItems: params => {
            console.log(params)
            const arr = ['autoSizeThis', 'autoSizeAll', 'separator', "pinSubMenu"]
            let arr2 = params.defaultItems.reduce((pre, v) => {
                const judeg = arr.every(v1 => v1 != v)
                if(judeg){
                    pre.push(v)
                }
                return pre
            }, [])
            return arr2
        },
        postProcessPopup: params => api.postProcessPopup(params),
        suppressColumnMoveAnimation:false,
        onCellDoubleClicked,
        onCellClicked,
        pagination: true,
        rowSelection: 'single',
        // menuTabs: params => api.menuTabs(params),
        paginationAutoPageSize: true, //根据网页高度自动分页（前端分页）
        localeText:locale
    }
};
export default gridOptions