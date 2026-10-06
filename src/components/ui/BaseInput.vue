<script setup lang="ts">
import { Field, ErrorMessage } from 'vee-validate'
const props = withDefaults(
  defineProps<{
    name: string
    label: string
    type?: string
    placeholder?: string
    validateOnInput?: boolean
    inputClass?: string
  }>(),
  {
    type: 'text',
    placeholder: '',
    validateOnInput: true,
    inputClass: '',
  },
)
</script>

<template>
  <div class="my-2">
    <label :for="name" class="pr-1">{{ props.label }}</label>
    <div class="flex flex-col items-start">
      <div class="w-full py-2">
        <div
          class="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200"
        >
          <Field
            :name="name"
            :id="name"
            :type="type"
            :placeholder="props.placeholder"
            :label="label"
            :validate-on-input="validateOnInput"
            class="w-full outline-none"
          />
          <slot />
        </div>
      </div>

      <div class="min-h-6">
        <ErrorMessage :name="name" class="text-red-500 text-sm" />
      </div>
    </div>
  </div>
</template>
