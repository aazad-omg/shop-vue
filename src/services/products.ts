import { supabase } from '@/supabase'
import type {
  Category,
  CreateProductInput,
  FetchProductsByCategoriesOptions,
  FetchProductsOptions,
  Product,
  UpdateProductInput,
} from '@/types/product'

type ProductWithCategories = Omit<Product, 'categories'> & {
  product_categories: Array<{ categories: Pick<Category, 'name'> | null }> | null
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const response = await query

  if (response.error) throw response.error

  return (response.data as Category[] | null) ?? []
}

export async function createCategory(name: string, slug: string): Promise<Category> {
  const response = await supabase
    .from('categories')
    .insert({ name, slug })
    .select('id, name, slug')
    .single()

  if (response.error) throw response.error

  return response.data as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await supabase.from('categories').delete().eq('id', id)

  if (response.error) throw response.error
}

export async function createProduct(product: CreateProductInput): Promise<void> {
  const { categories, ...productData } = product
  const response = await supabase.from('products').insert(productData).select('id').single()

  if (response.error) throw response.error

  const createdProduct = response.data as { id: number }
  const categoryLinks = categories.map((categoryId) => ({
    product_id: createdProduct.id,
    category_id: categoryId,
  }))

  if (categoryLinks.length) {
    const categoriesResponse = await supabase.from('product_categories').insert(categoryLinks)
    if (categoriesResponse.error) {
      await supabase.from('products').delete().eq('id', createdProduct.id)
      throw categoriesResponse.error
    }
  }
}

export async function updateProduct(product: UpdateProductInput): Promise<void> {
  const { id, categories, ...productData } = product
  const response = await supabase.from('products').update(productData).eq('id', id)

  if (response.error) throw response.error

  const deleteResponse = await supabase.from('product_categories').delete().eq('product_id', id)

  if (deleteResponse.error) throw deleteResponse.error

  if (categories.length) {
    const categoryLinks = categories.map((categoryId) => ({
      product_id: id,
      category_id: categoryId,
    }))
    const categoriesResponse = await supabase.from('product_categories').insert(categoryLinks)

    if (categoriesResponse.error) throw categoriesResponse.error
  }
}

async function fetchProductPage(
  { searchTerm, excludeId, from, to, signal }: FetchProductsOptions,
  categoryId?: string,
): Promise<{ products: Product[]; totalCount: number }> {
  let query = supabase.from('products').select(
    categoryId !== undefined
      ? `*,
        product_categories!inner (
          category_id,
          categories (name)
        )`
      : '*, product_categories(categories(name))',
    { count: 'exact' },
  )
  const normalizedSearchTerm = searchTerm?.trim()

  if (normalizedSearchTerm) {
    query = query.ilike('name', `%${normalizedSearchTerm}%`)
  }
  if (categoryId !== undefined) {
    query = query.eq('product_categories.category_id', categoryId)
  }
  if (excludeId !== undefined) {
    query = query.neq('id', excludeId)
  }

  const response = await query
    .order('name', { ascending: true })
    .order('id', { ascending: true })
    .range(from, to)
    .abortSignal(signal)

  if (response.error) throw response.error
  if (response.count === null) {
    throw new Error('Could not determine the total number of products')
  }

  const products = ((response.data ?? []) as ProductWithCategories[]).map(
    ({ product_categories, ...product }) => ({
      ...product,
      categories:
        product_categories?.flatMap(({ categories }) => (categories ? [categories.name] : [])) ??
        [],
    }),
  )

  return {
    products,
    totalCount: response.count,
  }
}

export function fetchProducts(options: FetchProductsOptions) {
  return fetchProductPage(options)
}

export function fetchProductsByCategories({
  categoryId,
  ...options
}: FetchProductsByCategoriesOptions) {
  return fetchProductPage(options, categoryId)
}

export async function fetchProductById(id: string, signal: AbortSignal): Promise<Product | null> {
  const response = await supabase
    .from('products')
    .select('*, product_categories(categories(name))')
    .eq('id', id)
    .abortSignal(signal)
    .maybeSingle()

  if (response.error) throw response.error
  if (!response.data) return null

  const { product_categories, ...product } = response.data as ProductWithCategories & {
    product_categories: Array<{ categories: Pick<Category, 'name'> | null }> | null
  }

  return {
    ...product,
    categories:
      product_categories?.flatMap(({ categories }) => (categories ? [categories.name] : [])) ?? [],
  }
}
