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
        window.dispatchEvent(new CustomEvent('unauthorized'))
      }
      return Promise.reject(error)
    }
  )

  return instance
}

export const axiosInstance = createAxiosInstance()