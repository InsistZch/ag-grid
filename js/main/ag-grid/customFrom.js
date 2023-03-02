/** @odoo-module **/
// {
// parent => str
// cancel => array[string]
// sure => string
// deleteData => array[string]
// cancelFun => function
// sureFun => function  => return Boolean
// initFun => function
// }

const dom = async ({parent,cancel,sure,deleteData,cancelFun = () => {},sureFun = () => {},initFun = () => {}}) => {
    const _parent = document.querySelector(parent)

    const _sure = document.querySelector(sure)
    // 删除数据
    const deldata = () => {
        for (const deleteData_item of deleteData) {
            _parent.querySelector(deleteData_item).innerHTML = ""
        }
    }

    // 显示页面
    _parent.style.display = 'block'
    initFun(_parent)
    // 取消页面
    for (const cancel_item of cancel) {
        const _cancel_item = _parent.querySelector(cancel_item)
        _cancel_item.onclick = () => {
            cancelFun()
            deldata()
            _parent.style.display = 'none'
        }
    }
    _sure.onclick = () => {
        const isSure = sureFun(_parent)
        isSure ?  deldata() : ""
        isSure ? _parent.style.display = 'none' : ""
    }
    return new Promise((r,j) => {
        r(_parent)
    })
}

export default dom