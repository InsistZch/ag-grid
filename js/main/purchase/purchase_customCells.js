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

        const d = new Date()

        input.min = `${d.getFullYear()}-${params.data.creationDate}`
        input.max = `${d.getFullYear()}-${params.data.demandDate}`

        input.value = `${d.getFullYear()}-${params.data.orderDate}`
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

        if (value == '' || value < this.ele.querySelector('input').min || value > this.ele.querySelector('input').max) {
            this.currentData = oldValue
        } else {
            const currentData = value
            this.currentData = `${currentData.split('-')[1]}-${currentData.split('-')[2]}`

            const date = new Date()
            const nowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
            const tomorrowDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : date.getDate() + 1}`
            const thirdDayDate = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() + 2 < 10 ? `0${date.getDate() + 2}` : date.getDate() + 2}`


            const rowNode = this.params.api.getRowNode(this.params.data.id)

            rowNode.setDataValue('Order', this.currentData == nowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('tomorrow', this.currentData == tomorrowDate ? rowNode.data.shouldOrder : 0)
            rowNode.setDataValue('thirdDay', this.currentData == thirdDayDate ? rowNode.data.shouldOrder : 0)

            this.params.api.refreshCells({ force: true })

        }

    }
}
export default customCells