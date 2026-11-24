<script setup lang="ts">
import { LayoutDashboard, Package, Tags } from '@lucide/vue'
import { AdminNavbar } from '@/components'

const navigation = [
  { label: 'Overview', name: 'admin-dashboard', icon: LayoutDashboard },
  { label: 'Products', name: 'admin-products', icon: Package },
  { label: 'Categories', name: 'admin-categories', icon: Tags },
]
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <AdminNavbar />

    <div
      class="mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10"
    >
      <aside class="shrink-0 lg:w-56">
        <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Workspace
        </p>
        <nav aria-label="Admin navigation" class="flex gap-2 overflow-x-auto lg:flex-col p-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="{ name: item.name }"
            class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-brand-900 transition-colors hover:bg-stone-100 hover:text-stone-950"
            active-class="border-stone-200 bg-white text-stone-950 shadow-sm"
            exact-active-class="border-stone-200 bg-white text-stone-950 shadow-sm"
          >
            <component :is="item.icon" class="size-4" :stroke-width="1.8" />
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main class="min-w-0 flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>
