/** @odoo-module **/
let cost = document.querySelector('#ag-button-cost')
let remarks = document.querySelector('#ag-button-remarks')
let save = document.querySelector('#ag-button-save')
let whole = document.querySelector('#ag-button-whole')

const nodes = new Map()

let init_query_element = () => {

    cost = document.querySelector('#ag-button-cost')
    remarks = document.querySelector('#ag-button-remarks')
    save = document.querySelector('#ag-button-save')
    whole = document.querySelector('#ag-button-whole')

}


// 优化建议：
// 1.改成class
// 2.节点改成非固定
export default {
    // 传入列colId 
    init_select(agOption) {
        const cols = agOption.columnApi.getColumnState()
        // console.log(cols)

        for (const col_item of cols) {
            // hide => 显示为false   不显示为true
            if(col_item['colId'] == "costPrice"){
                cost.checked = !col_item['hide']
                nodes.set('costPrice', {
                    node: cost,
                    hide: col_item['hide'],
                })
            }else if(col_item['colId'] == "remarks"){
                remarks.checked = !col_item['hide']
                nodes.set('remarks', {
                    node: remarks,
                    hide: col_item['hide']
                })
            }else if(col_item['colId'] == "save"){
                save.checked = !col_item['hide']
                nodes.set('save', {
                    node: save,
                    hide: col_item['hide']
                })
            }else if(col_item['colId'] == "whole"){
                whole.checked = !col_item['hide']
                nodes.set('whole', {
                    node: whole,
                    hide: col_item['hide']
                })
            }
        }
    },
    change_select(agOption){
        // console.log(nodes)
        for (const item of nodes) {
            item[1].node.onclick = () => {
                // console.log( item)
                agOption.columnApi.applyColumnState({
                    state: [
                        {
                            colId: item[0],
                            hide: !item[1].hide,
                        }
                    ]
                });
                agOption.api.sizeColumnsToFit();
                item[1].hide = !item[1].hide
            }
        }
    },
    init_query_element,
}