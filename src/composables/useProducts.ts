import { supabase } from '@/supabase'
import type { Product } from '@/types'
import { onScopeDispose, ref, type MaybeRefOrGetter, toValue } from 'vue'

// Handle composable parameters
type ProductOptions = {
  searchTerm?: string
  category?: string
  limit?: number
  excludeId?: number
  //   use categoryId later if the project scales
  // categoryId?: number
}

export const useProducts = (options: MaybeRefOrGetter<ProductOptions> = {}) => {
  const products = ref<Product[]>([])
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

  const fetchPage = async (append: boolean) => {
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    const refOptions = toValue(options)
    const pageSize = refOptions.limit ?? 20
    const from = append ? products.value.length : 0
    const to = from + pageSize - 1

    isLoading.value = true
    error.value = null
    if (!append) {
      products.value = []
      hasMore.value = true
    }

    try {
      let query = supabase.from('products').select('*')
      const searchTerm = refOptions.searchTerm?.trim()

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }
      if (refOptions.category) {
        query = query.contains('categories', [refOptions.category])
      }
      if (refOptions.excludeId !== undefined) {
        query = query.neq('id', refOptions.excludeId)
      }

      const response = await query
        .order('name', { ascending: true })
        .order('id', { ascending: true })
        .range(from, to)
        .abortSignal(controller.signal)

      if (response.error) throw response.error

      if (activeController === controller) {
        const page = response.data ?? []
        products.value = append ? [...products.value, ...page] : page
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

  const fetchProducts = () => fetchPage(false)

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
      const response = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .abortSignal(controller.signal)
        .maybeSingle()

      if (response.error) throw response.error

      return activeController === controller ? response.data : null
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
    isLoading,
    error,
    hasMore,
    fetchProducts,
    loadMoreProducts,
    fetchProductById,
    cancelFetch,
  }
}
