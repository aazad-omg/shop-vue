<script setup lang="ts">
import { Button, ProductCard, ProductCardSkeleton, ProductImageZoom } from '@/components'
import { Card } from '@/components/'
import { useCartStore } from '@/stores'
import { useProducts } from '@/composables'
import type { Product } from '@/types'
import { NepaliRupee } from '@lucide/vue'
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
// use reactively even while destructuring
const { fetchProductById, isLoading, error } = useProducts()
const currentProduct = ref<Product | null>(null)
const {
  products: recommendedProducts,
  isLoading: isLoadingRecommendations,
  error: recommendationError,
  fetchProducts: fetchRecommendedProducts,
  cancelFetch: cancelRecommendedFetch,
} = useProducts(() => ({
  limit: 4,
  excludeId: currentProduct.value?.id,
}))

const cart = useCartStore()

const quantity = ref<number>(1)
let productRequestId = 0

watch(
  () => route.query.id,
  async () => {
    const requestId = ++productRequestId
    currentProduct.value = null
    recommendedProducts.value = []
    cancelRecommendedFetch()
    const id = String(route.query.id ?? '')
    const product = id ? await fetchProductById(id) : null
    if (requestId === productRequestId && product) {
      currentProduct.value = product
      await fetchRecommendedProducts()
    }
  },
  { immediate: true },
)

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
      <template v-if="currentProduct">
        <section class="grid gap-4 md:grid-cols-2 md:gap-14">
          <ProductImageZoom
            :src="currentProduct.image"
            :alt="currentProduct.name"
            class="hidden aspect-square w-full md:block"
          />
          <Card class="h-fit gap-0 rounded-xl border-0 bg-transparent p-6 shadow-none sm:p-8">
            <p class="text-sm font-semibold text-amber-800">{{ currentProduct.subtitle }}</p>
            <h1 class="mt-2 text-4xl leading-tight font-extrabold text-brand sm:text-5xl">
              {{ currentProduct.name }}
            </h1>
            <ProductImageZoom
              :src="currentProduct.image"
              :alt="currentProduct.name"
              class="mt-6 aspect-square w-full md:hidden"
            />
            <p class="mt-7 flex items-center text-3xl font-bold text-stone-900">
              <NepaliRupee :size="22" color="#2a3a5e" :stroke-width="2.75" />
              <span class="pl-1">{{ currentProduct.price.toFixed(2) }}</span>
            </p>
            <Card class="mt-6 gap-4 rounded-lg border-stone-200 bg-white p-4 shadow-none sm:p-5">
              <div>
                <p>Arrives <span class="pl-1 font-semibold">Thursday, Oct 15</span></p>
                <p>In stock, ready to ship</p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <div
                  class="flex h-12 items-center rounded-md border border-stone-300 bg-white"
                  aria-label="Quantity"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Decrease quantity"
                    class="h-full w-11 rounded-l-md rounded-r-none text-lg text-stone-700 hover:bg-stone-100 focus-visible:ring-inset disabled:text-stone-300"
                    :disabled="quantity <= 1"
                    @click="quantity--"
                  >
                    -
                  </Button>
                  <output class="min-w-10 text-center text-sm font-semibold text-stone-900">
                    {{ quantity }}
                  </output>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Increase quantity"
                    class="h-full w-11 rounded-r-md rounded-l-none text-lg text-stone-700 hover:bg-stone-100 focus-visible:ring-inset"
                    @click="quantity++"
                  >
                    +
                  </Button>
                </div>
                <Button
                  type="button"
                  class="h-12 bg-brand px-6 hover:bg-amber-800"
                  @click="addCurrentProductToCart"
                >
                  Add to cart
                </Button>
              </div>
              <Button
                type="button"
                class="h-14 w-full bg-amber-500 px-6 text-base text-stone-950 hover:bg-amber-600"
              >
                Buy now
              </Button>
            </Card>
            <section class="mt-8 max-w-prose border-t border-stone-200 pt-6">
              <h2 class="text-lg font-bold text-stone-900">About this item</h2>
              <p class="mt-2 text-base leading-7 text-stone-600">
                {{ currentProduct.description }}
              </p>
            </section>
          </Card>
        </section>

        <section
          v-if="isLoadingRecommendations || recommendationError || recommendedProducts.length"
          class="mt-20"
          aria-label="Recommended products"
        >
          <h2 class="text-2xl font-bold text-stone-900">You might also like</h2>
          <p v-if="recommendationError" class="mt-4 text-red-700">
            Could not load recommendations: {{ recommendationError }}
          </p>
          <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <RouterLink
              v-for="product in recommendedProducts"
              :key="product.id"
              :to="{
                name: 'product-detail',
                params: { slug: product.slug },
                query: { id: product.id },
              }"
              class="block transition-all duration-200 ease-out hover:-translate-y-1 hover:cursor-pointer"
            >
              <ProductCard :product="product" :add-to-cart="() => addProductToCart(product)" />
            </RouterLink>
            <ProductCardSkeleton
              v-for="index in isLoadingRecommendations ? 4 - recommendedProducts.length : 0"
              :key="`recommendation-skeleton-${index}`"
            />
          </div>
        </section>
      </template>

      <template v-else-if="isLoading">
        <section
          class="grid gap-4 md:grid-cols-2 md:gap-14"
          aria-label="Loading product"
        >
          <div class="hidden aspect-square w-full animate-pulse rounded-md bg-gray-400 md:block" />
          <Card
            aria-hidden="true"
            class="h-fit animate-pulse gap-0 rounded-xl border-0 bg-transparent p-6 shadow-none sm:p-8"
          >
            <div class="h-4 w-2/5 rounded bg-gray-400" />
            <div class="mt-2 space-y-2">
              <div class="h-10 w-4/5 rounded bg-gray-400" />
              <div class="h-10 w-3/5 rounded bg-gray-400" />
            </div>
            <div class="mt-6 aspect-square w-full rounded-md bg-gray-400 md:hidden" />
            <div class="mt-7 h-9 w-28 rounded bg-gray-400" />
            <Card class="mt-6 gap-4 rounded-lg border-stone-200 bg-white p-4 shadow-none sm:p-5">
              <div class="space-y-2">
                <div class="h-4 w-3/5 rounded bg-gray-400" />
                <div class="h-4 w-2/5 rounded bg-gray-400" />
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <div class="h-12 w-28 rounded bg-gray-400" />
                <div class="h-12 w-36 rounded bg-gray-400" />
              </div>
              <div class="h-14 w-full rounded bg-gray-400" />
            </Card>
            <div class="mt-8 space-y-3 border-t border-stone-200 pt-6">
              <div class="h-5 w-2/5 rounded bg-gray-400" />
              <div class="h-4 w-full rounded bg-gray-400" />
              <div class="h-4 w-4/5 rounded bg-gray-400" />
              <div class="h-4 w-3/5 rounded bg-gray-400" />
            </div>
          </Card>
        </section>
        <section class="mt-20" aria-label="Loading recommended products">
          <h2 class="text-2xl font-bold text-stone-900">You might also like</h2>
          <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ProductCardSkeleton v-for="index in 4" :key="index" />
          </div>
        </section>
      </template>

      <p v-else-if="error" class="py-16 text-lg text-red-700">
        Could not load product: {{ error }}
      </p>
      <p v-else class="py-16 text-lg text-stone-600">Product not found.</p>
    </main>
  </div>
</template>
