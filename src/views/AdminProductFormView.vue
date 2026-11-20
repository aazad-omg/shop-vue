<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { AdminProductForm } from '@/components'

const route = useRoute()
const mode = computed(() => (route.name === 'admin-product-edit' ? 'edit' : 'create'))
</script>

<template>
  <section class="space-y-6">
    <header>
      <RouterLink
        :to="{ name: 'admin-products' }"
        class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
      >
        <ArrowLeft class="size-4" />
        Back to products
      </RouterLink>
      <p class="text-sm font-medium text-stone-500">Catalog</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
        {{ mode === 'edit' ? 'Edit product' : 'Add a product' }}
      </h1>
      <p class="mt-2 text-sm text-stone-500">
        {{ mode === 'edit' ? 'Update your product details.' : 'Add a new item to your catalog.' }}
      </p>
    </header>

    <AdminProductForm :mode="mode" />
  </section>
</template>
