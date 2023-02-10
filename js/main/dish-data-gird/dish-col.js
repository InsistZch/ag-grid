/** @odoo-module **/
const col = [
    {
        headerName:'菜品名称',
        field:'dishName',
        // filter: 'agTextColumnFilter',
        filter: 'agSetColumnFilter'
    },
    {
        headerName:'辣度',
        field:'spicy',
        filter: 'agSetColumnFilter'
    },
    {
        headerName:'食材组成',
        field:'foodFrom',
    }
]

export default col