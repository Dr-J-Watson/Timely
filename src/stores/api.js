import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useApiStore = defineStore('api', () => {
  const api = ref(null);
  const setApiKey = (key) => {
    api.value = axios.create({
      baseURL: 'https://timely.edu.netlor.fr',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${key}`,
      },
    });
  };
    return {
      api,
      setApiKey,
    };
  });
