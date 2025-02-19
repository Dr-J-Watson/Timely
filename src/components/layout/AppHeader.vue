```vue
<template>
  <header class="header">
    <div class="container header-content">
      <div class="logo">
        <router-link to="/" class="logo-link">Timely</router-link>
      </div>

      <div class="current-activity" v-if="currentActivity">
        <span class="project-name">{{ currentActivity.project.name }}</span>
        <span class="activity-name">{{ currentActivity.activity.name }}</span>
        <span class="duration">{{ formatDuration(currentActivity.duration) }}</span>
        <button @click="stopActivity" class="btn btn-danger btn-small">Arrêter</button>
      </div>

      <div class="nav-section">
        <span class="stats-badge">{{ todayTotalTime }} aujourd'hui</span>
        <span class="objectives-badge">{{ completedObjectives }}/{{ totalObjectives }} objectifs</span>
        <nav class="main-nav">
          <router-link to="/settings" class="nav-link">Paramètres</router-link>
          <router-link to="/statistics" class="nav-link">Statistiques</router-link>
          <button @click="logout" class="btn btn-danger btn-small">Déconnexion</button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiStore } from '@/stores/api'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const router = useRouter()
const apiStore = useApiStore()
const toast = useToast()

const currentActivity = ref(null)
const todayTotalTime = ref('0h')
const completedObjectives = ref(0)
const totalObjectives = ref(0)

const formatDuration = (duration) => {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  return `${hours}h${minutes}m`
}

const stopActivity = async () => {
  try {
    if (currentActivity.value?.id) {
      await apiStore.apiInstance.patch(`/api/time-entries/${currentActivity.value.id}/stop`)
      currentActivity.value = null
      toast.success('Activité arrêtée')
    }
  } catch (error) {
    toast.error('Erreur lors de l\'arrêt de l\'activité')
  }
}

const logout = () => {
  apiStore.removeApiKey()
  router.push('/auth')
  toast.info('Déconnexion réussie')
}

onMounted(async () => {
  try {
    const timeEntries = await apiStore.apiInstance.get('/api/time-entries')
    const objectives = await apiStore.apiInstance.get('/api/daily-objectives')
    
    currentActivity.value = timeEntries.data.find(entry => !entry.end)
    
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = timeEntries.data.filter(entry => entry.start.startsWith(today))
    const totalMs = todayEntries.reduce((total, entry) => {
      const end = entry.end ? new Date(entry.end) : new Date()
      const duration = end - new Date(entry.start)
      return total + duration
    }, 0)
    todayTotalTime.value = formatDuration(totalMs)

    totalObjectives.value = objectives.data.length
    completedObjectives.value = objectives.data.filter(obj => obj.done).length
  } catch (error) {
    toast.error('Erreur lors du chargement des données')
  }
})
</script>

<style scoped>
.header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 1rem;
}

.logo-link {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
}

.current-activity {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--gray-100);
  border-radius: 4px;
}

.project-name {
  font-weight: bold;
}

.activity-name {
  color: var(--gray-700);
}

.duration {
  font-family: monospace;
  background-color: var(--gray-200);
  padding: 2px 6px;
  border-radius: 4px;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: var(--gray-700);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: var(--gray-100);
}

.stats-badge, .objectives-badge {
  padding: 4px 8px;
  background-color: var(--gray-100);
  border-radius: 4px;
  font-size: 0.875rem;
}

.btn-small {
  padding: 4px 8px;
  font-size: 0.875rem;
}
</style>