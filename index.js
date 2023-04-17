import data_index from './data/index.js'
import main_index from './js/main/index.js'
import saveData from './js/main/saveData/index.js'
import init_mc from './js/main/ag-grid/special_fast_data.js'
import { getMaterial } from './js/main/otherApi/getMaterial.js'
import purchase_table from './js/main/purchase/purchase_table.js'
import { resetPurchaseData } from './js/main/otherApi/index.js'
import refreshWholeCol from './js/main/otherApi/refreshWholeCol.js'
import isShowPurchaseColumns from './js/main/purchase/isShowPurchaseColumns.js'
import purchase_date from './js/main/purchase/purchase_data.js'
console.log(data_index)

// for (const item of data_index.material_item) {
//     // 360190
//     if (item.id == 3143511) {
//         console.log(item)
//     }
// }

document.addEventListener("DOMContentLoaded", function () {

    // 添加window对象
    main_index.otherApi.addWindowData()
    // console.log(window)
    // 主表单
    let agOption = main_index.init_grid_options();
    const eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, agOption);

    // 采购单
    let purchaseOption = null
    let theOne = true

    // purchase_summary_data有数据，则录入purchase_summary_data中的数据，如果没有，则通过配量汇总生成
    purchaseOption = purchase_table(agOption) // 初始化
    // 初始化采购单
    resetPurchaseData.purchase_init(purchaseOption)
    agOption.api.sizeColumnsToFit();

    let purchase_rowdate = []

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

    // 获取选框状态
    const isShowColumns = new main_index.otherApi.isShowColumns()

    main_index.otherApi.purchasePrice('#purchase_price_btn', () => getMaterial(agOption))

    main_index.otherApi.purchase(["#purchase", "#purchase_ruturn"], async () => {

        // 时间警告
        const dateSpan = document.querySelector('.date')
        const theAlert = document.querySelector('.the_alert')
        const date = dateSpan.innerHTML.split(" ")[0].split('-')
        var d = new Date(date[0], date[1] - 1, date[2]);
        var nowD = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        if (d - nowD < 0) {
            theAlert.style.display = 'block'
            const alert = (message, type) => {
                const div = document.createElement('div')
                div.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
                theAlert.innerHTML = '';
                theAlert.append(div)
            }
            alert('只能对今天和今天之后的日菜单下达采购单!', 'warning')

            const timer = setTimeout(() => {
                theAlert.style.display = 'none'
            }, 2000)
            // 清空定时器
            for (let i = 1; i < timer; i++) {
                clearTimeout(i);
            }
        } else {

            // 如果日计划时间正确
            document.querySelector('#myGrid').classList.toggle("agGridLeft")
            const eDiv = document.querySelector('#myGrid2');
            let isShow = eDiv.classList.toggle("agGridRight")
            // 选框和按钮
            const agButton = document.querySelector('.ag_init_button .ag-button');
            const initFunction = document.querySelector('.ag_init_button .function');
            const date = document.querySelector('.date');
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

            // 显示采购单
            if (isShow) {
                eDiv.innerHTML = ""
                new agGrid.Grid(eDiv, purchaseOption);
                resetPurchaseData.Change(agOption)
                isShowPurchaseColumns(purchaseOption)
                // purchaseOption.api.sizeColumnsToFit();
                // console.log(agOption)
                // 设置主表单的列显示
                agOption.api.setColumnDefs(refreshWholeCol.refreshWhole('', agOption));
                agOption.api.sizeColumnsToFit()

                // 隐藏主表单的选款和按钮   +
                agButton.style.display = 'none'
                initFunction.style.display = 'none'
                date.id = 'purchase_date'
                agPurchaseButton.forEach((agButton) => {
                    agButton.style.display = 'flex'
                })

            } else {
                theOne = false
                refreshWholeCol.original(isShowColumns, agOption)
                agButton.style.display = 'flex'
                initFunction.style.display = 'flex'
                date.id = ''

                agPurchaseButton.forEach((agButton) => {
                    agButton.style.display = 'none'
                })

                purchase_rowdate = new purchase_date(purchaseOption.rowData)

                // 打印数据
                const purchaseConsole = []
                purchase_rowdate.data.forEach((r) => {
                    purchaseConsole.push({
                        mname: r.material,
                        purchase_unit_id: r.purchase_unit_id,
                        main_unit_id : r.main_unit_id,
                        purchase_gty: r.quantity,
                        creationDate:   `${d.getFullYear()}-${r.creationDate}`,
                        orderDate:`${d.getFullYear()}-${r.orderDate}`,
                        demandDate:`${d.getFullYear()}-${r.demandDate}`
                    })
                })
                console.log(purchaseConsole)

                if (agOption.context != undefined && agOption.context.owl_widget.PurChaseOrderSave) {
                    await agOption.context.owl_widget.PurChaseOrderSave(purchaseConsole)
                }
            }
        }
    })



    //控制列显示与隐藏
    isShowColumns.init_select(agOption)
    isShowColumns.change_select(agOption)
    isShowColumns.menu_select(agOption)
});
