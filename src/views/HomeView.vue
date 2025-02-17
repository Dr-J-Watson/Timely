<template>
  <h1>Accueil</h1>
  <form @submit.prevent="connexion">
    <input type="text" v-model="user.key" placeholder="Saisir l'apikey"/>
    <button type="submit">Connexion</button>
    <div>
      <label> Nouveau sur l'application ?</label>
      <label class="link" @click="inscription"> Créer un compte</label>
    </div>
  </form>
</template>

<script>
import { useApiStore } from '@/stores/api';

export default {
  data() {
    return {
      user: {
        key:'',
      }
    };
  },
  methods: {
    inscription() {
      this.$router.push({ name: 'inscription' });
    },
    async connexion() {
      try {
        const store = useApiStore();
        store.setApiKey(this.user.key);
        const response = await store.api.get('/api/profile');
        this.$router.push({ name: 'menu'});
      } catch (error) {
        console.error("Erreur lors de la connexion : ", error.response?.data || error.message);
      }
    }
  }
};
</script>

<style scoped>
button {
  cursor: pointer;
  border-radius: 15px;
}

.link {
  color: blue;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

form {
  font-size: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
