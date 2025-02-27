<template>
  <form @submit.prevent="handleSubmit" class="time-entry-form">
    <div class="form-group">
      <label class="form-label">Projet</label>
      <select
        v-model="formData.project_id"
        required
        class="form-input"
        :disabled="projects.length === 0"
      >
        <option value="" disabled selected>Sélectionner un projet</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </option>
      </select>
      <span v-if="projects.length === 0" class="form-help-text">
        Aucun projet actif disponible. Veuillez en créer un dans les paramètres.
      </span>
    </div>

    <div class="form-group">
      <label class="form-label">Activité</label>
      <select
        v-model="formData.activity_id"
        required
        class="form-input"
        :disabled="activities.length === 0"
      >
        <option value="" disabled selected>Sélectionner une activité</option>
        <option v-for="activity in activities" :key="activity.id" :value="activity.id"
                :style="{ color: activity.color }">
          {{ activity.name }}
        </option>
      </select>
      <span v-if="activities.length === 0" class="form-help-text">
        Aucune activité active disponible. Veuillez en créer une dans les paramètres.
      </span>
    </div>

    <template v-if="isEditMode">
      <div class="form-group">
        <label class="form-label">Date et heure de début</label>
        <input
          v-model="formData.start"
          type="datetime-local"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Date et heure de fin</label>
        <input
          v-model="formData.end"
          type="datetime-local"
          :required="!!formData.start"
          class="form-input"
        />
      </div>
    </template>

    <div class="form-group">
      <label class="form-label">Commentaire</label>
      <textarea
        v-model="formData.comment"
        class="form-input textarea"
        rows="3"
        placeholder="Ajouter un commentaire..."
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
        :disabled="isSubmitting || !isFormValid"
      >
        {{ isEditMode ? 'Modifier' : 'Démarrer' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApiStore } from '@/stores/api'
import { useToast } from 'vue-toastification'
import { formatDateForInput } from '@/plugins/formatters'

const props = defineProps({
  entry: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])
const apiStore = useApiStore()
const toast = useToast()

const projects = ref([])
const activities = ref([])
const isSubmitting = ref(false)
const isEditMode = computed(() => !!props.entry)

const formData = ref({
  project_id: '',
  activity_id: '',
  start: '',
  end: '',
  comment: ''
})

const isFormValid = computed(() => {
  return formData.value.project_id && formData.value.activity_id
})

onMounted(async () => {
  try {
    const [projectsResponse, activitiesResponse] = await Promise.all([
      apiStore.apiInstance.get('/api/projects'),
      apiStore.apiInstance.get('/api/activities')
    ])

    projects.value = projectsResponse.data.filter(p => p.is_enabled)
    activities.value = activitiesResponse.data.filter(a => a.is_enabled)

    if (props.entry) {
      formData.value = {
        project_id: props.entry.project_id,
        activity_id: props.entry.activity_id,
        start: formatDateForInput(props.entry.start),
        end: formatDateForInput(props.entry.end),
        comment: props.entry.comment || ''
      }
    }

    if (projects.value.length === 0) {
      toast.warning('Aucun projet actif disponible')
    }
    if (activities.value.length === 0) {
      toast.warning('Aucune activité active disponible')
    }
  } catch (error) {
    console.error('Error loading form data:', error)
    toast.error('Erreur lors du chargement des données')
  }
})

const handleSubmit = async () => {
  if (isSubmitting.value || !isFormValid.value) return
  
  try {
    isSubmitting.value = true

    const dataToSend = {
      project_id: formData.value.project_id,
      activity_id: formData.value.activity_id,
      comment: formData.value.comment,
    }

    if (isEditMode.value) {
      if (formData.value.start) dataToSend.start = formData.value.start
      if (formData.value.end) dataToSend.end = formData.value.end
      
      await apiStore.apiInstance.put(`/api/time-entries/${props.entry.id}`, dataToSend)
      toast.success('Entrée de temps modifiée')
    } else {
      await apiStore.apiInstance.post('/api/time-entries', dataToSend)
      toast.success('Activité démarrée')
    }
    
    emit('submit')
  } catch (error) {
    const errorMessage = error.response?.data?.message || (isEditMode.value
      ? 'Erreur lors de la modification de l\'entrée'
      : 'Erreur lors du démarrage de l\'activité'
    )
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>
  
  <style scoped>
  .time-entry-form {
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
    min-height: 80px;
  }
  
  .form-help-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--error-color);
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
  
  select {
    background-color: white;
  }
  
  select:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
  }
  
  option:disabled {
    color: var(--gray-400);
  }
  
  input[type="datetime-local"] {
    padding: 8px;
  }
  
  </style>