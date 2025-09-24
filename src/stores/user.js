import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  
  const isLogin = computed(() => {
    return !!token.value && !!userInfo.value
  })
  
  const setUserInfo = (info) => {
    userInfo.value = info
  }
  
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  const clearUserInfo = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('token')
  }
  
  return {
    userInfo,
    token,
    isLogin,
    setUserInfo,
    setToken,
    clearUserInfo
  }
})