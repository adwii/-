<template>
    <div class="login">
        <div class="login_content">
            <p>用户登录</p>
            <el-form :model="loginForm" label-width="auto" size="large" ref="loginRef" :rules="logRules">
                <el-form-item label="账号：" prop="username">
                    <el-input placeholder="请输入账号" v-model="loginForm.username">
                    </el-input>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                    <el-input placeholder="请输入密码" v-model="loginForm.password" type="passWord">
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="btn">
                <el-button type="primary" style="width: 80%" size="large" round auto-insert-space @click="doLogin"
                    :loading="loginLoading">登录</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { reactive, toRefs, ref } from '@vue/reactivity'
import { onBeforeMount, onBeforeUnmount, onMounted } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import { setRouter } from '../common/comFun'
import { useStore } from 'vuex'
import { login, getMenuTreeNavigation } from '../api/userApi'


export default {
    setup() {

        const router = useRouter()
        const store = useStore()

        const loginRef = ref(null)
        const loginLoading = ref(false)

        const logRules = reactive({
            'username': [
                { required: true, trigger: 'blur', message: '请输入账号' }
            ],
            'password': [
                { required: true, trigger: 'blur', message: '请输入密码' }
            ],
        })

        const state = reactive({
            menuList: [],
            loginForm: {}
        })

        onBeforeMount(() => {
        })

        onMounted(() => {
            window.addEventListener('keydown', enterKey)
            if (import.meta.env.MODE == "development") {
                state.loginForm = {
                    username: 'admin',
                    password: '1qaz2wsx'
                }
            }
        })

        onBeforeUnmount(() => {
            window.removeEventListener('keydown', enterKey)
        })

        const enterKey = (e) => {
            if (e.key == 'Enter') {
                doLogin()
            }
        }

        const doLogin = async () => {
            loginRef.value.validate(valid => {
                if (valid) {
                    loginLoading.value = true
                    login(state.loginForm).then(res => {
                        localStorage.setItem('userInfo', JSON.stringify(res.user))
                        localStorage.setItem('token', res.user.token)
                        localStorage.setItem('tokenTime', new Date().getTime())
                        setTimeout(() => {
                            getMenu()
                        }, 0);
                    })
                }
            })
        }

        const getMenu = () => {
            getMenuTreeNavigation().then(async res => {
                localStorage.setItem('menuList', JSON.stringify(res.data))
                await filterMenu(res.data)
                console.log(state.menuList)
                setRouter(state.menuList)
                store.commit('updateMenuRouteList', state.menuList)
                store.commit('updateMenuList', res.data)
                localStorage.setItem('menuRouteList', JSON.stringify(state.menuList))
                setTimeout(() => {
                    router.push(state.menuList[0].href)
                }, 0);
            })
        }

        const filterMenu = (routes) => {
            for (let i in routes) {
                if (routes[i].childList.length > 0 && routes[i].type == 0) {
                    for (let j in routes[i].childList) {
                        state.menuList.push(routes[i].childList[j])
                    }
                }
                if (routes[i].type == 1) {
                }
            }
        }

        return {
            ...toRefs(state),
            doLogin,
            loginRef,
            logRules,
            loginLoading
        }
    }
}
</script>

<style lang="scss" scoped>
.login {
    height: 100vh;

    & > div {
        text-align: center;
        position: absolute;
        top: 50%;
        left: 50%;
        box-shadow: 0 0 10px 0 #ccc;

        padding: 0 20px;
        border-radius: 8px;

        & > p {
            line-height: 54px;
            font-size: 18px;
        }

        .reg_tip {
            font-size: 12px;
            color: #999;
            line-height: 40px;

            span {
                color: #409eff;
                text-decoration: underline;
                cursor: pointer;
            }
        }
    }

    .login_content {
        width: 360px;
        margin-left: -180px;
        height: 280px;
        margin-top: -140px;
    }

    .register_content {
        width: 460px;
        height: 480px;
        margin-top: -250px;
        margin-left: -230px;

        .yzm {
            display: flex;
            width: 100%;
        }
    }
}
</style>