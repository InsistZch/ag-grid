class ShowCellRenderer {
    init(params) {
      console.log(params.value)

      const ui = document.createElement('div')

      if(params.data == undefined || params.data.configure){
        ui.innerHTML = `${params.value}`
      }else{
        let count = 0

        // 
        let fristTypeID = 0, isfrist = true
        params.api.forEachNode(v => {
            if(v.data == undefined || v.data.configure) return
            if(v.data.cl1 == params.data.cl1 && v.data.type == params.data.type){
                count++
                if(isfrist){
                    isfrist = !isfrist
                    fristTypeID = v.data.id
                    return
                }
            }
        })
        ui.innerHTML = fristTypeID === params.data.id ? `${params.value}` : ``


        this.ui = ui

      }
    }
  
    getGui() {
      return this.ui;
    }
  
    refresh() {
      return false;
    }
  }

export default ShowCellRenderer