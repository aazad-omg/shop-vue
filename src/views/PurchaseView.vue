<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { email as emailValidator, required } from '@vuelidate/validators'
import { Card, FullPageSpinner } from '@/components'
import { useImageFallback } from '@/composables'
import { useCartStore } from '@/stores'
import { Progress } from '@/components'
import { ArrowLeft, NepaliRupee, ShoppingCart, Trash2 } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

const cart = useCartStore()

const { fallbackImage, handleImageError } = useImageFallback()
const isLoading = ref(true)
const orderPlaced = ref(false)
const trackingStep = ref(0)
const checkoutNotice = ref('')
const fullName = ref('')
const email = ref('')
const address = ref('')
const trackingSteps = [{ title: 'Checkout' }, { title: 'Processing' }, { title: 'Delivered' }]
let loadingTimeout: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  loadingTimeout = setTimeout(() => {
    isLoading.value = false
  }, 2000)
})

const cleanupTimers = () => {
  if (loadingTimeout) clearTimeout(loadingTimeout)
}

onUnmounted(cleanupTimers)

const rules = computed(() => ({
  fullName: { required },
  email: { required, email: emailValidator },
  address: { required },
}))

const v$ = useVuelidate(rules, { fullName, email, address })

const submitOrder = async () => {
  const isValid = await v$.value.$validate()

  if (!isValid) return

  cleanupTimers()
  isLoading.value = true
  loadingTimeout = setTimeout(() => {
    isLoading.value = false
    cart.clearCart()
    orderPlaced.value = true
    trackingStep.value = 1
    toast.success('Your order has been placed', {})
  }, 2000)
}
</script>

<template>
  <FullPageSpinner :loading="isLoading" />

  <main class="min-h-screen bg-amber-50 px-4 py-8 sm:px-8 sm:py-12">
    <div class="mx-auto max-w-6xl">
      <RouterLink
        to="/"
        class="inline-flex justify-start items-center gap-3 p-2 rounded-full border border-amber-200 bg-white px-5 text-base font-bold text-stone-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50 hover:text-brand hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:text-lg"
      >
        <ArrowLeft :size="20" aria-hidden="true" />
        Continue shopping
      </RouterLink>

      <header class="mt-7 border-b border-stone-200 pb-7 sm:mt-9 sm:pb-9">
        <p class="text-xs font-bold tracking-[0.18em] text-amber-800 uppercase">Order details</p>
        <div class="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">Checkout</h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
              Just a few details before your order is ready.
            </p>
          </div>
        </div>
      </header>

      <div v-if="orderPlaced || cart.items.length > 0" class="mx-auto mt-7 max-w-3xl px-3 pt-3">
        <div class="relative">
          <Progress
            :model-value="(trackingStep / (trackingSteps.length - 1)) * 100"
            :aria-label="`Order progress: ${trackingSteps[trackingStep]?.title}`"
            class="bg-stone-200 [&_[data-slot=progress-indicator]]:bg-brand [&_[data-slot=progress-indicator]]:duration-700"
          />
          <span
            v-for="(step, index) in trackingSteps"
            :key="step.title"
            aria-hidden="true"
            class="absolute top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold transition-colors"
            :class="index <= trackingStep ? 'bg-brand text-white' : 'bg-stone-200 text-stone-500'"
            :style="{ left: `${(index / (trackingSteps.length - 1)) * 100}%` }"
          >
            {{ index + 1 }}
          </span>
        </div>
        <ol class="mt-4 flex justify-between" aria-label="Order progress steps">
          <li
            v-for="(step, index) in trackingSteps"
            :key="step.title"
            class="w-1/3 text-center text-xs font-semibold sm:text-sm"
            :class="index <= trackingStep ? 'text-brand' : 'text-stone-500'"
            :aria-current="index === trackingStep ? 'step' : undefined"
          >
            {{ step.title }}
          </li>
        </ol>
      </div>

      <div
        v-if="!orderPlaced && cart.items.length === 0"
        class="mx-auto mt-10 max-w-xl rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10"
      >
        <div
          class="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100 text-brand"
        >
          <ShoppingCart :size="24" aria-hidden="true" />
        </div>
        <h2 class="mt-5 text-xl font-bold text-stone-900">Your cart is empty</h2>
        <p class="mt-2 text-sm leading-6 text-stone-600">
          Find something you love, then come back here to complete your order.
        </p>
        <RouterLink
          to="/"
          class="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Explore products
        </RouterLink>
      </div>

      <section
        v-else-if="orderPlaced"
        aria-labelledby="tracking-title"
        class="mx-auto mt-10 max-w-3xl rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-9"
      >
        <p class="text-xs font-bold tracking-[0.16em] text-amber-800 uppercase">
          Demo order tracking
        </p>
        <h2
          id="tracking-title"
          class="mt-2 text-2xl font-extrabold tracking-tight text-brand sm:text-3xl"
        >
          Track your order
        </h2>
        <p class="mt-2 text-sm leading-6 text-stone-600">
          Thanks, {{ fullName }}. Follow your order as it moves through each delivery stage.
        </p>

        <RouterLink
          to="/"
          class="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Continue shopping
        </RouterLink>
      </section>

      <div v-else class="mt-7 grid items-start gap-6 lg:mt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <Card class="gap-0 rounded-2xl border-stone-200/80 bg-white p-0 shadow-sm">
          <form novalidate class="p-5 sm:p-8" @submit.prevent="submitOrder">
            <div class="flex items-center gap-3">
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-900"
                aria-hidden="true"
                >1</span
              >
              <div>
                <h2 class="text-lg font-bold text-stone-900 sm:text-xl">Delivery information</h2>
                <p class="mt-0.5 text-sm text-stone-500">Where should we send your order?</p>
              </div>
            </div>
            <div class="mt-7 grid gap-5">
              <label class="grid gap-2 text-sm font-semibold text-stone-700" for="full-name">
                Full name
                <input
                  id="full-name"
                  name="full-name"
                  autocomplete="name"
                  v-model.trim="fullName"
                  placeholder="e.g. Alex Morgan"
                  :aria-invalid="v$.fullName.$error"
                  @blur="v$.fullName.$touch()"
                  class="h-12 rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 text-base font-normal text-stone-900 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
                <span class="min-h-5 text-sm font-medium text-destructive" role="alert">
                  {{ v$.fullName.$error ? v$.fullName.$errors[0]?.$message : '' }}
                </span>
              </label>
              <label class="grid gap-2 text-sm font-semibold text-stone-700" for="email">
                Email address
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  v-model.trim="email"
                  placeholder="you@example.com"
                  :aria-invalid="v$.email.$error"
                  @blur="v$.email.$touch()"
                  class="h-12 rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 text-base font-normal text-stone-900 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
                <span class="min-h-5 text-sm font-medium text-destructive" role="alert">
                  {{ v$.email.$error ? v$.email.$errors[0]?.$message : '' }}
                </span>
              </label>
              <label class="grid gap-2 text-sm font-semibold text-stone-700" for="address">
                Delivery address
                <textarea
                  id="address"
                  name="address"
                  autocomplete="street-address"
                  v-model.trim="address"
                  rows="3"
                  placeholder="Street, city, and any helpful delivery details"
                  :aria-invalid="v$.address.$error"
                  @blur="v$.address.$touch()"
                  class="resize-y rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-base font-normal text-stone-900 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
                <span class="min-h-5 text-sm font-medium text-destructive" role="alert">
                  {{ v$.address.$error ? v$.address.$errors[0]?.$message : '' }}
                </span>
              </label>
              <label
                class="grid gap-2 text-sm font-semibold text-stone-700"
                for="delivery-instructions"
              >
                <span class="flex items-center gap-1">
                  Delivery instructions
                  <span class="font-normal text-stone-500">(optional)</span>
                </span>
                <textarea
                  id="delivery-instructions"
                  name="delivery-instructions"
                  rows="3"
                  placeholder="e.g. Leave the package at the front desk"
                  class="resize-y rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-base font-normal text-stone-900 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </label>
            </div>
            <button
              type="submit"
              class="mt-7 min-h-12 w-full rounded-lg bg-brand px-5 text-sm font-bold tracking-wide text-white shadow-sm transition duration-200 hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Continue with order
            </button>
            <p
              v-if="checkoutNotice"
              role="status"
              class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950"
            >
              {{ checkoutNotice }}
            </p>
          </form>
        </Card>

        <section class="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
          <div class="border-b border-stone-200 bg-stone-50/80 px-5 py-5 sm:px-7">
            <p class="text-xs font-bold tracking-[0.16em] text-amber-800 uppercase">
              Order summary
            </p>
            <h2 class="mt-1 text-lg font-bold text-stone-900 sm:text-xl">Your items</h2>
          </div>
          <div class="p-5 sm:p-7">
            <ul class="divide-y divide-stone-100">
              <li
                v-for="item in cart.items"
                :key="item.product.id"
                class="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
              >
                <img
                  :src="item.product.image || fallbackImage"
                  :alt="item.product.name"
                  class="size-[4.5rem] shrink-0 rounded-xl bg-stone-100 object-cover ring-1 ring-stone-900/5"
                  @error="handleImageError"
                />
                <div class="flex min-w-0 flex-1 flex-col justify-center">
                  <p class="font-semibold leading-5 text-stone-900">{{ item.product.name }}</p>
                  <p class="mt-1 text-xs text-stone-500">
                    {{ item.quantity }} ×
                    <span class="inline-flex items-center"
                      ><NepaliRupee :size="12" :stroke-width="2.5" />{{
                        item.product.price.toFixed(2)
                      }}</span
                    >
                  </p>
                  <p class="mt-1.5 flex items-center text-sm font-bold text-stone-900">
                    <NepaliRupee :size="14" :stroke-width="2.5" />
                    {{ (item.product.price * item.quantity).toFixed(2) }}
                  </p>
                </div>
                <button
                  type="button"
                  :aria-label="`Remove ${item.product.name} from order`"
                  class="inline-flex size-9 shrink-0 self-center items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  @click="cart.removeFromCart(item.product.id)"
                >
                  <Trash2 class="size-4" aria-hidden="true" />
                </button>
              </li>
            </ul>

            <div class="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
              <div class="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span class="flex items-center font-medium text-stone-900">
                  <NepaliRupee :size="14" :stroke-width="2.5" />
                  {{ cart.subTotal.toFixed(2) }}
                </span>
              </div>
              <div class="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span class="font-medium text-emerald-700">Free</span>
              </div>
              <div
                class="mt-4 flex justify-between rounded-xl bg-amber-50 px-4 py-4 text-base font-bold text-stone-900"
              >
                <span>Total</span>
                <span class="flex items-center">
                  <NepaliRupee :size="17" :stroke-width="2.5" />
                  {{ cart.subTotal.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
