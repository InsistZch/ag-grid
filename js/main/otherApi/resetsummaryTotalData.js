/** @odoo-module **/
import summaryTotal_row from "../summaryTotal/summaryTotal_row.js"
import refreshWholeCol from './refreshWholeCol.js'
class resetPurchaseData {
    summaryTotalOption = null

    summaryTotal_init(summaryTotalOption) {
        this.summaryTotalOption = summaryTotalOption
    }
    Change(agOption) {
        const data = summaryTotal_row(agOption)
        this.summaryTotalOption.rowData = data
        this.summaryTotalOption.api && this.summaryTotalOption.api.setRowData(data)
        this.summaryTotalOption.api && this.summaryTotalOption.api.refreshCells({ force: true })
        refreshWholeCol.refreshWhole('', agOption)
    }
}

export default new resetPurchaseData()