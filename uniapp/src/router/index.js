import uniCrazyRouter from "uni-crazy-router";

uniCrazyRouter.beforeEach(async (to, from, next) => {
    console.log('路由拦截Crazy')
    next()
})