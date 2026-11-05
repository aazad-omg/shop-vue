import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase'
import { getAvatarUrl, uploadAvatar } from '@/services'

type Profile = {
  full_name: string | null
  email: string | null
  phone_number: string | null
  avatar_path: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const avatarUrl = ref<string | null>(null)
  const isAuth = ref(false)
  const isLoading = ref(false)
  const isUploadingAvatar = ref(false)
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
      await fetchProfile()
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
            full_name: name,
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

  const updateProfile = async (name: string, email: string, phone: string) => {
    if (!user.value) {
      error.value = 'You must be signed in to update your profile'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.value.id,
            full_name: name,
            email,
            phone_number: phone,
            avatar_path: profile.value?.avatar_path ?? null,
          },
          { onConflict: 'id' },
        )
        .select('full_name, email, phone_number, avatar_path')
        .single()
      if (error) throw error
      profile.value = data
      avatarUrl.value = data.avatar_path ? await getAvatarUrl(data.avatar_path) : null

      return true
    } catch (updateError: unknown) {
      error.value = updateError instanceof Error ? updateError.message : 'Profile update failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchProfile = async () => {
    if (!user.value) {
      error.value = 'You must be signed in to view your profile'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('full_name, email, phone_number, avatar_path')
        .eq('id', user.value.id)
        .maybeSingle()

      if (fetchError) throw fetchError

      profile.value = data
      avatarUrl.value = data?.avatar_path ? await getAvatarUrl(data.avatar_path) : null
      return true
    } catch (fetchError: unknown) {
      error.value = fetchError instanceof Error ? fetchError.message : 'Profile load failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const uploadProfileAvatar = async (file: File) => {
    if (!user.value) {
      error.value = 'You must be signed in to upload a profile picture'
      return false
    }

    isUploadingAvatar.value = true
    error.value = null

    try {
      const avatarPath = await uploadAvatar(file, profile.value?.avatar_path)
      profile.value = {
        full_name: profile.value?.full_name ?? null,
        email: profile.value?.email ?? null,
        phone_number: profile.value?.phone_number ?? null,
        avatar_path: avatarPath,
      }
      avatarUrl.value = await getAvatarUrl(avatarPath)
      return true
    } catch (uploadError: unknown) {
      error.value =
        uploadError instanceof Error ? uploadError.message : 'Profile picture upload failed'
      return false
    } finally {
      isUploadingAvatar.value = false
    }
  }

  const resetAuth = () => {
    user.value = null
    profile.value = null
    avatarUrl.value = null
    isAuth.value = false
    error.value = null
  }

  const signOut = async () => {
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      resetAuth()
      return true
    } catch (signOutError: unknown) {
      error.value = signOutError instanceof Error ? signOutError.message : 'Logout failed'
      return false
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
    if (user.value) await fetchProfile()
  }

  return {
    user,
    profile,
    avatarUrl,
    isAuth,
    isLoading,
    isUploadingAvatar,
    error,
    initialize,
    signIn,
    signUp,
    updateProfile,
    fetchProfile,
    uploadProfileAvatar,
    signOut,
  }
})
