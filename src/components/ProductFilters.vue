<script setup lang="ts">
import { Button, Input } from './ui'

defineProps<{
  availableBrands: string[]
  isLoadingBrands: boolean
  brandError: string | null
}>()

const maxPriceInput = defineModel<number | ''>('maxPriceInput', { required: true })
const minPriceInput = defineModel<number | ''>('minPriceInput', { required: true })
const selectedBrands = defineModel<string[]>('selectedBrands', { required: true })

const emit = defineEmits<{
  clear: []
  applyPrice: [minPrice: number | '', maxPrice: number | '']
}>()

const emitPriceFilter = () => {
  emit('applyPrice', minPriceInput.value, maxPriceInput.value)
}
</script>

<template>
  <aside
    aria-label="Product filters"
    class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
  >
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-stone-900">Filters</h2>
      <button
        type="button"
        class="text-sm font-medium text-brand hover:underline hover:cursor-pointer"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>

    <section class="mt-5 border-t border-stone-200 pt-4">
      <h3 class="text-sm font-semibold text-stone-800">Brand</h3>
      <p v-if="isLoadingBrands" class="mt-3 text-sm text-stone-500" role="status">
        Loading brands...
      </p>
      <p v-else-if="brandError" class="mt-3 text-sm text-red-700" role="alert">
        Could not load brands: {{ brandError }}
      </p>
      <p v-else-if="availableBrands.length === 0" class="mt-3 text-sm text-stone-500">
        No brands available.
      </p>
      <div v-else class="mt-3 max-h-56 space-y-2 overflow-y-auto">
        <label
          v-for="brand in availableBrands"
          :key="brand"
          class="flex cursor-pointer items-center gap-2 text-sm text-stone-700"
        >
          <input
            v-model="selectedBrands"
            type="checkbox"
            :value="brand"
            class="size-4 accent-brand"
          />
          <span>{{ brand }}</span>
        </label>
      </div>
    </section>

    <form
      class="flex items-center gap-2 mt-5 border-t border-stone-200 py-4"
      @submit.prevent="emitPriceFilter"
    >
      <Input id="min-price" min="0" v-model="minPriceInput" type="number" placeholder="Min" />

      <span>-</span>
      <Input id="max-price" placeholder="Max" v-model="maxPriceInput" type="number" min="0" />
      <Button type="button" @click="emitPriceFilter">Go</Button>
    </form>
  </aside>
</template>
