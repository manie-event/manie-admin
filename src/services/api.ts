import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
}

export const professionalServiceService = {
  listPending: () => api.get('/admin/professional-services/pending'),
  verify: (uuid: string) => api.patch(`/admin/professional-services/${uuid}/verify`),
  reject: (uuid: string) => api.delete(`/admin/professional-services/${uuid}`),
}

export const keywordService = {
  list: (sector?: string) => api.get('/keyword', { params: { limit: 5000, sector } }),
  create: (data: { sector: string; category: string; value: string }) =>
    api.post('/keyword/create', data),
  delete: (uuid: string) => api.delete(`/keyword/${uuid}`),
}

export default api
