// For the cart store structure we discussed, the main pieces would be:

import type { Product } from '@/types'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

type CartItem = {
  product: Product
  quantity: number
}

// The store would make these available to any component that calls useCartStore().
export const useCartStore = defineStore('cart', () => {
  // items: the cart’s state, containing each product and its quantity.
  // add items in cart to localStorage to persist across browser refresh
  const items = useStorage<CartItem[]>('cart-items', [])
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
    if (quantity <= 0) return

    const existingItem = items.value.find((item) => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
      toast.success('Quantity increased', {
        description: `${product.name} is added to cart`,
      })
      return
    }

    items.value.push({ product, quantity })

    toast.success('Added to cart', {
      description: product.name,
    })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      toast.success('Item removed from cart')
      return
    }

    const item = items.value.find((cartItem) => cartItem.product.id === productId)
    if (!item) return

    const previousQuantity = item.quantity
    item.quantity = quantity

    const toastMessage =
      quantity > previousQuantity
        ? `Quantity increased to ${quantity}`
        : quantity < previousQuantity
          ? `Quantity decreased to ${quantity}`
          : 'Quantity updated'

    toast.success(toastMessage, {
      description: item.product.name,
    })
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
