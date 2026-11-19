<script setup lang="ts">
import { ChevronDown, ChevronUp } from '@lucide/vue'
import { TableHead } from '@/components'

const props = withDefaults(
  defineProps<{
    label: string
    sortable?: boolean
    sortDirection?: false | 'asc' | 'desc'
    class?: string
  }>(),
  {
    sortable: false,
    sortDirection: false,
  },
)

const emit = defineEmits<{
  sort: []
}>()
</script>

<template>
  <TableHead
    :class="props.class || 'px-4 py-3.5 font-semibold text-brand-700'"
    :aria-sort="props.sortable
      ? props.sortDirection === 'asc'
        ? 'ascending'
        : props.sortDirection === 'desc'
          ? 'descending'
          : 'none'
      : undefined"
  >
    <button
      v-if="props.sortable"
      type="button"
      class="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.12em] text-brand-700"
      @click="emit('sort')"
    >
      <slot>{{ props.label }}</slot>
      <ChevronUp v-if="props.sortDirection === 'asc'" class="size-3.5" />
      <ChevronDown v-else-if="props.sortDirection === 'desc'" class="size-3.5" />
    </button>
    <span v-else>
      <slot>{{ props.label }}</slot>
    </span>
  </TableHead>
</template>
