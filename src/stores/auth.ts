import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuth = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let isInitialized = false

  const signIn = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      user.value = data.user
      isAuth.value = true
      return true
    } catch (signInError: unknown) {
      error.value = signInError instanceof Error ? signInError.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      if (error) throw error
      return true
    } catch (signUpError: unknown) {
      error.value = signUpError instanceof Error ? signUpError.message : 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const initialize = async () => {
    if (isInitialized) return

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      isAuth.value = session !== null
    })

    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) throw sessionError

    user.value = data.session?.user ?? null
    isAuth.value = data.session !== null
    isInitialized = true
  }

  return { user, isAuth, isLoading, error, initialize, signIn, signUp }
})
