<template>
  <div class="menu-container">
    <h1>Menu</h1>
    <div class="profile-section">
      <label>Profile</label>
      <form @submit.prevent="modifier" class="profile-form">
        <div class="form-group">
          <input type="text" v-model="user.name" placeholder="Nom d'utilisateur" required />
        </div>
        <div class="form-group">
          <input type="email" v-model="user.email" placeholder="Email" required />
        </div>
        <button type="submit" class="submit-button">Modifier le compte</button>
      </form>
    </div>
    <button @click="deconnexion" class="logout-button">Déconnexion</button>
    <div class="sections">
      <div>
        <label>Projets</label>
      </div>
      <div>
        <label>Activités</label>
      </div>
    </div>
  </div>
</template>

<script>
import { useApiStore } from '@/stores/api';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      user: {
        name: '',
        email: ''
      },
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
      const response = await api.get('/api/profile');
      this.user.name = response.data.name;
      this.user.email = response.data.email;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil : ", error.response?.data || error.message);
      toast.error("Erreur lors de la récupération du profil : " + (error.response?.data || error.message));
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
    deconnexion() {
      const store = useApiStore();
      store.removeApiKey();
      this.$router.push('/');
    }
  }
}
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

.sections div {
  flex: 1;
  text-align: center;
}

.sections label {
  font-size: 18px;
  font-weight: bold;
}
</style>