<script setup lang="ts">
import AdminCategoryManager from '@/components/admin/AdminCategoryManager.vue'
</script>

<template>
  <section class="space-y-6">
    <header>
      <p class="text-sm font-medium text-stone-500">Catalog</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
        Categories
      </h1>
      <p class="mt-2 text-sm text-stone-500">Manage the categories used to organize products.</p>
    </header>

    <AdminCategoryManager />
  </section>
</template>
