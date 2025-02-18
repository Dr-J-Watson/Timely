import { createRouter, createWebHistory } from 'vue-router';
import connexionView from '../views/connexionView.vue';
import inscriptionView from '../views/inscriptionView.vue';
import settingsView from '../views/settingsView.vue';
import projectsView from '../views/projectsView.vue';
import activitiesView from '../views/activitiesView.vue';
import objectivesView from '../views/objectivesView.vue';
import statisticsView from '../views/statisticsView.vue';
import { useApiStore } from '@/stores/api';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'connexion',
      component: connexionView,
    },
    {
      path: '/singup',
      name: 'inscription',
      component: inscriptionView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: settingsView,
    },
    {
      path: '/projects',
      name: 'projects',
      component: projectsView,
    },
    {
      path: '/activities',
      name: 'activities',
      component: activitiesView,
    },
    {
      path: '/objectives',
      name: 'objectives',
      component: objectivesView,
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: statisticsView,
    },
  ],
});

// tableau des routes autorisées sans authentification
const allowedRoutes = ['connexion', 'inscription'];

router.beforeEach((to, from, next) => {
  const store = useApiStore();
  if ( !store.isAuthenticated() && !allowedRoutes.includes(to.name) ) {
    next({ name: 'connexion' });
  } else {
    next();
  }
});

export default router;