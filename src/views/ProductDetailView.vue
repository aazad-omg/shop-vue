<script setup lang="ts">
import { ProductCard, ProductImageZoom } from '@/components'
import { Card } from '@/components/'
import { PRODUCTS } from '@/data/products'
import { useCartStore } from '@/stores'
import type { Product } from '@/types'
import { NepaliRupee } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const products = ref<Product[]>([])
products.value = PRODUCTS

// Find the product name from the slug
const currentProduct = computed(() =>
  products.value.find((product) => product.slug === String(route.params.name ?? '')),
)

// Any four products but the current one
const recommendedProducts = computed(() => {
  return products.value.filter((candidate) => candidate.id !== currentProduct.value?.id).slice(0, 4)
})

const quantity = ref<number>(1)

const cart = useCartStore()

const addProductToCart = (product: Product, amount = 1) => {
  cart.addToCart(product, amount)
  cart.openDrawer()
}

const addCurrentProductToCart = () => {
  if (currentProduct.value) addProductToCart(currentProduct.value, quantity.value)
}
</script>

<template>
  <div class="min-h-screen w-full bg-amber-50">
    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <section v-if="currentProduct" class="grid gap-4 lg:grid-cols-2 lg:gap-14">
        <!-- <img
          :src="currentProduct.image"
          :alt="currentProduct.name"
          class="aspect-4/3 w-full rounded-md object-cover"
        /> -->

        <!-- Component to display the product image and zoom on hover -->
        <ProductImageZoom :src="currentProduct.image" :alt="currentProduct.name" />

        <Card class="h-fit gap-0 rounded-xl border-0 bg-transparent p-6 shadow-none sm:p-8">
          <p class="text-sm font-semibold text-amber-800">{{ currentProduct.subtitle }}</p>
          <h1 class="mt-2 text-4xl leading-tight font-extrabold text-brand sm:text-5xl">
            {{ currentProduct.name }}
          </h1>
          <p class="flex items-center mt-7 text-3xl font-bold text-stone-900">
            <NepaliRupee :size="22" color="#2a3a5e" :stroke-width="2.75" />
            <span class="pl-1">{{ currentProduct.price.toFixed(2) }}</span>
          </p>
          <Card class="mt-6 gap-4 rounded-lg border-stone-200 bg-white p-4 shadow-none sm:p-5">
            <div>
              <p>Arrives <span class="font-semibold pl-1"> Thursday, Oct 15</span></p>
              <p>In stock, ready to ship</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <div
                class="flex h-12 items-center rounded-md border border-stone-300 bg-white"
                aria-label="Quantity"
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  class="h-full w-11 rounded-l-md text-lg font-semibold text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand hover:cursor-pointer disabled:cursor-not-allowed disabled:text-stone-300"
                  :disabled="quantity <= 1"
                  @click="quantity--"
                >
                  -
                </button>
                <output class="min-w-10 text-center text-sm font-semibold text-stone-900">
                  {{ quantity }}
                </output>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  class="h-full w-11 rounded-r-md text-lg font-semibold text-stone-700 hover:bg-stone-100 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  @click="quantity++"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                class="h-12 rounded-md bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-amber-800 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                @click="addCurrentProductToCart"
              >
                Add to cart
              </button>
            </div>
            <button
              type="button"
              class="h-14 w-full rounded-md bg-amber-500 px-6 text-base font-bold text-stone-950 transition-colors hover:bg-amber-600 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
            >
              Buy now
            </button>
          </Card>
          <section class="mt-8 max-w-prose border-t border-stone-200 pt-6">
            <h2 class="text-lg font-bold text-stone-900">About this item</h2>
            <p class="mt-2 text-base leading-7 text-stone-600">
              {{ currentProduct.description }}
            </p>
          </section>
        </Card>
      </section>

      <section v-if="currentProduct" class="mt-20">
        <h2 class="text-2xl font-bold text-stone-900">You might also like</h2>
        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <RouterLink
            v-for="product in recommendedProducts"
            :key="product.id"
            :to="`/product/${product.slug}`"
            class="block transition-all duration-200 ease-out hover:-translate-y-1 hover:cursor-pointer"
          >
            <ProductCard :product="product" :add-to-cart="() => addProductToCart(product)" />
          </RouterLink>
        </div>
      </section>

      <p v-else class="py-16 text-lg text-stone-600">Product not found.</p>
    </main>
  </div>
</template>
