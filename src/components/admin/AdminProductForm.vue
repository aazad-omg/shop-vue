<script setup lang="ts">
import {
  createProduct,
  getPublicImageUrl,
  removeImage,
  updateProduct,
  uploadImage,
} from '@/services'
import { generateSlug } from '@/helpers'
import { useCategories, useProducts } from '@/composables'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  Button,
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
  productBrandRules,
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
const imageInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const imageError = ref('')
const isDraggingImage = ref(false)
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
  image: '',
  name: '',
  slug: '',
  subtitle: '',
  brand: '',
  categories: [] as string[],
  price: null as number | null,
  stock: null as number | null,
  is_active: true,
  description: '',
})

const isSlugManuallyEdited = ref(false)

watch(
  () => form.name,
  (name) => {
    if (!isSlugManuallyEdited.value) form.slug = generateSlug(name)
  },
  { flush: 'sync' },
)

const markSlugAsManuallyEdited = () => {
  isSlugManuallyEdited.value = true
}

onMounted(async () => {
  const [, product] = await Promise.all([
    fetchCategories(),
    props.mode === 'edit' ? fetchProductById(String(route.params.id ?? '')) : Promise.resolve(null),
  ])

  if (!product) return

  form.name = product.name
  form.image = product.image
  form.slug = product.slug
  form.subtitle = product.subtitle
  form.brand = product.brand ?? ''
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

const previewImage = computed(() => imagePreviewUrl.value || form.image)

const setImageFile = (file?: File) => {
  imageError.value = ''
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    imageError.value = 'Please upload a JPG, PNG, or WebP image.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    imageError.value = 'Image must be smaller than 2 MB.'
    return
  }

  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
}

const handleImageSelection = (event: Event) => {
  const input = event.currentTarget
  if (!(input instanceof HTMLInputElement)) return

  setImageFile(input.files?.[0])
  input.value = ''
}

const handleImageDrop = (event: DragEvent) => {
  isDraggingImage.value = false
  setImageFile(event.dataTransfer?.files[0])
}

onUnmounted(() => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
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
  brand: productBrandRules,
  categories: productCategoryRules,
  price: productPriceRules,
  stock: productStockRules,
  description: productDescriptionRules,
}

const v$ = useVuelidate(rules, form)

const handleSubmit = async () => {
  if (imageError.value) return

  const isValid = await v$.value.$validate()
  if (!isValid || form.price === null || form.stock === null) return

  isSubmitting.value = true
  submitError.value = ''

  let uploadedImagePath: string | null = null
  let productSaved = false
  try {
    let image = form.image
    if (imageFile.value) {
      uploadedImagePath = await uploadImage(imageFile.value, { bucket: 'products' })
      image = getPublicImageUrl('products', uploadedImagePath)
    }

    const productInput = {
      ...(imageFile.value ? { image } : {}),
      name: form.name.trim(),
      slug: form.slug.trim(),
      subtitle: form.subtitle.trim(),
      brand: form.brand.trim(),
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
    productSaved = true
    await router.push({ name: 'admin-products' })
  } catch (error) {
    if (uploadedImagePath && !productSaved && props.mode === 'create') {
      try {
        await removeImage('products', uploadedImagePath)
      } catch (cleanupError) {
        console.error('Could not remove uploaded product image:', cleanupError)
      }
    }
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
        <div class="">
          <span class="mb-2 block text-sm font-medium text-stone-700">Product image</span>
          <input
            ref="imageInput"
            class="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose a product image"
            @change="handleImageSelection"
          />
          <div
            class="flex min-h-80 items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors"
            :class="
              isDraggingImage
                ? 'border-stone-500 bg-stone-50'
                : 'border-stone-200 hover:border-stone-400'
            "
            @dragover.prevent="isDraggingImage = true"
            @dragleave.prevent="isDraggingImage = false"
            @drop.prevent="handleImageDrop"
          >
            <div class="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
              <img
                v-if="previewImage"
                :src="previewImage"
                alt="Product image preview"
                class="size-24 rounded-lg border border-stone-200 object-cover"
              />
              <div v-else class="flex size-24 items-center justify-center rounded-lg bg-stone-100">
                <span class="text-xs text-stone-500">No image</span>
              </div>
              <div>
                <p class="text-sm text-stone-600">Drag and drop an image here, or</p>
                <Button
                  type="button"
                  variant="link"
                  class="mt-1 h-auto px-0 py-0 text-sm text-stone-900"
                  @click="imageInput?.click()"
                >
                  Choose file
                </Button>
                <p class="mt-1 text-xs text-stone-500">JPG, PNG, or WebP. Maximum size: 2 MB.</p>
              </div>
            </div>
          </div>
          <p v-if="imageError" role="alert" class="mt-1.5 text-sm font-medium text-red-700">
            {{ imageError }}
          </p>
        </div>

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

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-stone-700">
            Brand <span class="text-red-700" aria-hidden="true">*</span>
          </span>
          <input
            v-model.trim="v$.brand.$model"
            placeholder="e.g. Apple"
            :aria-invalid="v$.brand.$error"
            class="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
          />
          <p v-if="v$.brand.$error" role="alert" class="mt-1.5 text-sm font-medium text-red-700">
            {{ v$.brand.$errors[0]?.$message }}
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
              @input="markSlugAsManuallyEdited"
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
      <Button
        type="submit"
        :disabled="isSubmitting || productLoading"
        class="rounded-xl bg-stone-900 px-5 py-2.5 hover:bg-stone-700"
      >
        {{ isSubmitting ? 'Creating...' : mode === 'edit' ? 'Save changes' : 'Create product' }}
      </Button>
    </div>
  </form>
</template>
