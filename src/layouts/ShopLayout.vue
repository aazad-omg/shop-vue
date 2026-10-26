<script setup lang="ts">
import { AppNavbar } from '@/components'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const products = ref<Product[]>([])
products.value = PRODUCTS

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
