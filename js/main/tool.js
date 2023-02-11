/** @odoo-module **/

<<<<<<< HEAD
export function create_virtual_id(id) {

    return `virtual_${id}`;

}

=======
>>>>>>> 91635e3 (修改tool)
let make_add_function = () => {

    let id = 1;

    return () => {
        return `virtual_${id++}`;
    }

}

const add_material_id = make_add_function();
const add_dish_bom_id = make_add_function();
const add_dish_key_id = make_add_function();



export {
    add_material_id,
    add_dish_bom_id,
    add_dish_key_id,
}