/** @odoo-module **/
import index from '../../../data/index.js'
import {dish_detailed} from './ag-grid-row.js'
import dishTable from '../dish-data-gird/dish-table.js'
import {add_dish_key_id,} from "./../tool.js";
import saveData from '../saveData/index.js';
import preserved_dishes from './preserved_dishes.js';

// let create_dish_key = 5000000


class customCells {
    // 创建编辑器后调用一次
    init(params) {
        // console.log(params)
        // 将一些必要数据存入 this
        this.params = params
        this.dish_data = []

        // 创建元素
        const dn = document.createElement('div')

        dn.classList.add('el_dish')

        const input = document.createElement('input')


        input.type = 'text'
        input.classList.add('el_dish_search')
        // input.setAttribute('list', 'lesson')


        const datalist = document.createElement('div')
        datalist.classList.add('el_dish_food')
        // datalist.id = 'lesson'

        const createDish = document.createElement('div')

        createDish.classList.add('el_dish_create')
        createDish.style.display = 'none'
        createDish.setAttribute('data-bs-toggle', 'modal')
        // 
        createDish.setAttribute('data-bs-target', '#staticBackdrop')


        createDish.onclick = () => {
            // 获取菜品名称
            let dishInput = document.querySelector('#dishInput')
            dishInput.value = input.value
            // 获取类别
            let dishCategory = document.querySelector('#dishCategory')
            dishCategory.value = params.data.dish_key_id.dish_top_category_id
            // 获取辣度
            // let dishSpicy = document.querySelector("#dishSpicy")
            let successCreateDish = document.querySelector('#successCreateDish')

            let dishSubCategory = document.querySelector('#dishSubCategory')
            let dishColors = document.querySelector('#dishColors')
            // 插入数据
            index.dish_sub_category.forEach(v => {
                if (v.dish_top_category_id == params.data.dish_key_id.dish_top_category_id) {
                    dishSubCategory.innerHTML += `<option value="${v.id}">${v.name_cn}</option>`
                }
            })

            successCreateDish.onclick = () => {
                let obj = {
                    "id": add_dish_key_id(),
                    "name": dishInput.value,
                    "dish_top_category_id": dishCategory.value,
                    "spicy": "spicy1",
                    "is_fish": false,
                    "is_organ": false,
                    "is_semi_finished": false,
                    "is_fried": false,
                    "odor": "odor_0",
                    "is_shrimp": false,
                    "is_color_additive": false,
                    dish_sub_category_id: dishSubCategory.value,
                    material_tag: dishColors.value
                }
                saveData.new_dish_key_list.push(obj)
                index.dish_key.push(obj)
                this.dish_data.push(obj)
                input.focus();
                successCreateDish.onclick = null
            }

        }

        // 循环查找数据 并将数据存入dish_data
        let count = 0
        let str = ""

        // if (params.context.owl_widget) {
        //     let obj = {} // 菜品信息
        //     // let data_list = await params.context.owl_wideget.get_dish_key_detail(obj, -1)
        //     let data_list = await params.context.owl_wideget.get_dish_key_detail(obj, 7)
        // }

        for (const dish_key of index.dish_key) {
            if (dish_key.dish_top_category_id == params.data.dish_key_id.dish_top_category_id) {
                if (count++ >= 7) break;
                str += `<div class="food_item">${dish_key.name}</div>`
                this.dish_data.push(dish_key)
            }
        }
        
        datalist.innerHTML = str
        item_click(datalist, (v) => {
            input.value = v
            input.focus()
        })
        let get_plan_day_data_list = () => {

            // let dish_top_category_id = parseInt(params.data.dish_key_id.dish_top_category_id)
            // let ds = index.plan_day_record_show.map(e => e.dish_key_id)
            // let dish_names = index.dish_key.filter(e => ds.includes(parseInt(e.id))).map(e => e.name).filter(e => e !== params.data.dish)
            let rs = []
            params.api.forEachLeafNode(node => {
                if (node.rowIndex !== params.rowIndex) {
                    rs.push({
                        dish_top_category_id: parseInt(node.data.dish_key_id.dish_top_category_id),
                        dish: node.data.dish,
                        dinner_type: node.data.dinner_type,
                        Copies: node.data.Copies,
                        costPrice: node.data.costPrice,
                        material_item_bom_list: node.data.dish_key_id.material_item.map(e => {
                            return {
                                name: e.name,
                                form: e.form,
                                phase: e.phase,
                                process_name: e.dish_process_category_name,
                                dish_qty: e.dish_qty,
                                unit_name: e.unit_name,

                            }
                        })
                    })
                }
            })


            return rs

        }

        let is_use_owl = false

        input.onkeyup = async () => {
            let str = ''
            // input.value
            let arr = []
            let dish_key_list = []
            if (is_use_owl && params.context.owl_widget) {

                let dish_top_category_id = parseInt(params.data.dish_key_id.dish_top_category_id)


                let obj = {
                    dish_name: input.value.trim(),
                    dish_top_category_id: dish_top_category_id,
                    plan_day_data_list: get_plan_day_data_list(),
                }

                if (!!obj.dish_name) {
                    arr = await params.context.owl_widget.get_dish_key_detail(obj, 7)

                }

                dish_key_list = arr

            } else {
                dish_key_list = [...index.dish_key]

            } 
            // console.log(params.data.dish_key_id, dish_key_list)
            if (input.value.trim() == "") {
                count = 0
                for (const dish_key of dish_key_list) {
                    if (dish_key.dish_top_category_id == params.data.dish_key_id.dish_top_category_id) {
                        if (count++ >= 7) break;
                        str += `<div class="food_item">${dish_key.name}</div>`
                        arr.push(dish_key)
                    }
                }
               
            } else {
                for (const dish_key of dish_key_list) {
                    if (dish_key.dish_top_category_id == params.data.dish_key_id.dish_top_category_id) {
                        if (dish_key.name.includes(input.value)) {
                            str += `<div class="food_item">${dish_key.name}</div>`
                            arr.push(dish_key)
                        }
                    }
                }
            }
            
            // console.log(arr, str)
            // 判断是否需要创建菜品
            createDish.style.display = 'block'
            createDish.innerText = input.value.trim() != "" ? `创建：${input.value}` : "创建："

            for (const dish_key of dish_key_list) {
                if (dish_key.name == input.value) {
                    createDish.style.display = "none"
                }
            }


            this.dish_data = arr
            // console.log(datalist)
            datalist.innerHTML = str
            item_click(datalist, (v) => {
                input.value = v
                input.focus()
            })
        }
        
        // console.log(this.dish_data)
        // 写入 查找更多 功能
        const queryDiv = document.createElement('div');
        queryDiv.classList.add('el_dish_more')
        queryDiv.style.backgroundColor = '#fff'
        queryDiv.innerText = '查找更多...'
        queryDiv.setAttribute('data-bs-toggle', 'modal')
        queryDiv.setAttribute('data-bs-target', '#exampleModal')

        queryDiv.onclick = () => {
            const dish_dataDiv = document.querySelector('#dish_data')
            dish_dataDiv.innerHTML = ""

            // 获取到本行数据
            const doubleClickGetRowData = ({data}) => {
                // console.log(data)
                if (data == undefined) return
                this.dish_data.push({
                    name: data.dishName,
                    id: data.id,
                    dish_top_category_id: params.data.dish_key_id.dish_top_category_id
                })
                input.value = data.dishName
                let d = document.querySelector('#exampleModal')
                d.style.display = 'none'
                document.querySelector('.modal-backdrop.fade').parentNode.removeChild(document.querySelector('.modal-backdrop.fade'))
                input.focus();
            }
            const clickGetRowData = ({data}) => {
                // console.log(data)
                if (data == undefined) return
                this.dish_data.push({
                    name: data.dishName,
                    id: data.id,
                    dish_top_category_id: params.data.dish_key_id.dish_top_category_id
                })
                input.value = data.dishName

            }
            document.querySelector('#defineChange').onclick = () => {
                input.focus();
            }
            // 创建表格
            const d = dishTable(params.data.dish_key_id.dish_top_category_id, doubleClickGetRowData, clickGetRowData);

            if (is_use_owl && params.context.owl_widget) {
                d.rowData = null

                d.onGridReady = async () => {
                    let dish_top_category_id = parseInt(params.data.dish_key_id.dish_top_category_id)


                    let obj = {
                        dish_name: input.value.trim(),
                        dish_top_category_id: dish_top_category_id,
                        plan_day_data_list: get_plan_day_data_list(),
                    }

                    if (!!obj.dish_name) {
                        let arr = await params.context.owl_widget.get_dish_key_detail(obj, -1)

                        d.api.setRowData(arr)
                    }


                }
            }


            new agGrid.Grid(dish_dataDiv, d);
            d.api.sizeColumnsToFit();


        }
        // content
        const dish_content = document.createElement('div')
        dish_content.classList.add('el_dish_content')

        dish_content.appendChild(datalist)
        dish_content.appendChild(createDish)
        dish_content.appendChild(queryDiv)
        // 将元素插入到dn
        dn.appendChild(input)
        dn.appendChild(dish_content)
        
        // 存放元素
        this.ele = dn
        input.value = params.value
        input.focus()
    }

    // 插入elementNode
    getGui() {
        let e = this.ele.querySelector('input')
        e.focus()
        return this.ele
    }

    // 将值发送到当前的表格
    getValue() {
        return this.currentData
    }

    // 编辑开始前调用
    isCancelBeforeStart() {
        return false;
    }

    // 编辑结束后返回一次
    // 如果返回true,编辑结果失效
    isCancelAfterEnd() {
        const currentData = this.ele.querySelector('input').value
        if (currentData == undefined || currentData == null || currentData.trim() == "") return true
        for (const e of this.dish_data) {
            // console.log(e,this.params)
            if (e.name == currentData && e.dish_top_category_id == this.params.data.dish_key_id.dish_top_category_id) {
                // console.log(e, this.params)
                if (e.name == this.params.data.dish) {
                    return false
                }
                // console.log(e, currentData)
                let obj = {
                    dish_top_category_id: e.dish_top_category_id,
                    id: e.id,
                }
                // // 判断当前菜品是否保存过
                // const judeg = preserved_dishes.some(v => v.dish_key_name == currentData)

                let dish_detailedValue = dish_detailed(e, this.params.data.Copies)
                // console.log(this.params.data)
                // 需要斤数
                if (preserved_dishes.has(e.id)) {
                    const value = preserved_dishes.get(e.id)
                    console.log(value)
                    if (value.dinner_type == this.params.data.dinner_type) {
                        this.params.data.whole = value.whole
                        obj['material_item'] = [...value.material_item]

                    } else {
                        this.params.data.whole = dish_detailedValue[0]
                        obj['material_item'] = dish_detailedValue[1]
                    }
                } else {
                    this.params.data.whole = dish_detailedValue[0]
                    obj['material_item'] = dish_detailedValue[1]
                }
                this.params.data.dish_key_id = {...obj}
                // console.log(this.params.data.dish_key_id)
                this.currentData = currentData
                return false
            }
        }
        return true

    }

    afterGuiAttached() {
        this.ele.querySelector('input').focus()
    }

    //
    isPopup() {
        return true
    }

    // getPopupPosition(){
    //     return 'under'
    // }

}
const item_click = (el, func) => {
    const els = el.querySelectorAll('div')
        for (const el of els) {
            el.onclick = function(e) {
                func(this.innerText)
            }
        }
}
export default customCells