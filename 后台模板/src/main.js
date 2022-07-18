import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './styles/element/index.scss'
import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import 'dayjs/locale/zh-cn'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import './icon/iconfont.css'
import './icon/iconfont.js'

const app = createApp(App)

app.use(store).use(router).use(ElementPlus, { locale }).mount('#app')
