<template>
    <div class="profile-settings">
      <h1 class="settings-title">Mon profil</h1>
      
      <div class="profile-box">
        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group">
            <label class="form-label">Nom complet</label>
            <input
              v-model="profile.name"
              type="text"
              required
              class="form-input"
              placeholder="Votre nom complet"
            />
          </div>
  
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="profile.email"
              type="email"
              required
              class="form-input"
              placeholder="Votre adresse email"
            />
          </div>

          <div class="form-group">
            <label class="form-label
            ">Clé d'API</label>
            <input
              v-model="apiStore.apiKey"
              type="text"
              required
              class="form-input"
              placeholder="Votre clé d'API"
              disabled
            />
          </div>
  
          <div class="form-actions">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn btn-primary"
            >
              {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useApiStore } from '@/stores/api'
  import { useToast } from 'vue-toastification'
  
  const apiStore = useApiStore()
  const toast = useToast()
  
  const profile = ref({
    name: '',
    email: ''
  })
  const isSubmitting = ref(false)
  
  onMounted(async () => {
    try {
      const response = await apiStore.getProfile()
      profile.value = {
        name: response.name,
        email: response.email
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Erreur lors du chargement du profil')
    }
  })
  
  const updateProfile = async () => {
    if (isSubmitting.value) return
    
    isSubmitting.value = true
    try {
      await apiStore.updateProfile(profile.value.name, profile.value.email)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
  .profile-settings {
    max-width: 600px;
  }
  
  .settings-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--gray-900);
  }
  
  .profile-form {
    background-color: white;
    border-radius: 8px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  </style>