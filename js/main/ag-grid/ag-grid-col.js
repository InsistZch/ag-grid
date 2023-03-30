/** @odoo-module **/
import index from '../../../data/index.js'
import saveData from '../saveData/index.js';
import customCells from './ag-grid-customCells.js';
import { duibi } from './ag-grid-row.js';
import preserved_dishes from './preserved_dishes.js';
import init_mc from './special_fast_data.js';
import dish_tooltipField from './dish_tooltipField.js'
import ShowCellRenderer from './ShowCellRenderer.js'
// 定义列
const col = () => {

    const col = [
        // {
        //     headerName: '',//选择列头部显示的文字，可以为空
        //     checkboxSelection: true,//设置为ture显示为复选框
        //     headerCheckboxSelection: true, //表头是否也显示复选框，全选反选用
        //     'pinned': 'left', //固定再左边
        //     width: 30, //列的宽度
        //     showDisabledCheckboxes: true,
        //     editable:false,
        //     menuTabs:[]
        // },

        {
            headerName: "",
            field: 'cl1',
            hide: true,
            rowGroup: true,
            cellRenderer: 'agGroupCellRenderer',
            showRowGroup: true,
        },
        {
            headerName: '类别',
            field: 'type',
            minWidth: 55,
            editable: false,
            pinned: 'left',
            filter: true,
            // checkboxSelection: true, //设置为true显示为复选框
            // headerCheckboxSelection: true, //表头是否也显示复选框，全选反选用
            valueGetter: params => {
                // console.log(params)
                let specialMealID = params.data.specialMealID != undefined ? params.data.specialMealID : ""
                return params.data.type + specialMealID
            },
            cellClassRules: {
                'show-cell': 'value !== undefined',
            },
            rowSpan: params => {
                // configure 
                // cl1
                // console.log(params)
                if(params.data.configure) return 1
                let count = 0

                // 
                let fristTypeID = 0, isfrist = true
                params.api.forEachNode(v => {
                    if(v.data == undefined || v.data.configure) return
                    if(v.data.cl1 == params.data.cl1 && v.data.type == params.data.type){
                        count++
                        if(isfrist){
                            isfrist = !isfrist
                            fristTypeID = v.data.id
                            return
                        }
                    }
                })
                // console.log(fristTypeID, params.data.id, count)
                return fristTypeID === params.data.id ? count : 0
            },
            cellRenderer: ShowCellRenderer
        },
        {
            headerName: '菜品',
            field: 'dish',
            minWidth: 82,
            // cellEditor: "agSelectCellEditor",
            // cellEditorParams:{values:dish_dropdown()},
            cellEditor: customCells,
            pinned: 'left',
            filter: true,
            tooltipField: 'dish',
            tooltipComponent: dish_tooltipField,
            cellRenderer: params => {
                if (params.value == "" || params.value == undefined) return ""
                if (params.data.configure) {

                    return `<span title="业内平均成本比例">${params.value}</span>`
                }

                // 其他 冻品 鲜肉 半成品
                let color = "", title = ""
                for (const dish_key of index.dish_key) {
                    if (params.data.dish_key_id.id == dish_key.id) {
                        switch (dish_key.material_tag) {
                            case '其他':
                                color = "black"
                                title = ""
                                break;
                            case '冻品':
                                color = "#9a870a"
                                title = "冻品"
                                break;
                            case '鲜肉':
                                color = "green"
                                title = "鲜肉"
                                break;
                            case '半成品':
                                color = "orange"
                                title = "半成品"
                                break;
                            default:
                                color = "red"
                                title = "该餐品无分类"
                                break;
                        }
                        break
                    }
                }
                return `<span style="color:${color}" title="${title}">${params.value}</span>`
            }
        },
        {
            headerName: '成本',
            field: 'costPrice',
            minWidth: 50,
            pinned: 'left',
            editable: false,
            cellRenderer: params => {
                if (params.data.type == "%") {
                    let style = ""
                    const high = index.org_config.material_cost_ratio_high_lmt, low = index.org_config.material_cost_ratio_low_lmt
                    let value = Number(params.data.costPrice.substr(0, params.data.costPrice.length - 1)) / 100
                    if (value >= high) {
                        style = "red"
                    } else if (value >= low) {
                        style = "green"
                    } else {
                        style = "black"
                    }

                    return `<span style="font-weight: 600;color: ${style};">${params.value}</span>`
                }
                return params.value
            }
        },
    ]
    // 确定列数
    const newCus_loc = index.cus_loc.sort((a, b) => a.no - b.no)
    for (const item of newCus_loc) {
        const obj = {}
        obj['headerName'] = item['name']
        obj['field'] = `${item['id']}`
        obj['minWidth'] = 42
        // obj['pinned'] = 'left'
        obj['valueParser'] = params => Number(params.newValue)
        obj['cellRenderer'] = (params) => {
            // console.log(Restrictions(params))
            
            if (params.data.configure) {
                if (params.data.type == "%") {
                    // console.log(params.value)
                    if(params.value == undefined) return "0%"
                    const v = Number(params.value.split('%')[0]) / 100
                    const high = index.org_config.cus_los_ratio_high_lmt;
                    let style = ""
                    if (v >= high) {
                        style = "red"
                    } else {
                        style = "black"
                    }
                    return `<span style="font-weight: 600;color: ${style};">${params.value}</span>`
                }
                return params.value
            }
            if (isNaN(params.value) || params.value == null) {
                return 0
            }
            params.value = Math.ceil(params.value)
            // console.log(1)
            // console.log(params)
            // userId dinner_type
            // let hook = headHookLimit(params.colDef.field, params.data.dinner_type, params.data.type)
            let hook = init_mc().filter(v => {
                return v.cl1 == params.data.cl1
            })
            if (params.data.type.includes("特色") || params.data.specialMealColor != undefined) {
                hook = hook.find(v => v.type == "特色")
            } else {
                hook = hook.find(v => v.type == "快餐")
            }

            hook = hook[`${params.colDef.field}`]
            // console.log(params.data.dish, params.colDef.field, hook)
            // console.log(hook)                 
            // user_id,dish_id

            let value = ""

            if (params.value > hook) {
                value = `<span style="color:red;" title="超出厨师长限制 限制为：${hook}">${params.value}</span>`
            } else {
                value = params.value
            }
            if (!params.data.configure) {
                let d = duibi(params.colDef.field, params.data.dish_key_id.id, params.data.dinner_type, params.data.dish_key_id.material_item)
                if (!d[1]) {
                    value = `<span style="color:red;" title="客户禁忌,客户不吃${d[0]}">${params.value}</span>`
                }
            }
            if (params.data.type == "汤粥") {
                let count = 0
                for (const item of init_mc()) {
                    if (item.cl1 == params.data.cl1) {
                        count += item[params.colDef.field]
                    }
                }
                if (count < params.value) {
                    value = `<span style="color:red;" title="超出厨师长限制 限制为：${count}">${params.value}</span>`
                } else {
                    value = params.value
                }
            }
            return value
        }
        col.push(obj)
    }
    col.push({
        headerName: '份数',
        field: 'Copies',
        // minWidth:10,
        minWidth: 48,
        editable: false,
        pinned: 'right',
    })
    col.push({
        headerName: '配量汇总',
        field: "whole",
        minWidth: 250,
        pinned: 'right',
        // autoHeight: true,
        // wrapText: true,
        cellRenderer: (params) => {
            if (params.data.configure && !params.data.edit) {
                if (params.data.type == "%") {
                    if (params.data.cl1 != null) return ""
                    const d = params.data.whole.match(/(\d*\.?\d+)/g)
                    // console.log(d)
                    if (d == null) return params.value
                    let v = params.value
                    for (const d_item of d) {
                        if (Number(d_item) / 100 > index.org_config.material_cost_ratio_high_lmt) {
                            v = v.replace(d_item + '%', `<span style="color:red;">${d_item}%</span>`)
                        } else if (Number(d_item) / 100 > index.org_config.material_cost_ratio_low_lmt) {
                            v = v.replace(d_item + '%', `<span style="color:green;">${d_item}%</span>`)
                        }
                    }
                    return v
                }
                return params.value
            }
            if (params.data.whole.trim() == "" || params.data.dish_key_id.material_item == []) {
                return params.value
            }
            // if(params.data.dish == "") return params.value
            if (Restrictions(params) || !params.data.fixed) return params.value
            //  主要功能为
            // 第一、找到所有表内有的配料信息
            // 第二、找到所有相同的配料信息，并返回标红
            // console.log(1)
            let data = [];

            // console.log(params)
            let { value, data: { dish_key_id: { material_item } } } = params
            // console.log(105, params)
            if (value == '' || value == null) return value
            // console.log(typeof value, value)

            if (value[value.length - 1] != " ") value += ' '
            // console.log(108, material_item)


            // 找到目前所有材料的数据
            const arr = material_item.reduce((pre, v) => {
                let current = value.split(" ")

                for (const cv of current) {
                    let c = cv.match(/([\u4e00-\u9fa5a-zA-Z]+)/)
                    if (c == null) break
                    let d = v.name.split('-')[0]
                    // console.log(c[0], d + v.dish_process_category_name)

                    if (c[0] == d || c[0] == d + v.dish_process_category_name) {

                        // console.log(127, v)
                        pre.push(v)
                        break
                    }
                }
                return pre
            }, [])
            params.data.dish_key_id.material_item = arr
            // console.log(params.data.dish_key_id.material_item)

            // 找到当前菜品列的全部数据
            params.api.forEachNode((e) => {
                if (e.data == null) return
                // 问题所在 params.rowIndex != e.rowIndex
                // console.log(params, e)
                if (e.data.dinner_type == params.data.dinner_type && params.node.id != e.id) {
                    // data.push(e.data['dish_key_id']['material_item'])
                    // console.log(e.data)
                    if (e.data.dish == "" || Restrictions(e) || !e.data.fixed) return
                    data.push(...e.data['dish_key_id']['material_item'])
                }
            })
            material: for (const item of material_item) {
                let str = item.name.split('-')[0]
                // 前一天使用的食材
                for (const forbidden_material_id of index.forbidden_material_ids) {
                    if (item.id == forbidden_material_id) {
                        let str = item.name.split('-')[0]
                        value = value.replace(`${str}`, `<span style="color: red;" title="前一天使用食材">${str}</span>`)
                        continue material
                    }
                }
                // 找到相同则标红
                for (const d1 of data) {
                    if (item.id == d1.id) {
                        // let str = ""
                        for (const material_item of index.material_item) {
                            if (material_item.id == d1.id) {
                                // console.log(material_item, d1)
                                str = material_item.name.split('-')[0]
                                break
                            }
                        }
                        // console.log(str, params.data)    
                        // console.log(item, d1)
                        value = value.replace(`${str}`, `<span style="color:red;" title="出现相同菜品">${str}</span>`)
                        continue material
                    }
                }

                // 特殊菜品展示
                // let str = item.name.split('-')[0]
                const { name } = index.material_purchase_unit_category.find(v => v.id == item.main_unit_id)
                let w = ""
                if (item.main_unit_id == item.unit_id) {
                    w = `${str} ${item.form} ${Number(item.main_price / item.main_unit_bom_unit_ratio).toFixed(2)}元/${item.unit_name}，标准价${Number(item.material_price_alert / item.main_unit_bom_unit_ratio).toFixed(2)}元/${name}`
                } else {
                    w = `${str} ${item.form} ${Number(item.main_price / item.main_unit_bom_unit_ratio).toFixed(2)}元/${item.unit_name}，标准价${Number(item.material_price_alert).toFixed(2)}元/${name}`
                }
                let sty = ""
                if (item.main_price > item.material_price_alert) {
                    sty = "border-bottom: solid 1px red;"
                }
                if (item.top_category_id == 1 || item.top_category_id == 2) {
                    if (item.form == "鲜品") {
                        value = value.replace(`${str}`, `<span style="color: green;${sty}"  title="${w}">${str}</span>`)
                    } else if (item.form == "冻品") {
                        // console.log("冻品")
                        value = value.replace(`${str}`, `<span style="color: #af7700;${sty}" title="${w}">${str}</span>`)
                    } else if (item.form == "半成品") {
                        value = value.replace(`${str}`, `<span style="color: #7a3e09;${sty}" title="${w}">${str}</span>`)
                    }
                } else {
                    value = value.replace(str, `<span style="${sty}" title="${w}">${str}</span>`)
                }
            }

            return value
        },
    })

    col.push({
        headerName: '备注',
        field: 'remarks',
        pinned: 'right',
        minWidth:100,
        hide: true
    })
    col.push({
        headerName: '',
        field: 'save',
        pinned: 'right',
        hide: true,
        editable: false,
        minWidth: 25,
        width: 10,
        maxWidth: 30,
        cellRenderer: params => {
            if (Restrictions(params) || !params.data.fixed) return params.value
            const createspan = document.createElement('span')
            createspan.title = '保存本列餐品'
            createspan.innerText = "存"
            createspan.classList.add('el_save')
            createspan.onclick = () => {
                if (!params.data.dish_key_id.id) {
                    alert('菜品不存在!!!')
                    return;
                }
                const { dish_key_id: { material_item } } = params.data

                const mt = material_item.reduce((pre, v) => {
                    const judeg = pre.every(v2 => v2.id != v.id)
                    if (params.data.whole.includes(v.name.split('-')[0]) && judeg) {
                        pre.push(v)
                    }
                    return pre
                }, [])
                params.data.dish_key_id.material_item = mt
                // 保存数据
                preserved_dishes.set(params.data.dish_key_id.id, {
                    dish_key_id: params.data.dish_key_id.id,
                    dish_key_name: params.data.dish,
                    dinner_type: params.data.dinner_type,
                    whole: params.data.whole,
                    material_item: [...params.data.dish_key_id.material_item]
                })

                console.log(params.data)
                if (params.data.isNewAdd) {
                    const { data } = params
                    console.log(data)
                    saveData.add_dish_key_list.push({
                        cl1: data.cl1,
                        dinner_type: data.dinner_type,
                        dish: data.dish,
                        dish_key_id: { ...data.dish_key_id },
                        sales_type: data.sales_type,
                        type: data.type
                    })
                }
                if (params.context && params.context.owl_widget) {
                    params.context.owl_widget.Save_Row_Data(params.data)
                }
            }
            return createspan
        }
    })
    return col
}
// 如果不可输入，则不计算菜品和配量汇总
// 如果为配置信息，则不计算菜品和配量汇总
// return false 表示该框可输入
const Restrictions = params => {
    // console.log(params.data)
    if (!params.data.edit) return true
    if (params.data.configure && params.data.fixed) return true
    return false
}

export {
    Restrictions
}
export default col