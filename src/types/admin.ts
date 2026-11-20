import type { Product } from './product'

export type AdminProduct = Product & {
  sku: string
  stock: number
  status: 'Active' | 'Draft' | 'Out of stock'
}
