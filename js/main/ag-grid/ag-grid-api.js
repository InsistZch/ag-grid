/** @odoo-module **/
import agGridRow from "./ag-grid-row.js"
import index from '../../../data/index.js'
import customFromDom from './customFrom.js'
import saveData from "../saveData/index.js"
import { add_dish_bom_id, add_material_id } from "../tool.js"
import specialMeal from "./specialMeal.js"


// 添加对应数据
const addData = (e, i, el) => {
    el.innerHTML += 
    i == 0 ? `<option value="${e.id}" selected>${e.name}</option>`:
    `<option value="${e.id}">${e.name}</option>`
}
// 添加material_item数据
// const addMaterial_item = (params,obj) => {
//     params.data.dish_key_id.material_item.push({
//         ...obj
//     })
// }


// cellRenderer > onCellValueChanged
const onCellValueChanged = (e,gridOptions) => {
    // console.log(e)
    if(e.colDef.headerName != '菜品' && e.colDef.headerName != '配量汇总'){
        if(e.newValue == undefined || e.newValue == null) e.newValue = 0
        if(isNaN(e.newValue)) {
            e.data[`${e.colDef.field}`] = e.oldValue
            gridOptions.api.refreshCells({force:true})
            return
            // gridOptions.api.refreshCells({force:true})
        }
        if(parseInt(e.newValue) < 0){
            e.newValue = 0
            e.data[`${e.colDef.field}`] = 0
        }
        // console.log(e.newValue)
        // const scale = (parseInt(e.newValue) - parseInt(e.oldValue)) / e.data['Copies']
        const Copies =  e.data['Copies'] + (parseInt(e.newValue) - parseInt(e.oldValue))
        
        // 当前数据 
        const countMaterialData = agGridRow.countMaterialData({
            material_items: e.data['dish_key_id']['material_item'],
            dish_key_id: e.data['dish_key_id']['id'],
            oldCopies: e.data['Copies'],
            newCopies: Copies
        })
        e.data['Copies'] = Copies
        e.data['whole'] = countMaterialData[0]
        e.data['dish_key_id']['material_item'] = countMaterialData[1]
        gridOptions.api.refreshCells({force:true})
    }else if(e.colDef.headerName == '菜品'){
        console.log('111')
        if(e.newValue == null || e.newValue == undefined || e.newValue.trim() == ""){
            e.data[`${e.colDef.field}`] = e.oldValue
        }
        for (const item of index.dish_key) {
            if(item.name == e.newValue){
                // console.log(item, e.data)
                // console.log(item.dish_top_category_id != e.data.dish_key_id.dish_top_category_id)
                // console.log(item.name != e.data.dish)
                if(item.dish_top_category_id != e.data.dish_key_id.dish_top_category_id && item.name != e.oldValue){
                    // console.log(item, e.data)
                    e.data[`${e.colDef.field}`] = e.oldValue
                }
            }
        }
        console.log(e.newValue, e.oldValue, e.data[`${e.colDef.field}`])
        const arr = ["早餐", "中餐", "晚餐", "夜餐"]
        for (const item of arr) {
            if(e.newValue == item){
                e.data[`${e.colDef.field}`] = e.oldValue
            }
        }
        gridOptions.api.refreshCells({force:true})
    }else if(e.colDef.headerName == '配量汇总'){
        let d1 = e.newValue
        // console.log(e)
        // // let colData = e.columnApi.getColumn('whole')
        // // console.log(e.columnApi.getColumnState())
        // e.api.forEachNode((node,index) => {
        //     console.log(node.data, index)
        // })
        if(e.newValue == null || d1.trim() == "" ){
            e.data.whole = ""
            e.data.dish_key_id.material_item = []
            return
        }
        if(e.newValue.trim() == e.oldValue.trim()) return 
        if(d1[d1.length - 1] != " ") d1 += ' '
        // console.log(e)
        // 可能为单位，也可能为新增数据
        // 数据可能存在，也可能不存在

        // 可能修改多个地方        
        
        // 分割 配量汇总 字符串
        // console.log(d1)
        let material_data = d1.split(' ')
        material_data: for (const material of material_data) {
            let isTrue = true
            if (material.trim() == "") continue
            
            // 鸭肉片23.58斤 鸭肉片 23.58 斤
            let d = material.match(/([\u4e00-\u9fa5a-zA-Z]+)?(\d*\.?\d+?)?([\u4e00-\u9fa5a-zA-Z]+)?/)
            // console.log(d)
             
            // 如果输入的不是汉字或者字母 回滚
            if(d == null){
                e.data[`${e.colDef.field}`] = e.oldValue
                gridOptions.api.refreshCells({force:true})
                break
            }

            // 当找不到用户输入的单位,则回滚
            
            const judeg = index.material_purchase_unit_category.every(v => v.name != d[3])
            // console.log(d)
            if(judeg && d[3] != undefined && d[3].trim() != "" ){
                // console.log(d)
                e.data[`${e.colDef.field}`] = e.oldValue
                gridOptions.api.refreshCells({force:true})
                break
            }

            // 发现两个一样的菜品,回滚
            // console.log(e.newValue.split(d[0]))
            // 大肉片与大肉片片为一种食材
            if(e.data != undefined){
                const arr = e.data['dish_key_id']['material_item'].map(v => v.name.split('-')[0])
                for (const item of arr) {
                    if(e.newValue.split(item).length > 2){
                        e.data[`${e.colDef.field}`] = e.oldValue
                        gridOptions.api.refreshCells({force:true})
                        break material_data
                    }
                }
            }
            // console.log(e)
            const data_name = d[1]
            // 先判断材料名称中是否含有切片方式
            // 再看切片方式是否在最后
            let dpc = index.dish_process_category.sort((a,b) => b.name.length - a.name.length)
            // console.log(dpc)
            dpc: for (const dish_process_category of dpc) {
                let name = dish_process_category.name

                // let isJudeg = true
                for (const material_item of index.material_item) {
                    let mV =  material_item.name.split('-')[0]
                    // console.log(mV, d[1], name)
                    // 没有切片方式
                    // 查看d[1]是否存在表中切配方式
                    // 查看d[1]是否存在该配料
                    // 小米 小米辣
                    // data_name => 
                    // d[1] => 餐品名称 || 餐品名称+切片方式
                    // name 切片方式
                    // mV 表中餐品名称
                    // 猪心片片  猪心 
                    if(d[1].includes(name) && d[1].includes(mV) && mV.trim() != ""){
                        // console.log(d[1], name, mV)
                        let judeg = true
                        // 细丝 
                        // 丝 细丝
                        // 需要判断
                        for(let i = 1; i <= name.length; i ++){
                            if(d[1][d[1].length - i] != name[name.length - i]){
                                judeg = false
                            }
                        }
                        // console.log(judeg)
                        if(judeg){
                            // 去掉切片方式
                            // console.log(mV, d[1])
                            if(mV == d[1]){
                                // console.log(mV, d[1])
                                break dpc
                            }else{
                                // d[1] = d[1].split(name)[0]
                                d[1] = d[1].substr(0, d[1].length - name.length)
                            }
                            // const judeg = 
                            console.log('1')
                            if(d[1] == data_name){
                                e.data.dish_key_id.material_item.push({
                                    ...material_item,
                                    dish_process_category_name: name,
                                })
                            }
                            break dpc
                        }
                        // console.log(d[1])
                        break
                    }else if(data_name == mV && mV.trim() != ""){
                        // 
                        const value = data_name.split(mV)[1]
                        // 只要有有一个等于就返回true
                        // const judeg = index.dish_process_category.every(v => v.name != value && value != undefined)
                        // console.log(d[1], mV, value, judeg)
                        
                        if(!judeg){
                            console.log('2')
                            e.data.dish_key_id.material_item.push({
                                ...material_item,
                                dish_process_category_name: "",
                                unit_name:d[3],
                                dish_qty:d[2],
                            })
                            // console.log(e.data.dish_key_id.material_item)
                            break dpc
                        }
                    }
                    
                }
            }
            console.log(e.data.dish_key_id.material_item)
           

            //  去掉所有重复的数据
            e.data.dish_key_id.material_item = e.data.dish_key_id.material_item.reduce((pre,v) => {
                const judeg = [...pre].every(v2 => v2.id != v.id)
                if(judeg){
                    if(d[1] == v.name.split('-')[0]){
                        const value = data_name.split(d[1])[1]
                        pre.push({
                            ...v,
                            unit_name:d[3],
                            dish_qty:d[2],
                            dish_process_category_name: value
                        })
                    }else{
                        pre.push(v)
                    }
                    
                }
                return pre
            },[])
            // console.log(e.data.dish_key_id.material_item)
            // console.log(d)
            // console.log('111')
            // 查找 菜品配量是否存在

            // 材料名称-切片方式-数量-单位

            // 先判断该配料是否存在 如果存在则判断是否有切法，单位
            // 如果不存在 则创建配料，检查该配料是否有切法 单位

            // 确认该配料是否存在
            for (const material_item of index.material_item) {
                let name = material_item.name.split('-')[0]
                // console.log(material_item, name)
                if(name == d[1]){
                    // console.log(material_item)
                    //  确认是否输入数量，单位
                    console.log(d, d[2], [3])
                    if(d[2] == undefined || d[3] == undefined){
                        // 查找材料名称 切片方式 数量 单位
                        let dishes_name = document.querySelector('#write_Side_dishes_name')
                        let dishes_section = document.querySelector('#write_Side_dishes_section')
                        let dishes_quantity = document.querySelector('#write_Side_dishes_quantity')
                        let dishes_company = document.querySelector('#write_Side_dishes_company')
                        let dishes_category = document.querySelector('#write_Side_dishes_category')

                        console.log(name, material_item)
                        // 定义变量
                        // 查看是否带切片方式
                        let section_str = d[1] != data_name ? data_name.split(d[1])[1] : "无"
                        const m = index.material_item.filter(v => v.name.split('-')[0] == d[1])
                        //写入自定义dom操作 配菜
                        customFromDom({
                            parent:"#write_Side_dishes",
                            cancel:["#write_Side_dishes_cancel1","#write_Side_dishes_cancel2"],
                            sure:"#write_Side_dishes_sure",
                            deleteData: ["#write_Side_dishes_section","#write_Side_dishes_company", "#write_Side_dishes_category"],
                            initFun:() => {
                                // 插入对应数据
                                dishes_name.value = d[1]
                                index.dish_process_category.forEach(v => {
                                    dishes_section.innerHTML += v.name == section_str ? 
                                    `<option value="${v.id}" selected>${v.name}</option>`:
                                    `<option value="${v.id}">${v.name}</option>`
                                })

                                index.material_purchase_unit_category.forEach((v ,i) => addData(v, i, dishes_company))

                                
                                for (const m_item of m) {
                                    dishes_category.innerHTML += `
                                    <option value="${m_item.id}">${m_item.form}</option>`
                                }

                                dishes_quantity.value = d[2] != undefined && d[2].trim() != "" ? d[2] : 0

                                console.log(m, d[1])
                            },
                            cancelFun:() => {
                                e.data[`${e.colDef.field}`] = e.oldValue
                                gridOptions.api.refreshCells({force:true})
                            },
                            sureFun:() => {
                                let section = dishes_section.querySelector(`option[value="${dishes_section.value}"]`)
                                section = section.innerText == "无" ? "" : section.innerText
                                
                                let number = dishes_quantity.value.trim() == "" ? 0 : dishes_quantity.value

                                let compamy = dishes_company.querySelector(`option[value="${dishes_company.value}"]`).innerText
                                // console.log(compamy)
                                for (const m_item of m) {
                                    if(m_item.id == dishes_category.value){
                                        e.data.dish_key_id.material_item.push({
                                            ...m_item,
                                            dish_process_category_name:section,
                                            unit_name: compamy,
                                            dish_qty: number
                                        })
                                        break
                                    }
                                }

                                // 替换原数据
                                let str = ""
                                console.log(e.data[`${e.colDef.field}`].split(' '))
                                for (let item of e.data[`${e.colDef.field}`].split(' ')) {
                                    const dish_str = dishes_name.value + section + number + compamy + " "
                                    if(dish_str.includes(item.replace(/\d+(\.\d+)?/, number))){
                                        str += dish_str
                                        continue
                                    }
                                    str += item + " "
                                }
                                console.log(str)
                                // e.data[`${e.colDef.field}`] = e.data[`${e.colDef.field}`].replace(`/${data_name}(\d+)?(.+)? /`, )
                                e.data[`${e.colDef.field}`] = str
                                gridOptions.api.refreshCells({force:true})
                            }
                        })
                    }
                    
                    isTrue = false
                    break
                }
            }
            if(isTrue){
                // 创建配菜
                let isCreate = confirm(`尚无${d[1]}食品，是否创建？`)
                if(isCreate){
                    // 操作自定义modal
                    const customName = document.querySelector('#customName')

                    // 添加可选数据
                    let customFrom = document.querySelector('#customFrom')
                    let customPhase = document.querySelector('#customPhase')
                    
                    
                    let customSection = document.querySelector('#customSection')
                    index.dish_process_category.forEach((e,i) => addData(e, i, customSection));

                    let customCompany = document.querySelector('#customCompany')
                    index.material_purchase_unit_category.forEach((e,i) => addData(e, i, customCompany))

                    
                    customName.value = d[1]
                    // 创建食品
                    customFromDom({
                        parent:"#material_modal",
                        cancel:["#material_modal_cancel1","#material_modal_cancel2"],
                        sure:"#material_modal_sure",
                        deleteData: ["#customCompany","#customSection"],
                        cancelFun:() => {
                            e.data[`${e.colDef.field}`] = e.oldValue
                            gridOptions.api.refreshCells({force:true})
                        },
                        sureFun:(_parent) => {
                            console.log(customPhase, customPhase.value)
                            const customPhaseValue = customPhase.querySelector(`option[value="${customPhase.value}"]`).innerText
                            let name = `${customName.value}-${customFrom.value}-${customPhaseValue}`
                            
                            let m_id = add_material_id()
                            
                            //  添加数据
                            const obj1 = {
                                id: m_id,
                                name,
                                form: customFrom.value,
                                phase: customPhase.value
                            }
                            // 记载数据
                            console.log(obj1)
                            saveData.new_material_item_list.push(obj1)
                            index.material_item.push(obj1)
                            // console.log(e)
                            const obj = {
                                id: add_dish_bom_id(),
                                material_id: m_id,
                                dish_key_id: e.data.dish_key_id['id'],
                                process_id: customSection.value,
                                gbom_qty_high: 0,
                                gbom_qty_mid: 0,
                                gbom_qty_low: 0,
                                unit_id: customCompany.value
                            }
                            index.dish_bom.push(obj)
                            console.log(obj)
                            // saveData.new_or_update_dish_bom_list.new.push(obj)
                            let dish_process_category_name = customCompany.querySelector(`option[value="${customCompany.value}"]`).innerText
                            let customSectionValue = customSection.querySelector(`option[value="${customSection.value}"]`).innerText
                            console.log(customSectionValue, d)
                            customSectionValue = customSectionValue == "无" || customSectionValue == d[2] ? "" : customSectionValue
                            e.data.dish_key_id.material_item.push({
                                ...obj1,
                                dish_process_category_name: customSectionValue,
                                unit_name: dish_process_category_name,
                                dish_qty: 0,
                            })
                            
                            const str = customName.value + customSectionValue + 0 + dish_process_category_name
                            // e.data[`${e.colDef.field}`] = e.data[`${e.colDef.field}`].replace(data_name, str)
                            // e.data
                            const strs = e.data[`${e.colDef.field}`].split(' ')
                            for (const s_key in strs) {
                                if(strs[s_key].includes(data_name)){
                                    strs[s_key] = str
                                }
                            }
                            e.data[`${e.colDef.field}`] = strs.join(' ')
                            gridOptions.api.refreshCells({force:true})
                        }
                        })
                }else{
                    e.data[`${e.colDef.field}`] = e.oldValue
                }
            }
            gridOptions.api.refreshCells({force:true})
        }
        // gridOptions.api.refreshCells({force:true})
    }
}

const getContextMenuItems = (params, gridOptions) => {
    if(params.node.data == undefined) return
    // console.log(params)
    const result = [
        {
            name:'向下新增一行',
            action:() => {
                
                const data = [{}]
                for (const key in params.node.data) {
                    if(!isNaN(key)){
                        data[0][`${key}`] = 0
                    }
                }
                
                data[0]['Copies'] = 0
                data[0]['cl1'] = params.node.data['cl1']
                
                data[0]['dish'] = ""
                
                data[0]['dinner_type'] = params.node.data['dinner_type']
                data[0]['whole'] = ""
                customFromDom({
                    parent:"#Meal",
                    deleteData:["#MealCategory"],
                    cancel:["#Meal_cancel1", "#Meal_cancel2"],
                    sure:"#Meal_sure",
                    initFun(_parent){
                        let MealCategory= _parent.querySelector('#MealCategory')
                        index.dish_top_category.forEach(v => {
                            MealCategory.innerHTML += v.name_cn == params.node.data['type'] ? 
                            `<option value="${v.id}" selected>${v.name_cn}</option>` :
                            `<option value="${v.id}">${v.name_cn}</option>`
                        })
                    },
                    sureFun(_parent){
                        const MealCategory = _parent.querySelector('#MealCategory')
                        const value = MealCategory.querySelector(`option[value="${MealCategory.value}"]`).innerText
                        data[0]['type'] = value
                        if(specialMeal.index <= specialMeal.colors.length && value == "特色"){
                            data[0]['specialMealID'] = specialMeal.index
                            data[0]['specialMealColor'] = specialMeal.colors[specialMeal.index - 1]
                            specialMeal.index ++
                        }
                        data[0]['dish_key_id'] = {
                            dish_top_category_id: MealCategory.value,
                            material_item:[]
                        }
                        // const id = parseInt(gridOptions.api.getDisplayedRowAtIndex(params.node.rowIndex).rowIndex) + 1
                        console.log(params)
                        gridOptions.api.expandAll()
                        gridOptions.api.applyTransaction({ add: data, addIndex: params.node.rowIndex + 1})
                        // gridOptions.api.forEachNode(node => {
                        //     if(node.key != params.node.data.cl1){
                        //         console.log(node, params)
                        //         node.setExpanded(false)
                        //     }
                        // });
                    }
                })
                
            }
        },
        {
            name:'新增特色餐',
            action: () => {
                if(specialMeal.index <= specialMeal.colors.length){
                    const data = [{}]
                    for (const key in params.node.data) {
                        if(!isNaN(key)){
                            data[0][`${key}`] = 0
                        }
                    }
                    const {id} = index.dish_top_category.find(v => v.name_cn == "特色")
                    data[0]['Copies'] = 0
                    data[0]['cl1'] = params.node.data['cl1']
                    data[0]['dinner_type'] = params.node.data['dinner_type']
                    data[0]['dish'] = ""
                    data[0]['dish_key_id'] = {
                        dish_top_category_id: id,
                        material_item:[]
                    }
                    data[0]['type'] = "特色"
                    data[0]['specialMealID'] = specialMeal.index
                    data[0]['specialMealColor'] = specialMeal.colors[specialMeal.index - 1]
                    data[0]['whole'] = ""
                    specialMeal.index += 1
                    gridOptions.api.applyTransaction({ add: data})
                }
                
            }
        },
        {
            name:'新增特色餐配菜',
            action:() => {
                if(specialMeal.index == 1) return
                const data = [{}]
                for (const key in params.node.data) {
                    if(!isNaN(key)){
                        data[0][`${key}`] = 0
                    }
                }
                
                data[0]['Copies'] = 0
                data[0]['cl1'] = params.node.data['cl1']
                
                data[0]['dish'] = ""
                
                data[0]['dinner_type'] = params.node.data['dinner_type']
                data[0]['whole'] = ""
                customFromDom({
                    parent:"#SpecialMeal",
                    deleteData:["#SpecialMealCategory"],
                    cancel:["#SpecialMealCategory_cancel1", "#SpecialMealCategory_cancel2"],
                    sure:"#SpecialMealCategorys_sure",
                    initFun(_parent){
                        let SpecialMealCategory = _parent.querySelector('#SpecialMealCategory')
                        let MealCategory = _parent.querySelector('#MealCategory22')
                        for (let index = 1; index < specialMeal.index; index++) {
                            SpecialMealCategory.innerHTML += `
                            <option value="${index}">特色${index}</option>`
                        }
                        console.log(_parent, MealCategory)
                        index.dish_top_category.forEach(v => {
                            if(v.name_cn == "特色") return
                            MealCategory.innerHTML += v.name_cn == params.node.data['type'] ? 
                            `<option value="${v.id}" selected>${v.name_cn}</option>` :
                            `<option value="${v.id}">${v.name_cn}</option>`
                        })
                    },
                    sureFun(_parent){
                        const SpecialMealCategory = _parent.querySelector('#SpecialMealCategory')
                        const MealCategory = _parent.querySelector('#MealCategory22')
                        const value = MealCategory.querySelector(`option[value="${MealCategory.value}"]`)

                        data[0]['dish_key_id'] = {
                            dish_top_category_id: MealCategory.value,
                            material_item:[]
                        }
                        data[0]['type'] = value.innerText
                        data[0]['specialMealColor'] = specialMeal.colors[SpecialMealCategory.value - 1]
                        // console.log(data)

                        gridOptions.api.expandAll()
                        gridOptions.api.applyTransaction({ add: data, addIndex: params.node.rowIndex + 1})
                    }
                })
            }
        },
        {
            name:'删除本行',
            action:() => {
                const selRows = gridOptions.api.getSelectedRows();
                if(selRows.length == 0) return alert("请选中本行")
                gridOptions.api.applyTransaction({ remove: selRows });
            }
        },
        // ...params.defaultItems
    ]
    return result
}

const getRowStyle = params => {
    if(params.data != undefined){
        if(params.data.specialMealColor != undefined){
            return {
                // backgroundColor: params.data.specialMealColor,
                borderBottom: `solid 2px ${params.data.specialMealColor}`
                // textDecoration: "underline 2px #000"
                // textDecoration: `underline 2px ${params.data.SpecialMealCategory} !important`,
                // color: "#ddd",
            }
        }else if(params.data.type == "餐标"){
            return {
                backgroundColor:"#bfbfbf33",
                color: "#666",
                fontStyle: "italic",
                fontWeight: "600",
            }
        }
    }
}

const onCellClicked = params => {
    if(params.colDef.field == "dish"){
        // console.log(params)
        const { dish_family_id } = index.dish_key.find(v => v.id == params.data.dish_key_id.id)
        const arr = index.dish_family.filter(v => v.id == dish_family_id)
        console.log(arr)
    }
    
}
// const onPasteStart = params => {
//     console.log(params)
// }

export default {
    onCellValueChanged, getContextMenuItems, getRowStyle, onCellClicked
}