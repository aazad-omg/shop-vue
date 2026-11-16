<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { ProductCard, ProductCardSkeleton, Spinner } from '@/components'
import type { Product } from '@/types'
import { useCartStore } from '@/stores'
import { useProducts } from '@/composables'

const cart = useCartStore()
const route = useRoute()
const router = useRouter()

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
const selectedCategory = ref('All goods')
const { products, isLoading, error, hasMore, fetchProducts, loadMoreProducts } = useProducts(
  () => ({
    limit: 20,
    category: selectedCategory.value === 'All goods' ? undefined : selectedCategory.value,
  }),
)

const loadMoreTrigger = ref<HTMLElement | null>(null)

// Detect when an HTML element
// enters or leaves the visible area of the browser
let observer: IntersectionObserver | null = null

const loadMore = () => {
  void loadMoreProducts()
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadMore()
      }
    },
    {
      root: null,
      rootMargin: '300px',
      threshold: 0,
    },
  )

  if (loadMoreTrigger.value) {
    // tell the IntersectionObserver to watch the element
    observer?.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

const selectCategory = (category: string) => {
  router.push({
    query: {
      ...route.query,
      category: category === 'All goods' ? undefined : category,
    },
  })
}

// watch the route query parameter for category changes and fetch products accordingly
watch(
  () => route.query.category,
  async (value) => {
    const category = typeof value === 'string' ? value : ''
    selectedCategory.value = category || 'All goods'
    await fetchProducts()
  },
  { immediate: true },
)

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
        class="mx-auto flex w-max min-w-full list-none items-center gap-2 px-4 py-2 sm:px-6 lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-9 lg:gap-x-4"
      >
        <li v-for="category in categories" :key="category" class="shrink-0 lg:shrink">
          <button
            type="button"
            class="h-full rounded-full px-4 py-2 text-center text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-base lg:w-full lg:whitespace-normal lg:px-2 hover:cursor-pointer"
            :class="
              selectedCategory === category
                ? 'bg-brand text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-brand'
            "
            :aria-pressed="selectedCategory === category"
            @click="selectCategory(category)"
          >
            {{ category }}
          </button>
        </li>
      </ul>
    </nav>

    <main class="mx-auto w-full max-w-7xl px-4 pb-10">
      <!-- <ProductBanner /> -->
      <div
        v-if="isLoading && products.length === 0"
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
            v-for="product in products"
            :key="product.id"
            :to="{
              name: 'product-detail',
              params: { slug: product.slug },
              query: { id: product.id },
            }"
            class="block transition-all duration-200 ease-out hover:-translate-y-1 hover:cursor-pointer"
          >
            <ProductCard :product="product" :add-to-cart="() => addCurrentProductToCart(product)" />
          </RouterLink>
        </div>

        <p v-if="products.length === 0" class="py-16 text-center text-stone-600">
          No products in this category yet.
        </p>
      </div>

      <!-- Infinite scroll trigger -->
      <div ref="loadMoreTrigger" class="flex justify-center py-8">
        <Spinner class="size-10" aria-hidden="true" v-if="isLoading" />

        <p v-else-if="!hasMore" class="text-sm text-gray-500">You've reached the end.</p>
      </div>
    </main>
  </div>
</template>
