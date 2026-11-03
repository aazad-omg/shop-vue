import { supabase } from '@/supabase'
import type { Product } from '@/types'
import { onScopeDispose, ref, type MaybeRefOrGetter, toValue } from 'vue'

// Handle composable parameters
type ProductOptions = {
  searchTerm?: string
  category?: string
  limit?: number
  //   use categoryId later if the project scales
  // categoryId?: number
}

export const useProducts = (options: MaybeRefOrGetter<ProductOptions> = {}) => {
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let activeController: AbortController | null = null
  let requestId = 0

  const cancelFetch = () => {
    requestId += 1
    activeController?.abort()
    activeController = null
    isLoading.value = false
    error.value = null
  }

  const fetchProducts = async () => {
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    const currentRequestId = ++requestId
    isLoading.value = true
    error.value = null

    try {
      const refOptions = toValue(options)

      let query = supabase.from('products').select('*')
      const searchTerm = refOptions.searchTerm?.trim()

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }
      if (refOptions.category) {
        query = query.contains('categories', [refOptions.category])
      }

      if (refOptions.limit !== undefined) {
        query = query.limit(refOptions.limit)
      }

      const response = await query.order('name', { ascending: true })

      if (response.error) throw response.error

      if (currentRequestId === requestId) {
        // @ts-expect-error: TypeScript is not able to infer the type of response.data correctly
        products.value = response.data ?? []
      }
    } catch (err) {
      if (currentRequestId === requestId && !controller.signal.aborted) {
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
      if (currentRequestId === requestId) {
        activeController = null
        isLoading.value = false
      }
    }
  }

  const fetchProductById = async (id: string): Promise<Product | null> => {
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    const currentRequestId = ++requestId
    isLoading.value = true
    error.value = null

    try {
      const response = await supabase.from('products').select('*').eq('id', id).maybeSingle()

      if (response.error) throw response.error

      return currentRequestId === requestId ? response.data : null
    } catch (err) {
      console.error('Error fetching product:', err)
      if (currentRequestId === requestId && !controller.signal.aborted) {
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
      if (currentRequestId === requestId) {
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
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    cancelFetch,
  }
}
