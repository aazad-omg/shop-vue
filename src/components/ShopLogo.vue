<script setup lang="ts">
import { NepaliRupee } from '@lucide/vue'
</script>

<template>
  <div class="flex items-center gap-2 font-extrabold text-brand">
    <p class="text-3xl">ShopVue</p>
    <NepaliRupee :size="35" color="#dd0808" :stroke-width="2.5" />
  </div>
</template>
