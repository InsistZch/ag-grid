/** @odoo-module **/
const col = [
    {
        headerName:'食材名称',
        field:'materialName',
        editable: false
    },
    {
        headerName:'单价',
        field:'price',
        editable: true,
        valueFormatter: params => {
            return Number(params.value).toFixed(2)
        },
        // cellRenderer: params => {
        //     return Number(params.value).toFixed(2)
        // }
    },
    {
        headerName:'单位',
        field:'unit',
        editable: false
    },
    {
        headerName: "",
        field: "update",
        editable: false,
        cellRenderer: (params) => {
            const div = document.createElement('div')
            div.classList.add("price_div")  
            div.innerHTML = `<button type="button" class="btn btn-outline-primary el_update_btn"><svg t="1681928864680" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2898" id="mx_n_1681928864680" width="20" height="20"><path d="M185.856 457.216a42.496 42.496 0 0 0 55.296-27.648A272.896 272.896 0 0 1 375.808 271.36a268.288 268.288 0 0 1 204.8-13.312 293.888 293.888 0 0 1 126.464 91.136l-25.088-5.632a43.008 43.008 0 0 0-51.2 33.792 46.592 46.592 0 0 0 34.816 53.76l122.88 28.672a43.008 43.008 0 0 0 51.2-29.184l30.72-107.008a46.08 46.08 0 0 0-28.672-57.344 43.008 43.008 0 0 0-55.296 27.648l-2.048 13.312a385.536 385.536 0 0 0-177.152-133.12 353.792 353.792 0 0 0-271.872 17.408 358.4 358.4 0 0 0-178.176 209.92 46.08 46.08 0 0 0 28.672 55.808z m656.384 142.848a43.008 43.008 0 0 0-55.808 27.648 273.408 273.408 0 0 1-134.656 158.208 266.752 266.752 0 0 1-204.8 13.824 290.816 290.816 0 0 1-126.464-91.136l25.088 5.632a42.496 42.496 0 0 0 51.2-33.792 46.592 46.592 0 0 0-34.816-53.76l-122.88-28.672a42.496 42.496 0 0 0-51.2 29.184L153.6 733.696a46.592 46.592 0 0 0 28.672 57.344 42.496 42.496 0 0 0 55.296-27.648l3.584-11.776a387.584 387.584 0 0 0 177.152 133.12 354.816 354.816 0 0 0 272.384-17.408 361.984 361.984 0 0 0 179.712-209.92 46.592 46.592 0 0 0-28.16-57.344z" p-id="2899" fill="#71639e"></path></svg></button>`
            const btn = div.querySelector('button')
            const path = div.querySelector('path')
            btn.onmousemove = () => {
                path.setAttribute('fill', "#fff")
            }
            btn.onmouseout = () => {
                path.setAttribute('fill', "#71639e")
            }
            btn.onclick = () => {
                console.log(params.data)
            }
            
            return div
        }
    }
]

export default col