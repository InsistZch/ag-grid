/** @odoo-module **/
import index from './../../../data/index.js'

class isShowColumns {
    cost = document.querySelector('#ag-button-cost')
    note = document.querySelector('#ag-button-note')
    save = document.querySelector('#ag-button-save')
    whole = document.querySelector('#ag-button-whole')
    menu = document.querySelector('#ag-button-menu')
    Nomenu = document.querySelector('#ag-button-Nomenu')

    init() {
        this.is_init = !!this.is_init
        if (!this.is_init) {
            this.cost = document.querySelector('#ag-button-cost')
            this.note = document.querySelector('#ag-button-note')
            this.save = document.querySelector('#ag-button-save')
            this.whole = document.querySelector('#ag-button-whole')
            this.menu = document.querySelector('#ag-button-menu')
            this.Nomenu = document.querySelector('#ag-button-Nomenu')


            const user_setting = index.user_settings[0]
            this.cost.checked = user_setting.is_plan_day_show_dish_cost
            this.note.checked = user_setting.is_plan_day_show_note
            this.save.checked = user_setting.is_plan_day_show_save_bom_btn
            this.whole.checked = user_setting.is_plan_day_show_dish_bom_str
            this.menu.checked = user_setting.is_plan_day_show_cus_with_menu
            this.Nomenu.checked = user_setting.is_plan_day_show_cus_no_menu

            this.ismenu = this.menu.checked
            this.isNomenu = this.Nomenu.checked

            this.is_init = true



        }
    }

    nodes = new Map()
    ismenu = this.menu.checked
    isNomenu = this.Nomenu.checked

    init_select(agOption) {

        this.init()

        const cols = agOption.columnApi.getColumnState()
        // console.log(cols)

        for (const col_item of cols) {
            // hide => 显示为false   不显示为true
            if (col_item['colId'] == "costPrice") {
                this.cost.checked = !col_item['hide']
                this.nodes.set('costPrice', {
                    node: this.cost,
                    hide: col_item['hide'],
                })
            } else if (col_item['colId'] == "note") {
                this.note.checked = !col_item['hide']
                this.nodes.set('note', {
                    node: this.note,
                    hide: col_item['hide']
                })
            } else if (col_item['colId'] == "save") {
                this.save.checked = !col_item['hide']
                this.nodes.set('save', {
                    node: this.save,
                    hide: col_item['hide']
                })
            } else if (col_item['colId'] == "whole") {
                this.whole.checked = !col_item['hide']
                this.nodes.set('whole', {
                    node: this.whole,
                    hide: col_item['hide']
                })
            }
        }

        this.ChangeCol(agOption)
    }

    change_select(agOption) {
        this.init()
        // console.log(nodes)
        for (const item of this.nodes) {
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
                let col = agOption.columnDefs.filter((col) => col.hide == false).length;

                let arr = []
                if (item[0] == "whole" && item[1].hide == true) {
                    if (col < 20) {
                        arr = []
                        agOption.columnDefs.forEach(col => {
                            if (col.field == "save" || col.field == "Copies" || col.field == "note") {
                                arr.push({
                                    colId: col.field,
                                    pinned: null
                                })
                            }
                        });
                    }
                } else {
                    arr = []
                    agOption.columnDefs.forEach(col => {
                        if (col.field == "save" || col.field == "Copies" || col.field == "note") {
                            arr.push({
                                colId: col.field,
                                pinned: "right"
                            })
                        }
                    });
                }
                agOption.columnApi.applyColumnState({
                    state: [...arr]
                })
            }
        }
    }

    menu_select(agOption) {
        this.init()
        this.menu.onclick = () => {
            // console.log(menu.checked)
            this.ismenu = this.menu.checked
            this.ChangeCol(agOption)
        }
        this.Nomenu.onclick = () => {
            // console.log(menu.checked)
            this.isNomenu = this.Nomenu.checked
            this.ChangeCol(agOption)
        }

    }
    ChangeCol(agOption) {
        // 两个都选中 默认显示
        // 只选中 menu 只显示有菜单
        // 只选中 isNomenu 只显示无菜单
        // 都不选中 不显示用户
        let col = []
        let arr = []
        for (const item of agOption.columnApi.getColumnState()) {
            if (!isNaN(item.colId)) {
                arr.push({
                    colId: item.colId,
                    hide: false
                })
            }
        }
        agOption.columnApi.applyColumnState({
            state: [...arr]
        })

        if (this.ismenu && !this.isNomenu) {
            const colfilter = index.cus_loc.filter(v => v.org_group_category == "无菜单")
            for (const item of colfilter) {
                col.push(String(item.id))
            }
        } else if (!this.ismenu && this.isNomenu) {
            const colfilter = index.cus_loc.filter(v => v.org_group_category == "有菜单")
            for (const item of colfilter) {
                col.push(String(item.id))
            }
        } else if (!this.ismenu && !this.isNomenu) {
            for (const item of agOption.columnApi.getColumnState()) {
                // console.log(item)
                if (!isNaN(item.colId)) {
                    col.push(String(item.colId))
                }
            }
        }
        // console.log(col)
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

// 优化建议：
// 1.改成class
// 2.节点改成非固定
export default isShowColumns