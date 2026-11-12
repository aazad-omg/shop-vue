import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import type { Product } from '@/types'
import { ref } from 'vue'
import { useProducts } from '@/composables'
import { toast } from 'vue-sonner'

const PAGE_SIZE = 12

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)

  const {
    products: fetchedProducts,
    error: fetchProductsError,
    fetchProducts: fetchProductList,
  } = useProducts({ limit: 20 })

  const getProducts = async () => {
    isLoading.value = true
    error.value = null
    hasMore.value = true

    await fetchProductList()

    if (!fetchProductsError.value) {
      products.value = fetchedProducts.value
    }

    error.value = fetchProductsError.value
    isLoading.value = false
  }

  const loadMoreProducts = async () => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true

    try {
      const from = products.value.length
      const to = from + PAGE_SIZE - 1

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })
        .range(from, to)

      if (fetchError) throw fetchError
      products.value.push(...data)

      // set hasMore false if fetched products is less than 12
      hasMore.value = data.length === PAGE_SIZE
    } catch (loadMoreError: unknown) {
      error.value =
        loadMoreError instanceof Error ? loadMoreError.message : 'Failed to load products'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    isLoading,
    error,
    hasMore,
    fetchProducts: getProducts,
    loadMoreProducts,
  }
})
