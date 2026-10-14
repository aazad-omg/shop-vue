<script setup lang="ts">
import { AppNavbar, ProductImageZoom } from '@/components'
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

const addToCart = () => {
  alert('Item added to cart!')
}
</script>

<template>
  <div class="min-h-screen w-full bg-amber-50">
    <AppNavbar :products="products" :initial-product="currentProduct" />
    <main class="w-full max-w-7xl py-8 pl-6 pr-4 sm:py-12 sm:pl-8 lg:ml-24">
      <section v-if="currentProduct" class="grid gap-8 lg:grid-cols-3 lg:gap-14">
        <!-- <img
          :src="currentProduct.image"
          :alt="currentProduct.name"
          class="aspect-4/3 w-full rounded-md object-cover"
        /> -->

        <ProductImageZoom :src="currentProduct.image" :alt="currentProduct.name" />

        <div class="py-2">
          <p class="text-sm font-semibold text-amber-800">{{ currentProduct.subtitle }}</p>
          <h1 class="mt-2 text-4xl leading-tight font-extrabold text-brand sm:text-5xl">
            {{ currentProduct.name }}
          </h1>
          <p class="mt-7 text-3xl font-bold text-stone-900">
            ${{ currentProduct.price.toFixed(2) }}
          </p>
          <button
            type="button"
            class="mt-6 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            @click="addToCart"
          >
            Add to cart
          </button>
          <section class="mt-8 max-w-prose">
            <h2 class="text-lg font-bold text-stone-900">About this item</h2>
            <p class="mt-2 text-base leading-7 text-stone-600">
              {{ currentProduct.description }}
            </p>
          </section>
        </div>
      </section>

      <p v-else class="py-16 text-lg text-stone-600">Product not found.</p>
    </main>
  </div>
</template>
