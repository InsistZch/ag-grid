import customFrom from './customFrom.js'
export default (elStr, func = () => {}) => {
    document.querySelector(elStr).onclick = () => {
        customFrom({
            parent:'#purchase_price',
            cancel: ['#purchase_price_cancel1', '#purchase_price_cancel2'],
            sure: "#purchase_price_sure",
            deleteData: [],
            initFun(){
                func()
            },
            sureFun(){
                console.log('sure');
                return true
            }
        })
    }
}