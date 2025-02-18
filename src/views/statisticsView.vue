<template>
    <div class="statistics-container">
      <h1>Statistiques</h1>
      <div class="filters">
        <label for="start-date">Du :</label>
        <input type="date" id="start-date" v-model="startDate" />
        <label for="end-date">Au :</label>
        <input type="date" id="end-date" v-model="endDate" />
        <button @click="fetchStatistics">Appliquer</button>
      </div>
      <div class="charts">
        <canvas id="projectChart"></canvas>
        <canvas id="activityChart"></canvas>
      </div>
      <div class="logs">
        <h2>Entrées de temps</h2>
        <ul>
          <li v-for="entry in timeEntries" :key="entry.id">
            {{ entry.start }} - {{ entry.end }} : {{ entry.project }} - {{ entry.activity }} ({{ entry.duration }})
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useApiStore } from '@/stores/api';
  import { useToast } from 'vue-toastification';
  import Chart from 'chart.js/auto';
  
  export default {
    setup() {
      const startDate = ref(new Date().toISOString().substr(0, 10));
      const endDate = ref(new Date().toISOString().substr(0, 10));
      const timeEntries = ref([]);
      const projectChart = ref(null);
      const activityChart = ref(null);
  
      const fetchStatistics = async () => {
        const toast = useToast();
        try {
          const store = useApiStore();
          const api = store.apiInstance;
          if (!api) {
            throw new Error('API instance is not initialized');
          }
  
          // Fetch time entries
          const timeEntriesResponse = await api.get(`/api/time-entries?from=${startDate.value}&to=${endDate.value}`);
          timeEntries.value = timeEntriesResponse.data;
  
          // Calculate project statistics
          const projectStats = {};
          const activityStats = {};
          timeEntries.value.forEach(entry => {
            if (!projectStats[entry.project]) {
              projectStats[entry.project] = 0;
            }
            projectStats[entry.project] += entry.duration;
  
            if (!activityStats[entry.activity]) {
              activityStats[entry.activity] = 0;
            }
            activityStats[entry.activity] += entry.duration;
          });
  
          // Render project chart
          if (projectChart.value) {
            projectChart.value.destroy();
          }
          projectChart.value = new Chart(document.getElementById('projectChart'), {
            type: 'pie',
            data: {
              labels: Object.keys(projectStats),
              datasets: [{
                data: Object.values(projectStats),
                backgroundColor: Object.keys(projectStats).map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`),
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Répartition du temps par projet'
                }
              }
            }
          });
  
          // Render activity chart
          if (activityChart.value) {
            activityChart.value.destroy();
          }
          activityChart.value = new Chart(document.getElementById('activityChart'), {
            type: 'pie',
            data: {
              labels: Object.keys(activityStats),
              datasets: [{
                data: Object.values(activityStats),
                backgroundColor: Object.keys(activityStats).map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`),
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Répartition du temps par activité'
                }
              }
            }
          });
  
        } catch (error) {
          console.error("Erreur lors de la récupération des statistiques : ", error.response?.data || error.message);
          toast.error("Erreur lors de la récupération des statistiques : " + (error.response?.data || error.message));
        }
      };
  
      onMounted(() => {
        fetchStatistics();
      });
  
      return {
        startDate,
        endDate,
        timeEntries,
        fetchStatistics,
      };
    }
  };
  </script>
  
  <style scoped>
  .statistics-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
  }
  
  .filters {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .filters label {
    margin-right: 10px;
  }
  
  .filters input {
    margin-right: 20px;
  }
  
  .charts {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .charts canvas {
    width: 45%;
  }
  
  .logs {
    margin-top: 20px;
  }
  
  .logs ul {
    list-style-type: none;
    padding: 0;
  }
  
  .logs li {
    margin-bottom: 10px;
  }
  </style>