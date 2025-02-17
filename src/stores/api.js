import { defineStore } from 'pinia';
import axios from 'axios';

export const useApiStore = defineStore('api', {
  state: () => ({
    apiKey: localStorage.getItem('apiKey') || '',
  }),
  getters: {
    apiInstance: (state) => {
      if (!state.apiKey) return null;
      return axios.create({
        baseURL: 'https://timely.edu.netlor.fr',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${state.apiKey}`,
        },
      });
    },
  },
  actions: {
    setApiKey(key) {
      this.apiKey = key;
      localStorage.setItem('apiKey', key);
    },
    removeApiKey() {
      this.apiKey = '';
      localStorage.removeItem('apiKey');
    },
    isAuthenticated() {
      return !!this.apiKey;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'apiKey',
        storage: localStorage,
      },
    ],
  },
});