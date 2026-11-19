<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    type: 'button',
  },
)
</script>

<template>
  <button
    :type="props.type"
    class="px-4 py-2 bg-blue-500 text-white font-bold rounded transition-transform active:scale-95 hover:bg-blue-700 hover:cursor-pointer"
  >
    <slot />
  </button>
</template>
