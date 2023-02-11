/** @odoo-module **/
import agGridRow from "./ag-grid-row.js"
import index from '../../../data/index.js'
import customFromDom from './customFrom.js'
import saveData from "../saveData/index.js"
import { add_dish_bom_id, add_material_id } from "../tool.js"

// 添加对应数据
const addData = (e, i, el) => {
    el.innerHTML += 
    i == 0 ? `<option value="${e.id}" selected>${e.name}</option>`:
    `<option value="${e.id}">${e.name}</option>`
}


// cellRenderer > onCellValueChanged
const onCellValueChanged = (e,gridOptions) => {
    // console.log(e)
    if(e.colDef.headerName != '菜品' && e.colDef.headerName != '配量汇总'){
        if(isNaN(e.newValue)) {
            e.data[`${e.colDef.field}`] = e.oldValue
            gridOptions.api.refreshCells({force:true})
            return
            // gridOptions.api.refreshCells({force:true})
        }
        e.data['Copies'] += parseInt(e.newValue) - parseInt(e.oldValue)
        let dish_detailed_data = agGridRow.dish_detailed(e.data['dish_key_id'], parseInt(e.data['Copies']))
        e.data['whole'] = dish_detailed_data[0]
        e.data['dish_key_id']['material_item'] = dish_detailed_data[1]
        gridOptions.api.refreshCells({force:true})
    }else if(e.colDef.headerName == '菜品'){
        gridOptions.api.refreshCells({force:true})
    }else if(e.colDef.headerName == '配量汇总'){
        let d1 = e.newValue
        // // let colData = e.columnApi.getColumn('whole')
        // // console.log(e.columnApi.getColumnState())
        // e.api.forEachNode((node,index) => {
        //     console.log(node.data, index)
        // })
        if(d1 == "") return 
        if(d1[d1.length - 1] != " ") d1 += ' '

        // 可能为单位，也可能为新增数据
        // 数据可能存在，也可能不存在

        // 可能修改多个地方        
        
        // 分割 配量汇总 字符串
        console.log(d1)
        let material_data = d1.split(' ')
        for (const material of material_data) {
            let isTrue = true
            if (material == " " || material == "") continue
            
            // 鸭肉片23.58斤 鸭肉片 23.58 斤
            let d = material.match(/([\u4e00-\u9fa5a-zA-Z]+)?([0-9]+\.?\d+)?([\u4e00-\u9fa5]+)?/)


             
            // 如果输入的不是汉字或者字母 则直接退出循环
            if(d == null){
                e.data[`${e.colDef.field}`] = e.oldValue
                gridOptions.api.refreshCells({force:true})
                break
            }
            const data_name = d[1]
            // 先判断材料名称中是否含有切片方式
            // 再看切片方式是否在最后
            let dpc = index.dish_process_category.sort((a,b) => b.name.length - a.name.length)
            // console.log(dpc)
            for (const dish_process_category of dpc) {
                let name = dish_process_category.name

                // let isJudeg = true
                for (const material_item of index.material_item) {
                    let mV =  material_item.name.split('-')[0]
                    
                    // console.log(mV, d[1])
                    // 没有切片方式
                    
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
                        console.log(judeg)
                        if(judeg){
                            console.log(mV, d[1])
                            if(mV == d[1]){
                                
                                break
                            }else{
                                // d[1] = d[1].split(name)[0]
                                d[1] = d[1].substr(0, d[1].length - name.length)
                            }
                            e.data.dish_key_id.material_item.push({
                                ...material_item,
                                dish_process_category_name: name
                            })
                            console.log(e.data.dish_key_id.material_item)
                        }
                        console.log(d[1])
                        break
                    }
                    
                }
                
                
            }

            // console.log(d[1])
            // 查找 菜品配量是否存在

            // 材料名称-切片方式-数量-单位

            // 先判断该配料是否存在 如果存在则判断是否有切法，单位
            // 如果不存在 则创建配料，检查该配料是否有切法 单位

            // 确认该配料是否存在
            for (const material_item of index.material_item) {
                let name = material_item.name.split('-')[0]
                if(name == d[1]){
                    // console.log(material_item)
                    //  确认是否输入数量，单位
                    if(d[2] == undefined && d[3] == undefined){
                        // 查找材料名称 切片方式 数量 单位
                        let dishes_name = document.querySelector('#write_Side_dishes_name')
                        let dishes_section = document.querySelector('#write_Side_dishes_section')
                        let dishes_quantity = document.querySelector('#write_Side_dishes_quantity')
                        let dishes_company = document.querySelector('#write_Side_dishes_company')

                        // 定义变量
                        // 查看是否带切片方式
                        let section_str = d[1] != data_name ? data_name.split(d[1])[1] : "无"
                        // 插入对应数据
                        dishes_name.value = d[1]
                        
                        index.dish_process_category.forEach(v => {
                            dishes_section.innerHTML += v.name == section_str ? 
                            `<option value="${v.id}" selected>${v.name}</option>`:
                            `<option value="${v.id}">${v.name}</option>`
                        })
                        index.material_purchase_unit_category.forEach((v ,i) => addData(v, i, dishes_company))
                        
                        //写入自定义dom操作  配菜
                        customFromDom({
                            parent:"#write_Side_dishes",
                            cancel:["#write_Side_dishes_cancel1","#write_Side_dishes_cancel2"],
                            sure:"#write_Side_dishes_sure",
                            deleteData: ["#write_Side_dishes_section","#write_Side_dishes_company"],
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
                                e.data.dish_key_id.material_item.push({
                                    ...material_item,
                                    dish_process_category_name:section
                                })

                                // 替换原数据
                                e.data[`${e.colDef.field}`] = e.data[`${e.colDef.field}`].replace(data_name, dishes_name.value + section + number + compamy)
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
                        sureFun:() => {
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
                                gbom_qty_high:0,
                                gbom_qty_mid:0,
                                gbom_qty_low:0,
                                unit_id:customCompany.value
                            }
                            index.dish_bom.push(obj)
                            console.log(obj)
                            // saveData.new_or_update_dish_bom_list.new.push(obj)
                            let dish_process_category_name = customCompany.querySelector(`option[value="${customCompany.value}"]`).innerText
                            let customSectionValue = customSection.querySelector(`option[value="${customSection.value}"]`).innerText
                            customSectionValue = customSectionValue == "无" ? "" : customSectionValue
                            e.data.dish_key_id.material_item.push({
                                ...obj1,
                                dish_process_category_name: customSectionValue
                            })
                            
                            const str = data_name + customSectionValue + 0 + dish_process_category_name
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
    console.log(params)
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
                data[0]['dinner_type'] = params.node.data['dinner_type']
                data[0]['dish'] = ""
                data[0]['dish_key_id'] = {
                    dish_top_category_id:params.node.data['dish_key_id'].dish_top_category_id
                }
                data[0]['type'] = params.node.data['type']
                data[0]['whole'] = ""
                gridOptions.api.applyTransaction({ add: data, addIndex: params.node.rowIndex + 1})
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
        ...params.defaultItems
    ]
    return result
}

// const stringToObject = (str) => {
//     let reg = /([\u4e00-\u9fa5a-zA-Z]+)?([0-9]+\.?\d+)?([\u4e00-\u9fa5]+)?/
//     let data = str.match(reg)
   
//     return {
//         allValue: data[0],

//     }
// }

export default {
    onCellValueChanged,getContextMenuItems
}