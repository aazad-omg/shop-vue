<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { ProductCard, ProductCardSkeleton } from '@/components'
import type { Product } from '@/types'
import { useCartStore, useProductStore } from '@/stores'
import { storeToRefs } from 'pinia'

const categories = ref<string[]>([
  'All goods',
  'Kitchen',
  'Home',
  'Accessories',
  'Audio & Tech',
  'Travel',
  'Outdoors',
  'Stationery',
  'Seasonal markdowns',
])

const productStore = useProductStore()
// use reactively even while destructuring
const { products, isLoading, error } = storeToRefs(productStore)

onMounted(() => productStore.fetchProducts())
const selectedCategory = ref('All goods')
const filteredProducts = computed(() =>
  selectedCategory.value === 'All goods'
    ? products.value
    : products.value.filter((product) => product.categories.includes(selectedCategory.value)),
)

const cart = useCartStore()

const addCurrentProductToCart = (product: Product) => {
  cart.addToCart(product, 1)
  cart.openDrawer()
}
</script>

<template>
  <!-- Root div -->
  <div class="min-h-screen w-full bg-amber-50">
    <!-- Category Navigation -->
    <nav
      aria-label="Product categories"
      class="overflow-x-auto border-b border-stone-200 lg:overflow-visible"
    >
      <ul
        class="mx-auto flex w-max min-w-full list-none gap-2 px-4 py-1 sm:px-6 lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-9 lg:gap-x-4"
      >
        <li v-for="category in categories" :key="category" class="shrink-0 lg:shrink">
          <button
            type="button"
            class="h-full border-b-5 px-3 py-2 text-center text-sm font-medium transition-colors duration-200 sm:text-base lg:w-full lg:whitespace-normal lg:px-2"
            :class="
              selectedCategory === category
                ? 'border-brand text-brand'
                : 'border-transparent text-stone-600 hover:border-brand-300 hover:text-brand'
            "
            :aria-pressed="selectedCategory === category"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </li>
      </ul>
    </nav>

    <main class="mx-auto w-full max-w-7xl px-4 pb-10">
      <!-- <ProductBanner /> -->

      <div
        v-if="isLoading"
        class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-label="Loading products"
      >
        <ProductCardSkeleton v-for="index in 8" :key="index" />
      </div>
      <p v-else-if="error" class="mt-8 py-16 text-center text-red-700">
        Could not load products: {{ error }}
      </p>

      <div v-else class="mt-8">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <RouterLink
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/product/${product.slug}`"
            class="block transition-all duration-200 ease-out hover:-translate-y-1 hover:cursor-pointer"
          >
            <ProductCard :product="product" :add-to-cart="() => addCurrentProductToCart(product)" />
          </RouterLink>
        </div>

        <p v-if="filteredProducts.length === 0" class="py-16 text-center text-stone-600">
          No products in this category yet.
        </p>
      </div>
    </main>
  </div>
</template>
