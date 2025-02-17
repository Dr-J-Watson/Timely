import { defineStore } from 'pinia';
import axios from 'axios';

export const useApiStore = defineStore('api', {
  state: () => ({
    apiKey: '',  
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
    },
    removeApiKey() {
      this.apiKey = '';
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
