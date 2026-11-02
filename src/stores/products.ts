import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import type { Product } from '@/types'
import { ref } from 'vue'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const categoryProducts = ref<Product[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  let categoryRequestId = 0
  let categoryRequestController: AbortController | null = null

  const fetchProducts = async () => {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('id, image, name, slug, subtitle, categories, price, description')
        .order('name')

      if (queryError) throw queryError

      products.value = data ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load products'
    } finally {
      isLoading.value = false
    }
  }

  const fetchProductsByCategory = async (category: string) => {
    categoryRequestController?.abort()
    const controller = new AbortController()
    categoryRequestController = controller
    const requestId = ++categoryRequestId
    isLoading.value = true
    error.value = null
    try {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('id, image, name, slug, subtitle, categories, price, description')
        .contains('categories', [category])
        .order('name')
        .abortSignal(controller.signal)

      if (queryError) throw queryError

      if (requestId === categoryRequestId) categoryProducts.value = data ?? []
    } catch (err) {
      if (requestId === categoryRequestId && !controller.signal.aborted) {
        error.value = err instanceof Error ? err.message : 'Failed to load products'
      }
    } finally {
      if (requestId === categoryRequestId) {
        isLoading.value = false
        categoryRequestController = null
      }
    }
  }

  return { products, categoryProducts, isLoading, error, fetchProducts, fetchProductsByCategory }
})
