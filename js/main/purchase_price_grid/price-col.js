/** @odoo-module **/
const col = [
    {
        headerName:'食材名称',
        field:'materialName',
        editable: false
    },
    {
        headerName:'单价',
        field:'price',
        editable: true,
        valueFormatter: params => {
            return Number(params.value).toFixed(2)
        },
        // cellRenderer: params => {
        //     return Number(params.value).toFixed(2)
        // }
    },
    {
        headerName:'单位',
        field:'unit',
        editable: false
    }
]

export default col