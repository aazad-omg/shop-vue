<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const displayName = computed(() => {
  const metadata = user.value?.user_metadata
  const fullName = metadata?.full_name
  const name = metadata?.name

  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  if (typeof name === 'string' && name.trim()) return name.trim()
  return 'ShopVue customer'
})

const initials = computed(
  () =>
    displayName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase() || '?',
)

const memberSince = computed(() => {
  const createdAt = user.value?.created_at
  if (!createdAt) return 'Not available'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Not available'

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date)
})
</script>

<template>
  <main class="min-h-screen bg-amber-50 px-4 py-8 sm:px-8 sm:py-12">
    <Card class="w-full max-w-4xl border-stone-200/80 bg-white px-5 shadow-sm sm:px-8">
      <header class="border-b border-stone-200 py-0">
        <p class="text-xs font-bold tracking-[0.18em] text-amber-800 uppercase">Your account</p>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">Profile</h1>
        <p class="mt-2 text-stone-600">View your account details.</p>
      </header>

      <section aria-label="Profile details">
        <div class="flex items-center gap-4 border-b border-stone-200">
          <div
            aria-hidden="true"
            class="px-4 py-2 items-center justify-center rounded-full bg-brand text-xl font-bold text-white"
          >
            {{ initials }}
          </div>
          <div class="min-w-0">
            <h2 class="wrap-break-word text-xl font-bold text-stone-900 sm:text-2xl">
              {{ displayName }}
            </h2>
            <p class="mt-1 break-all text-sm text-stone-600">
              {{ user?.email || 'No email address available' }}
            </p>
          </div>
        </div>

        <dl class="grid gap-x-8 sm:grid-cols-2">
          <div class="border-b border-stone-200 py-4">
            <dt class="text-sm font-medium text-stone-500">Email address</dt>
            <dd class="mt-1 break-all font-semibold text-stone-900">
              {{ user?.email || 'Not available' }}
            </dd>
          </div>
          <div class="border-b border-stone-200 py-4">
            <dt class="text-sm font-medium text-stone-500">Phone number</dt>
            <dd class="mt-1 font-semibold text-stone-900">
              {{ user?.phone || 'Not provided' }}
            </dd>
          </div>
          <div class="border-b border-stone-200 py-4">
            <dt class="text-sm font-medium text-stone-500">Member since</dt>
            <dd class="mt-1 font-semibold text-stone-900">{{ memberSince }}</dd>
          </div>
          <div class="border-b border-stone-200 py-4">
            <dt class="text-sm font-medium text-stone-500">Email status</dt>
            <dd class="mt-1 font-semibold text-stone-900">
              {{ user?.email_confirmed_at ? 'Verified' : 'Not verified' }}
            </dd>
          </div>
        </dl>
      </section>
    </Card>
  </main>
</template>
