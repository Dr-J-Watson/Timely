<template>
    <div class="time-entry-item">
      <div class="time-entry-header">
        <div class="project-info">
          <h3 class="project-name">{{ entry.project?.name }}</h3>
          <p class="activity-name" :style="{ color: entry.activity?.color }">
            {{ entry.activity?.name }}
          </p>
        </div>
        <div class="time-info">
          <span class="time">{{ formatDate(entry.start) }}</span>
          <span class="duration">{{ getDuration() }}</span>
        </div>
      </div>
  
      <p v-if="entry.comment" class="time-entry-comment">{{ entry.comment }}</p>
  
      <div class="time-entry-actions">
        <button 
          v-if="!entry.end"
          @click="handleStop" 
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
          @click="handleDelete" 
          class="btn btn-danger btn-small"
        >
          Supprimer
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    entry: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['update', 'edit', 'delete'])
  
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('fr-FR')
  }
  
  const getDuration = () => {
  if (!props.entry.start) return '0h00m'
  
  const start = new Date(props.entry.start)
  const end = props.entry.end === "0000-00-00 00:00:00" ? new Date() : new Date(props.entry.end)
  const diff = end - start
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}m`
}
  
  const handleDelete = () => {
    if (confirm('Voulez-vous vraiment supprimer cette entrée ?')) {
      emit('delete', props.entry.id)
    }
  }
  
  const handleStop = () => {
    if (confirm('Voulez-vous arrêter cette entrée ?')) {
      emit('stop', props.entry.id)
    }
  }
  </script>
  
  <style scoped>
  .time-entry-item {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
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
  
  .time-entry-comment {
    margin: 0.5rem 0;
    font-size: 0.875rem;
    color: var(--gray-700);
  }
  
  .time-entry-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .btn-small {
    padding: 4px 8px;
    font-size: 0.875rem;
  }
  </style>