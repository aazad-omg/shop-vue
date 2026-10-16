import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuth = ref(false)

  const setUser = (userData: User | null) => {
    user.value = userData
    isAuth.value = userData !== null
  }

  return { user, isAuth, setUser }
})
