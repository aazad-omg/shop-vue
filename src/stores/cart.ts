// For the cart store structure we discussed, the main pieces would be:

import type { Product } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type CartItem = {
  product: Product
  quantity: number
}

// The store would make these available to any component that calls useCartStore().
export const useCartStore = defineStore('cart', () => {
  // items: the cart’s state, containing each product and its quantity.
  const items = ref<CartItem[]>([])
  const isDrawerOpen = ref(false)

  // itemCount: a getter that totals the quantities across all cart lines,
  //            for a navbar badge.
  // const itemCount = computed(() => items.value.reduce((total, item) => total + item.quantity, 0))

  // Use only the number of different items
  const itemCount = computed(() => items.value.length)

  // subtotal: a getter that adds up each product’s price multiplied by its
  //           quantity.
  const subTotal = computed(() =>
    items.value.reduce((total, item) => total + item.product.price * item.quantity, 0),
  )

  // addToCart: an action that adds a product, or increases its quantity
  //            if it’s already in the cart.

  const addToCart = (product: Product, quantity = 1) => {
    //   Check if the product already exists in the cart
    const existing = items.value.find((item) => item.product.id === product.id)
    //   If exists add its quantity
    if (existing) existing.quantity += quantity
    //   else add the new product to cart
    else items.value.push({ product, quantity })
  }

  // Find matching cart item and updates quantity
  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find((cartItem) => cartItem.product.id === productId)
    if (item && quantity >= 1) item.quantity = quantity
  }

  const removeFromCart = (productId: number) => {
    items.value = items.value.filter((item) => item.product.id !== productId)
  }

  const openDrawer = () => {
    isDrawerOpen.value = true
  }

  const closeDrawer = () => {
    isDrawerOpen.value = false
  }

  return {
    items,
    itemCount,
    subTotal,
    isDrawerOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    openDrawer,
    closeDrawer,
  }
})
