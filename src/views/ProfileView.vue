<script setup lang="ts">
import { AppNavbar, BaseButton } from '@/components'
import { products } from '@/data/products'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const name = ref<string>('aazad')
</script>

<template>
  <div class="flex min-h-screen flex-col bg-amber-200">
    <AppNavbar :products="products" />
    <main class="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <p class="text-5xl">This is your profile page {{ name }}</p>
      <RouterLink to="/">
        <BaseButton>Go back to home</BaseButton>
      </RouterLink>
    </main>
  </div>
</template>
