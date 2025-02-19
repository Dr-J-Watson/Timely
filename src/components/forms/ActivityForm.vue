<template>
    <form @submit.prevent="handleSubmit" class="activity-form">
      <div class="form-group">
        <label class="form-label">Nom</label>
        <input 
          v-model="formData.name" 
          type="text" 
          required
          class="form-input"
          placeholder="Nom de l'activité"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Couleur</label>
        <div class="color-picker-container">
          <input 
            v-model="formData.color" 
            type="color"
            class="color-picker"
          />
          <span class="color-preview" :style="{ backgroundColor: formData.color }"></span>
        </div>
      </div>
  
      <div class="form-actions">
        <button 
          type="button" 
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          Annuler
        </button>
        <button 
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          {{ activity ? 'Modifier' : 'Créer' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useApiStore } from '@/stores/api'
  import { useToast } from 'vue-toastification'
  
  const props = defineProps({
    activity: {
      type: Object,
      default: null
    }
  })
  
  const emit = defineEmits(['submit', 'cancel'])
  const apiStore = useApiStore()
  const toast = useToast()
  
  const formData = ref({
    name: '',
    color: '#4F46E5'
  })
  
  const isSubmitting = ref(false)
  
  onMounted(() => {
    if (props.activity) {
      formData.value = {
        name: props.activity.name,
        color: props.activity.color || '#4F46E5'
      }
    }
  })
  
  const handleSubmit = async () => {
    if (isSubmitting.value) return
  
    try {
      isSubmitting.value = true
  
      if (props.activity) {
        await apiStore.apiInstance.put(`/api/activities/${props.activity.id}`, formData.value)
        toast.success('Activité modifiée avec succès')
      } else {
        await apiStore.apiInstance.post('/api/activities', formData.value)
        toast.success('Activité créée avec succès')
      }
      
      emit('submit')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue'
      toast.error(props.activity 
        ? `Erreur lors de la modification : ${errorMessage}`
        : `Erreur lors de la création : ${errorMessage}`
      )
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
  .activity-form {
    max-width: 100%;
    padding: 1rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .color-picker-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .color-picker {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 50px;
    height: 50px;
    padding: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  .color-picker::-webkit-color-swatch {
    border: 1px solid var(--gray-300);
    border-radius: 4px;
  }
  
  .color-preview {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid var(--gray-300);
  }
  
  .btn-secondary {
    background-color: var(--gray-200);
    color: var(--gray-700);
  }
  
  .btn-secondary:hover {
    background-color: var(--gray-300);
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  </style>