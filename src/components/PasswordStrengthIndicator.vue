<script setup lang="ts">
import { toRef } from 'vue'
import { usePasswordStrength } from '@/composables'
import { Progress } from '@/components/ui/progress'

const props = defineProps<{ password: string }>()
const passwordStrength = usePasswordStrength(toRef(props, 'password'))
</script>

<template>
  <div v-if="props.password" class="mt-2" aria-live="polite">
    <div class="flex items-center justify-between text-sm">
      <span class="text-brand-700">Password strength</span>
      <span class="font-medium" :class="passwordStrength.textColorClass">
        {{ passwordStrength.label }}
      </span>
    </div>
    <Progress
      class="mt-1 h-1.5"
      :model-value="passwordStrength.score * 25"
      :indicator-class="passwordStrength.indicatorClass"
      :aria-valuetext="passwordStrength.label"
      aria-label="Password strength"
    />
    <p class="mt-1 text-xs text-brand-700">
      Try 8+ characters with uppercase and lowercase letters, a number, and a symbol.
    </p>
  </div>
</template>
