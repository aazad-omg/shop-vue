<script setup lang="ts">
import { Card, CardContent, CardHeader } from './ui/card'
import { Skeleton } from './ui/skeleton'
</script>

<template>
  <Card aria-hidden="true" class="group w-full overflow-hidden gap-0 p-0">
    <Skeleton class="h-72 w-full" />
    <CardHeader class="gap-2 px-4 pt-4 pb-0">
      <Skeleton class="h-6 w-3/5" />
      <Skeleton class="h-4 w-2/5" />
    </CardHeader>
    <CardContent class="px-4 pt-3 pb-4">
      <div class="space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-4/5" />
      </div>
      <div class="mt-3 flex items-center justify-between">
        <Skeleton class="h-4 w-8" />
        <Skeleton class="h-6 w-20" />
      </div>
    </CardContent>
  </Card>
</template>
