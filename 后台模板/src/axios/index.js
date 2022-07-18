import axios from "axios";
import { ElMessage } from "element-plus";

import router from "../router";

const defaultAxios = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: 100000
})


const ned = 12 * 60 * 60 * 1000
const maxNed = 24 * 60 * 60 * 1000
function refreshToken() {
    defaultAxios.get('/sys/refreshToken', {
        params: {
            token: localStorage.getItem('token')
        }
    }).then(res => {
        if (res) {
            localStorage.setItem('token', res.token)
            localStorage.setItem('tokenTime', new Date().getTime())
        }
    })
}

defaultAxios.interceptors.request.use((config) => {
    if (localStorage.getItem('token')) {
        let tokenTime = localStorage.getItem('tokenTime')
        let now = new Date().getTime()
        let timeSpace = Number(now) - Number(tokenTime)
        if ((timeSpace > ned && timeSpace < maxNed) && config.url != '/sys/refreshToken') {
            refreshToken()
        }
        if (timeSpace > maxNed) {
            router.push('/login')
            return config
        } else {
            config.headers.token = localStorage.getItem('token')
            return config;
        }
    } else {
        router.push('/login')
    }
    return config
}, err => {
    return Promise.reject(err)
})


defaultAxios.interceptors.response.use((res) => {
    if (res.data.code !== 200) {
        ElMessage.warning(res.data.msg)
        return Promise.reject(res.data)
    } else {
        return res.data.data
    }
}, err => {
    ElMessage.error('请求失败')
    return Promise.reject(err)
})

export const defAxios = defaultAxios