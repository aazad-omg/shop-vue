import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isFullPageLoading = ref(false)

  const startSpinner = () => {
    isFullPageLoading.value = true
  }

  const stopSpinner = () => {
    isFullPageLoading.value = false
  }

  return { isFullPageLoading, startSpinner, stopSpinner }
})
