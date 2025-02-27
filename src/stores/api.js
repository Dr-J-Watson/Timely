import { defineStore } from 'pinia'
import { createAxiosInstance, axiosInstance } from '@/plugins/axios'

export const useApiStore = defineStore('api', {
  state: () => ({
    apiKey: ''
  }),

  getters: {
    apiInstance: (state) => {
      return state.apiKey ? createAxiosInstance(state.apiKey) : null
    },
    isAuthenticated: (state) => !!state.apiKey
  },

  actions: {
    setApiKey(key) {
      this.apiKey = key
    },

    removeApiKey() {
      this.apiKey = ''
    },

    async testConnection() {
      try {
        const response = await axiosInstance.get('/api/ping')
        return response.status === 200
      } catch (error) {
        console.error('API connection test failed:', error)
        return false
      }
    },

    async createApiKey(name, email) {
      try {
        const response = await axiosInstance.post('/api/apikeys', { name, email })
        if (response.data?.key) {
          this.setApiKey(response.data.key)
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to create API key:', error)
        throw error
      }
    },

    async getProfile() {
      if (!this.apiInstance) return null
      
      try {
        const response = await this.apiInstance.get('/api/profile')
        return response.data
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        throw error
      }
    },

    async updateProfile(name, email) {
      if (!this.apiInstance) return null
      
      try {
        const response = await this.apiInstance.put('/api/profile', { name, email })
        return response.data
      } catch (error) {
        console.error('Failed to update profile:', error)
        throw error
      }
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'timely-api',
        storage: localStorage,
        paths: ['apiKey']
      },
    ],
  },
})


window.addEventListener('unauthorized', () => {
  const store = useApiStore()
  store.removeApiKey()
})