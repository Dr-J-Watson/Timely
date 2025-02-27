<template>
    <form @submit.prevent="handleSubmit" class="project-form">
      <div class="form-group">
        <label class="form-label">Nom</label>
        <input 
          v-model="formData.name" 
          type="text" 
          required
          class="form-input"
          placeholder="Nom du projet"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea 
          v-model="formData.description" 
          class="form-input textarea"
          rows="3"
          placeholder="Description du projet"
        ></textarea>
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
        >
          {{ project ? 'Modifier' : 'Créer' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
    import { useApiStore } from '@/stores/api'
    import { useToast } from 'vue-toastification'
  
  const props = defineProps({
    project: {
      type: Object,
      default: null
    }
  })
  
  const emit = defineEmits(['submit', 'cancel'])
  const apiStore = useApiStore()
  const toast = useToast()
  
  const formData = ref({
    name: '',
    description: ''
  })
  
  onMounted(() => {
    if (props.project) {
      formData.value = {
        name: props.project.name,
        description: props.project.description
      }
    }
  })
  
  const handleSubmit = async () => {
    try {
      if (props.project) {
        await apiStore.apiInstance.put(`/api/projects/${props.project.id}`, formData.value)
        toast.success('Projet modifié avec succès')
      } else {
        await apiStore.apiInstance.post('/api/projects', formData.value)
        toast.success('Projet créé avec succès')
      }
      emit('submit')
    } catch (error) {
      toast.error(props.project ? 'Erreur lors de la modification du projet' : 'Erreur lors de la création du projet')
    }
  }
  </script>
  
  <style scoped>
  .project-form {
    max-width: 100%;
    padding: 1rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .btn-secondary {
    background-color: var(--gray-200);
    color: var(--gray-700);
  }
  
  .btn-secondary:hover {
    background-color: var(--gray-300);
  }
  </style>