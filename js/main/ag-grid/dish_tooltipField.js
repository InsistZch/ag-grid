/** @odoo-module **/
import index from '../../../data/index.js'

class dish_tooltipField {
    init(params){
        if(params.data.configure){
            const {min, max, average} = index.planed_cost_ratio_dict

            let now = (params.data.costPrice.split('%')[0]) / 100
            now = now > max ? max : now < min ? min : now

            const eGui = this.eGui = document.createElement('div');
            const color = params.color || 'white';
     
            eGui.classList.add('custom-tooltip');
            eGui.style['background-color'] = color;
            
            const left_width = ((average - min) / (max - min) * 100).toFixed(1)
            const now_left = (now - min) / (max - min) * 100
            
    
            eGui.innerHTML = `
            <div class="el_sales_main">
                <div class="el_sales_left" style="width:${left_width}%"></div>
                <div class="center_sales el_sales_minRomax" style="" data-center="${(average * 100).toFixed(1)}%" title="业内平均成本比例"></div>
                <div class="el_sales_right"></div>
                <div class="min_sales el_sales_minRomax" style="" data-min="${(min * 100).toFixed(1)}%" title="业内最小成本比例"></div>
                <div class="max_sales el_sales_minRomax" style="" data-max="${(max * 100).toFixed(1)}%" title="业内最大成本比例"></div>
                <div class="now_sales" style="left: ${now_left}%;" data-now="${params.data.costPrice}" title="本公司当前成本比例"></div>
                <div class="now_sales_span" style="left: ${now_left}%; color: ${now >= average ? 'var(--sales_max_bgColor)' : 'var(--sales_min_bgColor)'}">${params.data.costPrice}</div>
            </div>`;
        }else{
            this.eGui = document.createElement("div")
        }
    }
    
    getGui() {
        return this.eGui;
    }
    
}

export default dish_tooltipField