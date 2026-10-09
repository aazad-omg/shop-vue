<script setup lang="ts">
import { AppNavbar, ProductCard } from '@/components'
import { products } from '@/data/products'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const categories = ref<string[]>([
  'All goods',
  'Kitchen',
  'Home',
  'Audio & Tech',
  'Travel',
  'Outdoors',
  'Stationery',
  'Seasonal markdowns',
])

const addToCart = () => {
  alert('Item added to cart!')
}
</script>

<template>
  <!-- Root div -->
  <div class="min-h-screen w-full bg-amber-50">
    <AppNavbar :products="products" />
    <!-- Category Navigation -->
    <nav aria-label="Product categories" class="border-b border-stone-200 bg-white">
      <ul
        class="mx-auto grid max-w-7xl list-none grid-cols-2 justify-center gap-x-4 px-4 sm:grid-cols-4 sm:px-6 lg:grid-cols-8"
      >
        <li
          v-for="(category, index) in categories"
          :key="index"
          class="border-b-2 border-transparent py-3 text-center text-sm font-medium text-stone-600 transition-colors duration-200 hover:cursor-pointer hover:border-brand hover:text-brand"
        >
          <p>{{ category }}</p>
        </li>
      </ul>
    </nav>

    <main class="mx-auto w-full max-w-7xl px-4 pb-10">
      <!-- <ProductBanner /> -->

      <div class="mt-8">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <RouterLink
            v-for="product in products"
            :key="product.id"
            :to="`/product/${product.slug}`"
            class="block transition-all duration-200 ease-out hover:-translate-y-1 hover:cursor-pointer"
          >
            <ProductCard :product="product" :add-to-cart="addToCart" />
          </RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>
