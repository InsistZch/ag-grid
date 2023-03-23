import purchase_row from "../purchase/purchase_row.js"

class resetPurchaseData{
    purchaseOption = null

    purchase_init(purchaseOption){
        this.purchaseOption = purchaseOption
    }
    Change(agOption){
        const data = purchase_row(agOption)
        this.purchaseOption.api.setRowData(data)
    }
}

export default new resetPurchaseData()