/** @odoo-module **/
class GroupRowInnerRenderer {
    // 初始化
    init(params){
        // console.log(params)
        const eGui = document.createElement('div')
        
        const span = document.createElement('span')
        const btn = document.createElement('button')
        // 设置样式

        eGui.style.cssText = `
        display:flex;
        `
        btn.style.cssText = `
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        height:30px;
        margin-left: 5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        `

        // 设置监听事件
        btn.onclick = () => {
            console.log(params)
        }
        // 插入内容
        span.innerText = params.value
        btn.innerText = "份数"

        eGui.appendChild(span)
        eGui.appendChild(btn)

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