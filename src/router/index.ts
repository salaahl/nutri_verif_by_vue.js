import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import ProductView from '../views/ProductView.vue'

const routes = [
  { path: '/', component: HomeView, name: 'home', meta: { transition: 'slide-fade' } },
  {
    path: '/product/:id',
    component: ProductView,
    name: 'product',
    meta: { transition: 'slide-fade' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
