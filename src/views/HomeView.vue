<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { ProductCard, ProductCardSkeleton } from '@/components'
import type { Product } from '@/types'
import { useCartStore, useProductStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useProducts } from '@/composables'

const productStore = useProductStore()
const cart = useCartStore()
const route = useRoute()
const router = useRouter()
// use reactively even while destructuring
const { products, isLoading, error } = storeToRefs(productStore)

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
const {
  products: categoryProducts,
  isLoading: isCategoryLoading,
  error: categoryError,
  fetchProducts: fetchCategoryProducts,
  cancelFetch: cancelCategoryFetch,
} = useProducts(() => ({ limit: 20, category: selectedCategory.value }))

const routeCategory = () => (typeof route.query.category === 'string' ? route.query.category : '')

onMounted(() => {
  // Make the api call but dont wait for it to finish,
  if (!routeCategory()) void productStore.fetchProducts()
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
    if (!category || category === 'All goods') {
      cancelCategoryFetch()
      return
    }

    await fetchCategoryProducts()
  },
  { immediate: true },
)

const displayedProducts = computed(() =>
  selectedCategory.value === 'All goods' ? products.value : categoryProducts.value,
)
const displayedLoading = computed(() =>
  selectedCategory.value === 'All goods' ? isLoading.value : isCategoryLoading.value,
)
const displayedError = computed(() =>
  selectedCategory.value === 'All goods' ? error.value : categoryError.value,
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
        v-if="displayedLoading"
        class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-label="Loading products"
      >
        <ProductCardSkeleton v-for="index in 8" :key="index" />
      </div>
      <p v-else-if="displayedError" class="mt-8 py-16 text-center text-red-700">
        Could not load products: {{ displayedError }}
      </p>

      <div v-else class="mt-8">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <RouterLink
            v-for="product in displayedProducts"
            :key="product.id"
            :to="{
              path: `/product/${product.slug}`,
              state: { productId: String(product.id) },
            }"
            class="block transition-all duration-200 ease-out hover:-translate-y-1 hover:cursor-pointer"
          >
            <ProductCard :product="product" :add-to-cart="() => addCurrentProductToCart(product)" />
          </RouterLink>
        </div>

        <p v-if="displayedProducts.length === 0" class="py-16 text-center text-stone-600">
          No products in this category yet.
        </p>
      </div>
    </main>
  </div>
</template>
