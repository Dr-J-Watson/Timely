<template>
    <h1>Menu</h1>
    <div>
        <label>Profile</label>
        <form>
            <input type="text" v-model="user.name" placeholder="Nom d'utilisateur" required />
            <input type="email" v-model="user.email" placeholder="Email" required />
            <button type="submit" @click="modifier">Modifier le compte</button>
        </form>
    </div>
    <button @click="deconnexion">Déconnexion</button>
    <div>
        <label>Projets</label>
    </div>
    <div>
        <label>Activites</label>
    </div>
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
            key: '',
        };
    },
    methods: {
        async modifier() {
            try {
                const store = useApiStore();
                store.setApiKey(store.apiKey);
                if (!store.apiInstance) {
                    throw new Error('L\'API n\'est pas initialisée');
                }
                const response = store.apiInstance.put('/api/profile', this.user);
                alert("Compte modifié avec succès");
            } catch (error) {
                console.error("Erreur lors de la modification : ", error.response?.data || error.message);
                alert("Erreur lors de la modification : " + error.response?.data?.message || error.message);
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