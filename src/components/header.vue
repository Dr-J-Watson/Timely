<template>
    <header class="app-header">
      <nav>
        <div class="nav-top">
          <ul class="nav-buttons">
            <li><router-link to="/settings">Paramètres généraux</router-link></li>
            <li><router-link to="/activities">Activité</router-link></li>
            <li><router-link to="/statistics">Statistiques</router-link></li>
            <li><a @click="deconnexion">Déconnexion</a></li>
          </ul>
        </div>
        <div class="nav-bottom">
          <ul class="nav-info">
            <li v-if="currentActivity">
              Activité courante : {{ currentActivity.project }} - {{ currentActivity.activity }} ({{ currentActivity.duration }})
              <button @click="stopActivity">Arrêter</button>
            </li>
            <li>Heures travaillées aujourd'hui : {{ hoursWorkedToday }}</li>
            <li>Objectifs atteints aujourd'hui : {{ objectivesCompletedToday }} / {{ totalObjectivesToday }}</li>
          </ul>
        </div>
      </nav>
    </header>
  </template>
  
  <script>
  import { useApiStore } from '@/stores/api';
  import { useToast } from 'vue-toastification';
  
  export default {
    data() {
      return {
        currentActivity: null,
        hoursWorkedToday: '0h',
        objectivesCompletedToday: 0,
        totalObjectivesToday: 0,
      };
    },
    async mounted() {
      const toast = useToast();
      try {
        const store = useApiStore();
        const api = store.apiInstance;
        if (!api) {
          throw new Error('API instance is not initialized');
        }
        // Fetch current activity
        const activityResponse = await api.get('/api/time-entries?current=true');
        this.currentActivity = activityResponse.data;
  
        // Fetch hours worked today
        const hoursResponse = await api.get('/api/time-entries?date=today');
        this.hoursWorkedToday = hoursResponse.data.total_hours || '0h';
  
        // Fetch objectives completed today
        const objectivesResponse = await api.get('/api/daily-objectives?date=today');
        this.objectivesCompletedToday = objectivesResponse.data.filter(obj => obj.done).length;
        this.totalObjectivesToday = objectivesResponse.data.length;
      } catch (error) {
        console.error("Erreur lors de la récupération des données : ", error.response?.data || error.message);
        toast.error("Erreur lors de la récupération des données : " + (error.response?.data || error.message));
      }
    },
    methods: {
      async stopActivity() {
        const toast = useToast();
        try {
          const store = useApiStore();
          const api = store.apiInstance;
          if (!api) {
            throw new Error('API instance is not initialized');
          }
          await api.patch(`/api/time-entries/${this.currentActivity.id}/stop`);
          this.currentActivity = null;
          toast.success("Activité arrêtée avec succès");
        } catch (error) {
          console.error("Erreur lors de l'arrêt de l'activité : ", error.response?.data || error.message);
          toast.error("Erreur lors de l'arrêt de l'activité : " + (error.response?.data || error.message));
        }
      },
      deconnexion() {
        const store = useApiStore();
        store.removeApiKey();
        this.$router.push('/connexion');
      }
    }
  };
  </script>
  
  <style scoped>
  .app-header {
    background-color: #333;
    color: white;
    padding: 10px;
  }
  
  nav {
    display: flex;
    flex-direction: column;
  }
  
  .nav-top {
    display: flex;
    justify-content: space-between;
  }
  
  .nav-buttons {
    list-style-type: none;
    padding: 0;
    display: flex;
  }
  
  .nav-buttons li {
    margin-right: 20px;
  }
  
  .nav-buttons li a {
    color: white;
    text-decoration: none;
  }
  
  .nav-buttons li a:hover {
    text-decoration: underline;
  }
  
  .nav-bottom {
    margin-top: 10px;
  }
  
  .nav-info {
    list-style-type: none;
    padding: 0;
  }
  
  .nav-info li {
    margin-bottom: 5px;
  }
  
  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>