<script setup lang="ts">
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components'

defineProps<{
  label: string
  value: string
  change: string
  comparison: string
  tone?: 'green' | 'blue' | 'amber' | 'violet'
}>()
</script>

<template>
  <Card class="gap-0 rounded-2xl border-stone-200/80 bg-white py-0 shadow-sm shadow-stone-200/30">
    <CardHeader class="gap-0 px-5 pt-5 pb-0">
      <CardTitle class="text-sm font-medium text-stone-500">{{ label }}</CardTitle>
      <CardAction
        class="flex size-10 items-center justify-center rounded-xl"
        :class="{
          'bg-emerald-50 text-emerald-700': tone === 'green',
          'bg-sky-50 text-sky-700': tone === 'blue',
          'bg-amber-50 text-amber-700': tone === 'amber',
          'bg-violet-50 text-violet-700': tone === 'violet',
        }"
      >
        <slot name="icon" />
      </CardAction>
    </CardHeader>
    <CardContent class="px-5 pt-3 pb-5">
      <p class="text-2xl font-semibold tracking-tight text-brand-900 sm:text-3xl">
        {{ value }}
      </p>
      <div class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span class="font-semibold text-emerald-700">{{ change }}</span>
        <CardDescription class="text-xs text-stone-400">{{ comparison }}</CardDescription>
      </div>
    </CardContent>
  </Card>
</template>
