<template>
  <Header />
  <div class="menu-container">
    <h1>Paramètres généraux</h1>
    <div class="profile-section">
      <h2>Mon profil</h2>
      <form @submit.prevent="modifier" class="profile-form">
        <div class="form-group">
          <label for="name">Nom d'utilisateur</label>
          <input type="text" id="name" v-model="user.name" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="user.email" required />
        </div>
        <button type="submit" class="submit-button">Modifier le compte</button>
      </form>
    </div>
    <div class="sections">
      <div class="section">
        <h2>Mes projets</h2>
        <button @click="ajouterProjet" class="add-button">Ajouter un projet</button>
        <ul>
          <li v-for="project in projects" :key="project.id">
            {{ project.name }}
            <button @click="modifierProjet(project)">Modifier</button>
            <button @click="toggleProjet(project)">{{ project.active ? 'Désactiver' : 'Réactiver' }}</button>
          </li>
        </ul>
      </div>
      <div class="section">
        <h2>Mes activités</h2>
        <button @click="ajouterActivite" class="add-button">Ajouter une activité</button>
        <ul>
          <li v-for="activity in activities" :key="activity.id">
            {{ activity.name }}
            <button @click="modifierActivite(activity)">Modifier</button>
            <button @click="toggleActivite(activity)">{{ activity.active ? 'Désactiver' : 'Réactiver' }}</button>
          </li>
        </ul>
      </div>
    </div>
    <button @click="deconnexion" class="logout-button">Déconnexion</button>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import { useApiStore } from '@/stores/api';
import { useToast } from 'vue-toastification';

export default {
  components: {
    Header
  },
  data() {
    return {
      user: {
        name: '',
        email: ''
      },
      projects: [],
      activities: []
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
      const profileResponse = await api.get('/api/profile');
      this.user.name = profileResponse.data.name;
      this.user.email = profileResponse.data.email;

      const projectsResponse = await api.get('/api/projects');
      this.projects = projectsResponse.data;

      const activitiesResponse = await api.get('/api/activities');
      this.activities = activitiesResponse.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données : ", error.response?.data || error.message);
      toast.error("Erreur lors de la récupération des données : " + (error.response?.data || error.message));
    }
  },
  methods: {
    async modifier() {
      const toast = useToast();
      try {
        const store = useApiStore();
        const api = store.apiInstance;
        if (!api) {
          throw new Error('API instance is not initialized');
        }
        await api.put('/api/profile', this.user);
        toast.success("Compte modifié avec succès");
      } catch (error) {
        console.error("Erreur lors de la modification : ", error.response?.data || error.message);
        toast.error("Erreur lors de la modification : " + (error.response?.data?.message || error.message));
      }
    },
    async ajouterProjet() {
      // Logique pour ajouter un projet
    },
    async modifierProjet(project) {
      // Logique pour modifier un projet
    },
    async toggleProjet(project) {
      const toast = useToast();
      try {
        const store = useApiStore();
        const api = store.apiInstance;
        if (!api) {
          throw new Error('API instance is not initialized');
        }
        if (project.active) {
          await api.patch(`/api/projects/${project.id}/disable`);
          project.active = false;
        } else {
          await api.patch(`/api/projects/${project.id}/enable`);
          project.active = true;
        }
        toast.success(`Projet ${project.active ? 'réactivé' : 'désactivé'} avec succès`);
      } catch (error) {
        console.error("Erreur lors de la modification du projet : ", error.response?.data || error.message);
        toast.error("Erreur lors de la modification du projet : " + (error.response?.data || error.message));
      }
    },
    async ajouterActivite() {
      // Logique pour ajouter une activité
    },
    async modifierActivite(activity) {
      // Logique pour modifier une activité
    },
    async toggleActivite(activity) {
      const toast = useToast();
      try {
        const store = useApiStore();
        const api = store.apiInstance;
        if (!api) {
          throw new Error('API instance is not initialized');
        }
        if (activity.active) {
          await api.patch(`/api/activities/${activity.id}/disable`);
          activity.active = false;
        } else {
          await api.patch(`/api/activities/${activity.id}/enable`);
          activity.active = true;
        }
        toast.success(`Activité ${activity.active ? 'réactivée' : 'désactivée'} avec succès`);
      } catch (error) {
        console.error("Erreur lors de la modification de l'activité : ", error.response?.data || error.message);
        toast.error("Erreur lors de la modification de l'activité : " + (error.response?.data || error.message));
      }
    },
  }
};
</script>

<style scoped>
.menu-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.profile-section {
  margin-bottom: 20px;
}

.profile-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.submit-button {
  cursor: pointer;
  border-radius: 15px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  font-size: 16px;
}

.logout-button {
  cursor: pointer;
  border-radius: 15px;
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  font-size: 16px;
  margin-bottom: 20px;
}

.sections {
  display: flex;
  justify-content: space-between;
}

.section {
  flex: 1;
  margin-right: 20px;
}

.section:last-child {
  margin-right: 0;
}

.section h2 {
  font-size: 18px;
  font-weight: bold;
}

.add-button {
  cursor: pointer;
  border-radius: 15px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  font-size: 16px;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}

button {
  margin-left: 10px;
  cursor: pointer;
  border-radius: 5px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  font-size: 14px;
}

button:hover {
  background-color: #0056b3;
}
</style>