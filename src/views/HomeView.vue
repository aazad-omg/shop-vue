<script setup lang="ts">
import { RouterLink } from 'vue-router'

const name: string = 'I have setup Vue Router'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-amber-50 justify-center items-center">
    <p class="text-5xl">{{ name }}</p>
    <p>This is Home page</p>
    <RouterLink to="/profile">
      <button>See your profile</button>
    </RouterLink>
  </div>
</template>
