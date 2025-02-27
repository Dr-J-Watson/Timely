<template>
    <div class="project-item">
      <div class="project-content">
        <h3 class="project-name">{{ project.name }}</h3>
        <div class="project-actions">
          <button 
            @click="$emit('edit', project)" 
            class="btn btn-primary btn-small"
          >
            Modifier
          </button>
          <button 
            @click="toggleStatus" 
            :class="project.is_enabled ? 'btn-danger' : 'btn-success'"
            class="btn btn-small"
          >
            {{ project.is_enabled ? 'Désactiver' : 'Activer' }}
          </button>
        </div>
      </div>
      <p class="project-description">{{ project.description }}</p>
    </div>
  </template>
  
  <script setup>
    import { useApiStore } from '@/stores/api'
    import { useToast } from 'vue-toastification'
  
  const props = defineProps({
    project: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['update', 'edit'])
  const apiStore = useApiStore()
  const toast = useToast()
  
  const toggleStatus = async () => {
    try {
      const endpoint = props.project.is_enabled ? 'disable' : 'enable'
      await apiStore.apiInstance.patch(`/api/projects/${props.project.id}/${endpoint}`)
      emit('update')
      toast.success(`Projet ${props.project.is_enabled ? 'désactivé' : 'activé'} avec succès`)
    } catch (error) {
      toast.error('Erreur lors de la modification du statut')
    }
  }
  </script>
  
  <style scoped>
  .project-item {
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .project-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .project-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  .project-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .project-description {
    color: var(--gray-700);
    margin: 0;
    font-size: 0.875rem;
  }
  
  .btn-success {
    background-color: var(--success-color);
    color: white;
  }
  
  .btn-success:hover {
    filter: brightness(0.9);
  }
  
  .btn-small {
    padding: 4px 8px;
    font-size: 0.875rem;
  }
  </style>