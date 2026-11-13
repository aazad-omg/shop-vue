<script setup lang="ts">
import { NepaliRupee } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import AccountDropdown from './AccountDropdown.vue'
</script>

<template>
  <header
    class="sticky top-0 z-45 w-full border-b border-stone-200 bg-white/95 text-stone-800 shadow-sm backdrop-blur"
  >
    <nav
      aria-label="Admin header"
      class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
    >
      <RouterLink to="/admin" class="flex min-w-0 items-center gap-2 font-extrabold text-brand">
        <span class="text-2xl sm:text-3xl">ShopVue</span>
        <NepaliRupee :size="30" color="#dd0808" :stroke-width="2.5" />
        <span
          class="ml-1 hidden border-l border-stone-300 pl-3 text-sm font-semibold text-stone-600 sm:inline"
        >
          Admin
        </span>
      </RouterLink>

      <div class="flex shrink-0 items-center gap-2 sm:gap-4">
        <RouterLink
          to="/"
          class="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-brand"
        >
          Back to shop
        </RouterLink>
        <AccountDropdown />
      </div>
    </nav>
  </header>
</template>
