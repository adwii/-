import router from '../router/index.js'
//返回路径
export const findFileUrl = (fileUrl) => {
    return new URL(fileUrl, import.meta.url).href
}

const setRouterFun = (rouers, parentName) => {
    rouers.map((itemRouter) => {
        console.log(itemRouter.href)
        router.addRoute('home', {
            path: itemRouter.href,
            name: itemRouter.href.split('/').join('-'),
            component: () => import(/* @vite-ignore */findFileUrl(`/src/views${itemRouter.href}.vue`))
        })
    })
}
//设置路由
export const setRouter = async (routes) => {
    await setRouterFun(routes)
    router.addRoute({
        path: '/:pathMatch(.*)',
        redirect: '/404',
    })
}

//鉴权方法
export const checkPer = (perStr) => {
    const permiss = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).permissions : []
    return permiss.indexOf(perStr) >= 0 ? true : false
}