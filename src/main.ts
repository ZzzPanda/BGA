/**
 * 应用入口文件
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// 错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info)
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Global warning:', msg, trace)
}

// 注册 PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration)
      })
      .catch((error) => {
        console.log('SW registration failed:', error)
      })
  })
}
