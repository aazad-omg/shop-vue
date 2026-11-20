import {
  fetchProductById as fetchProductByIdFromService,
  fetchProducts as fetchProductsFromService,
  fetchProductsByCategories as fetchProductsByCategoriesFromService,
} from '@/services'
import type { Product } from '@/types'
import { onScopeDispose, ref, type MaybeRefOrGetter, toValue } from 'vue'

// Handle composable parameters
type ProductOptions = {
  searchTerm?: string
  categoryId?: string
  limit?: number
  excludeId?: number
}

export const useProducts = (options: MaybeRefOrGetter<ProductOptions> = {}) => {
  const products = ref<Product[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  let activeController: AbortController | null = null

  const cancelFetch = () => {
    activeController?.abort()
    activeController = null
    isLoading.value = false
    error.value = null
  }

  const fetchPage = async (append: boolean, page = 1) => {
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    const refOptions = toValue(options)
    const pageSize = refOptions.limit ?? 20
    const from = append ? products.value.length : (page - 1) * pageSize
    const to = from + pageSize - 1

    isLoading.value = true
    error.value = null
    if (!append) {
      products.value = []
      hasMore.value = true
    }

    try {
      const request = {
        searchTerm: refOptions.searchTerm,
        excludeId: refOptions.excludeId,
        from,
        to,
        signal: controller.signal,
      }
      const response =
        refOptions.categoryId !== undefined
          ? await fetchProductsByCategoriesFromService({
              ...request,
              categoryId: refOptions.categoryId,
            })
          : await fetchProductsFromService(request)

      if (activeController === controller) {
        const page = response.products
        products.value = append ? [...products.value, ...page] : page
        totalCount.value = response.totalCount
        hasMore.value = page.length === pageSize
      }
    } catch (err) {
      if (activeController === controller && !controller.signal.aborted) {
        console.error('Error fetching products:', err)
        if (err instanceof Error) {
          error.value = err.message
        } else if (
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof err.message === 'string'
        ) {
          error.value = err.message
        } else {
          error.value = 'Failed to load products'
        }
      }
    } finally {
      if (activeController === controller) {
        activeController = null
        isLoading.value = false
      }
    }
  }

  const fetchProducts = (page = 1) => fetchPage(false, page)

  const loadMoreProducts = () => {
    if (isLoading.value || !hasMore.value) return Promise.resolve()
    return fetchPage(true)
  }

  const fetchProductById = async (id: string): Promise<Product | null> => {
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    isLoading.value = true
    error.value = null

    try {
      const product = await fetchProductByIdFromService(id, controller.signal)

      return activeController === controller ? product : null
    } catch (err) {
      if (activeController === controller && !controller.signal.aborted) {
        console.error('Error fetching product:', err)
        if (err instanceof Error) {
          error.value = err.message
        } else if (
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof err.message === 'string'
        ) {
          error.value = err.message
        } else {
          error.value = 'Failed to load product'
        }
      }

      return null
    } finally {
      if (activeController === controller) {
        activeController = null
        isLoading.value = false
      }
    }
  }

  // Automatically cancels an in-flight Supabase request
  // when the component using useProducts() is disposed,
  // preventing a request from outliving its UI.
  onScopeDispose(cancelFetch)

  return {
    products,
    totalCount,
    isLoading,
    error,
    hasMore,
    fetchProducts,
    loadMoreProducts,
    fetchProductById,
    cancelFetch,
  }
}
