<script setup lang="ts">
import { BaseButton } from '@/components'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const name = ref<string>('aazad')
const products = ref<Product[]>([])
products.value = PRODUCTS
</script>

<template>
  <div class="flex min-h-screen flex-col bg-amber-200">
    <main class="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <p class="text-5xl">This is your profile page {{ name }}</p>
      <RouterLink to="/">
        <BaseButton>Go back to home</BaseButton>
      </RouterLink>
    </main>
  </div>
</template>
