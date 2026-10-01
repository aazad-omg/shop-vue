<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col bg-amber-200 min-h-screen items-center justify-center">
    <p class="text-5xl">This is your profile page</p>
    <RouterLink to="/">
      <button>Go back to home</button>
    </RouterLink>
  </div>
</template>
