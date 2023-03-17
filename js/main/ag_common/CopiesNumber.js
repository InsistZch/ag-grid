/** @odoo-module **/
const copiesNumber = (num) => {
    num = Math.ceil(num)
    if(num == 0 || num < 10) return Math.ceil(num)

    if(num < 100){
        let lastNumber = String(num)[String(num).length - 1]
        if(Number(lastNumber) > 5){
            num = num - Number(lastNumber) + 10
        }else if(Number(lastNumber) != 0){
            num = num - Number(lastNumber) + 5
        }
        return num
    }
    const numArr = String(num).split("")
    // 获取最后一位数字
    const lastNumber = numArr[numArr.length - 1]
    let newNumber;

    // console.log(lastNumber)
    if(Number(lastNumber) >= 5){
        numArr[numArr.length - 1] = 0
        // 0有两种含义 一种为十进一 一种为原本就是0
        // 上一次做了进位操作设置true 没做进位操作设置false
        // 默认为true
        let operation = true
        for(let i = numArr.length - 2; i >= 0; i--){
            // 
            if(operation){
                
                if(Number(numArr[i]) + 1 == 10){
                    numArr[i] = 0
                    operation = true
                }else{
                    numArr[i] = Number(numArr[i]) + 1
                    operation = false
                }
            }
        }
        if(operation) numArr.unshift(1)
    }else{
        numArr[numArr.length - 1] = 0
        
    }
    newNumber = numArr.join("")
    // console.log(newNumber)
    return Number(newNumber)
}
// copiesNumber(999)
export default copiesNumber