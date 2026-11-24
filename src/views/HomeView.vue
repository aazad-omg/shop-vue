<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { Button, ProductCard, ProductCardSkeleton, Spinner } from '@/components'
import type { Product } from '@/types'
import { useCartStore } from '@/stores'
import { useCategories, useProducts } from '@/composables'

const cart = useCartStore()
const route = useRoute()
const router = useRouter()

const { categories, isLoaded: categoriesLoaded, fetchCategories } = useCategories()
const selectedCategorySlug = ref('')
const selectedCategoryId = computed(
  () => categories.value.find(({ slug }) => slug === selectedCategorySlug.value)?.id,
)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const { products, isLoading, error, hasMore, fetchProducts, loadMoreProducts } = useProducts(
  () => ({
    limit: 20,
    categoryId: selectedCategoryId.value,
  }),
)

// Detect when an HTML element
// enters or leaves the visible area of the browser
let observer: IntersectionObserver | null = null

watch(
  () => route.query.category,
  async (value) => {
    selectedCategorySlug.value = typeof value === 'string' ? value : ''
    if (selectedCategorySlug.value && !categoriesLoaded.value) return
    await fetchProducts()
  },
  { immediate: true },
)

watch(categoriesLoaded, async (loaded) => {
  if (loaded && selectedCategorySlug.value) {
    await fetchProducts()
  }
})

onMounted(() => {
  fetchCategories()

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

const loadMore = () => {
  loadMoreProducts()
}

const selectCategory = (categorySlug: string) => {
  router.push({
    query: {
      ...route.query,
      category: categorySlug || undefined,
    },
  })
}

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
      v-if="categoriesLoaded"
      aria-label="Product categories"
      class="overflow-x-auto border-b border-stone-200 lg:overflow-visible"
    >
      <ul
        class="mx-auto flex w-max min-w-full list-none items-center gap-2 px-4 py-2 sm:px-6 lg:w-full lg:max-w-7xl lg:justify-center lg:gap-x-2"
      >
        <li
          v-for="category in categories"
          :key="category.slug || category.name"
          class="shrink-0 lg:min-w-0 lg:flex-1"
        >
          <Button
            type="button"
            variant="ghost"
            class="h-full rounded-full px-4 py-2 text-center text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-base lg:w-full lg:whitespace-normal lg:px-2"
            :class="
              selectedCategorySlug === category.slug
                ? 'bg-brand text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-brand'
            "
            :aria-pressed="selectedCategorySlug === category.slug"
            @click="selectCategory(category.slug)"
          >
            {{ category.name }}
          </Button>
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
