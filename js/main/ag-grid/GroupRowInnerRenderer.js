/** @odoo-module **/
import {cost_proportion} from "./ag-grid-row.js"
// 获取快餐，特色初始化数据
import init_mc from './special_fast_data.js'
import init_mp from "./meal_price.js"
class GroupRowInnerRenderer {
    // 初始化
    init(params){
        // console.log(params)
        const eGui = document.createElement('div')
        
        const span = document.createElement('span')
        const btn = document.createElement('button')
        const btn2 = document.createElement('button')
        const costbtn = document.createElement('button')
        // 设置样式
        const cssText = `
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: .2rem .6rem;
        border-radius: 5px;
        border: none;
        font-size: .8rem;
        background-color: transparent;
        color: #71639e;
        `
        eGui.style.cssText = `
        display:flex;
        `
        btn.style.cssText =  `
        ${cssText}
        margin-left: 10rem;`

        btn2.style.cssText = `
        ${cssText}
        margin-left: 5rem;
        `
        costbtn.style.cssText = `
        ${cssText}
        margin-left: 15rem;`

        let c = init_mc()
        // 设置监听事件
        // 份数
        btn.onclick = () => {
            // console.log(params)
            const data = []
            // 获取全部设置
            // edit fixed types
            // 查看当前餐类别份数是否存在
            params.api.forEachNode(v => {
                if(v.data != undefined) {
                    if(v.data.configure && v.data.cl1 == params.value){
                        if(v.data.fixed) return
                        data.push(v.data)
                    }
                    
                }
            })
            // console.log(data)
            // 当份数不存在时
            if(data.length == 0){
                const d2 = c.filter(v => v.cl1 == params.value)
                let addIndex = dataIndex(params)
               
                params.api.applyTransaction({add: [...d2], addIndex})
            }else{
                const d = getRowData({
                    params,
                    rowTypes: ['快餐', '特色'],
                    categoryName: params.value
                })
                params.api.applyTransaction({remove: d})
                
            }
        }
        // 餐标
        btn2.onclick = () => {
            // setRowHeight
            // console.log(params)
            // console.log(window.cus_loc_ids)
            const data = []
            params.api.forEachNode(v => {
                if(v.data != undefined) {
                    if(v.data.type == "餐标" && v.data.cl1 == params.value) return
                    data.push(v.data)
                }
            })

            // console.log(data)
            // params.api.setRowData(data)
            const mealsPrice = init_mp()
            let arr = []
            // 查看当前点击所点击的餐标是否存在
            params.api.forEachNode(v => {
                if(v.data != null && v.data.type == "餐标" && v.data.cl1 == params.value){
                    arr.push(v.data.cl1)
                    // v.setRowHeight(0)
                }
            })
            if(arr.length == 0){
                for (const mealsPrice_item of mealsPrice) {
                    if(mealsPrice_item.cl1 == params.value){
                        mealsPrice_item['Copies'] = null
                        params.api.applyTransaction({add: [mealsPrice_item], addIndex: 0})
                    }
                }
            }else {
                params.api.setRowData(data)
            }
        }

        // 成本
        costbtn.onclick = () => {
            const arr = []
            let dinner_type = ""
            params.api.forEachNode(v => {
                if(v.data == null) return
                if(v.data.configure == true || v.data.edit == false) return
                if(params.value == v.data.cl1){
                    arr.push(v.data)
                    dinner_type = v.data.cl1
                }
                // if(params.key == v.data.cl1){
                //     arr.push(v)
                // }
            })
            const c2 = c.filter(v => params.value == v.cl1)
            const d = cost_proportion(arr, c2)
            // 查看当前是否存在成本 默认为无
            let judeg = false
            const arr2 = []
            params.api.forEachNode(v => {
                if(v.data == null) return
                if(v.data.type == d[2]['type'] && params.value == v.data.cl1){
                    judeg = true
                }else{
                    arr2.push(v.data)
                }
            })

            if(judeg){
                params.api.setRowData(arr2)
            }else{
                const obj = {
                    ...d[2],
                    cl1: params.value,
                    dinner_type,
                }
                let addIndex = dataIndex(params)
                
                params.api.applyTransaction({add: [obj], addIndex})
            }
        }
        // 插入内容
        span.innerHTML = `<span style="font-weight: 600;">${params.value}</span>`
        btn.innerText = "份数"
        btn2.innerText = "餐标"
        costbtn.innerText = "成本"
        eGui.appendChild(span)
        eGui.appendChild(btn)
        eGui.appendChild(btn2)
        eGui.appendChild(costbtn)
        // 发到this
        this.eGui = eGui
    }
    // 插入页面
    getGui() {
        return this.eGui;
    }
    // 刷新
    refresh(params) {
        return false;
    }

}

const dataIndex = (params) => {
    let index = 0
    params.api.forEachNode((v, i) => {
        if(v.data == null) return
        if(v.data.cl1 == params.value && v.data.type =="餐标"){
            index = i + 1
        }
        if(v.data.configure && v.data.cl1 == params.value){
            index = i + 1
            // console.log(v.data)
        }
    })
    return index
}

// rowTypes => [type, type] => 行数据type字段
// category => string => 餐别
// configure => boolean => 判断是否为配置
const getRowData = ({
    params,
    rowTypes,
    categoryName,
    configure = true}) => {
    const data = []
    params.api.forEachNode(v => {
        if(v.data == null) return
        if(v.data.cl1 != categoryName || v.data.configure != configure) return
        for (const item of rowTypes) {
            if(item == v.data.type) {
                data.push(v.data)
            }
        }
    })
    return data
}

export {
    dataIndex
}
export default GroupRowInnerRenderer