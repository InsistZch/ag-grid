import data_index from './data/index.js'
import main_index from './js/main/index.js'
import saveData from './js/main/saveData/index.js'
import init_mc from './js/main/ag-grid/special_fast_data.js'
import { getMaterial } from './js/main/otherApi/getMaterial.js'
import purchase_table from './js/main/purchase/purchase_table.js'
import { resetPurchaseData } from './js/main/otherApi/index.js'
import refreshWholeCol from './js/main/otherApi/refreshWholeCol.js'
import isShowPurchaseColumns from './js/main/purchase/isShowPurchaseColumns.js'
console.log(data_index)

for (const item of data_index.material_item) {
    // 360190
    if (item.id == 3143511) {
        console.log(item)
    }
}

document.addEventListener("DOMContentLoaded", function () {

    // 添加window对象

    main_index.otherApi.addWindowData()
    // console.log(window)
    let agOption = main_index.init_grid_options();
    const eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, agOption);
    agOption.api.sizeColumnsToFit();

    // console.log(agOption)
    main_index.otherApi.saveData('.update', () => {
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
        console.log(init_mc())
    })
    // 主单位是斤
    // 一个食材单位为两
    // 一个单位食材为斤
    main_index.otherApi.purchasePrice('#purchase_price_btn', () => getMaterial(agOption))

    main_index.otherApi.purchase(["#purchase", "#purchase_ruturn"], () => {
        document.querySelector('#myGrid').classList.toggle("agGridLeft")
        const eDiv = document.querySelector('#myGrid2');
        const isShow = eDiv.classList.toggle("agGridRight")
        const agInitButton = document.querySelectorAll('.ag_init_button');
        const agPurchaseButton = document.querySelectorAll('.ag_purchase_button');
        // console.log(isShow)  
        const col_cus = agOption.columnDefs.reduce((pre, v) => {
            if (!isNaN(v.field)) {
                pre.push({
                    colId: v.field,
                    hide: isShow,
                })
            }
            return pre
        }, [])
        agOption.columnApi.applyColumnState({
            state: [...col_cus]
        })
        agOption.api.sizeColumnsToFit();

        if (isShow) {
            const purchaseOption = purchase_table(agOption)
            eDiv.innerHTML = ""
            
            resetPurchaseData.purchase_init(purchaseOption)
            new agGrid.Grid(eDiv, purchaseOption);
            isShowPurchaseColumns(purchaseOption)
            // purchaseOption.api.sizeColumnsToFit();
            // console.log(agOption)
            agOption.api.setColumnDefs(refreshWholeCol.refreshWhole());
            purchaseOption.api.sizeColumnsToFit();

            agInitButton.forEach((agButton) => {
                agButton.style.display = 'none'
            })
            agPurchaseButton.forEach((agButton) => {
                agButton.style.display = 'flex'
            })

        } else {
            agOption.api.setColumnDefs(refreshWholeCol.original());

            agInitButton.forEach((agButton) => {
                agButton.style.display = 'flex'
            })
            agPurchaseButton.forEach((agButton) => {
                agButton.style.display = 'none'
            })
        }
    })
    //控制列显示与隐藏
    const isShowColumns = new main_index.otherApi.isShowColumns()
    isShowColumns.init_select(agOption)
    isShowColumns.change_select(agOption)
    isShowColumns.menu_select(agOption)
});
