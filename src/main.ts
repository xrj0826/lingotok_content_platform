import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { preloadSharedFFmpeg } from './utils/ffmpegSharedInstance'

// 引入TDesign
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入全局样式
import './style/index.less'

// 引入自定义组件
import * as components from './components'

// 引入权限控制
import './permission'

const app = createApp(App)

// 注册全局组件
Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

// 使用插件
app.use(store)
app.use(router)
app.use(TDesign)
app.use(ElementPlus)

// 在应用启动时预加载FFmpeg
preloadSharedFFmpeg()
  .then(() => {
    console.log('✅ FFmpeg预加载成功')
  })
  .catch((error) => {
    console.warn('⚠️ FFmpeg预加载失败，将在需要时加载:', error)
  })

// 挂载应用
app.mount('#app')