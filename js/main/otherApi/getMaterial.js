/** @odoo-module **/
export default (agOption) => {
    const material = new Map()
    agOption.api.forEachNode(v => {
        if(v.data == null || v.data.config) return
        for (const item of v.data.dish_key_id.material_item) {
            material.set(item.id, item)
        }
    })
    // console.log(material)
    return [material, agOption]
}