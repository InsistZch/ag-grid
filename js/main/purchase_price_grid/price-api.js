const onCellValueChanged = (params, agOption) => {
    if(params.colDef.field == "price"){
        if(isNaN(params.newValue) || Number(params.newValue) <= 0){
            const rowNode = params.api.getRowNode(params.data.id)
            rowNode.setDataValue('price', params.oldValue)
            return
        }
        agOption.api.forEachNode(v => {
            if(v.data == null || v.data.config) return
            for (const item of v.data.dish_key_id.material_item) {
                if(item.id == params.data.materialId){
                    item.main_price = Number(params.newValue)
                    const rowNode = agOption.api.getRowNode(v.data.id)
                    rowNode.setData(v.data)
                }
            }
        })
        // agOption.api.refreshCells({force:true})
    }
}


const getRowId = (params) => params.data.id;

export {
    onCellValueChanged, getRowId
}

export default {
    onCellValueChanged, getRowId
}