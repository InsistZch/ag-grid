/** @odoo-module **/
let id = 0

const idPlusOne = () => id ++
// 餐标 份数 成本
const costPlusOne = (category) => `cost-${category}`

const pricePlusOne = (category) => `price-${category}`

const copiesPlusOne = (category, id) => `copies-${category}-${id}`
export default idPlusOne

export {
    costPlusOne,pricePlusOne, copiesPlusOne
}