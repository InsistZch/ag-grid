/** @odoo-module **/
import index from '../../../data/index.js'
import customCells from './ag-grid-customCells.js';
import {duibi,headHookLimit} from './ag-grid-row.js';
import preserved_dishes from './preserved_dishes.js';
// 定义列
const col = () => {
    const col = [
        // {
        //     headerName: '',//选择列头部显示的文字，可以为空
        //     checkboxSelection: true,//设置为ture显示为复选框
        //     headerCheckboxSelection: true, //表头是否也显示复选框，全选反选用
        //     'pinned': 'left', //固定再左边
        //     width: 30, //列的宽度
        //     showDisabledCheckboxes: true,
        //     editable:false,
        //     menuTabs:[]
        // },

        {
            headerName:"",
            field:'cl1',
            hide:true,
            rowGroup:true,
            menuTabs:[],
            cellRenderer: 'agGroupCellRenderer',
            showRowGroup: true,
        },
        {
            headerName:'类别',
            field:'type',
            minWidth:80,
            editable:false,
            pinned: 'left',
            filter:true,
            menuTabs:[],
            checkboxSelection: true, //设置为true显示为复选框
            headerCheckboxSelection: true, //表头是否也显示复选框，全选反选用
            valueGetter: params => {
                // console.log(params)
                let specialMealID = params.data.specialMealID != undefined ? params.data.specialMealID : ""
                return params.data.type + specialMealID
            }
        },
        {
            headerName:'菜品',
            field:'dish',
            minWidth: 82,
            // cellEditor: "agSelectCellEditor",
            // cellEditorParams:{values:dish_dropdown()},
            cellEditor:customCells,
            pinned: 'left',
            filter:true,
            menuTabs:[],
            cellRenderer: params => {
            //    console.log(params)
               if(params.value == "" || params.value == undefined) return ""
                // 其他 冻品 鲜肉 半成品
                let color = "",title = ""
                for (const dish_key of index.dish_key) {
                    if(params.data.dish_key_id.id == dish_key.id){
                        switch (dish_key.material_tag) {
                            case '其他':
                                color = "black"
                                title = ""
                                break;
                            case '冻品': 
                                color = "#9a870a"
                                title = "冻品"
                                break;
                            case '鲜肉': 
                                color = "green"
                                title = "鲜肉"
                                break;
                            case '半成品':
                                color = "orange"
                                title = "半成品"
                                break;
                            default:
                                color = "red"
                                title = "该餐品无分类"
                                break;
                        }
                        break
                    }
                }
                return `<span style="color:${color}" title="${title}">${params.value}</span>`
            }
        },
        {
            headerName:'份数',
            field:'Copies',
            // minWidth:10,
            minWidth: 48,
            editable:false,
            pinned: 'left',
            menuTabs:[],
            sortable: true,
        },
    ]
    // 确定列数
    let count = 0;
    const newCus_loc = index.cus_loc.sort((a, b) => a.no - b.no)
    for (const item of newCus_loc) {
        const obj = {}
        obj['headerName'] = item['name']
        obj['field'] = `${item['id']}`
        obj['minWidth'] = 50
        obj['columnGroupShow'] = count++ < 10 ? 'closed' : 'open'
        obj['valueParser'] = params => Number(params.newValue)
        obj['menuTabs'] = []
        obj['cellRenderer'] = (params) => {
            // console.log(params)
            if(params.data.edit == false) return params.value
            if(isNaN(params.value) || params.value == null){
                return 0
            }
            params.value = Math.ceil(params.value)
            // console.log(1)
            // console.log(params)
            // userId dinner_type
            let hook = headHookLimit(params.colDef.field, params.data.dinner_type, params.data.type)
            // user_id,dish_id
            let d = duibi(params.colDef.field, params.data.dish_key_id.id, params.data.dinner_type)
            let value = ""
            if(params.value > hook){
                value = `<span style="color:red;" title="超出厨师长限制 限制为：${hook}">${params.value}</span>`
            }else if(d){
                value = params.value
            }
            if(!d[1]){
                value =  `<span style="color:red;" title="客户禁忌,客户不吃${d[0]}">${params.value}</span>`
            }
            return value
        }
        col.push(obj)
    }
    col.push({
        headerName:'配量汇总',
        field:"whole",
        pinned: 'right',
        menuTabs:[],
        minWidth:350,
        cellRenderer:(params) => {
            if(params.data.edit == false) return params.value
            //  主要功能为
            // 第一、找到所有表内有的配料信息
            // 第二、找到所有相同的配料信息，并返回标红
            // console.log(1)
            let data = [];
            // console.log(params)
            let {value, data:{dish_key_id:{material_item}}} = params
            // console.log(105, params)
            if(value == '' || value == null) return value
            // console.log(typeof value, value)
            value = value.replace(`/<span style="color:red;">/g`,'')
            value = value.replace('/</span>/g','')
            
            if(value[value.length - 1] != " ") value += ' '
            // console.log(108, material_item)

            
            // 找到目前所有材料的数据
            const arr = material_item.reduce((pre,v) => {
                let current = value.split(" ")

                for (const cv of current) {
                    let c = cv.match(/([\u4e00-\u9fa5a-zA-Z]+)/)
                    if(c == null) break
                    let d = v.name.split('-')[0]
                    // console.log(c[0], d + v.dish_process_category_name)
                    
                    if(c[0] == d || c[0] == d + v.dish_process_category_name){
                        
                        // console.log(127, v)
                        pre.push(v)
                        break
                    }
                }
                return pre
            }, [])
            params.data.dish_key_id.material_item = arr
            // console.log(params.data.dish_key_id.material_item)

            // 找到当前列的全部数据
            params.api.forEachNode((e) => {
                if(e.data == null) return
                if(e.data.dinner_type == params.data.dinner_type && params.rowIndex != e.rowIndex ){
                    // data.push(e.data['dish_key_id']['material_item'])
                    // console.log(e.data.whole, value)
                    // console.log(e.data.whole.length, value.length)
                    // console.log(e.data)
                    if(e.data.edit == undefined){
                        data.push(...e.data['dish_key_id']['material_item'])
                    }
                }
            })
            // console.log(data)
            // for (const v of value.trim().split(" ")) {
            //     let v1 = v.match(/([\u4e00-\u9fa5a-zA-Z]+)/)
            //     if(v1 == null) continue;
            //     for (const material_item of material_item) {
            //         // if(material_item)
            //     }
            // }
            // console.log(1, data)
            // console.log(2, material_item)
            // 找到相同则标红
            for (const mt1 of material_item) {
                for (const d1 of data) {
                    if(mt1.id == d1.id){
                        let str = ""
                        for (const material_item of index.material_item) {
                            if(material_item.id == d1.id){
                                str = material_item.name.split('-')[0]
                                break
                            }
                        }
                        value = value.replace(`${str}`,`<span style="color:red;">${str}</span>`)
                    }
                }
            }
            // 确认数据一致
            const mt = material_item.reduce((pre, v) => {
                if(params.data.whole.includes(v.name.split('-')[0])){
                    pre.push(v)
                }
                return pre
            }, [])
            params.data.dish_key_id.material_item = mt
            // params.data.dish_key_id.material_item = arr
            // console.log(params)
            return value
        }
    })


    col.push({
        headerName:'',
        field:'save',
        pinned:'right',
        menuTabs:[],
        editable:false,
        minWidth: 25,
        cellRenderer: params => {
            if(params.data.edit == false) return params.value
            const createImg = document.createElement('img')
            createImg.title = '保存本列餐品'
            // createImg.src = '/gmm/static/src/img/saveData.png' // 这个不用再改
            createImg.src = './public/img/saveData.png'
            createImg.style.cssText = `
            height:15px;
            width:15px;
            position: absolute;
            left:50%;
            top:50%;
            transform: translate(-50%, -50%);
            cursor: pointer;
            `
            createImg.onclick = () => {
                if (!params.data.dish_key_id.id) {
                    alert('菜品不存在!!!')
                    return;
                }
                const {dish_key_id:{material_item}} = params.data

                const mt = material_item.reduce((pre, v) => {
                    const judeg = pre.every(v2 => v2.id != v.id)
                    if(params.data.whole.includes(v.name.split('-')[0]) && judeg){
                        pre.push(v)
                    }
                    return pre
                }, [])
                params.data.dish_key_id.material_item = mt
                // 保存数据
                preserved_dishes.set(params.data.dish_key_id.id,{
                    dish_key_id: params.data.dish_key_id.id,
                    dish_key_name: params.data.dish,
                    dinner_type: params.data.dinner_type,
                    whole: params.data.whole,
                    material_item: [...params.data.dish_key_id.material_item]
                })
                console.log(params.data)

                if (params.context && params.context.owl_widget) {
                    params.context.owl_widget.Save_Row_Data(params.data)
                }
            }
            return createImg
        }
    })
    return col
}


export default col