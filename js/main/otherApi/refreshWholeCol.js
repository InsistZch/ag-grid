/** @odoo-module **/
import gridCol from '../ag-grid/ag-grid-col.js'
export default {
    refreshWhole: () => {
        const col = gridCol()

        for (const col_item of col) {
            if (col_item['field'] == "whole") {
                col_item['cellRenderer'] = (params) => {
                    if (params.data.configure || !params.data.fixed) return params.value
                    if (params.value == undefined || params.data.whole.trim() == "" || params.data.dish_key_id.material_item == []) {
                        params.data['whole'] = ""
                        return params.value
                    }
                    //  主要功能为
                    // 第一、找到所有表内有的配料信息
                    // 第二、找到所有相同的配料信息，并返回标红
                    // console.log(1)
                    let { value, data: { dish_key_id: { material_item } } } = params
                    const arr = material_item.reduce((pre, v) => {
                        let current = value.split(" ")

                        for (const cv of current) {
                            let c = cv.match(/([\u4e00-\u9fa5a-zA-Z]+)/)
                            if (c == null) break
                            let d = v.name.split('-')[0]
                            if (c[0] == d || c[0] == d + v.dish_process_category_name) {
                                pre.push(v)
                                break
                            }
                        }
                        return pre
                    }, [])
                    params.data.dish_key_id.material_item = arr
                    return params.value
                }
            }
        }
        return col
    },
    original: () => gridCol()
}