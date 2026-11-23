import { fetchCategories as fetchCategoriesFromService } from '@/services'
import type { Category } from '@/types/product'
import { onScopeDispose, ref } from 'vue'

type CategoryOption = Pick<Category, 'name' | 'slug'> & { id?: string }

export function useCategories() {
  const categories = ref<CategoryOption[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)
  let activeController: AbortController | null = null

  const cancelFetch = () => {
    activeController?.abort()
    activeController = null
    isLoading.value = false
  }

  const fetchCategories = async () => {
    cancelFetch()
    const controller = new AbortController()
    activeController = controller
    isLoading.value = true
    isLoaded.value = false
    error.value = null

    try {
      const categoryList = await fetchCategoriesFromService(controller.signal)

      if (activeController === controller) {
        const uniqueCategories = new Map<string, Category>()
        for (const category of categoryList) {
          if (category.name !== 'All goods') {
            uniqueCategories.set(category.id, category)
          }
        }
        categories.value = [{ name: 'All goods', slug: '' }, ...uniqueCategories.values()]
        isLoaded.value = true
      }
    } catch (err) {
      if (activeController === controller && !controller.signal.aborted) {
        console.error('Error fetching categories:', err)
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
          error.value = 'Failed to load categories'
        }
      }
    } finally {
      if (activeController === controller) {
        activeController = null
        isLoading.value = false
      }
    }
  }

  onScopeDispose(cancelFetch)

  return {
    categories,
    isLoading,
    isLoaded,
    error,
    fetchCategories,
    cancelFetch,
  }
}
