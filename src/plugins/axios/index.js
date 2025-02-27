import axios from 'axios'

export const createAxiosInstance = (apiKey) => {
  const instance = axios.create({
    baseURL: 'https://timely.edu.netlor.fr',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey ? `key=${apiKey}` : undefined,
    },
  })

  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // On émet un événement personnalisé pour la déconnexion
        window.dispatchEvent(new CustomEvent('unauthorized'))
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Export de l'instance par défaut (sans apiKey)
export const axiosInstance = createAxiosInstance()