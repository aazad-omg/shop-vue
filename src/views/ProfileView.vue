<script setup lang="ts">
import { BaseButton } from '@/components'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const name = ref<string>('aazad')
</script>

<template>
  <div class="flex flex-col bg-amber-200 min-h-screen items-center justify-center">
    <p class="text-5xl">This is your profile page {{ name }}</p>
    <RouterLink to="/">
      <BaseButton>Go back to home</BaseButton>
    </RouterLink>
  </div>
</template>
