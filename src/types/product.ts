export type FetchProductsOptions = {
  searchTerm?: string
  excludeId?: number
  from: number
  to: number
  signal: AbortSignal
}

export type FetchProductsByCategoriesOptions = FetchProductsOptions & {
  categoryId: string
}

export type Product = {
  id: number
  image: string
  name: string
  slug: string
  subtitle: string
  categories: string[]
  price: number
  description: string
  stock?: number
  is_active?: boolean
}

export type CreateProductInput = {
  name: string
  slug: string
  subtitle: string
  categories: string[]
  price: number
  stock: number
  is_active: boolean
  description: string
}

export type UpdateProductInput = CreateProductInput & {
  id: string
}

export type Category = {
  id: string
  name: string
  slug: string
}
