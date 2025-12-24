/**
 * Vue Router 配置
 */

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '卡牌识别系统'
      }
    }
  ]
})

// 设置页面标题
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'Card Recognition App'
  next()
})

export default router
