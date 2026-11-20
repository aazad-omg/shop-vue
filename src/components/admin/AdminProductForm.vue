<script setup lang="ts">
import { createProduct, updateProduct } from '@/services'
import { useCategories, useProducts } from '@/composables'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/components'
import useVuelidate from '@vuelidate/core'
import {
  productCategoryRules,
  productDescriptionRules,
  productNameRules,
  productPriceRules,
  productSlugRules,
  productStockRules,
  productSubtitleRules,
} from '@/validations/common'

const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const submitError = ref('')
const {
  categories: categoryOptions,
  isLoading: categoriesLoading,
  error: categoriesError,
  fetchCategories,
} = useCategories()
const { fetchProductById, isLoading: productLoading, error: productError } = useProducts()
const categories = computed(() =>
  categoryOptions.value.filter(
    (category): category is typeof category & { id: string } =>
      Boolean(category.slug) && Boolean(category.id),
  ),
)

const form = reactive({
  name: '',
  slug: '',
  subtitle: '',
  categories: [] as string[],
  price: null as number | null,
  stock: null as number | null,
  is_active: true,
  description: '',
})

onMounted(async () => {
  const [, product] = await Promise.all([
    fetchCategories(),
    props.mode === 'edit' ? fetchProductById(String(route.params.id ?? '')) : Promise.resolve(null),
  ])

  if (!product) return

  form.name = product.name
  form.slug = product.slug
  form.subtitle = product.subtitle
  form.price = product.price
  form.stock = product.stock ?? null
  form.is_active = product.is_active ?? true
  form.description = product.description
  form.categories = product.categories.flatMap((name) =>
    categoryOptions.value
      .filter((category) => category.name === name)
      .map((category) => category.id ?? ''),
  )
})

const publishingStatus = computed({
  get: () => (form.is_active ? 'active' : 'draft'),
  set: (value: string) => {
    form.is_active = value === 'active'
  },
})

const rules = {
  name: productNameRules,
  slug: productSlugRules,
  subtitle: productSubtitleRules,
  categories: productCategoryRules,
  price: productPriceRules,
  stock: productStockRules,
  description: productDescriptionRules,
}

const v$ = useVuelidate(rules, form)

const handleSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid || form.price === null || form.stock === null) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const productInput = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      subtitle: form.subtitle.trim(),
      categories: form.categories,
      price: form.price,
      stock: form.stock,
      is_active: form.is_active,
      description: form.description.trim(),
    }

    if (props.mode === 'edit') {
      await updateProduct({ ...productInput, id: route.params.id as string })
      toast.success('Product updated successfully')
    } else {
      await createProduct(productInput)
      toast.success('Product added successfully')
    }
    await router.push({ name: 'admin-products' })
  } catch (error) {
    submitError.value =
      error instanceof Error
        ? error.message
        : `Failed to ${props.mode === 'edit' ? 'update' : 'create'} product`
    console.log('submitError:', submitError.value)
    toast.error(submitError.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <p v-if="productLoading" role="status" class="text-sm text-stone-500">Loading product...</p>
    <p v-else-if="productError" role="alert" class="text-sm text-red-700">
      Could not load product: {{ productError }}
    </p>
    <section class="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-7">
      <div class="mb-7">
        <h2 class="text-base font-semibold text-stone-900">Product information</h2>
        <p class="mt-1 text-sm text-stone-500">
          Enter the details customers will see in your store.
        </p>
      </div>

      <div class="space-y-6">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-stone-700">
            Product name <span class="text-red-700" aria-hidden="true">*</span>
          </span>
          <input
            v-model.trim="v$.name.$model"
            placeholder="e.g. Apple Watch SE"
            :aria-invalid="v$.name.$error"
            class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
          />
          <p v-if="v$.name.$error" role="alert" class="mt-1.5 text-sm font-medium text-red-700">
            {{ v$.name.$errors[0]?.$message }}
          </p>
        </label>

        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">
              Slug <span class="text-red-700" aria-hidden="true">*</span>
            </span>
            <input
              v-model.trim="v$.slug.$model"
              placeholder="apple-watch-se"
              :aria-invalid="v$.slug.$error"
              class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            />
            <p v-if="v$.slug.$error" role="alert" class="mt-1.5 text-sm font-medium text-red-700">
              {{ v$.slug.$errors[0]?.$message }}
            </p>
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">
              Subtitle <span class="text-red-700" aria-hidden="true">*</span>
            </span>
            <input
              v-model.trim="v$.subtitle.$model"
              placeholder="Stay connected and active"
              :aria-invalid="v$.subtitle.$error"
              class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            />
            <p
              v-if="v$.subtitle.$error"
              role="alert"
              class="mt-1.5 text-sm font-medium text-red-700"
            >
              {{ v$.subtitle.$errors[0]?.$message }}
            </p>
          </label>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">
              Price <span class="text-red-700" aria-hidden="true">*</span>
            </span>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400"
                >NPR</span
              >
              <input
                v-model.number="v$.price.$model"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                :aria-invalid="v$.price.$error"
                class="h-11 w-full rounded-xl border border-stone-200 bg-white pl-12 pr-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
              />
            </div>
            <p v-if="v$.price.$error" role="alert" class="mt-1.5 text-sm font-medium text-red-700">
              {{ v$.price.$errors[0]?.$message }}
            </p>
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">
              Stock quantity <span class="text-red-700" aria-hidden="true">*</span>
            </span>
            <input
              v-model.number="v$.stock.$model"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              :aria-invalid="v$.stock.$error"
              class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            />
            <p v-if="v$.stock.$error" role="alert" class="mt-1.5 text-sm font-medium text-red-700">
              {{ v$.stock.$errors[0]?.$message }}
            </p>
          </label>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend class="mb-2 block text-sm font-medium text-stone-700">
              Categories <span class="text-red-700" aria-hidden="true">*</span>
            </legend>
            <Select v-model="v$.categories.$model" multiple>
              <SelectTrigger
                :aria-invalid="v$.categories.$error"
                class="h-11 w-full rounded-xl border-stone-200 bg-white px-3.5 hover:cursor-pointer"
              >
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <div
                    v-if="categoriesLoading"
                    class="flex justify-center items-center py-10 gap-2 text-sm text-stone-500"
                    role="status"
                  >
                    <Spinner class="size-8 text-brand-700" aria-hidden="true" />
                    <p class="text-brand-700 font-medium">Loading categories...</p>
                  </div>
                  <p v-else-if="categoriesError" role="alert" class="text-sm text-red-700">
                    {{ categoriesError }}
                  </p>
                  <template v-else-if="categories.length">
                    <SelectItem
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                      class="hover:bg-stone-100 data-[state=checked]:bg-stone-100 hover:cursor-pointer"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </template>
                  <p v-else class="text-sm text-stone-500">No categories available.</p>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p
              v-if="v$.categories.$error"
              role="alert"
              class="mt-1.5 text-sm font-medium text-red-700"
            >
              {{ v$.categories.$errors[0]?.$message }}
            </p>
          </fieldset>

          <label class="block">
            <span class="mb-2 block text-sm font-medium text-stone-700">Publishing status</span>
            <Select v-model="publishingStatus">
              <SelectTrigger
                class="h-11 w-full rounded-xl border-stone-200 bg-white px-3.5 text-stone-600 hover:cursor-pointer"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="active" class="hover:bg-stone-100 hover:cursor-pointer">
                    Active
                  </SelectItem>
                  <SelectItem value="draft" class="hover:bg-stone-100 hover:cursor-pointer">
                    Draft
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
        </div>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-stone-700">
            Full description <span class="text-red-700" aria-hidden="true">*</span>
          </span>
          <textarea
            v-model.trim="v$.description.$model"
            rows="5"
            placeholder="Describe the product and its key details..."
            :aria-invalid="v$.description.$error"
            class="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
          ></textarea>
          <p
            v-if="v$.description.$error"
            role="alert"
            class="mt-1.5 text-sm font-medium text-red-700"
          >
            {{ v$.description.$errors[0]?.$message }}
          </p>
        </label>
      </div>
    </section>

    <div class="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
      <RouterLink
        :to="{ name: 'admin-products' }"
        class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
      >
        Cancel
      </RouterLink>
      <button
        type="submit"
        :disabled="isSubmitting || productLoading"
        class="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ isSubmitting ? 'Creating...' : mode === 'edit' ? 'Save changes' : 'Create product' }}
      </button>
    </div>
  </form>
</template>
