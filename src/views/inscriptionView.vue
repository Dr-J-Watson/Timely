<template>
    <h1>Inscription</h1>
    <form @submit.prevent="inscription">
        <input type="text" v-model="user.name" placeholder="Nom d'utilisateur" required />
        <input type="email" v-model="user.email" placeholder="Email" required />
        <button type="submit">Inscription</button>

        <div v-if="apikey">
            <label>Votre apikey :</label>
            <input type="text" v-model="apikey" readonly />
        </div>

        <div>
            <label> Vous avez déjà un compte ?</label>
            <label class="link" @click="connexion"> Se connecter</label>
        </div>
    </form>
</template>

<script>
import { useApiStore } from '@/stores/api';

export default {
    data() {
        return {
            user: {
                name: '',
                email: ''
            },
            apikey: ''
        };
    },
    methods: {
        connexion() {
            this.$router.push({ name: 'home' });
        },
        async inscription() {
            try {
                const store = useApiStore();
                store.setApiKey(''); 
                const response = await store.api.post('/api/apikeys', {
                    name: this.user.name,
                    email: this.user.email
                });

                console.log("Réponse API : ", response.data);
                this.apikey = response.data.key || "Clé non reçue";

                store.setApiKey(this.apikey);
            } catch (error) {
                console.error("Erreur lors de l'inscription : ", error.response?.data || error.message);
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