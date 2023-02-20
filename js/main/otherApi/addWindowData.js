import index from './../../../data/index.js'
const addWindowData = () => {
    // 向window添加数据
    window.cus_loc_ids = Object.keys(index.plan_day_record_show[0]['cus_loc_info']).map(v => v.split('_')[1])
    window.dinner_types = [...index.plan_day_record_show.reduce((pre, v) => {
        pre.add(v.dinner_type)
        return pre
    }, new Set())]
}
export default addWindowData