/** @odoo-module **/
// {
// parent => str  => 父元素
// cancel => array[string]  => 取消按钮
// sure => string  => 确认按钮
// deleteData => array[string] => 关闭后需要删除的数据
// cancelFun => function  => 取消后的执行的方法
// sureFun => function  => return Boolean  => 确认后的执行的方法
// initFun => function => 初始化
// }
// sureFun => return true => 确认成功 false => 确认失败

const dom = async ({parent,cancel,sure,deleteData,cancelFun = () => {},sureFun = () => true,initFun = () => {}}) => {
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