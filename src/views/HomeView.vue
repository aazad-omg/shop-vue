<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { Button, ProductCard, ProductCardSkeleton, ProductFilters, Spinner } from '@/components'
import type { Product } from '@/types'
import { useCartStore } from '@/stores'
import { useCategories, useProducts } from '@/composables'
import { fetchProductBrands } from '@/services'

const cart = useCartStore()
const route = useRoute()
const router = useRouter()

const { categories, isLoaded: categoriesLoaded, fetchCategories } = useCategories()
const selectedCategorySlug = ref('')
const minPriceInput = ref<number | ''>('')
const maxPriceInput = ref<number | ''>('')

const parsePrice = (value: number | ''): number | undefined => {
  if (value === '') return undefined
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

const parseQueryPrice = (value: unknown): number | '' => {
  if (typeof value !== 'string' || value.trim() === '') return ''
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : ''
}

const minPrice = computed(() => {
  return parsePrice(minPriceInput.value)
})
const maxPrice = computed(() => {
  return parsePrice(maxPriceInput.value)
})
const selectedBrands = ref<string[]>([])
const availableBrands = ref<string[]>([])
const isLoadingBrands = ref(false)
const brandError = ref<string | null>(null)
const selectedCategoryId = computed(
  () => categories.value.find(({ slug }) => slug === selectedCategorySlug.value)?.id,
)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const { products, isLoading, error, hasMore, fetchProducts, loadMoreProducts } = useProducts(
  () => ({
    limit: 20,
    categoryId: selectedCategoryId.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    brands: selectedBrands.value,
  }),
)

// Detect when an HTML element
// enters or leaves the visible area of the browser
let observer: IntersectionObserver | null = null

watch(
  () => route.query.category,
  async (value) => {
    const categorySlug = typeof value === 'string' ? value : ''
    if (categorySlug !== selectedCategorySlug.value) selectedBrands.value = []
    selectedCategorySlug.value = categorySlug
    if (selectedCategorySlug.value && !categoriesLoaded.value) return
    await fetchProducts()
  },
  { immediate: true },
)

watch(
  () => route.query.brand,
  (value) => {
    const brandNames = typeof value === 'string' ? [value] : (value ?? []).map(String)
    selectedBrands.value = [...new Set(brandNames)]
  },
  { immediate: true },
)

watch(
  () => route.query.maxPrice,
  (value) => {
    const maxPriceValue = parseQueryPrice(value)
    if (maxPriceValue !== maxPriceInput.value) maxPriceInput.value = maxPriceValue
  },
  { immediate: true },
)

watch(
  () => route.query.minPrice,
  (value) => {
    const minPriceValue = parseQueryPrice(value)
    if (minPriceValue !== minPriceInput.value) minPriceInput.value = minPriceValue
  },
  { immediate: true },
)

watch([() => route.query.minPrice, () => route.query.maxPrice], async () => {
  await fetchProducts()
})

watch(
  selectedCategoryId,
  async (categoryId, _, onCleanup) => {
    const controller = new AbortController()
    onCleanup(() => controller.abort())
    isLoadingBrands.value = true
    brandError.value = null

    try {
      availableBrands.value = await fetchProductBrands(categoryId, controller.signal)
      selectedBrands.value = selectedBrands.value.filter((brand) =>
        availableBrands.value.includes(brand),
      )
      await fetchProducts()
    } catch (err) {
      if (controller.signal.aborted) return
      console.error('Error fetching product brands:', err)
      brandError.value = err instanceof Error ? err.message : 'Failed to load product brands'
    } finally {
      if (!controller.signal.aborted) isLoadingBrands.value = false
    }
  },
  { immediate: true },
)

watch(categoriesLoaded, async (loaded) => {
  if (loaded && selectedCategorySlug.value) {
    await fetchProducts()
  }
})

watch(
  selectedBrands,
  async () => {
    await router.replace({
      query: {
        ...route.query,
        brand: selectedBrands.value.length ? [...selectedBrands.value] : undefined,
      },
    })
    await fetchProducts()
  },
  { deep: true },
)

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

const clearFilters = () => {
  minPriceInput.value = ''
  maxPriceInput.value = ''
  selectedBrands.value = []
  router.replace({
    query: {
      ...route.query,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    },
  })
}

const applyPriceFilter = async (submittedMinPrice: number | '', submittedMaxPrice: number | '') => {
  const normalizedMinPrice = parsePrice(submittedMinPrice)
  const normalizedMaxPrice = parsePrice(submittedMaxPrice)

  minPriceInput.value = normalizedMinPrice ?? ''
  maxPriceInput.value = normalizedMaxPrice ?? ''

  if (
    normalizedMinPrice !== undefined &&
    normalizedMaxPrice !== undefined &&
    normalizedMinPrice > normalizedMaxPrice
  ) {
    maxPriceInput.value = normalizedMinPrice
  }

  const appliedMinPrice = parsePrice(minPriceInput.value)
  const appliedMaxPrice = parsePrice(maxPriceInput.value)

  await router.replace({
    query: {
      ...route.query,
      minPrice: appliedMinPrice === undefined ? undefined : String(appliedMinPrice),
      maxPrice: appliedMaxPrice === undefined ? undefined : String(appliedMaxPrice),
    },
  })
  await fetchProducts()
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

    <main class="w-full max-w-screen-2xl px-4 pb-10">
      <!-- <ProductBanner /> -->
      <div class="mt-6 grid items-start gap-6 md:grid-cols-4 lg:gap-8">
        <ProductFilters
          class="grid md:col-span-1"
          v-model:min-price-input="minPriceInput"
          v-model:max-price-input="maxPriceInput"
          v-model:selected-brands="selectedBrands"
          :available-brands="availableBrands"
          :is-loading-brands="isLoadingBrands"
          :brand-error="brandError"
          @clear="clearFilters"
          @apply-price="applyPriceFilter"
        />
        <section aria-label="Products" class="min-w-0 md:col-span-3">
          <div
            v-if="isLoading && products.length === 0"
            class="mt-1 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            aria-label="Loading products"
          >
            <ProductCardSkeleton v-for="index in 8" :key="index" />
          </div>

          <p v-else-if="error" class="py-16 text-center text-red-700" role="alert">
            Could not load products: {{ error }}
          </p>

          <div v-else class="mt-1">
            <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <RouterLink
                v-for="product in products"
                :key="product.id"
                :to="{
                  name: 'product-detail',
                  params: { slug: product.slug },
                  query: { id: product.id },
                }"
                class="block transition-all duration-200 ease-out hover:-translate-y-1"
              >
                <ProductCard
                  :product="product"
                  :add-to-cart="() => addCurrentProductToCart(product)"
                />
              </RouterLink>
            </div>

            <p v-if="products.length === 0" class="py-16 text-center text-stone-600">
              No products match these filters.
            </p>
          </div>
        </section>
      </div>

      <!-- Infinite scroll trigger -->
      <div ref="loadMoreTrigger" class="flex justify-center py-8">
        <Spinner class="size-10" aria-hidden="true" v-if="isLoading" />

        <p v-else-if="!hasMore" class="text-sm text-gray-500">You've reached the end.</p>
      </div>
    </main>
  </div>
</template>
