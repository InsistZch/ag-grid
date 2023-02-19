/** @odoo-module **/
import {mealPrice,mealCopies } from "./ag-grid-row.js"
class GroupRowInnerRenderer {
    // 初始化
    init(params){
        // console.log(params)
        const eGui = document.createElement('div')
        
        const span = document.createElement('span')
        const btn = document.createElement('button')
        const btn2 = document.createElement('button')
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
        margin-left: 5rem;`

        btn2.style.cssText = `
        ${cssText}
        margin-left: 10rem;
        `
        // 设置监听事件
        btn.onclick = () => {
            // console.log(params)
            const data = []
            // 获取全部设置
            // edit fixed types
            const c = mealCopies(true, false, {
                t1: "快餐",
                t2: "特色"
            })
            // console.log(c)
            // 查看当前餐类别份数是否存在
            params.api.forEachNode(v => {
                if(v.data != undefined) {
                    if(v.data.configure && v.data.cl1 == params.value){
                        if(v.data.fixed) return
                        data.push(v.data)
                    }
                    
                }
            })
            console.log(data)
            // 当份数不存在时
            if(data.length == 0){
                const d2 = c.filter(v => v.cl1 == params.value)
                params.api.applyTransaction({add: [...d2], addIndex: 0})
            }else{
                let d = []
                params.api.forEachNode(v => {
                    // 保证不是分组行
                    if(v.data != null){
                        // 保证不是同类配置
                        if(v.data.configure == true && v.data.cl1 == params.value && v.data.fixed == false) return
                        d.push(v.data)
                    }
                })
                // console.log(d)
                params.api.setRowData(d)
            }
        }

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

            // btn2judeg = !btn2judeg
            // console.log(data)
            // params.api.setRowData(data)
            const mealsPrice = mealPrice()
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
                        params.api.applyTransaction({add: [mealsPrice_item], addIndex: 0})
                    }
                }
            }else {
                params.api.setRowData(data)
            }
            // params.api.onRowHeightChanged(0, true)
            // params.api.refreshCells({force:true})
        }
        // 插入内容
        span.innerText = params.value
        btn.innerText = "份数"
        btn2.innerText = "餐标"

        eGui.appendChild(span)
        eGui.appendChild(btn)
        eGui.appendChild(btn2)

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

export default GroupRowInnerRenderer