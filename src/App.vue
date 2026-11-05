<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components'
</script>

<template>
  <RouterView />
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
