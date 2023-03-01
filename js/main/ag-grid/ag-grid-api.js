/** @odoo-module **/
import agGridRow from "./ag-grid-row.js"
import index from '../../../data/index.js'
import customFromDom from './customFrom.js'
import saveData from "../saveData/index.js"
import { add_dish_bom_id, add_material_id, add_material_item_bom_unit_ratio_id } from "../tool.js"
import specialMeal from "./specialMeal.js"
import {Restrictions} from './ag-grid-col.js'
import { copiesNumber } from './../otherApi/index.js'
import { countMaterialData, cost_proportion } from './ag-grid-row.js'
import mealcopies from './special_fast_data.js'
import {dataIndex} from './GroupRowInnerRenderer.js'
import init_mp from "./meal_price.js"
// import 

// 添加对应数据
const addData = (e, i, el) => {
    el.innerHTML += 
    i == 0 ? `<option value="${e.id}" selected>${e.name}</option>`:
    `<option value="${e.id}">${e.name}</option>`
}
// 添加material_item中的数据
// 计算表单中份数，成本
// 判断当前数值是否大于限制数字，如果超过，则按照限制的最大数字变动
const calculateCopies = (data) => {
    // 初始化份数数据
    let Copies = 0
    // 找到所有客户
    const cus_locs = Object.keys(data).filter(v => !isNaN(v))

    for (const c_item of cus_locs) {
        Copies += Number(data[c_item])
    }
    // console.log(Copies, data['Copies'])
    const d = countMaterialData({
        material_items: data['dish_key_id']['material_item'],
        dish_key_id: data['dish_key_id']['id'],
        oldCopies: data['Copies'],
        newCopies: Copies,
        update: data.update
    })
    data['Copies'] = Copies
    data['whole'] = d[0]
    data['dish_key_id']['material_item'] = d[1]
    // console.log(d[2])
    data['costPrice'] = d[2]
    return data
}

// cellRenderer > onCellValueChanged
const onCellValueChanged = (e,gridOptions) => {
    document.querySelector('#saveDataSpan').style.visibility = "visible"
    
    // console.log(e)
    if(e.colDef.headerName != '菜品' && e.colDef.headerName != '配量汇总' && e.colDef.headerName != "成本价"){
        if(e.newValue == undefined || e.newValue == null || String(e.newValue).trim() == "") {
            e.data[`${e.colDef.field}`] = 0
            e.newValue = 0
        }
        // console.log(e.newValue)
        if(isNaN(e.newValue)) {
            e.data[`${e.colDef.field}`] = e.oldValue
            gridOptions.api.refreshCells({force:true})
            return
            // gridOptions.api.refreshCells({force:true})
        }
        const meal_price = init_mp().find(v => v.cl1 == e.data.cl1)
        if(meal_price[e.colDef.field] == 0 || meal_price[e.colDef.field] == null){
            if(e.newValue != 0){
                let price = prompt("请输入餐标：")
                while(isNaN(price) || Number(price) <= 0){
                    if(price == null || price.trim() == ""){
                        e.data[`${e.colDef.field}`] = e.oldValue
                        break
                    }
                    price = prompt("请重新输入")
                }
            meal_price[e.colDef.field] = Number(price)
            }
        }

        if(parseInt(e.newValue) < 0){
            e.newValue = 0
            e.data[`${e.colDef.field}`] = 0
        }

        // console.log(e.newValue)
        // const scale = (parseInt(e.newValue) - parseInt(e.oldValue)) / e.data['Copies']
        const Copies =  e.data['Copies'] + (copiesNumber(Math.ceil(e.newValue)) - parseInt(e.oldValue))
        // 进入该if只有两种可能
        // 第一，改变了快餐
        // 第二，改变了特色
        // 增加比例
        const ratio = ( ( copiesNumber(Math.ceil(e.newValue)) - parseInt(e.oldValue)) / parseInt(e.oldValue == 0 ? 1 : e.oldValue))
        // console.log(e.newValue, e.oldValue, ratio)
        // 是配置 并且不固定
        if(e.data.configure && !e.data.fixed){
            e.data['Copies'] = Copies
            e.api.forEachNode(v => {
                // 如果没有数据或者餐品类别不同，直接return
                if(v.data == undefined || v.data.cl1 != e.data.cl1) return
                if(v.data.type == "%" || v.data.type == "餐标") return
                // console.log(v)
                // 改变当前列所有符合条件的值
                // 计算改变比率
                v.data[`${e.colDef.field}`] = copiesNumber(Number(v.data[`${e.colDef.field}`] ))
                if(e.data.type == "快餐"){
                    // 当specialMealID有值时，表示类型为特餐
                    if(v.data.specialMealID != null || v.data.specialMealColor != null || v.data.type == "快餐" || v.data.type == "特色") return
                    let value = copiesNumber(Math.ceil(v.data[`${e.colDef.field}`] + (v.data[`${e.colDef.field}`] * ratio)))
                    if(value > e.newValue){
                        v.data[`${e.colDef.field}`] = e.newValue
                    }else{
                        v.data[`${e.colDef.field}`] = value
                    }
                    
                    v.data = {
                        ...calculateCopies(v.data)
                    }

                    
                }else{
                    
                    if(v.data.specialMealColor == null || v.data.type == "快餐") return
                    if(v.data.specialMealColor == null && v.data.type == "特色") return
                    // console.log(111)
                    // console.log(Math.ceil( v.data[`${e.colDef.field}`] + (v.data[`${e.colDef.field}`] * ratio) ))
                    let value = copiesNumber(Math.ceil(v.data[`${e.colDef.field}`] + (v.data[`${e.colDef.field}`] * ratio)))
                    if(value > e.newValue){
                        v.data[`${e.colDef.field}`] = e.newValue
                    }else{
                        v.data[`${e.colDef.field}`] = value
                    }
                    v.data = {
                        ...calculateCopies(v.data)
                    }
                }

            })
        }else{
            e.data[`${e.colDef.field}`] = copiesNumber(e.data[`${e.colDef.field}`])
            console.log(e.data, Copies)
            const countMaterialData = agGridRow.countMaterialData({
                material_items: e.data['dish_key_id']['material_item'],
                dish_key_id: e.data['dish_key_id']['id'],
                oldCopies: e.data['Copies'],
                newCopies: Copies,
                update: e.data.update
            })
            console.log(countMaterialData, Copies)
            e.data['Copies'] = Copies
            e.data['whole'] = countMaterialData[0]
            e.data['dish_key_id']['material_item'] = countMaterialData[1]
            e.data['costPrice'] = isNaN(countMaterialData[2]) ? 0 : countMaterialData[2] 
        }
        // console.log(e.data)
        // 当前数据 101
        
        // gridOptions.api.refreshCells({force:true})
    }else if(e.colDef.headerName == '菜品'){
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
        // console.log(e.data)
        const arr = ["早餐", "中餐", "晚餐", "夜餐"]
        for (const item of arr) {
            if(e.newValue == item){
                e.data[`${e.colDef.field}`] = e.oldValue
            }
        }
        const d = countMaterialData({
            material_items: e.data.dish_key_id.material_item,
            dish_key_id: e.data.dish_key_id.id,
            oldCopies: e.data['Copies'],
            newCopies: e.data['Copies']
        })
        e.data['costPrice'] = d[2]
        gridOptions.api.refreshCells({force:true})
    }else if(e.colDef.headerName == '配量汇总'){
        e.data.update = true
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
                break
            }

            // 当找不到用户输入的单位,则回滚

            

            // 发现两个一样的菜品,回滚
            // console.log(e.newValue.split(d[0]))
            // 大肉片与大肉片片为一种食材
            if(e.data != undefined){
                const arr = e.data['dish_key_id']['material_item'].map(v => v.name.split('-')[0])
                for (const item of arr) {
                    if(e.newValue.split(item).length > 2){
                        e.data[`${e.colDef.field}`] = e.oldValue
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
            // dpc为切片方式
            const m_t = []
            dpc: for (const dish_process_category of dpc) {
                let name = dish_process_category.name == "无" ? "" : dish_process_category.name
                
                // let isJudeg = true
                // material_item => 食材列表
                for (const material_item of index.material_item) {
                    // 当前食材名称
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
                    // d[1]含有切片方式并且含有菜品名称
                    // name + mV == d[1]
                    if(mV + name == data_name && mV.trim() != ""){
                        // console.log(d[1], name, mV)
                        // let judeg = true
                        // for(let i = 1; i <= name.length; i ++){
                        //     if(d[1][d[1].length - i] != name[name.length - i]){
                        //         judeg = false
                        //     }
                        // }
                        
                        if(mV + name != d[1]) break
                        if(mV != d[1]){
                            d[1] = d[1].substr(0, d[1].length - name.length)
                        }
                        // 当数量或者单位不存在时 跳出循环
                        if(d[2] == undefined || d[3] == undefined) break dpc

                         // 获取单位
                            
                         const unit_category = index.material_purchase_unit_category.find(v => v.name == d[3])
                         // 获取切片方式
                         // console.log(d)
                         const pcValue = data_name.split(d[1])[1] == "" ? "无" : data_name.split(d[1])[1]

                         const process_category = index.dish_process_category.find(v => v.name == pcValue)
                        //  如果e.data.dish_key_id.material_item中有该信息，则替换该数据
                        // 如果没有则添加该数据
                        // 检查是否存在对应数据
                        const material_itemIndex = e.data.dish_key_id.material_item.findIndex(v => v.id == material_item.id)
                        if(material_itemIndex == -1){
                            e.data.dish_key_id.material_item.push({
                                ...material_item,
                                dish_process_category_name: name,
                                unit_name:d[3],
                                dish_qty:d[2],
                                material_id: material_item.id,
                                process_id: process_category.id,
                                unit_id: unit_category.id
                            })
                        }else{
                            // console.log(d)
                            e.data.dish_key_id.material_item[material_itemIndex] = {
                                ...material_item,
                                dish_process_category_name: name,
                                unit_name:d[3],
                                dish_qty:d[2],
                                material_id: material_item.id,
                                process_id: process_category.id,
                                unit_id: unit_category.id
                            } 
                        }
                         
                        break
                        // 
                    }       
                }
            }
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
                    // console.log(d, d[2], [3])
                    if(d[2] == undefined || d[3] == undefined){
                        // 查找材料名称 切片方式 数量 单位
                        let dishes_name = document.querySelector('#write_Side_dishes_name')
                        let dishes_section = document.querySelector('#write_Side_dishes_section')
                        let dishes_quantity = document.querySelector('#write_Side_dishes_quantity')
                        let dishes_company = document.querySelector('#write_Side_dishes_company')
                        let dishes_category = document.querySelector('#write_Side_dishes_category')

                        // console.log(name, material_item)
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

                                // console.log(m, d[1])
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
                                            dish_qty: number,
                                            // material_id: m_item.id,
                                            // process_id: process_category.id,
                                            // unit_id: unit_category.id
                                        })
                                        break
                                    }
                                }

                                // 替换原数据
                                let str = ""
                                // console.log(e.data[`${e.colDef.field}`].split(' '))
                                for (let item of e.data[`${e.colDef.field}`].split(' ')) {
                                    if(item.trim() == "") continue
                                    const dish_str = dishes_name.value + section + number + compamy + " "
                                    // console.log(dish_str)
                                    if(dish_str.includes(item.replace(/\d+(\.\d+)?/, number))){
                                        str += dish_str
                                        continue
                                    }
                                    str += item + " "
                                }
                                // console.log(str)
                                // e.data[`${e.colDef.field}`] = e.data[`${e.colDef.field}`].replace(`/${data_name}(\d+)?(.+)? /`, )
                                e.data[`${e.colDef.field}`] = str
                                gridOptions.api.refreshCells({force:true})
                                return true
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
                            // console.log(customPhase, customPhase.value)
                            const customPhaseValue = customPhase.querySelector(`option[value="${customPhase.value}"]`).innerText
                            let name = `${customName.value}-${customFrom.value}-${customPhaseValue}`
                            const customPrice = _parent.querySelector('#customPrice')
                            let m_id = add_material_id()
                            let r_id = add_material_item_bom_unit_ratio_id()
                            index.material_item_bom_unit_ratio.push({
                                id:r_id,
                                main_unit_bom_unit_ratio: 1,
                                material_id: m_id,
                                purchase_unit_id: customCompany.value,
                            })
                            //  添加数据
                            const obj1 = {
                                bom_unit_ratio_ids: [m_id],
                                id: m_id,
                                name,
                                form: customFrom.value,
                                phase: customPhase.value,
                                main_price: customPrice.value,
                                main_unit_id: customCompany.value,
                                material_price_alert: Number(customPrice.value) + 3,
                                repeat_tag: true,
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
                                main_unit_bom_unit_ratio: 1,
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
                            return true
                        },
                        initFun: (_parent) => {
                            const customPrice = _parent.querySelector('#customPrice')
                            const limitNumber = () => {
                                if(isNaN(customPrice.value) || Number(customPrice.value) < 1){
                                    customPrice.value = 1
                                }
                            }
                            customPrice.onkeydown = () => limitNumber()
                            customPrice.onwheel = () => limitNumber()
                        }
                    })
                }else{
                    e.data[`${e.colDef.field}`] = e.oldValue
                }
            }
            // 找到当前所有的单位id
            let bom_unit_ratio_ids = e.data.dish_key_id.material_item.find(v => {
                const vname = v.name.split('-')[0]
                // console.log(v)
                const ename = d[1].substr(0, d[1].length - (v.dish_process_category_name == undefined ? 0 : v.dish_process_category_name.length))
                // console.log(vname, ename, d[1], d[3])
                return vname == ename
            })
            console.log(bom_unit_ratio_ids)
            if(bom_unit_ratio_ids != null){
                bom_unit_ratio_ids = bom_unit_ratio_ids.bom_unit_ratio_ids
                // 找到所有的单位
                const units = []
                for (const id of bom_unit_ratio_ids) {
                    for (const unit_ratio of index.material_item_bom_unit_ratio) {
                        if(id == unit_ratio.id){
                            const {name} = index.material_purchase_unit_category.find(v => v.id == unit_ratio.purchase_unit_id)
                            units.push({
                                ...unit_ratio,
                                name
                            })
                        }
                    }
                }
                // console.log(units)
                // dish_process_category_name => 切片方式
                // unit_name => 单位
                // 判断whole字段中的单位是否全部 不等于 当前的已有的单位
                // 全部不等于返回 true
                const judeg = units.every(v => v.name != d[3])
                // console.log(d)
                if(judeg && d[3] != undefined && d[3].trim() != ""){
                    // console.log(d)
                    const unit_category = index.material_purchase_unit_category.find(v => v.name== d[3])
                    if(unit_category == undefined){
                        e.data[`${e.colDef.field}`] = e.oldValue
                        gridOptions.api.refreshCells({force:true})
                        break
                    }else{
                        // 添加食品单位
                        customFromDom({
                            parent:"#foodUnit",
                            cancel:["#foodUnit_cancel1", "#foodUnit_cancel2"],
                            sure: "#foodUnit_sure",
                            deleteData: [],
                            cancelFun(){
                                e.data[`${e.colDef.field}`] = e.oldValue
                                gridOptions.api.refreshCells({force:true})
                            },
                            sureFun(_parent){
                                const ratio = _parent.querySelector('#foodUnit_ratio')
                                const unitName = _parent.querySelector('#foodUnit_unitName')
                                if(ratio.value == null || ratio.value.trim() == ""){
                                    return false
                                }
                                const material_item = e.data.dish_key_id.material_item.find(v => {
                                    return v.name.split('-')[0] == d[1]
                                })
                                const id = add_material_item_bom_unit_ratio_id()
                                // 插入数据表内数据
                                const obj = {
                                    "id": id,
                                    "material_id": material_item.id, 
                                    "purchase_unit_id": unitName.getAttribute('unitID'), 
                                    "main_unit_bom_unit_ratio": Number(ratio.value)
                                }
                                // console.log(material_item, d[1])
                                index.material_item_bom_unit_ratio.push(obj)
                                // 插入存储表格
                                saveData.new_material_to_unit_ratio.push(obj)
                                // 插入展示表数据
                                for (const item of e.data.dish_key_id.material_item) {
                                    if(item.id == material_item.id){
                                        item['main_unit_bom_unit_ratio'] = Number(ratio.value)
                                        item['unit_id'] = unitName.value
                                        item['unit_name'] = unitNameValue.innerText
                                        item['bom_unit_ratio_ids'].push(id)
                                    }
                                }
                                const [,,costPrice] = countMaterialData({
                                    material_items: e.data.dish_key_id.material_item,
                                    dish_key_id: e.data.dish_key_id.id,
                                    oldCopies: e.data.Copies,
                                    newCopies: e.data.Copies,
                                    update: e.data.update
                                })
                                e.data.costPrice = costPrice
                                gridOptions.api.refreshCells({force:true})
                                return true
                            },
                            initFun(_parent){
                                const unitName = _parent.querySelector('#foodUnit_unitName')
                                const ratio = _parent.querySelector('#foodUnit_ratio')
                                ratio.value = 1
                                ratio.onkeyup = (e) => {
                                    if(isNaN(ratio.value) || parseFloat(ratio.value) < 0){
                                        ratio.value = 1
                                    }
                                    if(ratio.value.trim() == ""){
                                        ratio.focus()
                                    }
                                }
                                const unit_category = index.material_purchase_unit_category.find(v => v.name == d[3])
                                unitName.onkeyup = (e) => {
                                    console.log(e)
                                }
                                console.log(unit_category)
                                unitName.value = unit_category.name
                                unitName.setAttribute('unitID', unit_category.id)
                                // index.material_purchase_unit_category.forEach(v => {
                                //     unitName.innerHTML += v.name == d[3] ? 
                                // `<option value=${v.id} selected>${v.name}</option>` :
                                // `<option value=${v.id}>${v.name}</option>`
                                // })
                            },
                        })
                    }
                    
                }else{
                    // 切换转换比等信息
                    // if(d[3] == )
                    const m_key = e.data.dish_key_id.material_item.findIndex(v => {
                        const name = v.name.split('-')[0]
                        const category = v.dish_process_category_name == "无" ? "" : v.dish_process_category_name
                        return name + category == d[1]
                    })
                    if(m_key == -1) break
                    const m_item = e.data.dish_key_id.material_item
                    for (const unit of units) {
                        if(unit.name == d[3]){
                            m_item[m_key] = {
                                ...e.data.dish_key_id.material_item[m_key],
                                main_unit_bom_unit_ratio: unit.main_unit_bom_unit_ratio,
                                unit_id: unit.purchase_unit_id,
                                unit_name: unit.name
                            }
                            break
                        }
                    }
                    // console.log(m_item)
                    e.data.dish_key_id.material_item = [...m_item]
                }
            }
            
            // console.log(e.data)
            // 当配量汇总发生改变时，costPrice也需要刷新
            gridOptions.api.refreshCells({force:true})
        }
        const [,,costPrice] = countMaterialData({
            material_items: e.data.dish_key_id.material_item,
            dish_key_id: e.data.dish_key_id.id,
            oldCopies: e.data.Copies,
            newCopies: e.data.Copies,
            update: e.data.update
        })
        // console.log(e.data)
        e.data.costPrice = costPrice
        // e.data.dish_key_id.material_item = m_arr
        gridOptions.api.refreshCells({force:true})
        // gridOptions.api.refreshCells({force:true})
    }else if(e.colDef.headerName == "成本价"){
    }
    gridOptions.api.refreshCells({force:true})
    // console.log(gridOptions)
    // 表头比例设置
    const arr = []

    e.api.forEachNode(v => {
        if(v.data == null) return
        if(v.data.configure == true || v.data.edit == false) return
        arr.push(v.data)
    })

    
    const d = cost_proportion(arr, mealcopies())
    // console.log(gridOptions.rowData, mealcopies(), d)
    gridOptions.api.setPinnedTopRowData([d[2]])
    let cl1s = []
    gridOptions.api.forEachNode(v => {
        if(v.data == null) return
        if(v.data.type == "%"){
            cl1s.push(v.data.cl1)
        }
    })
    for (const c_item of cl1s) {
        // 成本所需数据
        const costs_data = []
        let dinner_type = ""
        gridOptions.api.forEachNode(v => {
            if(v.data == null) return
            if(v.data.configure == true || v.data.edit == false) return
            if(v.data.cl1 == c_item){
                costs_data.push(v.data)
                dinner_type = v.data.cl1
            }
        })
        const sales_data = []
        // 销售额所需数据
        for (const meal_item of mealcopies()) {
            if(meal_item.cl1 == c_item){
                sales_data.push(meal_item)
            }
        }
        const d = cost_proportion(costs_data, sales_data)
        gridOptions.api.forEachNode(v => {
            if(v.data == null) return
            if(v.data.cl1 == c_item && v.data.type == "%"){
                gridOptions.api.applyTransaction({remove: [v.data]})
            }
        })
        const obj = {
            ...d[2],
            cl1: c_item,
            dinner_type,
        }
        gridOptions.api.applyTransaction({add: [obj], addIndex: dataIndex(e)})
    }
    
    gridOptions.api.refreshCells({force:true})

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
                data[0] = {
                    ...data[0],
                    ...addRowPublicPart(params)
                }
                // data[0][]
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
                        if(specialMeal.Catering[params.node.data.dinner_type] <= specialMeal.colors.length && value == "特色"){
                            data[0]['specialMealID'] = specialMeal.Catering[params.node.data.dinner_type]
                            data[0]['specialMealColor'] = specialMeal.colors[specialMeal.Catering[params.node.data.dinner_type] - 1]
                            specialMeal.Catering[params.node.data.dinner_type] ++
                        }
                        data[0]['dish_key_id'] = {
                            dish_top_category_id: MealCategory.value,
                            material_item:[]
                        }
                        // const id = parseInt(gridOptions.api.getDisplayedRowAtIndex(params.node.rowIndex).rowIndex) + 1
                        // console.log(params)
                        gridOptions.api.expandAll()
                        gridOptions.api.applyTransaction({ add: data, addIndex: params.node.rowIndex + 1})

                        return  true
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
                if(specialMeal.Catering[params.node.data.dinner_type]<= specialMeal.colors.length){
                    const data = [{}]
                    for (const key in params.node.data) {
                        if(!isNaN(key)){
                            data[0][`${key}`] = 0
                        }
                    }
                    const {id} = index.dish_top_category.find(v => v.name_cn == "特色")

                    data[0] = {
                        ...data[0],
                        ...addRowPublicPart(params)
                    }
                    data[0]['dish_key_id'] = {
                        dish_top_category_id: id,
                        material_item: []
                    }
                    data[0]['type'] = "特色"
                    data[0]['specialMealID'] = specialMeal.Catering[params.node.data.dinner_type]
                    data[0]['specialMealColor'] = specialMeal.colors[specialMeal.Catering[params.node.data.dinner_type] - 1]
                    specialMeal.Catering[params.node.data.dinner_type] += 1
                    gridOptions.api.applyTransaction({ add: data})
                }
                
            }
        },
        {
            name:'新增特色餐配菜',
            action:() => {
                console.log(params)
                if(specialMeal.Catering[params.node.data.dinner_type] == 1) return
                const data = [{}]
                for (const key in params.node.data) {
                    if(!isNaN(key)){
                        data[0][`${key}`] = 0
                    }
                }
                data[0] = {
                    ...data[0],
                    ...addRowPublicPart(params)
                }
                customFromDom({
                    parent:"#SpecialMeal",
                    deleteData:["#SpecialMealCategory"],
                    cancel:["#SpecialMealCategory_cancel1", "#SpecialMealCategory_cancel2"],
                    sure:"#SpecialMealCategorys_sure",
                    initFun(_parent){
                        let SpecialMealCategory = _parent.querySelector('#SpecialMealCategory')
                        let MealCategory = _parent.querySelector('#MealCategory22')

                        for (let index = 1; index < specialMeal.Catering[params.node.data.dinner_type]; index++) {
                            SpecialMealCategory.innerHTML += `
                            <option value="${index}">特色${index}</option>`
                        }
                        // console.log(_parent, MealCategory)
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

                        return true
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
// 添加行信息的公共添加部分
const addRowPublicPart = (params) => {
    const obj = {}
    obj['Copies'] = 0
    obj['cl1'] = params.node.data['cl1']
    obj['dish'] = ""
    obj['dinner_type'] = params.node.data['dinner_type']
    obj['whole'] = ""
    obj['edit'] = true
    obj['configure'] = false
    obj['fixed'] = true
    obj['costPrice'] = 0
    obj['update'] = false
    return obj
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
                // display: params.data.show ? "flex" : "none"
            }
        }
    }
}

const onCellClicked = params => {
    if(params.colDef.field == "dish"){
        // console.log(params)
        if(Restrictions(params)) return;
        if(params.data.configure || params.data.dish == "" || params.data.dish == undefined) return
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