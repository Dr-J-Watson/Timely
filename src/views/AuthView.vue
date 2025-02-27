<template>
    <div class="auth-container">
      <div class="auth-box">
        <h2 class="auth-title">
          {{ isLogin ? 'Connexion' : 'Créer un compte' }}
        </h2>
  
        <!-- Formulaire de connexion avec API Key -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Clé API</label>
            <input
              v-model="apiKey"
              type="text"
              required
              class="form-input"
              placeholder="Entrez votre clé API"
            />
          </div>
  
          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary submit-btn"
          >
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
  
        <!-- Formulaire d'inscription -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">Nom complet</label>
            <input
              v-model="registerForm.name"
              type="text"
              required
              class="form-input"
              placeholder="Entrez votre nom"
            />
          </div>
  
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="registerForm.email"
              type="email"
              required
              class="form-input"
              placeholder="Entrez votre email"
            />
          </div>
  
          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary submit-btn"
          >
            {{ isLoading ? 'Création...' : 'Créer un compte' }}
          </button>
        </form>
  
        <!-- Séparateur et bouton de bascule -->
        <div class="auth-separator">
          <span class="separator-text">
            {{ isLogin ? "Pas encore de clé API ?" : "Vous avez déjà une clé API ?" }}
          </span>
        </div>
  
        <button
          @click="toggleMode"
          class="btn btn-secondary switch-btn"
        >
          {{ isLogin ? 'Créer un compte' : 'Utiliser une clé existante' }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useApiStore } from '@/stores/api'
  import { useToast } from 'vue-toastification'
  
  const router = useRouter()
  const apiStore = useApiStore()
  const toast = useToast()
  
  const isLogin = ref(true)
  const isLoading = ref(false)
  const apiKey = ref('')
  const registerForm = ref({
    name: '',
    email: ''
  })
  
  const toggleMode = () => {
    isLogin.value = !isLogin.value
  }
  
  const handleLogin = async () => {
    if (!apiKey.value) return
  
    isLoading.value = true
    try {
      apiStore.setApiKey(apiKey.value)
      const profile = await apiStore.getProfile()
      if (profile) {
        toast.success('Connexion réussie')
        router.push('/')
      }
    } catch (error) {
      apiStore.removeApiKey()
      toast.error('Clé API invalide')
    } finally {
      isLoading.value = false
    }
  }
  
  const handleRegister = async () => {
    isLoading.value = true
    try {
      const success = await apiStore.createApiKey(
        registerForm.value.name,
        registerForm.value.email
      )
      if (success) {
        toast.success('Compte créé avec succès')
        router.push('/')
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la création du compte'
      toast.error(message)
    } finally {
      isLoading.value = false
    }
  }
  </script>
  
  <style scoped>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--gray-100);
    padding: 1rem;
  }
  
  .auth-box {
    background-color: white;
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .auth-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--gray-900);
  }
  
  .auth-form {
    margin-bottom: 1.5rem;
  }
  
  .submit-btn {
    width: 100%;
    margin-top: 1rem;
  }
  
  .auth-separator {
    position: relative;
    text-align: center;
    margin: 1.5rem 0;
  }
  
  .auth-separator::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
    background-color: var(--gray-200);
  }
  
  .separator-text {
    position: relative;
    background-color: white;
    padding: 0 0.5rem;
    color: var(--gray-500);
    font-size: 0.875rem;
  }
  
  .switch-btn {
    width: 100%;
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  </style>