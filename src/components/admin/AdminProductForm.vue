<script setup lang="ts">
import { ADMIN_PRODUCTS } from '@/data/adminProducts'

defineProps<{
  mode: 'create' | 'edit'
}>()

const exampleProduct = ADMIN_PRODUCTS.find((product) => product.id === 1)

if (!exampleProduct) {
  throw new Error('The sample product for the admin form is missing')
}
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
    <section class="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-7">
      <div class="mb-7">
        <h2 class="text-base font-semibold text-stone-900">Product information</h2>
        <p class="mt-1 text-sm text-stone-500">Add the details customers will see in your store.</p>
      </div>

      <form class="space-y-6" @submit.prevent>
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-stone-700">Product name</span>
          <input
            :value="mode === 'edit' ? exampleProduct.name : ''"
            placeholder="e.g. Everyday ceramic mug"
            class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
          />
        </label>

        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">Price</span>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">NPR</span>
              <input
                :value="mode === 'edit' ? exampleProduct.price : ''"
                placeholder="0.00"
                class="h-11 w-full rounded-xl border border-stone-200 bg-white pl-12 pr-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
              />
            </div>
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">Stock quantity</span>
            <input
              :value="mode === 'edit' ? exampleProduct.stock : ''"
              placeholder="0"
              class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            />
          </label>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">Category</span>
            <select
              class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-600 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            >
              <option>{{ mode === 'edit' ? exampleProduct.categories[0] : 'Choose a category' }}</option>
              <option>Home</option>
              <option>Accessories</option>
              <option>Audio &amp; Tech</option>
              <option>Stationery</option>
            </select>
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">Status</span>
            <select
              class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-600 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            >
              <option>Active</option>
              <option>Draft</option>
            </select>
          </label>
        </div>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-stone-700">Short description</span>
          <input
            :value="mode === 'edit' ? exampleProduct.subtitle : ''"
            placeholder="A short line describing the product"
            class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-stone-700">Full description</span>
          <textarea
            :value="mode === 'edit' ? exampleProduct.description : ''"
            rows="5"
            placeholder="Share more details about materials, sizing, care, and what makes it special..."
            class="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
          ></textarea>
          <span class="mt-1.5 block text-right text-xs text-stone-400">A clear description helps customers decide.</span>
        </label>
      </form>
    </section>

    <aside class="space-y-6">
      <section class="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 class="text-base font-semibold text-stone-900">Product image</h2>
        <p class="mt-1 text-sm text-stone-500">Use a clear image on a simple background.</p>
        <div
          class="mt-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50"
        >
          <img
            v-if="mode === 'edit'"
            :src="exampleProduct.image"
            :alt="exampleProduct.name"
            class="h-full w-full object-cover"
          />
          <div v-else class="px-6 text-center">
            <div class="mx-auto flex size-11 items-center justify-center rounded-xl bg-white text-stone-500 shadow-sm">
              <span class="text-xl">+</span>
            </div>
            <p class="mt-3 text-sm font-medium text-stone-700">Drop an image here</p>
            <p class="mt-1 text-xs text-stone-400">PNG or JPG, up to 5 MB</p>
          </div>
        </div>
        <button
          type="button"
          class="mt-4 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          {{ mode === 'edit' ? 'Replace image' : 'Choose image' }}
        </button>
      </section>

      <section class="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 class="text-sm font-semibold text-stone-800">Publishing</h2>
        <p class="mt-2 text-sm leading-6 text-stone-500">
          Active products are visible in your storefront. Drafts are only visible to your team.
        </p>
      </section>
    </aside>
  </div>

  <div class="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
    <RouterLink
      :to="{ name: 'admin-products' }"
      class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
    >
      Cancel
    </RouterLink>
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700"
    >
      {{ mode === 'edit' ? 'Save changes' : 'Create product' }}
    </button>
  </div>
</template>
