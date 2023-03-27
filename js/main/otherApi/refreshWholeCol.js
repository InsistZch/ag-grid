import gridCol  from '../ag-grid/ag-grid-col.js'
export default {
    refreshWhole: () => {
        const col = gridCol()
        
        for (const col_item of col) {
            if(col_item['field'] == "whole"){
                col_item['cellRenderer'] = (params) => {
                    return params.value
                }
            }
        }
        return col
    },
    original: () => gridCol()
}