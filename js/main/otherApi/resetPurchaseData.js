/** @odoo-module **/
import purchase_row from "../purchase/purchase_row.js"
import refreshWholeCol from './refreshWholeCol.js'

class resetPurchaseData {
    purchaseOption = null

    purchase_init(purchaseOption) {
        this.purchaseOption = purchaseOption
    }
    Change(agOption, e) {
        const data = purchase_row(agOption, e)
        // this.purchaseOption.rowData.forEach(row => {
        //     if(row.newAdd){
        //         data.push(row)
        //     }
        // })
        this.purchaseOption.rowData = data
        this.purchaseOption.api && this.purchaseOption.api.setRowData(data)
        this.purchaseOption.api && this.purchaseOption.api.refreshCells({ force: true })
        refreshWholeCol.refreshWhole('', agOption)
    }
}

export default new resetPurchaseData()