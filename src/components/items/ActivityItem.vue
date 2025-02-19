<template>
    <div class="activity-item">
      <div class="activity-content">
        <h3 class="activity-name">
          <span 
            class="activity-color" 
            :style="{ backgroundColor: activity.color }"
          ></span>
          {{ activity.name }}
        </h3>
        <div class="activity-actions">
          <button 
            @click="$emit('edit', activity)" 
            class="btn btn-primary btn-small"
          >
            Modifier
          </button>
          <button 
            @click="toggleStatus" 
            :class="activity.is_enabled ? 'btn-danger' : 'btn-success'"
            class="btn btn-small"
          >
            {{ activity.is_enabled ? 'Désactiver' : 'Activer' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useApiStore } from '@/stores/api'
  import { useToast } from 'vue-toastification'
  
  const props = defineProps({
    activity: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['update', 'edit'])
  const apiStore = useApiStore()
  const toast = useToast()
  
  const toggleStatus = async () => {
    try {
      const endpoint = props.activity.is_enabled ? 'disable' : 'enable'
      await apiStore.apiInstance.patch(`/api/activities/${props.activity.id}/${endpoint}`)
      emit('update')
      toast.success(`Activité ${props.activity.is_enabled ? 'désactivée' : 'activée'} avec succès`)
    } catch (error) {
      toast.error('Erreur lors de la modification du statut')
    }
  }
  </script>
  
  <style scoped>
  .activity-item {
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .activity-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .activity-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  .activity-color {
    width: 1rem;
    height: 1rem;
    border-radius: 4px;
    border: 1px solid var(--gray-200);
  }
  
  .activity-actions {
    display: flex;
    gap: 0.5rem;
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