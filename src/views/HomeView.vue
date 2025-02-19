<template>
    <div class="home-container">
      <section class="timetracker-section">
        <h2 class="section-title">Time Tracker</h2>
        
        <div class="current-activity-box">
          <div v-if="currentEntry">
            <div class="current-activity-header">
              <div>
                <h3>{{ currentEntry.project.name }}</h3>
                <p class="activity-name">{{ currentEntry.activity.name }}</p>
              </div>
              <button 
                @click="stopCurrentEntry"
                class="btn btn-danger"
              >
                Arrêter
              </button>
            </div>
            <textarea
              v-model="currentComment"
              @change="updateComment"
              placeholder="Ajouter des notes sur votre travail..."
              class="activity-notes"
            ></textarea>
          </div>
          <div v-else>
            <TimeEntryForm @submit="onEntryCreated" />
          </div>
        </div>
  
        <div class="today-entries">
          <h3 class="subsection-title">Activités du jour</h3>
          <div v-if="todayEntries.length === 0" class="empty-state">
            Aucune activité enregistrée aujourd'hui
          </div>
          <div v-else class="entries-list">
            <TimeEntryItem
              v-for="entry in todayEntries"
              :key="entry.id"
              :entry="entry"
              @update="fetchEntries"
              @edit="editEntry"
            />
          </div>
        </div>
      </section>
  
      <section class="objectives-section">
        <div class="objectives-header">
          <h2 class="section-title">Objectifs quotidiens</h2>
          <button 
            @click="showObjectiveForm = true"
            class="btn btn-primary"
          >
            Nouvel objectif
          </button>
        </div>
  
        <div class="objectives-list">
          <div v-if="objectives.length === 0" class="empty-state">
            Aucun objectif défini pour aujourd'hui
          </div>
          <div
            v-for="objective in objectives"
            :key="objective.id"
            class="objective-item"
          >
            <div class="objective-content">
              <h4>{{ objective.name }}</h4>
              <p v-if="objective.content" class="objective-description">
                {{ objective.content }}
              </p>
            </div>
            <div class="objective-actions">
              <button 
                @click="toggleObjective(objective)"
                :class="objective.done ? 'btn-success' : 'btn-secondary'"
                class="btn btn-small"
              >
                {{ objective.done ? 'Terminé' : 'Marquer comme terminé' }}
              </button>
              <button 
                @click="deleteObjective(objective.id)"
                class="btn btn-danger btn-small"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </section>
  
      <div v-if="showObjectiveForm" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">Nouvel objectif</h3>
          <form @submit.prevent="createObjective" class="objective-form">
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input 
                v-model="newObjective.name" 
                type="text" 
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea 
                v-model="newObjective.content"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            <div class="modal-actions">
              <button 
                type="button"
                @click="showObjectiveForm = false"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button 
                type="submit"
                class="btn btn-primary"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useApiStore } from '@/stores/api'
  import { useToast } from 'vue-toastification'
  import TimeEntryForm from '@/components/forms/TimeEntryForm.vue'
  import TimeEntryItem from '@/components/items/TimeEntryItem.vue'
  
  const apiStore = useApiStore()
  const toast = useToast()
  
  const currentEntry = ref(null)
  const todayEntries = ref([])
  const currentComment = ref('')
  
  const objectives = ref([])
  const showObjectiveForm = ref(false)
  const newObjective = ref({
    name: '',
    content: ''
  })
  
  const fetchEntries = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await apiStore.apiInstance.get(`/api/time-entries?from=${today}`)
      todayEntries.value = response.data
      currentEntry.value = todayEntries.value.find(entry => !entry.end)
      if (currentEntry.value) {
        currentComment.value = currentEntry.value.comment || ''
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des entrées')
    }
  }
  
  const fetchObjectives = async () => {
    try {
      const response = await apiStore.apiInstance.get('/api/daily-objectives')
      objectives.value = response.data
    } catch (error) {
      toast.error('Erreur lors du chargement des objectifs')
    }
  }
  
  const onEntryCreated = () => {
    fetchEntries()
  }
  
  const stopCurrentEntry = async () => {
    if (!currentEntry.value) return
    
    try {
      await apiStore.apiInstance.patch(`/api/time-entries/${currentEntry.value.id}/stop`)
      toast.success('Activité arrêtée')
      fetchEntries()
    } catch (error) {
      toast.error('Erreur lors de l\'arrêt de l\'activité')
    }
  }
  
  const updateComment = async () => {
    if (!currentEntry.value) return
    
    try {
      await apiStore.apiInstance.put(`/api/time-entries/${currentEntry.value.id}`, {
        ...currentEntry.value,
        comment: currentComment.value
      })
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du commentaire')
    }
  }
  
  const createObjective = async () => {
    try {
      await apiStore.apiInstance.post('/api/daily-objectives', newObjective.value)
      toast.success('Objectif créé')
      showObjectiveForm.value = false
      newObjective.value = { name: '', content: '' }
      fetchObjectives()
    } catch (error) {
      toast.error('Erreur lors de la création de l\'objectif')
    }
  }
  
  const toggleObjective = async (objective) => {
    try {
      await apiStore.apiInstance.patch(
        `/api/daily-objectives/${objective.id}/${objective.done ? 'undone' : 'done'}`
      )
      fetchObjectives()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'objectif')
    }
  }
  
  const deleteObjective = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet objectif ?')) return
    
    try {
      await apiStore.apiInstance.delete(`/api/daily-objectives/${id}`)
      toast.success('Objectif supprimé')
      fetchObjectives()
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'objectif')
    }
  }
  
  onMounted(() => {
    fetchEntries()
    fetchObjectives()
  })
  </script>
  
  <style scoped>
  .home-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .timetracker-section, .objectives-section {
    margin-bottom: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .subsection-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem;
  }
  
  .current-activity-box {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .current-activity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .activity-name {
    color: var(--gray-700);
    margin-top: 0.25rem;
  }
  
  .activity-notes {
    width: 100%;
    min-height: 100px;
    resize: vertical;
    padding: 0.5rem;
    border: 1px solid var(--gray-300);
    border-radius: 4px;
  }
  
  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .objectives-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .objectives-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .objective-item {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .objective-content {
    flex: 1;
  }
  
  .objective-description {
    color: var(--gray-700);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .objective-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .empty-state {
    text-align: center;
    color: var(--gray-700);
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
  }
  
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
  }
  
  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  </style>