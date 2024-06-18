import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import ProductView from '../views/ProductView.vue'
import AboutMeView from '../views/AboutMeView.vue'
import LegalNoticeView from '../views/LegalNoticeView.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', component: HomeView, name: 'home', meta: { transition: 'slide-fade' } },
  {
    path: '/about-me',
    component: AboutMeView,
    name: 'about-me',
    meta: { transition: 'slide-fade' }
  },
  {
    path: '/product/:id',
    component: ProductView,
    name: 'product',
    meta: { transition: 'slide-fade' }
  },
  {
    path: '/legal-notice',
    component: LegalNoticeView,
    name: 'legal-notice',
    meta: { transition: 'slide-fade' }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
    name: 'NotFound',
    meta: { transition: 'slide-fade' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to: any, from: any, savedPosition: any) {
    if (savedPosition) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(savedPosition)
        }, 250)
      })
    } else {
      return { top: 0 }
    }
  }
})

export default router
