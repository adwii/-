
import { createRouter, createWebHashHistory } from "vue-router";
import { setRouter } from "../common/comFun";
import store from "../store";

const routes = [
    {
        path: '/login',
        component: () => import('@/views/login.vue')
    },
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/home.vue'),
        children: [
            {
                path: '/',
                component: () => import('@/views/system/userCenter.vue')
            }
        ]
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/404.vue')
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

var isAddDone = false

router.beforeEach((to, from) => {
    //路由拦截逻辑代码
    if (isAddDone) {
        return true
    } else {
        console.log(isAddDone)
        if (store.state.menuList && store.state.menuList.length > 0) {
            setRouter(store.state.menuRouteList)
            isAddDone = true
            // console.log(isAddDone)
            return { ...to, replace: true }
        }
    }
})

export default router