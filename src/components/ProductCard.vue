<script setup lang="ts">
import type { Product } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { NepaliRupee } from '@lucide/vue'
import { handleImageFallback } from '@/helpers'
import { useMediaQuery } from '@vueuse/core'

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
    categories: [],
  }),
})

const { fallbackImage, handleImageError } = handleImageFallback()
const isAboveMd = useMediaQuery('(min-width: 48rem)')
</script>

<template>
  <Card class="group w-full overflow-hidden gap-0 p-0 transition-shadow hover:shadow-md">
    <div class="relative">
      <img
        :src="props.product.image || fallbackImage"
        :alt="props.product.name"
        loading="lazy"
        class="h-72 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        @error="handleImageError"
      />
      <button
        type="button"
        aria-label="Add to cart"
        class="visible absolute bottom-3 right-3 flex items-center justify-center rounded-md bg-brand px-3 py-1 text-xl font-medium text-white opacity-100 shadow-md transition-all hover:bg-amber-800 hover:cursor-pointer md:invisible md:opacity-0 md:group-hover:visible md:group-hover:opacity-100 md:focus-visible:visible md:focus-visible:opacity-100"
        @click.stop.prevent="props.addToCart"
      >
        <p class="text-sm font-semibold">+ Add</p>
      </button>
    </div>

    <CardHeader class="gap-1 px-4 pt-4 pb-0">
      <TooltipProvider v-if="isAboveMd">
        <Tooltip>
          <TooltipTrigger as-child>
            <CardTitle class="text-lg font-semibold text-gray-800 line-clamp-1">
              {{ props.product.name }}
            </CardTitle>
          </TooltipTrigger>
          <TooltipContent>{{ props.product.name }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CardTitle v-else class="text-lg font-semibold text-gray-800 line-clamp-1">
        {{ props.product.name }}
      </CardTitle>

      <CardDescription>{{ props.product.subtitle }}</CardDescription>
    </CardHeader>

    <CardContent class="px-4 pt-3 pb-4">
      <p class="text-sm text-gray-600 line-clamp-2">{{ props.product.description }}</p>
      <div class="mt-3 flex items-center justify-between">
        <p class="text-sm text-amber-500" role="img" aria-label="Rating">⭐</p>
        <p class="flex items-center text-lg font-bold text-brand">
          <NepaliRupee :size="17" color="#2a3a5e" :stroke-width="2.75" />
          <span class="pl-0.5">{{ props.product.price.toFixed(2) }}</span>
        </p>
      </div>
    </CardContent>
  </Card>
</template>
