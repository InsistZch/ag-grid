import data_index from './data/index.js'
import main_index from './js/main/index.js'
import saveData from './js/main/saveData/index.js'
import init_mc from './js/main/ag-grid/special_fast_data.js'
import { getMaterial } from './js/main/otherApi/getMaterial.js'
import purchase_table from './js/main/purchase/purchase_table.js'
import { resetPurchaseData, resetsummaryTotalData } from './js/main/otherApi/index.js'
import refreshWholeCol from './js/main/otherApi/refreshWholeCol.js'
import isShowPurchaseColumns from './js/main/purchase/isShowPurchaseColumns.js'
import purchase_data from './js/main/purchase/purchase_data.js'
import { get_purchase_row_data_list } from "./js/main/tool.js";
import summaryTotal_table from './js/main/SummaryTotal/summaryTotal_table.js'
console.log(data_index)

// for (const item of data_index.dish_key) {
//     // 360190
//     if (item.name == "红枣银耳汤") {
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
    // let theOne = true
    // purchase_summary_data有数据，则录入purchase_summary_data中的数据，如果没有，则通过配量汇总生成
    purchaseOption = purchase_table(agOption) // 初始化
    // 初始化采购单
    resetPurchaseData.purchase_init(purchaseOption)

    // 食材汇总
    let summaryTotalOption = summaryTotal_table(agOption) // 初始化
    // 初始化食材汇总
    resetsummaryTotalData.summaryTotal_init(summaryTotalOption)
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

    // 获取选框状态
    const isShowColumns = new main_index.otherApi.isShowColumns()

    main_index.otherApi.purchasePrice('#purchase_price_btn', () => getMaterial(agOption))

    let purchase_rowdata = purchase_data
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
            const eDiv = document.querySelector('#myGrid2');
            let isShow = eDiv.classList.toggle("agGridRight")
            // 选框和按钮
            const agButton = document.querySelector('.ag_init_button .ag-button');
            const initFunction = document.querySelector('.ag_init_button .function');
            const date = document.querySelector('.date');
            const agPurchaseButton = document.querySelectorAll('.ag_purchase_button');
            // console.log(isShow)
            // 采购单布局
            const agGridPurchase = document.querySelector('.purchaseGrid');
            const agGridsummaryTotal = document.querySelector('.summaryTotalGrid');
            let agGridLeft = document.querySelector('.agGridLeft')
            const agGridCenter = document.querySelector('.agGridCenter')

            // const col_cus = agOption.columnDefs.reduce((pre, v) => {
            //     if (!isNaN(v.field)) {
            //         pre.push({
            //             colId: v.field,
            //             hide: isShow,
            //         })
            //     }
            //     return pre
            // }, [])
            // agOption.columnApi.applyColumnState({
            //     state: [...col_cus]
            // })
            agOption.api.sizeColumnsToFit();

            // 显示采购单
            if (isShow) {
                // 布局显示
                agGridPurchase.style.display = 'block'
                if (agGridCenter != null) {
                    agGridLeft.style.width = '36%'
                    agGridsummaryTotal.style.width = '28%'
                    agGridPurchase.style.width = '36%'
                } else {
                    document.querySelector('#myGrid').classList.toggle("agGridLeft")
                    agGridLeft = document.querySelector('.agGridLeft')
                    agGridPurchase.style.width = '50%'
                    agGridLeft.style.width = '50%'
                }

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

                const orderConsole = async (arr) => {

                    let ans_arr = get_purchase_row_data_list(d, arr)
                    console.log(ans_arr)

                    if (purchaseOption.context != undefined && purchaseOption.context.owl_widget.DownloadPurchaseOrderAllCategory) {

                        await purchaseOption.context.owl_widget.DownloadPurchaseOrderAllCategory(ans_arr)
                    }
                }
                const btnOrderAll = document.querySelector('#purchase_order_all')
                btnOrderAll.onclick = async () => {
                    const arr = purchaseOption.rowData
                    await orderConsole(arr)
                }

            } else {
                // theOne = false
                agGridPurchase.style.display = 'none'
                if (agGridCenter != null) {
                    agGridLeft.style.width = '50%'
                    agGridsummaryTotal.style.width = '50%'
                    agOption.api.sizeColumnsToFit();
                } else {
                    document.querySelector('#myGrid').style.width = '100%'
                    document.querySelector('#myGrid').classList.toggle("agGridLeft")
                    refreshWholeCol.original(isShowColumns, agOption)
                    agOption.api.sizeColumnsToFit();
                }
                agButton.style.display = 'flex'
                initFunction.style.display = 'flex'
                date.id = ''

                agPurchaseButton.forEach((agButton) => {
                    agButton.style.display = 'none'
                })

                purchase_rowdata.data = purchaseOption.rowData
                // 打印数据
                // let ans_arr = get_purchase_row_data_list(d, purchase_rowdata.data)

                if (purchaseOption.context != undefined && purchaseOption.context.owl_widget.PurChaseOrderSave) {
                    // await purchaseOption.context.owl_widget.PurChaseOrderSave(ans_arr)
                }
            }
        }
    })

    main_index.otherApi.summaryTotal(["#summaryTotal", "#summaryTotal_return"], async () => {
        const eDiv = document.querySelector('#myGrid3');
        let isShow = eDiv.classList.toggle("agGridCenter")
        // 食材总汇布局
        const agGridsummaryTotal = document.querySelector('.summaryTotalGrid');
        const agGridPurchase = document.querySelector('.purchaseGrid');
        let agGridLeft = document.querySelector('.agGridLeft')
        const agGridRight = document.querySelector('.agGridRight')
        // 显示食材汇总单
        if (isShow) {
            // 布局显示
            agGridsummaryTotal.style.display = 'block'
            if (agGridRight != null) {
                agGridLeft.style.width = '36%'
                agGridsummaryTotal.style.width = '28%'
                agGridPurchase.style.width = '36%'
            } else {
                document.querySelector('#myGrid').classList.toggle("agGridLeft")
                agGridLeft = document.querySelector('.agGridLeft')
                agGridsummaryTotal.style.width = '50%'
                agGridLeft.style.width = '50%'
            }
            eDiv.innerHTML = ""
            new agGrid.Grid(eDiv, summaryTotalOption);

            resetsummaryTotalData.Change(agOption)
            // 设置主表单的列显示
            agOption.api.setColumnDefs(refreshWholeCol.refreshWhole('', agOption));
            agOption.api.sizeColumnsToFit()

        } else {
            agGridsummaryTotal.style.display = 'none'
            if (agGridRight != null) {
                agGridLeft.style.width = '50%'
                agGridPurchase.style.width = '50%'
                agOption.api.sizeColumnsToFit();
            } else {
                document.querySelector('#myGrid').style.width = '100%'
                document.querySelector('#myGrid').classList.toggle("agGridLeft")
                refreshWholeCol.original(isShowColumns, agOption)
                agOption.api.sizeColumnsToFit();
            }
        }
    })

    //控制列显示与隐藏
    isShowColumns.init_select(agOption)
    isShowColumns.change_select(agOption)
    isShowColumns.menu_select(agOption)
});
