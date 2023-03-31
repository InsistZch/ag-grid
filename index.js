import data_index from './data/index.js'
import main_index from './js/main/index.js'
import saveData from './js/main/saveData/index.js'
import init_mc from './js/main/ag-grid/special_fast_data.js'
console.log(data_index)

// for (const item of data_index.material_item) {
//     // 360190
//     if(item.id == 360190){
//         console.log(item)
//     }
// }
document.addEventListener("DOMContentLoaded", function () {

    // 添加window对象

    main_index.otherApi.addWindowData()
    // console.log(window)
    let agOption =  main_index.init_grid_options();
    const eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, agOption);
    agOption.api.sizeColumnsToFit();

    // console.log(agOption)
    main_index.otherApi.saveData('.update', (el) => {
        // console.log(agOption.api.getPinnedTopRow(0))
        saveData.day_cost_proportion.complete_cost_ratio = Number(agOption.api.getPinnedTopRow(0).data.costPrice.split('%')[0])
        console.log(saveData)
        const arr = []
        agOption.api.forEachNode(v => {
            if (v.data == null || v.data.configure) return
            arr.push(v.data)
        })
        console.log(arr)
        console.log("------------餐份数------------")
        const colArr = []
        for (const item of agOption.columnApi.getColumnState()) {
            if(!isNaN(item['colId'])){
                colArr.push(item['colId'])
            }
        }
        // 
        console.log("------------列------------")
        console.log(colArr)
        // 餐标
        console.log(init_mc())
        el.classList.remove('btn-outline-danger')
        el.classList.add('btn-outline-primary')
        el.innerText = "更新"
    })
    // 主单位是斤
    // 一个食材单位为两
    // 一个单位食材为斤
    main_index.otherApi.purchasePrice('#purchase_price_btn', () => {
        const material = new Map()
        agOption.api.forEachNode(v => {
            if (v.data == null || v.data.config) return
            for (const item of v.data.dish_key_id.material_item) {
                material.set(item.id, item)
            }
        })
        // console.log(material)
        return [material, agOption]
    })

    //控制列显示与隐藏
    const isShowColumns = new main_index.otherApi.isShowColumns()
    isShowColumns.init_select(agOption)
    isShowColumns.change_select(agOption)
    isShowColumns.menu_select(agOption)
});