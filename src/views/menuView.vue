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
                console.log("key: "+store.key);
                store.setApiKey(store.key);
                if (!store.api) {
                    throw new Error('L\'API n\'est pas initialisée');
                }
                console.log("Modification du compte : ", this.user);
                console.log("key: "+store.key);
                const response = await store.api.put('/api/profile', this.user);
                console.log("Réponse API : ", response.data);
            } catch (error) {
                console.error("Erreur lors de la modification : ", error.response?.data || error.message);
            }
        }
    }
}

</script>