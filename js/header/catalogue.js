(function(){
//  查找盒子
const left_catalogue = document.querySelector("header div.nav_left button")
const right_catalogue = document.querySelector("header button.header_user")

// 获取焦点方法
const func_focus = function(childClassName) {
    const child = this.querySelector(childClassName)
    child.style.display = "block";
}
// 失去焦点方法
const func_blur = function(childClassName) {
    const child = this.querySelector(childClassName)
    child.style.display = "none";
}

left_catalogue.onfocus = function(e) {
    return func_focus.call(this,".nav_catalogue")
};
left_catalogue.onblur = function(e) {
    return func_blur.call(this,".nav_catalogue")
};

right_catalogue.onfocus = function(e) {
    return func_focus.call(this,".user_set")
};
right_catalogue.onblur = function(e) {
    return func_blur.call(this,".user_set")
};
})()