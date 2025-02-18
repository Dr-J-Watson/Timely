<template>
  <Header />
  <div class="home-container">
    <h1>Accueil</h1>
    <form @submit.prevent="connexion" class="connexion-form">
      <div class="form-group">
        <input type="text" v-model="user.key" placeholder="Saisir l'apikey" required />
      </div>
      <button type="submit" class="submit-button">Connexion</button>
      <div class="signup-link">
        <label>Nouveau sur l'application ?</label>
        <label class="link" @click="inscription">Créer un compte</label>
      </div>
    </form>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import { useApiStore } from '@/stores/api';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      user: {
        key: '',
      },
    };
  },
  methods: {
    inscription() {
      this.$router.push({ name: 'inscription' });
    },
    async connexion() {
      const toast = useToast();
      try {
        const store = useApiStore();
        store.setApiKey(this.user.key);
        const response = await store.apiInstance.get('/api/profile');
        toast.success("Connexion réussie !");
        this.$router.push({ name: 'statistics' });
      } catch (error) {
        console.error("Erreur lors de la connexion : ", error.response?.data || error.message);
        toast.error("Erreur lors de la connexion : " + (error.response?.data || error.message));
      }
    },
  },
  components: {
      Header
  },
};
</script>

<style scoped>
.home-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
  text-align: center;
}

.connexion-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
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

.signup-link {
  margin-top: 20px;
}

.link {
  color: blue;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}
</style>