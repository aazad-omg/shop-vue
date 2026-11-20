<script setup lang="ts">
import { ShoppingCart } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { useAuthStore, useCartStore } from '@/stores'
import { CartDrawer } from '@/components/cart'
import ShopLogo from './ShopLogo.vue'
import AccountDropdown from './AccountDropdown.vue'
import ProductSearch from './ProductSearch.vue'

const cart = useCartStore()
const authStore = useAuthStore()
</script>

<template>
  <nav
    class="sticky top-0 z-45 w-full border-b border-stone-200 bg-white/95 text-stone-800 shadow-sm backdrop-blur"
  >
    <div
      class="mx-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 lg:gap-x-8 lg:px-8"
    >
      <RouterLink :to="{ name: 'home' }" class="min-w-0">
        <ShopLogo />
      </RouterLink>

      <ProductSearch />

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

        <AccountDropdown v-else />
      </div>
    </div>
  </nav>
  <CartDrawer />
</template>
