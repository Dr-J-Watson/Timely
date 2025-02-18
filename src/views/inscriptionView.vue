<template>
    <Header />
    <div class="inscription-container">
        <h1>Inscription</h1>
        <form @submit.prevent="inscription" class="inscription-form">
            <div class="form-group">
                <label for="name">Nom d'utilisateur</label>
                <input type="text" id="name" v-model="user.name" placeholder="Nom d'utilisateur" required />
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="user.email" placeholder="Email" required />
            </div>
            <button type="submit" class="submit-button">Inscription</button>

            <div v-if="apikey" class="apikey-container">
                <label>Votre apikey :</label>
                <input type="text" v-model="apikey" readonly />
            </div>

            <div class="login-link">
                <label>Vous avez déjà un compte ?</label>
                <label class="link" @click="connexion">Se connecter</label>
            </div>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import Header from '@/components/header.vue';
import { useApiStore } from '@/stores/api';
import { useToast } from 'vue-toastification';

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
            this.$router.push({ name: 'connexion' });
        },
        async inscription() {
            const toast = useToast();
            try {
                const response = await axios.post('https://timely.edu.netlor.fr/api/apikeys', {
                    name: this.user.name,
                    email: this.user.email
                });

                console.log("Réponse API : ", response.data);
                this.apikey = response.data.key || "Clé non reçue";

                const store = useApiStore();
                store.setApiKey(this.apikey);
                toast.success("Inscription réussie !");
            } catch (error) {
                console.error("Erreur lors de l'inscription : ", error.response?.data || error.message);
                toast.error("Erreur lors de l'inscription : " + (error.response?.data || error.message));
            }
        }
    },
    components: {
      Header
    },
};
</script>

<style scoped>
.inscription-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
}

.inscription-form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}

.submit-button {
    cursor: pointer;
    border-radius: 15px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    font-size: 16px;
}

.apikey-container {
    margin-top: 20px;
}

.login-link {
    margin-top: 20px;
    text-align: center;
}

.link {
    color: blue;
    cursor: pointer;
}

.link:hover {
    text-decoration: underline;
}
</style>