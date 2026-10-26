<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { ProductCard } from '@/components'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'
import { useCartStore } from '@/stores'

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
const products = ref<Product[]>([])
products.value = PRODUCTS
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
    <nav aria-label="Product categories" class="border-b border-stone-200">
      <ul
        class="mx-auto grid max-w-7xl list-none grid-cols-2 justify-center gap-x-4 px-4 sm:grid-cols-4 sm:px-6 lg:grid-cols-9"
      >
        <li v-for="category in categories" :key="category">
          <button
            type="button"
            class="h-full w-full border-b-5 px-2 py-1.5 text-center text-lg font-medium transition-colors duration-200"
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

      <div class="mt-8">
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
