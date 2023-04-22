/** @odoo-module **/
import customCells from "./purchase_customCells.js"
import index from '../../../data/index.js'
const date = new Date()
const nowDate = moment().format("YYYY-MM-DD")
const tomorrowDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)).format("YYYY-MM-DD")
const thirdDayDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)).format("YYYY-MM-DD")
// console.log(index.user_settings[0][0])
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
            if (params.data.orderDate != nowDate && params.data.purchase_freq != 'day') {
                return `<div style='color:#8d8c8c;'><i>${params.value}</i></div>`
            }else if (params.data.purchase_freq != 'day') {
                return `<div style='color:#8d8c8c;'>${params.value}</div>`
            } else if (params.data.orderDate != nowDate) {
                return `<i>${params.value}</i>`
            } else {
                return params.value
            }
        }
    },
    {
        headerName: "生成日期",
        field: "creationDate",
        hide: true,
        cellRenderer: (params) => {
            return moment(new Date(params.value)).format('MM-DD')
        }
    },
    {
        headerName: "下单日期",
        field: "orderDate",
        editable: true,
        hide: !index.user_settings[0].is_default_show_place_date,
        cellEditor: customCells,
        cellRenderer: (params) => {
            return moment(new Date(params.value)).format('MM-DD')
        }
    },
    {
        headerName: "需求日期",
        field: "demandDate",
        hide: !index.user_settings[0].is_default_show_need_date,
        cellRenderer: (params) => {
            return moment(new Date(params.value)).format('MM-DD')
        }
    },
    {
        headerName: "需量",
        field: "quantity",
        // editable: true,
        hide: !index.user_settings[0].is_plan_day_purchase_show_cal_qty,
    },
    {
        headerName: "库存",
        field: "stock",
        hide: !index.user_settings[0].is_plan_day_purchase_show_stock,

    },
    {
        headerName: "单价",
        field: "standardPrice",
        hide: true
    },
    {
        headerName: "市场价",
        field: "marketPrice",
        hide: true
    },
    // {
    //     headerName: "应下单",
    //     field: "shouldOrder",
    //     hide: true
    // },
    {
        headerName: "下单",
        field: "Order",
        editable: (e) => {
            if (e.data.orderDate == nowDate) {
                return true
            }
        },
        // cellRenderer:
    },
    {
        headerName: "送货日期",
        field: "deliveryDate",
        hide: true,
        cellRenderer: (params) => {
            return moment(new Date(params.value)).format('MM-DD')
        }
    }, {
        headerName: "明天",
        field: "tomorrow",
        hide: !index.user_settings[0].is_default_show_day_1_place_qty,
        editable: (e) => {
            if (e.data.orderDate == tomorrowDate) {
                return true
            }
        },
    },
    {
        headerName: "后天",
        field: "thirdDay",
        hide: !index.user_settings[0].is_default_show_day_2_place_qty,
        editable: (e) => {
            if (e.data.orderDate == thirdDayDate) {
                return true
            }
        },
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
        hide: true,
        editable: true,
    }
]