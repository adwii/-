import axios from "axios";

const defaultAxios = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: 100000
})

defaultAxios.interceptors.request.use((config) => {
    if(localStorage.getItem('token')){
        config.headers.token = localStorage.getItem('token')
    }else{
        uni.reLaunch({
            url: '/pages/login/login'
        })
    }
    return config
}, err => {
    return Promise.reject(err)
})


defaultAxios.interceptors.response.use((res) => {
    if(res.data.code !== 200){
        uni.showToast({
            icon: 'none',
            title: res.data.msg
        })
        return res.data
    }else{
        return res.data.data
    }
}, err => {
    uni.showToast({
        icon: 'none',
        title: '请求失败'
    })
    return Promise.reject(err)
})

export default {
    defaultAxios
}