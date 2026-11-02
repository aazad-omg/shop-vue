import { defineStore } from 'pinia'
import type { Product } from '@/types'
import { ref } from 'vue'
import { useProducts } from '@/composables/useProducts'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const {
    products: fetchedProducts,
    error: fetchProductsError,
    fetchProducts: fetchProductList,
  } = useProducts({ limit: 20 })

  const getProducts = async () => {
    isLoading.value = true
    error.value = null

    await fetchProductList()

    if (!fetchProductsError.value) {
      products.value = fetchedProducts.value
    }

    error.value = fetchProductsError.value
    isLoading.value = false
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts: getProducts,
  }
})
