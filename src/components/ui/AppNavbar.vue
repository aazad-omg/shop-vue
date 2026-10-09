<script setup lang="ts">
import { BaseButton } from '@/components/ui'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui'
import { XIcon } from '@lucide/vue'
import type { Product } from '@/types'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  products: Product[]
  initialProduct?: Product
}>()

const selectedProduct = ref<Product | undefined>(props.initialProduct)
const searchTerm = ref(props.initialProduct?.name ?? '')
const displayProduct = (product: Product | undefined) => product?.name ?? ''
const searchResults = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase()

  return props.products
    .filter((product) => product.name.toLocaleLowerCase().includes(query))
    .slice(0, 7)
})

watch(
  () => props.initialProduct,
  (product) => {
    selectedProduct.value = product
    searchTerm.value = product?.name ?? ''
  },
)

const clearSearch = () => {
  selectedProduct.value = undefined
  searchTerm.value = ''
}

const handleProductSelect = (product: Product) => {
  router.push(`/product/${product.slug}`)
}

const handleLogout = () => {
  alert('Logged out successfully!')
  router.replace('/login')
}
</script>

<template>
  <nav
    class="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 text-stone-800 shadow-sm backdrop-blur"
  >
    <div class="flex w-full items-center justify-around gap-4 px-4 py-3 sm:px-6">
      <RouterLink to="/" class="">
        <div class="text-xl font-extrabold text-brand">Logo placeholder</div>
      </RouterLink>

      <div role="search" class="w-full max-w-xl flex-1">
        <Combobox v-model="selectedProduct" by="id" :ignore-filter="true">
          <ComboboxAnchor
            class="flex w-full items-center rounded-md border border-stone-300 bg-white shadow-sm transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
          >
            <ComboboxInput
              v-model="searchTerm"
              placeholder="Search products..."
              :display-value="displayProduct"
              class="h-10 min-w-0 flex-1 border-0 px-3"
            />
            <button
              v-if="searchTerm || selectedProduct"
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

          <ComboboxList class="max-h-64 w-(--reka-combobox-trigger-width)">
            <ComboboxEmpty>No products found.</ComboboxEmpty>

            <ComboboxGroup>
              <ComboboxItem
                v-for="product in searchResults"
                :key="product.id"
                :value="product"
                class="pb-2"
                @select="handleProductSelect(product)"
              >
                {{ product.name }}
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </div>
      <div class="flex shrink-0 items-center gap-2 sm:gap-4">
        <RouterLink
          to="/profile"
          class="rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-stone-100"
        >
          Profile
        </RouterLink>
        <RouterLink
          to="/cart"
          class="rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-stone-100"
        >
          Cart
        </RouterLink>
        <BaseButton @click="handleLogout">Log out</BaseButton>
      </div>
    </div>
  </nav>
</template>
