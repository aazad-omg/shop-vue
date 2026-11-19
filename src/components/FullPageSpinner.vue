<script setup lang="ts">
import { Spinner } from '@/components'

defineProps<{
  loading: boolean
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="loading"
      class="fixed inset-0 z-9999 flex items-center justify-center bg-black/40"
      role="status"
      aria-label="Loading"
    >
      <Spinner class="size-10" aria-hidden="true" />
    </div>
  </Teleport>
</template>
