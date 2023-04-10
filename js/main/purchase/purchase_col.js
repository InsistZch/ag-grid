/** @odoo-module **/
import customCells from "./purchase_customCells.js"

export default [
    {
        headerName: "",
        field: "category_name",
        hide: true,
        rowGroup: true
    },
    {
        headerName: "食材",
        field: "material",
        cellRenderer: (params) => {
            if (params.data.purchase_freq_id != 1) {
                return `<div style='color:#5f5f5f;'>${params.value}</div>`
            } else {
                return params.value
            }
        }
    },
    {
        headerName: "生成日期",
        field: "creationDate",
        hide: true
    },
    {
        headerName: "下单日期",
        field: "orderDate",
        editable: true,
        hide: true,
        cellEditor:customCells
    },
    {
        headerName: "需求日期",
        field: "demandDate",
        hide: true
    },
    {
        headerName: "需量",
        field: "quantity",
        // editable: true,
        hide: true
    },
    {
        headerName: "库存",
        field: "stock",
        hide: true,
    },
    {
        headerName: "标准单价",
        field: "standardPrice",
        hide: true
    },
    {
        headerName: "市场价",
        field: "marketPrice",
        hide: true
    },
    {
        headerName: "应下单",
        field: "shouldOrder",
        hide: true
    },
    {
        headerName: "明天",
        field: "tomorrow",
        hide: true
    },
    {
        headerName: "下单",
        field: "Order",
        editable: true,
        // cellRenderer:
    },
    {
        headerName: "送货日期",
        field: "deliveryDate",
        hide: true
    },
    {
        headerName: "后天",
        field: "thirdDay",
        hide: true
    },
    {
        headerName: "单位",
        field: "unit",
        hide: false
    },
    {
        headerName: "供应商",
        field: "supplier"
    },
    {
        headerName: "备注",
        field: "remarks",
        minWidth: 300,
        hide: true
    }
]