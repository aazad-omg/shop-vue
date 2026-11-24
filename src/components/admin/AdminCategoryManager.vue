<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useCategories } from '@/composables'
import { createCategory, deleteCategory } from '@/services'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
  Button,
} from '../ui'

const {
  categories,
  isLoading: categoriesLoading,
  error: categoriesError,
  fetchCategories,
} = useCategories()
const categoryName = ref('')
const isAddingCategory = ref(false)
const removingCategoryId = ref<string | null>(null)
const isRemoveDialogOpen = ref(false)
const categoryToRemove = ref<{ id: string; name: string } | null>(null)
const managedCategories = computed(() => categories.value.filter((category) => category.slug))

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const addCategory = async () => {
  const name = categoryName.value.trim()
  if (!name) {
    toast.error('Enter a category name')
    return
  }

  const slug = slugify(name)
  if (!slug) {
    toast.error('Enter a valid category name')
    return
  }

  isAddingCategory.value = true
  try {
    await createCategory(name, slug)
    categoryName.value = ''
    await fetchCategories()
    toast.success('Category added')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to add category')
  } finally {
    isAddingCategory.value = false
  }
}

const requestRemoveCategory = (id: string, name: string) => {
  categoryToRemove.value = { id, name }
  isRemoveDialogOpen.value = true
}

const confirmRemoveCategory = async () => {
  const category = categoryToRemove.value
  if (!category || removingCategoryId.value) return

  removingCategoryId.value = category.id
  try {
    await deleteCategory(category.id)
    await fetchCategories()
    toast.success('Category removed')
    isRemoveDialogOpen.value = false
    categoryToRemove.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to remove category')
  } finally {
    removingCategoryId.value = null
  }
}

onMounted(() => fetchCategories())
</script>

<template>
  <section class="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-base font-semibold text-stone-900">Categories</h2>
        <p class="mt-1 text-sm text-stone-500">Add or remove product categories</p>
      </div>
      <form class="flex w-full gap-2 sm:w-auto" @submit.prevent="addCategory">
        <label class="sr-only" for="category-name">Category name</label>
        <input
          id="category-name"
          v-model="categoryName"
          type="text"
          placeholder="Category name"
          class="h-10 min-w-0 flex-1 rounded-xl border border-stone-200 px-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 sm:w-52"
        />
        <Button
          type="submit"
          :disabled="isAddingCategory"
          class="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-900 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus class="size-4" />
          Add
        </Button>
      </form>
    </div>

    <div
      v-if="categoriesLoading"
      class="flex justify-center items-center py-10 gap-2 text-sm text-stone-500"
      role="status"
    >
      <Spinner class="size-8 text-brand-700" aria-hidden="true" />
      <p class="text-brand-700 font-medium">Loading categories...</p>
    </div>

    <p v-else-if="categoriesError" role="alert" class="mt-5 text-sm text-rose-700">
      Could not load categories: {{ categoriesError }}
    </p>
    <p v-else-if="managedCategories.length === 0" class="mt-5 text-sm text-stone-500">
      No categories yet.
    </p>
    <ul v-else class="mt-5 divide-y divide-stone-100 rounded-xl border border-stone-100">
      <li
        v-for="category in managedCategories"
        :key="category.id || category.slug"
        class="flex items-center justify-between gap-3 px-4 py-3"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-stone-800">{{ category.name }}</p>
          <p class="mt-0.5 truncate text-xs text-stone-400">{{ category.slug }}</p>
        </div>
        <Button
          v-if="category.id"
          type="button"
          variant="ghost"
          size="icon"
          :disabled="removingCategoryId === category.id"
          :aria-label="`Remove ${category.name}`"
          class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-stone-400 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="requestRemoveCategory(category.id, category.name)"
        >
          <Trash2 class="size-4" />
        </Button>
      </li>
    </ul>
  </section>

  <Dialog v-model:open="isRemoveDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-brand-900">Remove category?</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove
          <span class="font-bold">"{{ categoryToRemove?.name }}"</span>? This action cannot be
          undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose as-child>
          <Button
            type="button"
            variant="outline"
            class="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50"
            :disabled="removingCategoryId !== null"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          class="rounded-xl bg-rose-700 hover:bg-rose-800"
          :disabled="removingCategoryId !== null || !categoryToRemove"
          @click="confirmRemoveCategory"
        >
          {{ removingCategoryId ? 'Removing...' : 'Remove category' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
