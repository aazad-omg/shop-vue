<script setup lang="ts">
import { Toaster } from '@/components'
</script>

<template>
  <RouterView />
  <Toaster
    position="top-center"
    expand
    :gap="4"
    :visible-toasts="4"
    :toast-options="{
      classes: {
        title: 'text-lg',
        description: 'text-base',
      },
    }"
  />
</template>

<style scoped></style>
