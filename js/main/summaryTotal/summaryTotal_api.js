/** @odoo-module **/
import index from '../../../data/index.js'

/** @odoo-module **/
const getRowId = (params) => params.data.id;

// 获取食材转化比信息
const getUnitObj = (material) => {
    const ids = [...material.bom_unit_ratio_ids]
    let idsIndex = ids.length - 1
    if (idsIndex < 0) return []
    const arr = index.material_item_bom_unit_ratio.filter(v => {
        if (idsIndex < 0) return false
        if (v.id == ids[idsIndex]) {
            idsIndex--
            return true
        }
    })
    // console.log(arr)
    return arr
}

export {
    getRowId
}

export default {
    getRowId
}
