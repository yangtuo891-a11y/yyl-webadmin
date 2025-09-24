import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/fresh-theme.css' // 引入生鲜主题样式
import router from './router'
import App from './App.vue'
import dayjs from 'dayjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs' // 中文语言包
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
    locale: zhCn, // 设置为中文
  })
app.config.globalProperties.$dayjs = dayjs

app.mount('#app')