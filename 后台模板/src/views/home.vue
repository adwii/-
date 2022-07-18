<template>
    <div class="home">
        <el-container>
            <el-header>
                <div class="header_left">后台管理系统</div>
                <div class="header_right">
                    <div @click="navToUserCenter">
                        <img src="../assets/header/avatar.png" alt="">
                        <span>{{ userInfo.name }}</span>
                    </div>
                    <div @click="doLogout">
                        <i class="iconfont icon-logout"></i>
                        <span>退出</span>
                    </div>
                </div>
            </el-header>
            <el-container>
                <el-aside width="260px">
                    <el-menu router unique-opened :default-active="route.path">
                        <template v-for="(menuLevel1, index) in menu" :key="index">
                            <el-sub-menu v-if="menuLevel1.childList && menuLevel1.childList.length > 0"
                                :index="menuLevel1.href || '/menu'">
                                <template #title>
                                    <i class="iconfont" :class="'icon-' + menuLevel1.icon"></i>
                                    <span>{{ menuLevel1.name }}</span>
                                </template>
                                <el-menu-item v-for="(menuLevel2, i) in menuLevel1.childList" :key="i"
                                    :index="menuLevel2.href">{{ menuLevel2.name }}</el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else :index="menuLevel1.href">{{ menuLevel1.name }}</el-menu-item>
                        </template>
                    </el-menu>
                </el-aside>
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import { reactive, toRefs } from '@vue/reactivity'
import { findFileUrl, setRouter } from '../common/comFun'
import { onMounted, onBeforeMount, provide } from '@vue/runtime-core'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout } from '../api/userApi'
import { useRoute, useRouter } from 'vue-router'
import { getMenuTreeNavigation } from '../api/userApi'
import { useStore } from 'vuex'


export default {
    setup() {

        const router = useRouter()
        const store = useStore()
        const route = useRoute()
        const state = reactive({
            menuList: [],
            menu: [],
            userInfo: {}
        })

        onMounted(() => {
            state.menu = JSON.parse(localStorage.getItem('menuList'))
            state.userInfo = JSON.parse(localStorage.getItem('userInfo'))
        })

        const doLogout = () => {
            ElMessageBox.confirm('确定退出？', '提示', {
                type: 'warning',
            }).then(() => {
                logout().then(res => {
                    router.push('/login')
                    localStorage.clear()
                })
            }).catch(() => {
                ElMessage('已取消')
            })
        }



        const getMenu = () => {
            getMenuTreeNavigation().then(async res => {
                localStorage.setItem('menuList', JSON.stringify(res.data))
                state.menu = res.data
                await filterMenu(res.data)
                setRouter(state.menuList)
                store.commit('updateMenuRouteList', state.menuList)
                store.commit('updateMenuList', res.data)
                localStorage.setItem('menuRouteList', JSON.stringify(state.menuList))
            })
        }

        const filterMenu = (routes) => {
            for (let i in routes) {
                if (routes[i].childList.length > 0 && routes[i].type == 0) {
                    for (let j in routes[i].childList) {
                        state.menuList.push(routes[i].childList[j])
                    }
                }
            }
        }
        provide('reloadMenu', getMenu)

        const navToUserCenter = () => {
            router.push('/')
        }

        return {
            ...toRefs(state),
            doLogout,
            route,
            navToUserCenter
        }
    }
}
</script>


<style lang="scss">
.home {
    height: 100vh;
    text-align: left;

    & > .el-container {
        height: 100%;

        .el-header {
            background-color: var(--el-color-primary);
            color: var(--el-color-white);
            display: flex;
            justify-content: space-between;
            line-height: 60px;

            .header_left {
                font-size: 24px;
                font-weight: 600;
            }

            .header_right {
                display: flex;

                & > div {
                    &:nth-of-type(1) {
                        margin-right: 28px;
                        font-weight: 600;

                        img {
                            width: 34px;
                            height: 34px;
                            vertical-align: middle;
                            margin-right: 10px;
                        }
                    }

                    &:last-of-type {
                        cursor: pointer;
                        font-size: 14px;

                        i {
                            font-size: 14px;
                            margin-right: 6px;
                        }
                    }
                }
            }
        }

        .el-container {
            .el-aside {
                height: 100%;
                background: var(--el-bg-color-page);

                .el-menu {
                    height: 100%;
                    background-color: var(--el-bg-color);

                    .el-sub-menu__title {
                        .iconfont {
                            margin-right: 6px;
                            margin-top: -3px;
                        }
                    }
                }
            }

            .el-main {
                background: var(--el-bg-color-page);

                .home-box {
                    // background-color: var(--el-bg-color);
                    height: 100%;
                    display: flex;
                    flex-direction: column;

                    .search-box {
                        .el-input {
                            width: 230px;
                        }

                        .el-form-item:last-of-type {
                            margin-bottom: 0;
                        }

                        .search-inline {
                            margin-left: 20px;
                        }
                    }

                    .bot-box {
                        display: flex;

                        .tree-box {
                            margin-top: 20px;
                            width: 24%;
                            margin-right: 20px;
                        }

                        .table-box {
                            overflow: inherit;
                        }
                    }

                    .table-box {
                        flex: 1;
                        margin-top: 20px;
                        overflow: auto;

                        .table-page {
                            margin-top: 20px;
                        }
                    }

                }
            }
        }
    }
}
</style>