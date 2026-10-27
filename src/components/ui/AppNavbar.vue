<script setup lang="ts">
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui'
import { NepaliRupee, ShoppingCart, XIcon } from '@lucide/vue'
import type { Product } from '@/types'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore, useCartStore } from '@/stores'
import { supabase } from '@/supabase'
import { CartDrawer } from '@/components/cart'

const router = useRouter()
const cart = useCartStore()
const authStore = useAuthStore()

let navbarResizeObserver: ResizeObserver | undefined

const props = defineProps<{
  products: Product[]
  initialProduct?: Product
}>()

const selectedProduct = ref<Product | undefined>(props.initialProduct)
const searchTerm = ref(props.initialProduct?.name ?? '')
const isLoggingOut = ref<boolean>(false)
const userInitial = computed(() => {
  const name =
    authStore.user?.user_metadata?.full_name ??
    authStore.user?.user_metadata?.name ??
    authStore.user?.email ??
    ''

  return String(name).trim().charAt(0).toLocaleUpperCase() || '?'
})

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

const handleLogout = async () => {
  isLoggingOut.value = true

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    authStore.setUser(null)
    router.replace('/login')
  } finally {
    isLoggingOut.value = false
  }
}

// disconnect the ResizeObserver that was watching the navbar’s size
onBeforeUnmount(() => navbarResizeObserver?.disconnect())
</script>

<template>
  <nav
    ref="navbarElement"
    class="sticky top-0 z-45 w-full border-b border-stone-200 bg-white/95 text-stone-800 shadow-sm backdrop-blur"
  >
    <div
      class="mx-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 lg:gap-x-8 lg:px-8"
    >
      <RouterLink to="/" class="min-w-0">
        <div class="flex items-center gap-2 font-extrabold text-brand">
          <p class="text-3xl">ShopVue</p>
          <NepaliRupee :size="35" color="#dd0808" :stroke-width="2.5" />
        </div>
      </RouterLink>

      <div
        role="search"
        class="col-span-2 row-start-2 w-full min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:mx-auto md:max-w-xl"
      >
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

          <ComboboxList class="max-h-64 w-(--reka-combobox-trigger-width) z-60">
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

      <div
        class="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-1 sm:gap-2 md:col-start-3 md:gap-3 lg:gap-4"
      >
        <RouterLink
          v-if="authStore.isAuth"
          to="/profile"
          class="rounded-full px-3 py-2 text-xl font-semibold transition-colors hover:bg-stone-100"
        >
          Profile
        </RouterLink>
        <button
          type="button"
          aria-label="Open cart"
          class="relative inline-flex items-center justify-center p-2"
          @click="cart.openDrawer"
        >
          <ShoppingCart :size="30" color="#2a3a5e" :stroke-width="2.5" />

          <span
            v-if="cart.itemCount > 0"
            class="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white"
            aria-hidden="true"
          >
            {{ cart.itemCount }}
          </span>
        </button>

        <RouterLink
          v-if="authStore.isAuth"
          to="/profile"
          :aria-label="`Open ${authStore.user?.user_metadata?.full_name ?? authStore.user?.user_metadata?.name ?? 'profile'}`"
          class="inline-flex size-10 items-center justify-center rounded-full bg-brand font-semibold text-white transition-colors hover:bg-brand/90"
        >
          {{ userInitial }}
        </RouterLink>

        <button
          v-if="authStore.isAuth"
          type="button"
          :disabled="isLoggingOut"
          class="rounded-full px-3 py-2 font-semibold transition-colors hover:bg-stone-100"
          @click="handleLogout"
        >
          {{ isLoggingOut ? 'Logging out...' : 'Log out' }}
        </button>

        <RouterLink
          v-else
          to="/login"
          class="rounded-full px-3 py-2 text-xl font-semibold transition-colors hover:bg-stone-100"
          >Log in
        </RouterLink>
      </div>
    </div>
  </nav>
  <CartDrawer />
</template>
