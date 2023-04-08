/** @odoo-module **/
import gridCol from '../ag-grid/ag-grid-col.js'
export default {
    refreshWhole: (materialName = "", agOption) => {

        let cols = agOption.columnApi.getColumnState();
        console.log(cols)

        const col = agOption.columnDefs
        console.log(col)
        for (const col_item of col) {
            if (!isNaN(col_item["field"])) {
                col_item['hide'] = true
            }
            if (col_item['field'] == "whole") {
                col_item['hide'] = false
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


                    if (materialName.trim() == "") {
                        return params.value
                    } else {
                        params.data.dish_key_id.material_item.forEach(item => {
                            if (item.name.split("-")[0] == (materialName)) {
                                params.value = `<div class='params_value'>${params.value.split(materialName)[0] + `<span class='span_value'>${materialName}</span>` + params.value.split(materialName)[1]}<div/>`
                            }
                        })
                        return params.value
                    }

                }
            }

            if (col_item['field'] == "Copies") {
                col_item['hide'] = false
                col_item['pinned'] = null
            }

            if (col_item['field'] == "note") {

                cols.forEach((c) => {
                    if (c.colId == 'note') {
                        col_item['hide'] = c.hide
                    }
                })

            }

            if (col_item['field'] == "save") {
                cols.forEach((c) => {
                    if (c.colId == 'save' && c.hide == false) {
                        col_item['hide'] = c.hide
                    }
                })

            }
        }
        return col
    },
    original: (isShowColumns, agOption) => {
        console.log(isShowColumns)
        const arr = []

        for (const inp in isShowColumns) {
            console.log(isShowColumns[inp])
            arr.push({
                colId: inp,
                hide: !isShowColumns[inp].checked
            })
        }
        
        agOption.columnApi.applyColumnState({
            state: [...arr]
        })

    }
}