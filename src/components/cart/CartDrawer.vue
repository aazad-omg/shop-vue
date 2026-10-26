<script setup lang="ts">
import { NepaliRupee, Minus, Plus, Trash2, XIcon } from '@lucide/vue'
import { useCartStore } from '@/stores'
import { RouterLink } from 'vue-router'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

const props = defineProps<{
  topOffset: number
}>()

const cart = useCartStore()

const handleOpenChange = (open: boolean) => {
  if (open) cart.openDrawer()
  else cart.closeDrawer()
}

const handleInteractOutside = (event: Event) => {
  const target = event.target
  if (target instanceof HTMLElement && target.closest('[data-sonner-toaster]')) {
    event.preventDefault()
  }
}
</script>

<template>
  <Dialog :open="cart.isDrawerOpen" @update:open="handleOpenChange">
    <!-- Provide dynamic top-offset to drawer based on navbar height -->
    <DialogContent
      :show-close-button="false"
      @interact-outside="handleInteractOutside"
      :style="{ '--cart-top-offset': `${props.topOffset}px` }"
      class="top-(--cart-top-offset)! h-[calc(100dvh_-_var(--cart-top-offset))]! max-h-[calc(100dvh_-_var(--cart-top-offset))]! right-0! left-auto! w-full! max-w-md! translate-x-0! translate-y-0! gap-0! rounded-none! border-0! p-0! flex flex-col bg-white shadow-2xl data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
    >
      <DialogDescription class="sr-only">
        Review items in your cart, update quantities, or continue to checkout.
      </DialogDescription>
      <header class="flex items-center justify-between border-0 border-stone-200 px-5 py-4">
        <div>
          <DialogTitle class="text-xl font-bold text-stone-900"> Your cart </DialogTitle>
          <p class="mt-0.5 text-sm text-stone-500">
            {{ cart.itemCount }} {{ cart.itemCount === 1 ? 'item' : 'items' }}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close cart"
          class="inline-flex size-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          @click="cart.closeDrawer"
        >
          <XIcon class="size-5" />
        </button>
      </header>

      <div
        v-if="cart.items.length === 0"
        class="flex flex-1 flex-col items-center justify-center px-6 text-center"
      >
        <p class="text-lg font-semibold text-stone-900">Your cart is empty</p>
        <p class="mt-1 text-sm text-stone-500">Find something you love and add it here.</p>
        <RouterLink
          to="/"
          class="mt-5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
          @click="cart.closeDrawer"
        >
          Continue shopping
        </RouterLink>
      </div>

      <ul v-else class="flex-1 divide-y divide-stone-200 overflow-y-auto px-5">
        <li v-for="item in cart.items" :key="item.product.id" class="flex gap-4 py-5">
          <img
            :src="item.product.image"
            :alt="item.product.name"
            class="size-20 shrink-0 rounded-md object-cover"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-stone-900">{{ item.product.name }}</p>
                <p class="mt-1 line-clamp-2 text-sm text-stone-500">
                  {{ item.product.subtitle }}
                </p>
              </div>
              <button
                type="button"
                :aria-label="`Remove ${item.product.name} from cart`"
                class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                @click="cart.removeFromCart(item.product.id)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <div class="inline-flex h-8 items-center rounded-md border border-stone-300">
                <button
                  type="button"
                  :aria-label="`Decrease ${item.product.name} quantity`"
                  :disabled="item.quantity <= 1"
                  class="inline-flex size-8 items-center justify-center text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
                  @click="cart.updateQuantity(item.product.id, item.quantity - 1)"
                >
                  <Minus class="size-3.5" />
                </button>
                <span class="min-w-8 text-center text-sm font-medium" aria-live="polite">
                  {{ item.quantity }}
                </span>
                <button
                  type="button"
                  :aria-label="`Increase ${item.product.name} quantity`"
                  class="inline-flex size-8 items-center justify-center text-stone-700 hover:bg-stone-100"
                  @click="cart.updateQuantity(item.product.id, item.quantity + 1)"
                >
                  <Plus class="size-3.5" />
                </button>
              </div>
              <p class="flex items-center font-semibold text-stone-900">
                <NepaliRupee :size="15" :stroke-width="2.5" />
                {{ (item.product.price * item.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </li>
      </ul>

      <footer v-if="cart.items.length > 0" class="border-t border-stone-200 px-5 py-5">
        <div class="flex items-center justify-between text-base font-semibold text-stone-900">
          <span>Subtotal</span>
          <span class="flex items-center">
            <NepaliRupee :size="17" :stroke-width="2.5" />
            {{ cart.subTotal.toFixed(2) }}
          </span>
        </div>
        <p class="mt-1 text-sm text-stone-500">Shipping and taxes calculated at checkout.</p>
        <RouterLink
          to="/cart"
          class="mt-4 flex min-h-11 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
          @click="cart.closeDrawer"
          >Proceed to checkout
        </RouterLink>
        <button
          type="button"
          class="mt-3 w-full py-1 text-sm font-medium text-stone-600 hover:text-stone-900"
          @click="cart.closeDrawer"
        >
          Continue shopping
        </button>
      </footer>
    </DialogContent>
  </Dialog>
</template>
