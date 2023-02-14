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
        padding:.2rem .6rem;
        border-radius: 5px;
        border: solid 1px #000;
        font-size: .8rem;
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
            console.log(params)
        }

        btn2.onclick = () => {
            console.log(params)
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