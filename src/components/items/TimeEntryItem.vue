<template>
    <div class="time-entry-item">
      <div class="time-entry-header">
        <div class="project-info">
          <h3 class="project-name">{{ entry.project.name }}</h3>
          <p class="activity-name" :style="{ color: entry.activity.color }">
            {{ entry.activity.name }}
          </p>
        </div>
        <div class="time-info">
          <span class="time">{{ formatDate(entry.start) }}</span>
          <span class="duration">{{ getDuration() }}</span>
        </div>
      </div>
  
      <div class="time-entry-actions">
        <button 
          v-if="!entry.end"
          @click="stopEntry" 
          class="btn btn-danger btn-small"
        >
          Arrêter
        </button>
        <button 
          @click="$emit('edit', entry)" 
          class="btn btn-primary btn-small"
        >
          Modifier
        </button>
        <button 
          @click="deleteEntry" 
          class="btn btn-danger btn-small"
        >
          Supprimer
        </button>
      </div>
  
      <p v-if="entry.comment" class="time-entry-comment">{{ entry.comment }}</p>
    </div>
  </template>
  
  <script setup>
  import { useApiStore } from '@/stores/api'
  import { useToast } from 'vue-toastification'
  
  const props = defineProps({
    entry: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['update', 'edit'])
  const apiStore = useApiStore()
  const toast = useToast()
  
  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString()
  }
  
  const getDuration = () => {
    const start = new Date(props.entry.start)
    const end = props.entry.end ? new Date(props.entry.end) : new Date()
    const diff = end - start
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h${remainingMinutes}m`
  }
  
  const stopEntry = async () => {
    try {
      await apiStore.apiInstance.patch(`/api/time-entries/${props.entry.id}/stop`)
      emit('update')
      toast.success('Entrée de temps arrêtée')
    } catch (error) {
      toast.error('Erreur lors de l\'arrêt de l\'entrée')
    }
  }
  
  const deleteEntry = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cette entrée de temps ?')) return
    
    try {
      await apiStore.apiInstance.delete(`/api/time-entries/${props.entry.id}`)
      emit('update')
      toast.success('Entrée de temps supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'entrée')
    }
  }
  </script>
  
  <style scoped>
  .time-entry-item {
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .time-entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }
  
  .project-info {
    flex: 1;
  }
  
  .project-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  .activity-name {
    font-size: 0.875rem;
    margin: 0.25rem 0 0 0;
  }
  
  .time-info {
    text-align: right;
    font-size: 0.875rem;
  }
  
  .time {
    display: block;
    color: var(--gray-700);
  }
  
  .duration {
    display: block;
    font-weight: 600;
    margin-top: 0.25rem;
  }
  
  .time-entry-actions {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  
  .time-entry-comment {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: var(--gray-700);
    white-space: pre-wrap;
  }
  
  .btn-small {
    padding: 4px 8px;
    font-size: 0.875rem;
  }
  </style>