import index from '../../../data/index.js'
import {dish_detailed} from './ag-grid-row.js'
import dishTable from '../dish-data-gird/dish-table.js'
import { add_dish_key_id,} from "./../tool.js";
import saveData from '../saveData/index.js';
// let create_dish_key = 5000000


class customCells{
    // 创建编辑器后调用一次
    init(params){
        // console.log(params)
        // 将一些必要数据存入 this
        this.params = params
        this.dish_data = []

        // 创建元素
        const dn = document.createElement('div')

        dn.style.position = 'relative'
        dn.style.backgroundColor = '#fff'
        dn.style.width = '300px'

        const input = document.createElement('input')
        

        input.type = 'search'
        input.setAttribute('list','lesson')


        const datalist = document.createElement('datalist')
        datalist.id = 'lesson'

        const createDish = document.createElement('div')

        createDish.classList.add('createDish')
        createDish.setAttribute('data-bs-toggle','modal')
        // 
        createDish.setAttribute('data-bs-target','#staticBackdrop')


        createDish.onclick = () => {
            // 获取菜品名称
            let dishInput = document.querySelector('#dishInput')
            dishInput.value = input.value
            // 获取类别
            let dishCategory = document.querySelector('#dishCategory')
            dishCategory.value = params.data.dish_key_id.dish_top_category_id
            // 获取辣度
            let dishSpicy = document.querySelector("#dishSpicy")
            let successCreateDish = document.querySelector('#successCreateDish')
            successCreateDish.onclick = () => {
                let obj = {
                    "id": add_dish_key_id(),
                    "name":dishInput.value,
                    "dish_top_category_id":dishCategory.value,
                    "spicy":dishSpicy.value,
                    "is_fish":false,
                    "is_organ":false,
                    "is_semi_finished":false,
                    "is_fried":false,
                    "odor":"odor_0",
                    "is_shrimp":false,
                    "is_color_additive":false
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
        
        for (const dish_key of index.dish_key) {
            if(dish_key.dish_top_category_id == params.data.dish_key_id.dish_top_category_id){
                if(count ++ >= 7) break;
                str += `<option value="${dish_key.name}"></option>`
                this.dish_data.push(dish_key)
            }
        }
        input.onkeyup = () => {
            let str = ''
            let arr = []
            if(input.value.trim() == ""){
                for (const dish_key of index.dish_key) {
                    if(dish_key.dish_top_category_id == params.data.dish_key_id.dish_top_category_id){
                        if(count ++ >= 7) break;
                        str += `<option value="${dish_key.name}"></option>`
                        arr.push(dish_key)
                    }
                }
            }else{
                for (const dish_key of index.dish_key) {
                    if(dish_key.dish_top_category_id == params.data.dish_key_id.dish_top_category_id){
                        if(dish_key.name.includes(input.value)){
                            str += `<option value="${dish_key.name}"></option>`
                            arr.push(dish_key)
                        }
                    }
                }
            }
            // 判断是否需要创建菜品
            createDish.innerText = input.value.trim() != "" ? `创建${input.value}...` : ""

            for (const dish_key of index.dish_key) {
                if(dish_key.name == input.value){
                    createDish.innerText = ""
                }
            }

            this.dish_data = arr
            datalist.innerHTML = str
        }
        datalist.innerHTML = str
        // console.log(this.dish_data)
        // 写入 查找更多 功能
        const queryDiv = document.createElement('div');
        queryDiv.style.backgroundColor = '#fff'
        queryDiv.innerText = '查找更多...'
        queryDiv.setAttribute('data-bs-toggle','modal')
        queryDiv.setAttribute('data-bs-target','#exampleModal')

        queryDiv.onclick = () => {
            const dish_dataDiv = document.querySelector('#dish_data')
            dish_dataDiv.innerHTML = ""

            // 获取到本行数据
            const doubleClickGetRowData = ({data}) => {
                this.dish_data.push({
                    name:data.dishName,
                    id:data.id,
                    dish_top_category_id:data.dish_top_category_id
                })
                input.value = data.dishName
                let d = document.querySelector('#exampleModal')
                d.style.display = 'none'
                document.querySelector('.modal-backdrop.fade').parentNode.removeChild(document.querySelector('.modal-backdrop.fade'))
                input.focus();
            }
            const clickGetRowData = ({data}) => {
                this.dish_data.push({
                    name:data.dishName,
                    id:data.id,
                    dish_top_category_id:data.dish_top_category_id
                })
                input.value = data.dishName
                
            }
            document.querySelector('#defineChange').onclick = () => {
                input.focus();
            }
            // 创建表格
            const d = dishTable(params.data.dish_key_id.dish_top_category_id,doubleClickGetRowData,clickGetRowData);
            new agGrid.Grid(dish_dataDiv, d);
            d.api.sizeColumnsToFit();
        }
        // 将元素插入到dn
        dn.appendChild(input)
        dn.appendChild(datalist)
        dn.appendChild(queryDiv)
        dn.appendChild(createDish)
        // 存放元素
        this.ele = dn
        input.value = params.value
        input.focus()
    }
    // 插入elementNode
    getGui(){
        let a = this.ele.querySelector('input')
        a.focus()
        return this.ele
    }
    // 将值发送到当前的表格
    getValue(){
        return this.currentData
    }
    // 编辑开始前调用
    isCancelBeforeStart() {
        return false;
    }
    // 编辑结束后返回一次
    // 如果返回true,编辑结果失效
    isCancelAfterEnd(){
        const currentData = this.ele.querySelector('input').value
        for (const e of this.dish_data) {
            if(e.name == currentData){
                // console.log(e)
                let dish_detailedValue = dish_detailed(e,this.params.data.Copies)
                this.params.data.whole = dish_detailedValue[0]
                this.params.data.dish_key_id = {
                    dish_top_category_id:e.dish_top_category_id,
                    id:e.id,
                    material_item:dish_detailedValue[1]
                }
                this.currentData = currentData
                return false
            }
        }
        return true
        
    }
    afterGuiAttached(){
        this.ele.querySelector('input').focus()
    }
    // 
    isPopup(){
        return true
    }
    
    // getPopupPosition(){
    //     return 'under'
    // }

}
export default customCells