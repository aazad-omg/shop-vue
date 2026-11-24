<script setup lang="ts">
import { Download, Plus, Search, SlidersHorizontal } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AdminProductTable from '@/components/admin/AdminProductTable.vue'
import { useProducts } from '@/composables'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components'

const currentPage = ref(1)
const pageSize = ref(5)
const { products, totalCount, isLoading, error, fetchProducts } = useProducts(() => ({
  limit: pageSize.value,
}))
const firstVisibleProduct = computed(() =>
  totalCount.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
)
const lastVisibleProduct = computed(() =>
  Math.min(currentPage.value * pageSize.value, totalCount.value),
)

watch(pageSize, () => {
  currentPage.value = 1
})

watch(
  [currentPage, pageSize],
  ([page]) => {
    fetchProducts(page)
  },
  { immediate: true },
)
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="text-sm font-medium text-stone-500">Catalog</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-brand-900 sm:text-3xl">
          Products
        </h1>
        <p class="mt-2 text-sm text-stone-500">Manage and organize your store’s product catalog.</p>
      </div>
      <RouterLink
        :to="{ name: 'admin-product-create' }"
        class="flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700"
      >
        <Plus class="size-4" />
        Add product
      </RouterLink>
    </header>

    <section class="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div class="flex flex-1 flex-col gap-3 sm:flex-row">
          <label class="relative block w-full sm:max-w-xs">
            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              placeholder="Search products..."
              class="h-10 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            />
          </label>
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 px-3.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            <SlidersHorizontal class="size-4 text-stone-400" />
            Filters
          </button>
        </div>
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
        >
          <Download class="size-4 text-stone-400" />
          Export
        </button>
      </div>
      <div
        class="flex flex-wrap items-center justify-between gap-2 border-y border-stone-100 bg-stone-50/60 px-5 py-3"
      >
        <div class="flex items-center gap-2">
          <label for="products-page-size" class="text-xs font-medium text-stone-500">
            Rows per page
          </label>
          <Select v-model="pageSize">
            <SelectTrigger id="products-page-size" class="h-8 w-[76px] rounded-lg bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="5">5</SelectItem>
              <SelectItem :value="10">10</SelectItem>
              <SelectItem :value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span class="text-xs text-stone-400">All products</span>
      </div>
      <p v-if="error" role="alert" class="px-5 py-4 text-sm text-rose-700">
        Could not load products: {{ error }}
      </p>
      <AdminProductTable v-else :products="products" :loading="isLoading" />
      <div
        class="flex flex-col items-center justify-between gap-3 border-t border-stone-100 px-5 py-3 sm:flex-row"
      >
        <p class="text-xs text-stone-400">
          Showing {{ firstVisibleProduct }}–{{ lastVisibleProduct }} of {{ totalCount }} products
        </p>
        <Pagination
          v-model:page="currentPage"
          :total="totalCount"
          :items-per-page="pageSize"
          :sibling-count="1"
          show-edges
          class="mx-0 w-auto"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious class="hover:cursor-pointer" />
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === currentPage"
                class="hover:cursor-pointer"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else />
            </template>
            <PaginationNext class="hover:cursor-pointer" />
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  </section>
</template>
