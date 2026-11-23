import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase'
import { getAvatarUrl, uploadAvatar } from '@/services'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  avatar_path: string | null
  is_admin: boolean
}

// keep session storage so that the app doesn't forgot that
// the user is resetting their password if the page is refreshed
const Password_Recovery_Storage_Key = 'shopvue-password-recovery'

export const useAuthStore = defineStore('auth', () => {
  const avatarUrl = ref<string | null>(null)
  const error = ref<string | null>(null)
  const isAuth = ref(false)
  const isChangingPassword = ref(false)
  const isLoading = ref(false)
  const isPasswordRecovery = ref(false)
  const isRequestingPasswordReset = ref(false)
  const isUploadingAvatar = ref(false)
  const isAdmin = ref(false)
  const user = ref<Profile | null>(null)
  const authUser = ref<User | null>(null)
  let isInitialized = false

  const canManageProducts = () => isAdmin.value

  const requestPasswordReset = async (email: string, redirectTo: string) => {
    isRequestingPasswordReset.value = true
    error.value = null

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

      if (resetError) throw resetError
      return true
    } catch (resetError: unknown) {
      error.value =
        resetError instanceof Error ? resetError.message : 'Password recovery request failed'
      return false
    } finally {
      isRequestingPasswordReset.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      authUser.value = data.user
      user.value = null
      avatarUrl.value = null
      isAdmin.value = false
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

  const changePassword = async (password: string) => {
    if (!authUser.value) {
      error.value = 'You must be signed in to change your password'
      return false
    }

    isChangingPassword.value = true
    error.value = null

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error
      isPasswordRecovery.value = false
      sessionStorage.removeItem(Password_Recovery_Storage_Key)
      return true
    } catch (changePasswordError: unknown) {
      error.value =
        changePasswordError instanceof Error
          ? changePasswordError.message
          : 'Password update failed'
      return false
    } finally {
      isChangingPassword.value = false
    }
  }

  const updateProfile = async (name: string, email: string, phone: string) => {
    if (!authUser.value) {
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
            id: authUser.value.id,
            full_name: name,
            email,
            phone_number: phone,
            avatar_path: user.value?.avatar_path ?? null,
          },
          { onConflict: 'id' },
        )
        .select('id, full_name, email, phone_number, avatar_path, is_admin')
        .single()
      if (error) throw error
      user.value = data
      isAdmin.value = data.is_admin === true
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
    if (!authUser.value) {
      error.value = 'You must be signed in to view your profile'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, avatar_path, is_admin')
        .eq('id', authUser.value.id)
        .maybeSingle()

      if (fetchError) throw fetchError

      user.value = data
      isAdmin.value = data?.is_admin === true
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
    if (!authUser.value) {
      error.value = 'You must be signed in to upload a profile picture'
      return false
    }

    isUploadingAvatar.value = true
    error.value = null

    try {
      const avatarPath = await uploadAvatar(file, user.value?.avatar_path)
      user.value = {
        id: authUser.value.id,
        full_name: user.value?.full_name ?? null,
        email: user.value?.email ?? null,
        phone_number: user.value?.phone_number ?? null,
        avatar_path: avatarPath,
        is_admin: user.value?.is_admin ?? false,
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
    authUser.value = null
    avatarUrl.value = null
    isAdmin.value = false
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
      const nextAuthUser = session?.user ?? null
      if (!nextAuthUser || nextAuthUser.id !== authUser.value?.id) {
        user.value = null
        avatarUrl.value = null
        isAdmin.value = false
      }
      authUser.value = nextAuthUser
      isAuth.value = session !== null

      if (_event === 'PASSWORD_RECOVERY') {
        isPasswordRecovery.value = true
        sessionStorage.setItem(Password_Recovery_Storage_Key, 'true')
      } else if (_event === 'SIGNED_OUT') {
        isPasswordRecovery.value = false
        sessionStorage.removeItem(Password_Recovery_Storage_Key)
      }
    })

    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) throw sessionError

    authUser.value = data.session?.user ?? null
    user.value = null
    isAdmin.value = false
    isAuth.value = data.session !== null
    isPasswordRecovery.value =
      data.session !== null && sessionStorage.getItem(Password_Recovery_Storage_Key) === 'true'
    if (!data.session) sessionStorage.removeItem(Password_Recovery_Storage_Key)
    isInitialized = true
    if (authUser.value) await fetchProfile()
  }

  return {
    user,
    authUser,
    avatarUrl,
    canManageProducts,
    isAuth,
    isAdmin,
    isLoading,
    isUploadingAvatar,
    isChangingPassword,
    isRequestingPasswordReset,
    isPasswordRecovery,
    error,
    initialize,
    signIn,
    signUp,
    requestPasswordReset,
    changePassword,
    updateProfile,
    fetchProfile,
    uploadProfileAvatar,
    signOut,
  }
})
