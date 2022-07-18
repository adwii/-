
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/home.vue'),
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/404.vue')
    },
    {
        path: '/:pathMatch(.*)',
        redirect: '/404',
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// var isAddDone = false

// router.beforeEach((to, from) => {
//     //路由拦截逻辑代码
//     if (isAddDone) {
//         return true
//     } else {
//         // console.log(isAddDone)
//         if (store.state.menuList && store.state.menuList.length > 0) {
//             setRouter(store.state.menuRouteList)
//             isAddDone = true
//             // console.log(isAddDone)

//             return { ...to, replace: true }
//         }
//         if (!localStorage.getItem('token') && to.path != '/login') {
//             return { path: '/login', replace: true }
//         }
//     }
// })

export default router