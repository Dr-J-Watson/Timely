import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import inscriptionView from '../views/inscriptionView.vue'
import menuView from '../views/menuView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/inscription',
      name: 'inscription',
      component: inscriptionView,
    },
    {
      path: '/menu',
      name: 'menu',
      component: menuView,
    },
  ],
})

export default router
