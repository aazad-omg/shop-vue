<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import {
  CircleCheck,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from '@lucide/vue'
import { cn } from 'cn'
import { Toaster as Sonner } from 'vue-sonner'

defineOptions({ name: 'SonnerToaster' })

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
      '--toast-icon-margin-end': '10px',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <CircleCheck class="size-6 fill-green-600 text-white" :stroke-width="2.75" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
