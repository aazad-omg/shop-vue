import { defineStore } from 'pinia'
import { useProducts } from '@/composables'

export const useProductStore = defineStore('products', () => useProducts({ limit: 20 }))
