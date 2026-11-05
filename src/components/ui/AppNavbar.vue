<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components'
import { LogOut, NepaliRupee, ShoppingCart, XIcon } from '@lucide/vue'
import type { Product } from '@/types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore, useCartStore } from '@/stores'
import { CartDrawer } from '@/components/cart'
import { useImageFallback, useProducts } from '@/composables'
import FullPageSpinner from './FullPageSpinner.vue'
import { toast } from 'vue-sonner'

const router = useRouter()
const cart = useCartStore()
const authStore = useAuthStore()

const { fallbackImage, handleImageError } = useImageFallback()

const props = defineProps<{
  initialProduct?: Product
}>()

const selectedProduct = ref<Product | undefined>(props.initialProduct)
const searchTerm = ref(props.initialProduct?.name ?? '')
const isLoggingOut = ref<boolean>(false)
const navbarElement = ref<HTMLElement | null>(null)
let searchDebounceTimeout: ReturnType<typeof setTimeout> | undefined

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

const userInitial = computed(() => {
  const name =
    authStore.user?.user_metadata?.full_name ??
    authStore.user?.user_metadata?.name ??
    authStore.user?.email ??
    ''

  return String(name).trim().charAt(0).toLocaleUpperCase() || '?'
})

const displayProduct = (product: Product | undefined) => product?.name ?? ''

const isAboveMd = useMediaQuery('(min-width: 48rem)')

watch(searchTerm, (term) => {
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout)

  searchError.value = null

  if (!term.trim() || selectedProduct.value?.name === term) {
    cancelProductSearch()
    searchResults.value = []
    return
  }

  searchDebounceTimeout = setTimeout(() => {
    searchDebounceTimeout = undefined
    void fetchProductSearch()
  }, 300)
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
  navbarElement.value?.querySelector<HTMLInputElement>('[data-slot="command-input"]')?.focus()
}

const handleProductSelect = (product: Product) => {
  router.push(`/product/${product.slug}/${product.id}`)
}

const handleLogout = async () => {
  isLoggingOut.value = true

  try {
    const signedOut = await authStore.signOut()

    if (!signedOut) {
      toast.error(authStore.error ?? 'Logout failed')
      return
    }
    // Display toast on succesfull signout as well
    cart.clearCart()
    router.replace('/')
  } finally {
    isLoggingOut.value = false
  }
}

onMounted(() => window.addEventListener('keydown', handleSearchShortcut))
onUnmounted(() => {
  window.removeEventListener('keydown', handleSearchShortcut)
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout)
})
</script>

<template>
  <FullPageSpinner :loading="isLoggingOut" />

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
              :placeholder="isAboveMd ? 'Search products... (Ctrl+K / ⌘+K)' : 'Search products...'"
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

      <div
        class="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-1 sm:gap-2 md:col-start-3 md:gap-3 lg:gap-4"
      >
        <button
          type="button"
          aria-label="Open cart"
          class="relative inline-flex items-center justify-center p-2 hover:cursor-pointer"
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
          v-if="!authStore.isAuth"
          to="/login"
          class="rounded-full px-3 py-2 text-xl font-semibold transition-colors hover:bg-stone-100"
        >
          Log in
        </RouterLink>

        <DropdownMenu v-else>
          <DropdownMenuTrigger>
            <div
              :aria-label="`Open ${authStore.user?.user_metadata?.full_name ?? authStore.user?.user_metadata?.name ?? 'profile'}`"
              class="flex size-10 items-center justify-center rounded-full bg-brand font-semibold text-white transition-colors hover:bg-brand/90 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              <img
                v-if="authStore.avatarUrl"
                :src="authStore.avatarUrl"
                alt=""
                class="size-full rounded-full object-cover"
              />
              <span v-else>{{ userInitial }}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            :side-offset="8"
            class="w-52 rounded-xl border-stone-200 bg-white p-2 text-stone-800 shadow-lg"
          >
            <DropdownMenuLabel
              class="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-stone-500"
            >
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator class="mx-1 bg-stone-200" />
            <DropdownMenuItem class="rounded-md p-0 focus:bg-stone-100 focus:text-brand">
              <RouterLink
                to="/profile"
                :aria-label="`Open ${authStore.user?.user_metadata?.full_name ?? authStore.user?.user_metadata?.name ?? 'profile'}`"
                class="block w-full rounded-md px-3 py-2 text-lg font-medium text-stone-700 transition-colors hover:text-brand"
              >
                Profile
              </RouterLink>
            </DropdownMenuItem>

            <DropdownMenuItem
              class="rounded-md p-0 focus:bg-red-50 focus:text-red-700"
              :disabled="isLoggingOut"
            >
              <button
                type="button"
                :disabled="isLoggingOut"
                class="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-lg font-medium text-red-600 transition-colors hover:text-red-700 hover:cursor-pointer"
                @click="handleLogout"
              >
                Log out
                <LogOut :size="16" aria-hidden="true" />
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </nav>
  <CartDrawer />
</template>
