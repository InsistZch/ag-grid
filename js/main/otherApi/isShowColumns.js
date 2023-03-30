/** @odoo-module **/
const cost = document.querySelector('#ag-button-cost')
const remarks = document.querySelector('#ag-button-remarks')
const save = document.querySelector('#ag-button-save')
const whole = document.querySelector('#ag-button-whole')
const menu = document.querySelector('#ag-button-menu')
const Nomenu = document.querySelector('#ag-button-Nomenu')

const nodes = new Map()


let ismenu = menu.checked
let isNomenu = Nomenu.checked

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
    menu_select(agOption){
        menu.onclick = () => {
            // console.log(menu.checked)
            ismenu = menu.checked
            ChangeCol()
        }
        Nomenu.onclick = () => {
            // console.log(menu.checked)
            isNomenu = Nomenu.checked
            ChangeCol()
        }
        const ChangeCol = () => {
            // 两个都选中 默认显示
            // 只选中 menu 只显示有菜单
            // 只选中 isNomenu 只显示无菜单
            // 都不选中 不显示用户
            let col = []
            let arr = []
            for (const item of agOption.columnApi.getColumnState()) {
                if(!isNaN(item.colId)){
                    arr.push({
                        colId: item.colId,
                        hide: false
                    })
                }
            }
            agOption.columnApi.applyColumnState({
                state: [...arr]
            })

            if(ismenu && !isNomenu){
                const colfilter = index.cus_loc.filter(v => v.org_group_category == "无菜单")
                for (const item of colfilter) {
                    col.push(String(item.id))
                }
            }else if(!ismenu && isNomenu){
                const colfilter = index.cus_loc.filter(v => v.org_group_category == "有菜单")
                for (const item of colfilter) {
                    col.push(String(item.id))
                }
            }else if(!ismenu && !isNomenu){
                for (const item of agOption.columnApi.getColumnState()) {
                    if(!isNaN(item)){
                        col.push(String(item.colId))
                    }
                }
            }

            arr = []
            for (const item of col) {
                arr.push({
                    colId: item,
                    hide: true,
                })
            }
            // console.log(arr)
            agOption.columnApi.applyColumnState({
                state: [...arr]
            })

            agOption.api.sizeColumnsToFit();
        }
    }

    },
    init_query_element,
}