import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = ref(!!token.value)

  async function login(email: string, password: string) {
    const response = await authService.login(email, password)
    token.value = response.data.token.token
    isAuthenticated.value = true
    localStorage.setItem('token', response.data.token.token)
    router.push('/')
  }

  function logout() {
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    router.push('/login')
  }

  return { token, isAuthenticated, login, logout }
})
