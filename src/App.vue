<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { FullPageSpinner, Toaster } from '@/components'
import { useUiStore } from '@/stores'
import 'vue-sonner/style.css'

const uiStore = useUiStore()
const { isFullPageLoading } = storeToRefs(uiStore)
</script>

<template>
  <RouterView />
  <FullPageSpinner :loading="isFullPageLoading" />
  <Toaster
    position="top-right"
    expand
    :gap="4"
    :visible-toasts="4"
    rich-colors
    :toast-options="{
      classes: {
        title: 'text-lg',
        description: 'text-base',
      },
    }"
  />
</template>

<style scoped></style>
