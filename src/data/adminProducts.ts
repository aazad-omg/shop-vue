import { PRODUCTS } from './products'
import type { AdminProduct } from '@/types/admin'

const inventory = [
  { sku: 'HM-001', stock: 42, status: 'Active' },
  { sku: 'HM-002', stock: 8, status: 'Active' },
  { sku: 'AC-003', stock: 0, status: 'Out of stock' },
  { sku: 'TE-004', stock: 26, status: 'Active' },
  { sku: 'TR-005', stock: 14, status: 'Active' },
  { sku: 'ST-006', stock: 61, status: 'Active' },
  { sku: 'HM-007', stock: 5, status: 'Draft' },
  { sku: 'TE-008', stock: 19, status: 'Active' },
  { sku: 'KT-009', stock: 33, status: 'Active' },
  { sku: 'HM-010', stock: 12, status: 'Active' },
] as const

export const ADMIN_PRODUCTS: AdminProduct[] = PRODUCTS.map((product, index) => {
  const productInventory = inventory[index]
  if (!productInventory) {
    throw new Error(`Missing sample inventory for product "${product.slug}"`)
  }

  return { ...product, ...productInventory }
})
