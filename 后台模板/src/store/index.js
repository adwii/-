import { createStore } from "vuex";

export default createStore({
    state: {
        menuRouteList: JSON.parse(localStorage.getItem('menuRouteList')) || [],
        menuList: JSON.parse(localStorage.getItem('menuList')) || []
    },
    mutations: {
        updateMenuRouteList: (state, list) => {
            state.menuRouteList = list
        },
        updateMenuList: (state, list) => {
            state.menuList = list
        },
    }
})