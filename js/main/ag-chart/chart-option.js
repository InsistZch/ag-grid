/** @odoo-module **/
import getData from './chart-data.js'
import series from './chart-series.js'

const options = {
    container: document.getElementById('myChart'),
    autoSize: true,
    data: getData,
    theme: {
      palette: {
        fills: ['#5BC0EB', '#FDE74C', '#9BC53D', '#E55934', '#FA7921'],
        strokes: ['#4086a4', '#b1a235', '#6c8a2b', '#a03e24', '#af5517'],
      },
      overrides: {
        column: {
          series: {
            strokeWidth: 0,
            highlightStyle: {
              series: {
                strokeWidth: 1,
                dimOpacity: 0.3,
              },
            },
          },
        },
      },
    },
    title: {
      text: '成本统计表',
      fontSize: 18,
    },
    series,
    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: {
          rotation: 30,
        },
      },
      {
        type: 'number',
        position: 'left',
        label: {
          formatter: (params) => {
            return params.value / 1000 + 'k';
          },
        },
      },
    ],
    legend: {
      position: 'top',
    },
    padding: {
      top: 40,
    },
  };
  export default options