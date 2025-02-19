```vue
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
            <td>{{ entry.project?.name || 'N/A' }}</td>
            <td>
              <span :style="{ color: entry.activity?.color }">
                {{ entry.activity?.name || 'N/A' }}
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

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useApiStore } from '@/stores/api'
import { useToast } from 'vue-toastification'
import Chart from 'chart.js/auto'

const apiStore = useApiStore()
const toast = useToast()

const projectChart = ref(null)
const activityChart = ref(null)
let projectChartInstance = null
let activityChartInstance = null

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

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('fr-FR')
}

const formatDuration = (ms) => {
  if (!ms || ms < 0) return '0h00m'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

const getDuration = (entry) => {
  if (!entry?.start) return 0
  const start = new Date(entry.start)
  const end = entry.end ? new Date(entry.end) : new Date()
  return end - start
}

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

const updateCharts = () => {
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
          backgroundColor: activityTimeData.value.map(d => d.color)
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

const fetchProjects = async () => {
  try {
    const response = await apiStore.apiInstance.get('/api/projects')
    if (response.data) {
      projects.value = response.data.filter(p => p.active)
    }
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
    
    if (response.data) {
      timeEntries.value = response.data
      calculateStatistics(timeEntries.value)
      updateCharts()
    }
  } catch (error) {
    console.error('Error fetching time entries:', error)
    toast.error('Erreur lors du chargement des données')
    timeEntries.value = []
    calculateStatistics([])
    updateCharts()
  }
}

const calculateStatistics = (entries) => {
  if (!Array.isArray(entries)) {
    entries = []
  }

  totalTime.value = entries.reduce((total, entry) => {
    return total + getDuration(entry)
  }, 0)

  const projectTimes = {}
  const activityTimes = {}

  entries.forEach(entry => {
    if (!entry.project || !entry.activity) return
    
    const duration = getDuration(entry)
    
    if (entry.project.id) {
      projectTimes[entry.project.id] = (projectTimes[entry.project.id] || 0) + duration
    }
    
    if (entry.activity.id) {
      activityTimes[entry.activity.id] = (activityTimes[entry.activity.id] || 0) + duration
    }
  })

  projectTimeData.value = Object.entries(projectTimes).map(([id, duration]) => ({
    name: projects.value.find(p => p.id === id)?.name || 'Inconnu',
    value: duration
  }))

  activityTimeData.value = Object.entries(activityTimes).map(([id, duration]) => {
    const activity = entries.find(e => e.activity.id === id)?.activity
    return {
      name: activity?.name || 'Inconnu',
      value: duration,
      color: activity?.color || '#CBD5E0'
    }
  })

  projectCount.value = Object.keys(projectTimes).length
  activityCount.value = Object.keys(activityTimes).length
}

watch(filters, () => {
  fetchTimeEntries()
}, { deep: true })

onMounted(() => {
  fetchProjects()
  fetchTimeEntries()
})

onUnmounted(() => {
  destroyCharts()
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
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.date-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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