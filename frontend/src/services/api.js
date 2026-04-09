import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export const weatherApi = {
  getCurrent: (city) => api.get(`/weather/current?city=${encodeURIComponent(city)}`).then(r => r.data),
  getForecast: (city) => api.get(`/weather/forecast?city=${encodeURIComponent(city)}`).then(r => r.data),
}

export const historyApi = {
  getAll: (limit = 20) => api.get(`/history?limit=${limit}`).then(r => r.data),
  deleteEntry: (id) => api.delete(`/history/${id}`).then(r => r.data),
  clearAll: () => api.delete('/history').then(r => r.data),
}

export default api
