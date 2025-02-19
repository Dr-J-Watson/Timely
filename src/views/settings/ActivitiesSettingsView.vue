<template>
    <div class="activities-settings">
      <div class="settings-header">
        <h1 class="settings-title">Mes activités</h1>
        <button
          @click="showForm = true"
          class="btn btn-primary"
        >
          Nouvelle activité
        </button>
      </div>
  
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="Rechercher une activité..."
        />
      </div>
  
      <div class="activities-list">
        <div v-if="filteredActivities.length === 0" class="empty-state">
          Aucune activité trouvée
        </div>
        
        <ActivityItem
          v-for="activity in filteredActivities"
          :key="activity.id"
          :activity="activity"
          @update="fetchActivities"
          @edit="editActivity"
        />
      </div>
  
      <div v-if="showForm" class="modal-overlay">
        <div class="modal-content">
          <h2 class="modal-title">
            {{ selectedActivity ? 'Modifier l\'activité' : 'Nouvelle activité' }}
          </h2>
          <ActivityForm
            :activity="selectedActivity"
            @submit="onFormSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useApiStore } from '@/stores/api'
  import { useToast } from 'vue-toastification'
  import ActivityItem from '@/components/items/ActivityItem.vue'
  import ActivityForm from '@/components/forms/ActivityForm.vue'
  
  const apiStore = useApiStore()
  const toast = useToast()
  
  const activities = ref([])
  const searchQuery = ref('')
  const showForm = ref(false)
  const selectedActivity = ref(null)
  
  const filteredActivities = computed(() => {
    if (!searchQuery.value) return activities.value
    const query = searchQuery.value.toLowerCase()
    return activities.value.filter(activity => 
      activity.name.toLowerCase().includes(query)
    )
  })
  
  const fetchActivities = async () => {
    try {
      const response = await apiStore.apiInstance.get('/api/activities')
      activities.value = response.data
    } catch (error) {
      toast.error('Erreur lors du chargement des activités')
    }
  }
  
  const editActivity = (activity) => {
    selectedActivity.value = activity
    showForm.value = true
  }
  
  const closeForm = () => {
    showForm.value = false
    selectedActivity.value = null
  }
  
  const onFormSubmit = () => {
    closeForm()
    fetchActivities()
  }
  
  onMounted(fetchActivities)
  </script>
  
  <style scoped>
  .activities-settings {
    min-height: 100%;
  }
  
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .settings-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--gray-900);
    margin: 0;
  }
  
  .search-box {
    margin-bottom: 1.5rem;
  }
  
  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    background-color: var(--gray-100);
    border-radius: 8px;
    color: var(--gray-700);
  }
  
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--gray-900);
  }
  </style>