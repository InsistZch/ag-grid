/** @odoo-module **/
import index from '../../../data/index.js'
import {dish_detailed} from '../ag-grid/ag-grid-row.js'
const row = (dish_top_category_id) => {
    let arr = []
    for (const dish_key of index.dish_key) {
        let obj = {}
        if(dish_top_category_id == dish_key.dish_top_category_id){
            // console.log(dish_top_category_id, dish_key.dish_top_category_id)
            obj['dishName'] = dish_key.name
            let sp = dish_key.spicy.split('spicy')[1]
            if(sp == '1'){
                obj['spicy'] = '不辣'
            }else if(sp == '2'){
                obj['spicy'] = '微辣'
            }else if(sp == '3'){
                obj['spicy'] = '中辣'
            }else{
                obj['spicy'] = '超辣'
            }
            // console.log(dish_key)
            obj['foodFrom'] = dish_detailed(dish_key,100)[0]
            obj['id'] = dish_key.id
            obj['dish_top_category_id'] = dish_key.dish_top_category_id
            arr.push(obj)
        }
    }
    return arr
}

export default row