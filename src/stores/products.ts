import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import type { Product } from '@/types'
import { computed, ref } from 'vue'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

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

  return { products, isLoading, error, fetchProducts }
})
