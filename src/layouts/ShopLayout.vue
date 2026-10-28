<script setup lang="ts">
import { AppNavbar } from '@/components'
import { useProductStore } from '@/stores'
import { storeToRefs } from 'pinia'

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const productStore = useProductStore()
// use reactively even while destructuring
const { products, isLoading, error } = storeToRefs(productStore)

// Find the product name from the slug
const currentProduct = computed(() =>
  products.value.find((product) => product.slug === String(route.params.name ?? '')),
)
</script>

<template>
  <AppNavbar :products="products" :initial-product="currentProduct" />

  <main>
    <RouterView />
  </main>
</template>
