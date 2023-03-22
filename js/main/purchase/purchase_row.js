import getMaterial from "../otherApi/getMaterial.js"


const row = (agOption) => {
    const d = getMaterial(agOption)
    console.log(d)
}

export default row