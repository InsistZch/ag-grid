/** @odoo-module **/

class customCells {

    init(params) {
        this.params = params
        this.dish_data = []
        // 创建元素
        const div = document.createElement('div')

        div.classList.add('el_orderDate')

        const input = document.createElement('input')

        input.type = 'date'
        input.classList.add('el_orderDate_search')

        const nowDate = moment().format("YYYY-MM-DD")

        input.min = nowDate
        input.max = params.data.demandDate

        input.value = params.data.orderDate

        div.appendChild(input)

        this.ele = div

    }

    getGui() {
        let e = this.ele.querySelector('input')
        e.focus()
        return this.ele
    }

    getValue() {
        return this.currentData
    }

    isPopup() {
        return true
    }

    isCancelAfterEnd() {
        const oldValue = this.params.value
        const value = this.ele.querySelector('input').value
        // console.log(this.ele.querySelector('input').max, value, this.ele.querySelector('input').min)
        if (value == '' || value < this.ele.querySelector('input').min || value > this.ele.querySelector('input').max) {
            this.currentData = oldValue
        } else {
            this.currentData = value
            console.log(this.currentData)

            const date = new Date()
            const nowDate = moment().format("YYYY-MM-DD")
            const tomorrowDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)).format("YYYY-MM-DD")
            const thirdDayDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)).format("YYYY-MM-DD")

            const rowNode = this.params.api.getRowNode(this.params.data.id)

            rowNode.setDataValue('Order', this.currentData == nowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('tomorrow', this.currentData == tomorrowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('thirdDay', this.currentData == thirdDayDate ? rowNode.data.shouldOrder : 0)

            this.params.api.refreshCells({ force: true })

        }

    }
}
export default customCells