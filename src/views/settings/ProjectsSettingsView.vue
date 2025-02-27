```vue
<template>
  <div class="projects-settings">
    <div class="settings-header">
      <h1 class="settings-title">Mes projets</h1>
      <button
        @click="showForm = true"
        class="btn btn-primary"
      >
        Nouveau projet
      </button>
    </div>

    <!-- Barre de recherche -->
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        class="form-input"
        placeholder="Rechercher un projet..."
      />
    </div>

    <!-- Liste des projets -->
    <div class="projects-list">
      <div v-if="filteredProjects.length === 0" class="empty-state">
        Aucun projet trouvé
      </div>
      
      <ProjectItem
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @update="fetchProjects"
        @edit="editProject"
      />
    </div>

    <!-- Modal formulaire projet -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-title">
          {{ selectedProject ? 'Modifier le projet' : 'Nouveau projet' }}
        </h2>
        <ProjectForm
          :project="selectedProject"
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
import ProjectItem from '@/components/items/ProjectItem.vue'
import ProjectForm from '@/components/forms/ProjectForm.vue'

const apiStore = useApiStore()
const toast = useToast()

const projects = ref([])
const searchQuery = ref('')
const showForm = ref(false)
const selectedProject = ref(null)

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  
  const query = searchQuery.value.toLowerCase()
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(query) ||
    project.description?.toLowerCase().includes(query)
  )
})

const fetchProjects = async () => {
  try {
    const response = await apiStore.apiInstance.get('/api/projects')
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    toast.error('Erreur lors du chargement des projets')
  }
}

const editProject = (project) => {
  selectedProject.value = project
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedProject.value = null
}

const onFormSubmit = () => {
  closeForm()
  fetchProjects()
}

onMounted(() => {
  fetchProjects()
})
</script>
  
  <style scoped>
  .projects-settings {
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
  
  .projects-list {
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