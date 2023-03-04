let id = 0

const idPlusOne = () => id ++
// 餐标 份数 成本
const costPlusOne = (category) => {
    console.log(category)
    return `cost-${category}`
}

export default idPlusOne

export {
    costPlusOne
}