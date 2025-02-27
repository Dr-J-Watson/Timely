```vue
<template>
  <header class="header">
    <div class="container header-content">
      <div class="logo">
        <router-link to="/" class="logo-link">Timely</router-link>
      </div>

      <div class="current-activity" v-if="currentEntry">
        <span class="project-name">{{ currentEntry.project.name }}</span>
        <span class="activity-name" :style="{ color: currentEntry.activity.color }">
          {{ currentEntry.activity.name }}
        </span>
        <span class="duration">{{ formatDuration(getCurrentDuration()) }}</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useApiStore } from '@/stores/api'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { formatDuration } from '@/plugins/formatters'

const router = useRouter()
const apiStore = useApiStore()
const toast = useToast()

const currentEntry = ref(null)
const todayTotalTime = ref('0h')
let totalMs = ref(0)
const completedObjectives = ref(0)
const totalObjectives = ref(0)
let updateInterval = null   

const getCurrentDuration = () => {
  if (!currentEntry.value?.start) return 0
  return new Date() - new Date(currentEntry.value.start)
}

const updateDuration = () => {
  if (currentEntry.value?.start) {
    todayTotalTime.value = formatDuration(totalMs + getCurrentDuration())
  }
}

const stopActivity = async () => {
  try {
    if (currentEntry.value?.id) {
      await apiStore.apiInstance.patch(`/api/time-entries/${currentEntry.value.id}/stop`)
      currentEntry.value = null
      toast.success('Activité arrêtée')
      window.location.reload()
    }
  } catch (error) {
    console.error('Error stopping activity:', error)
    toast.error('Erreur lors de l\'arrêt de l\'activité')
  }
}

const logout = () => {
  apiStore.removeApiKey()
  router.push('/auth')
  toast.info('Déconnexion réussie')
}

const loadData = async () => {
  try {
    const [timeEntriesResponse, objectivesResponse] = await Promise.all([
      apiStore.apiInstance.get('/api/time-entries'),
      apiStore.apiInstance.get('/api/daily-objectives')
    ])

    const currentAct = timeEntriesResponse.data.find(entry => entry.end === null)
    
    if (currentAct) {
      const [project, activity] = await Promise.all([
        apiStore.apiInstance.get(`/api/projects/${currentAct.project_id}`),
        apiStore.apiInstance.get(`/api/activities/${currentAct.activity_id}`)
      ])

      currentEntry.value = {
        ...currentAct,
        project: project.data,
        activity: activity.data
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const todayEntries = timeEntriesResponse.data.filter(entry => entry.start.startsWith(today))
    totalMs = todayEntries.reduce((total, entry) => {
      const end = entry.end && entry.end !== null ? new Date(entry.end) : new Date()
      const duration = end - new Date(entry.start)
      return total + duration
    }, 0)

    todayTotalTime.value = formatDuration(totalMs)
    totalObjectives.value = objectivesResponse.data.length
    completedObjectives.value = objectivesResponse.data.filter(obj => obj.done).length
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Erreur lors du chargement des données')
  }
}

onMounted(async () => {
  await loadData()
  // Mettre à jour la durée toutes les secondes
  updateInterval = setInterval(() => {
    updateDuration()
  }, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
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