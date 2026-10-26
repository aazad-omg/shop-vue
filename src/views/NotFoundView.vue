<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4">
    <h1 class="text-4xl font-bold">404</h1>

    <p class="text-gray-600">Sorry, the page you're looking for doesn't exist.</p>

    <button
      class="rounded bg-blue-600 px-4 py-2 text-white hover:cursor-pointer"
      @click="router.push('/')"
    >
      Back to Home
    </button>
  </main>
</template>
