
class CustomColumnsToolPanel {
    init(params){
        const eDiv = document.createElement('div')
        console.log(params)

        eDiv.innerHTML = `
        <label>
            <input type="checkbox"/>
            <span></span>
        </label>`
        this.eDiv = eDiv
    }

    getGui(){
        return this.eDiv
    }
}

export default CustomColumnsToolPanel