/** @odoo-module **/
import col from '../ag-grid/ag-grid-col.js'
export default {
    refreshWhole: (materialName = "", agOption) => {

        let cols = agOption.columnApi.getColumnState();
        const col = agOption.columnDefs

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

                    const date = new Date()
                    const nowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`

                    const dateSpan = document.querySelector('.date') // 日计划
                    const planDateHtml = dateSpan.innerHTML.split(" ")[0].split('-')
                    const planDate = new Date(planDateHtml)

                    // 
                    const DisplayProcessing = () => {
                        let current = value.split(" ")
                        current = current.filter((c) => {
                            return c != ''
                        })
                        console.log(current)
                        let name = ''
                        let num = ''
                        let unit = ''
                        let all = ''
                        for (const cv of current) {
                            name = cv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g) != null ? cv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0] : ''
                            num = cv.match(/(\d*\.?\d+?)/) != null ? cv.match(/(\d*\.?\d+?)/)[0] : ''
                            unit = cv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g) != null ? cv.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[1] : ''

                            if (unit == undefined) {
                                unit = ''
                            }

                            console.log(params.data.dish_key_id.material_item)
                            params.data.dish_key_id.material_item.forEach((v) => {
                                console.log('1')
                                const orderDate = new Date(planDate.getFullYear(), planDate.getMonth() + 1, planDate.getDate() + Number(v.plan_day_purchase_ahead_days))
                                const theOrderDate = `${orderDate.getMonth() < 10 ? `0${orderDate.getMonth()}` : orderDate.getMonth()}-${orderDate.getDate() < 10 ? `0${orderDate.getDate()}` : orderDate.getDate()}`

                                if (name == `${v.name.split('-')[0]}${v.dish_process_category_name}` && v.purchase_freq != 'day') {
                                    name = `<span class='span_name'>${name}</span>`
                                }
                                if ((name.match(/([\u4e00-\u9fa5a-zA-Z]+)/g)[0] || name) == `${v.name.split('-')[0]}${v.dish_process_category_name}` && theOrderDate != nowDate) {
                                    name = `<i>${name}</i>`
                                }
                            })
                            all += name + num + unit + ' '

                        }
                        return all
                    }

                    if (materialName.trim() == "") {
                        // console.log(DisplayProcessing())
                        value = DisplayProcessing()
                        // console.log(value)
                        // return all
                    } else {
                        value = DisplayProcessing()
                        params.data.dish_key_id.material_item.forEach(item => {
                            if (item.name.split("-")[0] == (materialName)) {
                                console.log(materialName)
                                value = `
                                <div class='params_value'>
                                ${value.split(materialName)[0]}
                                <span class='span_value'>${materialName}</span>
                                ${value.split(materialName)[1]}
                                </div>`
                                // value = "<div class='params_value'>" + value.split(materialName)[0] + "<span class='span_value'>" + materialName + "</span>" + value.split(materialName)[1] + "</div>"
                            }
                        })

                    }
                    console.log(value)
                    return value
                }
            }

            if (col_item['field'] == "Copies") {
                col_item['hide'] = false
            }

            if (col_item['field'] == "note") {
                cols.forEach((c) => {
                    if (c.colId == 'note' && c.hide == false) {
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

        agOption.api.setColumnDefs(col())
        agOption.api.refreshCells({ force: true })

        const arr = []

        for (const inp in isShowColumns) {
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