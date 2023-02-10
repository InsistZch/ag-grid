/** @odoo-module **/
// {
// parent => str
// cancel => array[string]
// sure => string
// deleteData => array[string]
// cancelFun => function
// sureFun => function
// }

const dom = ({parent,cancel,sure,deleteData,cancelFun = () => {},sureFun= () => {}}) => {
    const _parent = document.querySelector(parent)

    const _sure = document.querySelector(sure)
    // 删除数据
    const deldata = () => {
        for (const deleteData_item of deleteData) {
            document.querySelector(deleteData_item).innerHTML = ""
        }
    }

    // 显示页面
    _parent.style.display = 'block'
    // 取消页面
    for (const cancel_item of cancel) {
        const _cancel_item = document.querySelector(cancel_item)
        _cancel_item.onclick = () => {
            cancelFun()
            deldata()
            _parent.style.display = 'none'
        }
    }
    _sure.onclick = () => {
        sureFun()
        deldata()
        _parent.style.display = 'none'
    }
    return _parent
}

export default dom