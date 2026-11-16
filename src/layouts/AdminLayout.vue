<script setup lang="ts">
import { AdminNavbar } from '@/components'
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <AdminNavbar />

    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
      <aside class="shrink-0 lg:w-56">
        <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Administration
        </p>
        <nav aria-label="Admin navigation" class="flex gap-2 lg:flex-col">
          <RouterLink
            :to="{ name: 'admin-dashboard' }"
            class="rounded-md px-3 py-2 font-medium text-stone-700 transition-colors hover:bg-white hover:text-brand"
            active-class="bg-white text-brand shadow-sm"
          >
            Overview
          </RouterLink>
        </nav>
      </aside>

      <main class="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
