import { defineStore } from 'pinia';
import axios from 'axios';

export const useApiStore = defineStore('api', {
  state: () => ({
    apiKey: '',
    baseURL: 'https://timely.edu.netlor.fr'
  }),
  getters: {
    apiInstance: (state) => {
      if (!state.apiKey) return null;
      
      const instance = axios.create({
        baseURL: state.baseURL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${state.apiKey}`,
        },
      });

      // Add response interceptor for handling errors
      instance.interceptors.response.use(
        response => response,
        error => {
          // Handle 401 errors (unauthorized - invalid or expired API key)
          if (error.response && error.response.status === 401) {
            // Invalidate the API key
            useApiStore().removeApiKey();
            // You might want to redirect to login here
          }
          return Promise.reject(error);
        }
      );

      return instance;
    },
    isAuthenticated: (state) => !!state.apiKey
  },
  actions: {
    setApiKey(key) {
      this.apiKey = key;
    },
    removeApiKey() {
      this.apiKey = '';
    },
    async testConnection() {
      try {
        const response = await axios.get(`${this.baseURL}/api/ping`);
        return response.status === 200;
      } catch (error) {
        console.error('API connection test failed:', error);
        return false;
      }
    },
    async createApiKey(name, email) {
      try {
        const response = await axios.post(`${this.baseURL}/api/apikeys`, {
          name,
          email
        });
        if (response.data && response.data.key) {
          this.setApiKey(response.data.key);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to create API key:', error);
        throw error;
      }
    },
    async getProfile() {
      if (!this.apiInstance) return null;
      
      try {
        const response = await this.apiInstance.get('/api/profile');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
      }
    },
    async updateProfile(name, email) {
      if (!this.apiInstance) return null;
      
      try {
        const response = await this.apiInstance.put('/api/profile', {
          name,
          email
        });
        return response.data;
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
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
});