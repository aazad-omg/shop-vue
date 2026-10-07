<script setup lang="ts">
import type { Product } from '@/types'

type Props = {
  product: Product
  addToCart: () => void
}

const props = withDefaults(defineProps<Props>(), {
  product: () => ({
    id: 0,
    image: '',
    name: '',
    slug: '',
    subtitle: '',
    price: 0,
    description: '',
  }),
})
</script>

<template>
  <div class="group mx-auto max-w-xs overflow-hidden p-2">
    <div class="relative">
      <img
        :src="props.product.image"
        :alt="props.product.name"
        class="h-68 w-full rounded-2xl object-cover transition-transform duration-300 ease-out group-hover:scale-105"
      />
      <button
        type="button"
        aria-label="Add to cart"
        class="visible absolute bottom-3 right-3 flex items-center justify-center rounded-xl bg-brand px-3 py-1 text-xl font-medium text-white opacity-100 shadow-md transition-all hover:bg-amber-800 hover:cursor-pointer md:invisible md:opacity-0 md:group-hover:visible md:group-hover:opacity-100 md:focus-visible:visible md:focus-visible:opacity-100"
        @click.stop.prevent="props.addToCart"
      >
        <p class="text-sm font-semibold">+ Add</p>
      </button>
    </div>
    <div class="py-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 hover:underline">
            {{ props.product.name }}
          </h2>
          <p class="text-sm text-gray-500">{{ props.product.subtitle }}</p>
        </div>
      </div>
      <p class="mt-3 text-sm text-gray-600">{{ props.product.description }}</p>
      <p>Ratings</p>
      <p class="text-lg font-bold text-amber-700">${{ props.product.price.toFixed(2) }}</p>
    </div>
  </div>
</template>
