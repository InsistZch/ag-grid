/** @odoo-module **/
class CustomStatsToolPanel {
    init(params){
        const eDiv = document.createElement('div')
        console.log(params)
        this.eDiv = eDiv
    }

    getGui(){
        return this.eDiv
    }
}

export default CustomStatsToolPanel