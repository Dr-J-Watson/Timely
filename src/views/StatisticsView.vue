<template>
    <div class="statistics-container">
      <h1 class="page-title">Statistiques</h1>
  
      <div class="filters-section">
        <div class="date-filters">
          <div class="form-group">
            <label class="form-label">Du</label>
            <input
              v-model="filters.from"
              type="date"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Au</label>
            <input
              v-model="filters.to"
              type="date"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Projet</label>
            <select
              v-model="filters.projectId"
              class="form-input"
            >
              <option value="">Tous les projets</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
  
      <div class="stats-cards">
        <div class="stat-card">
          <h3>Temps total travaillé</h3>
          <p class="stat-value">{{ formatDuration(totalTime) }}</p>
        </div>
        <div class="stat-card">
          <h3>Nombre de projets</h3>
          <p class="stat-value">{{ projectCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Nombre d'activités</h3>
          <p class="stat-value">{{ activityCount }}</p>
        </div>
      </div>
  
      <div class="charts-section">
        <div v-if="!filters.projectId" class="chart-container">
          <h3>Répartition par projet</h3>
          <canvas ref="projectChart"></canvas>
        </div>
        <div class="chart-container">
          <h3>Répartition par activité</h3>
          <canvas ref="activityChart"></canvas>
        </div>
      </div>
  
      <div class="time-entries-section">
        <h3>Entrées de temps</h3>
        <div v-if="timeEntries.length === 0" class="empty-state">
          Aucune entrée trouvée pour la période sélectionnée
        </div>
        <table v-else class="time-entries-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Projet</th>
              <th>Activité</th>
              <th>Durée</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in timeEntries" :key="entry.id">
              <td>{{ formatDate(entry.start) }}</td>
              <td>{{ entry.project?.name }}</td>
              <td>
                <span :style="{ color: entry.activity?.color }">
                  {{ entry.activity?.name }}
                </span>
              </td>
              <td>{{ formatDuration(getDuration(entry)) }}</td>
              <td>{{ entry.comment || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  ```vue
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { formatDuration, formatDate, getDuration } from '@/plugins/formatters'
import { calculateTotalDuration } from '@/plugins/utils/timeCalculator'
import { useApiStore } from '@/stores/api'
import { useToast } from 'vue-toastification'
import Chart from 'chart.js/auto'

const apiStore = useApiStore()
const toast = useToast()

const projectChart = ref(null)
const activityChart = ref(null)
let projectChartInstance = null
let activityChartInstance = null
let updateInterval = null
const isPageVisible = ref(true)

const projects = ref([])
const timeEntries = ref([])
const totalTime = ref(0)
const projectCount = ref(0)
const activityCount = ref(0)
const projectTimeData = ref([])
const activityTimeData = ref([])

const filters = ref({
  from: new Date().toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0],
  projectId: ''
})

const destroyCharts = () => {
  if (projectChartInstance) {
    projectChartInstance.destroy()
    projectChartInstance = null
  }
  if (activityChartInstance) {
    activityChartInstance.destroy()
    activityChartInstance = null
  }
}

const updateDurations = () => {
  if (!timeEntries.value.length) return
  totalTime.value = calculateTotalDuration(timeEntries.value)
}

const updateCharts = () => {
  if (!isPageVisible.value) return
  destroyCharts()

  if (projectChart.value && !filters.value.projectId && projectTimeData.value.length > 0) {
    projectChartInstance = new Chart(projectChart.value, {
      type: 'doughnut',
      data: {
        labels: projectTimeData.value.map(d => d.name),
        datasets: [{
          data: projectTimeData.value.map(d => d.value),
          backgroundColor: [
            '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
            '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }

  if (activityChart.value && activityTimeData.value.length > 0) {
    activityChartInstance = new Chart(activityChart.value, {
      type: 'doughnut',
      data: {
        labels: activityTimeData.value.map(d => d.name),
        datasets: [{
          data: activityTimeData.value.map(d => d.value),
          backgroundColor: activityTimeData.value.map(d => d.color || '#CBD5E0')
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }
}

const handleVisibilityChange = () => {
  isPageVisible.value = document.visibilityState === 'visible'
  if (isPageVisible.value) {
    calculateStatistics(timeEntries.value)
    updateCharts()
  }
}

const fetchProjects = async () => {
  try {
    const response = await apiStore.apiInstance.get('/api/projects')
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    toast.error('Erreur lors du chargement des projets')
  }
}

const fetchTimeEntries = async () => {
  try {
    const params = new URLSearchParams({
      from: filters.value.from,
      to: filters.value.to
    })

    if (filters.value.projectId) {
      params.append('project_id', filters.value.projectId)
    }

    const response = await apiStore.apiInstance.get(`/api/time-entries?${params}`)
    const entries = response.data

    const entriesWithDetails = await Promise.all(entries.map(async (entry) => {
      const [project, activity] = await Promise.all([
        apiStore.apiInstance.get(`/api/projects/${entry.project_id}`),
        apiStore.apiInstance.get(`/api/activities/${entry.activity_id}`)
      ])
      return {
        ...entry,
        project: project.data,
        activity: activity.data
      }
    }))

    timeEntries.value = entriesWithDetails
    calculateStatistics(entriesWithDetails)
    updateCharts()
  } catch (error) {
    console.error('Error fetching time entries:', error)
    toast.error('Erreur lors du chargement des données')
  }
}

const calculateStatistics = (entries) => {
  totalTime.value = calculateTotalDuration(entries)

  const projectTimes = {}
  const activityTimes = {}

  entries.forEach(entry => {
    const duration = getDuration(entry)
    
    if (entry.project?.id) {
      projectTimes[entry.project.id] = (projectTimes[entry.project.id] || 0) + duration
    }
    
    if (entry.activity?.id) {
      activityTimes[entry.activity.id] = (activityTimes[entry.activity.id] || 0) + duration
    }
  })

  projectTimeData.value = Object.entries(projectTimes).map(([id, duration]) => ({
    name: entries.find(e => e.project?.id === id)?.project?.name || 'Inconnu',
    value: duration
  }))

  activityTimeData.value = Object.entries(activityTimes).map(([id, duration]) => {
    const activity = entries.find(e => e.activity?.id === id)?.activity
    return {
      name: activity?.name || 'Inconnu',
      value: duration,
      color: activity?.color
    }
  })

  projectCount.value = Object.keys(projectTimes).length
  activityCount.value = Object.keys(activityTimes).length
}

watch(filters, () => {
  fetchTimeEntries()
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    fetchProjects(),
    fetchTimeEntries()
  ])

  updateInterval = setInterval(() => {
    updateDurations()
  }, 1000)

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  destroyCharts()
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
  
  <style scoped>
  .statistics-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }
  
  .filters-section {
    background-color: white;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .date-filters {
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: center;
  }

  .date-filters .form-group {
    width: 45%;
  }
  
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .stat-card h3 {
    font-size: 0.875rem;
    color: var(--gray-700);
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--gray-900);
  }
  
  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .chart-container {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .chart-container h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .time-entries-section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--gray-700);
  }
  
  .time-entries-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  
  .time-entries-table th,
  .time-entries-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .time-entries-table th {
    font-weight: 600;
    color: var(--gray-700);
    background-color: var(--gray-50);
  }
  </style>