<script setup lang="ts">
import { useDebounceFn, useMediaQuery } from '@vueuse/core'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxViewport,
} from '@/components'
import { XIcon } from '@lucide/vue'
import type { Product } from '@/types'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useImageFallback, useProducts } from '@/composables'

const router = useRouter()
const searchElement = ref<HTMLElement | null>(null)
const searchTerm = ref('')
const isAboveMd = useMediaQuery('(min-width: 48rem)')

const { fallbackImage, handleImageError } = useImageFallback()

const {
  products: searchResults,
  isLoading: isSearching,
  error: searchError,
  fetchProducts: fetchProductSearch,
  cancelFetch: cancelProductSearch,
} = useProducts(() => ({
  searchTerm: searchTerm.value,
  limit: 5,
}))

const debouncedProductSearch = useDebounceFn(() => {
  void fetchProductSearch()
}, 300)

watch(searchTerm, (term) => {
  cancelProductSearch()

  if (!term.trim()) {
    debouncedProductSearch.cancel()
    searchResults.value = []
    return
  }

  void debouncedProductSearch()
})

const clearSearch = () => {
  searchTerm.value = ''
}

const handleSearchShortcut = (event: KeyboardEvent) => {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.shiftKey ||
    !(event.ctrlKey || event.metaKey) ||
    event.key.toLocaleLowerCase() !== 'k'
  ) {
    return
  }

  event.preventDefault()
  searchElement.value?.querySelector<HTMLInputElement>('[data-slot="command-input"]')?.focus()
}

const handleProductSelect = (product: Product) => {
  router.push({
    name: 'product-detail',
    params: { slug: product.slug },
    query: { id: product.id },
  })
}

onMounted(() => window.addEventListener('keydown', handleSearchShortcut))
onUnmounted(() => {
  window.removeEventListener('keydown', handleSearchShortcut)
  debouncedProductSearch.cancel()
})
</script>

<template>
  <div
    ref="searchElement"
    role="search"
    class="col-span-2 row-start-2 w-full min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:mx-auto md:max-w-xl"
  >
    <Combobox :ignore-filter="true">
      <ComboboxAnchor
        class="flex w-full items-center rounded-md border border-stone-300 bg-white shadow-sm transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
      >
        <ComboboxInput
          v-model="searchTerm"
          :placeholder="isAboveMd ? 'Search products... (Ctrl+K / ⌘+K)' : 'Search products...'"
          class="h-10 min-w-0 flex-1 border-0 px-3"
        />
        <button
          v-if="searchTerm"
          type="button"
          aria-label="Clear search"
          title="Clear search"
          class="mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          @mousedown.prevent
          @click.stop="clearSearch"
        >
          <XIcon class="size-4" />
        </button>
      </ComboboxAnchor>

      <ComboboxList class="max-h-64 w-(--reka-combobox-trigger-width) z-60">
        <ComboboxViewport>
          <ComboboxEmpty v-if="searchError">
            Could not search products: {{ searchError }}
          </ComboboxEmpty>
          <ComboboxEmpty v-else-if="isSearching">Searching products...</ComboboxEmpty>
          <ComboboxEmpty v-else-if="searchTerm.trim()">No products found.</ComboboxEmpty>
          <ComboboxGroup>
            <ComboboxItem
              v-for="product in searchResults"
              :key="product.id"
              :value="product"
              class="flex items-center gap-3 py-2 hover:cursor-pointer"
              @select="handleProductSelect(product)"
            >
              <img
                :src="product.image || fallbackImage"
                alt=""
                loading="lazy"
                class="size-10 shrink-0 rounded object-cover"
                @error="handleImageError"
              />
              <span class="min-w-0 truncate">{{ product.name }}</span>
            </ComboboxItem>
          </ComboboxGroup>
        </ComboboxViewport>
      </ComboboxList>
    </Combobox>
  </div>
</template>
