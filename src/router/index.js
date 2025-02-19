import { createRouter, createWebHistory } from 'vue-router'
import { useApiStore } from '../stores/api'
import AuthView from '../views/AuthView.vue'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'
import ProfileSettingsView from '../views/settings/ProfileSettingsView.vue'
import ProjectsSettingsView from '../views/settings/ProjectsSettingsView.vue'
import ActivitiesSettingsView from '../views/settings/ActivitiesSettingsView.vue'
import StatisticsView from '../views/StatisticsView.vue'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    component: SettingsView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'ProfileSettings' }
      },
      {
        path: 'profile',
        name: 'ProfileSettings',
        component: ProfileSettingsView,
        meta: { title: 'Mon profil' }
      },
      {
        path: 'projects',
        name: 'ProjectsSettings',
        component: ProjectsSettingsView,
        meta: { title: 'Mes projets' }
      },
      {
        path: 'activities',
        name: 'ActivitiesSettings',
        component: ActivitiesSettingsView,
        meta: { title: 'Mes activités' }
      }
    ]
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: StatisticsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Home' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const apiStore = useApiStore()
  const isAuthenticated = apiStore.isAuthenticated
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Auth' })
  } 
  else if (isAuthenticated && to.name === 'Auth') {
    next({ name: 'Home' })
  }
  else {
    next()
  }
})

export default router