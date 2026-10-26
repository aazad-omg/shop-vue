<script setup lang="ts">
import { Card, CardContent, CardHeader } from './card'
</script>

<template>
  <Card aria-hidden="true" class="group w-full animate-pulse overflow-hidden gap-0 p-0">
    <div class="h-72 w-full bg-stone-200"></div>
    <CardHeader class="gap-2 px-4 pt-4 pb-0">
      <div class="h-6 w-3/5 rounded bg-stone-200"></div>
      <div class="h-4 w-2/5 rounded bg-stone-200"></div>
    </CardHeader>
    <CardContent class="px-4 pt-3 pb-4">
      <div class="space-y-2">
        <div class="h-4 w-full rounded bg-stone-200"></div>
        <div class="h-4 w-4/5 rounded bg-stone-200"></div>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <div class="h-4 w-8 rounded bg-stone-200"></div>
        <div class="h-6 w-20 rounded bg-stone-200"></div>
      </div>
    </CardContent>
  </Card>
</template>
