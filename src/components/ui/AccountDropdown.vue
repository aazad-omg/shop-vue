<script setup lang="ts">
import { LogOut } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore, useCartStore, useUiStore } from '@/stores'
import { toast } from 'vue-sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

const router = useRouter()
const authStore = useAuthStore()
const cart = useCartStore()
const uiStore = useUiStore()

const userName = computed(
  () =>
    authStore.user?.user_metadata?.full_name ??
    authStore.user?.user_metadata?.name ??
    authStore.user?.email ??
    'profile',
)

const userInitial = computed(
  () => String(userName.value).trim().charAt(0).toLocaleUpperCase() || '?',
)

const handleLogout = async () => {
  uiStore.isFullPageLoading = true

  try {
    const signedOut = await authStore.signOut()

    if (!signedOut) {
      toast.error(authStore.error ?? 'Logout failed')
      return
    }

    cart.clearCart()
    await router.replace('/')
  } finally {
    uiStore.isFullPageLoading = false
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <div
        :aria-label="`Open ${userName}`"
        class="flex size-10 items-center justify-center rounded-full bg-brand font-semibold text-white transition-colors hover:cursor-pointer hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        <img
          v-if="authStore.avatarUrl"
          :src="authStore.avatarUrl"
          alt=""
          class="size-full rounded-full object-cover"
        />
        <span v-else>{{ userInitial }}</span>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      :side-offset="8"
      class="w-52 rounded-xl border-stone-200 bg-white p-2 text-stone-800 shadow-lg"
    >
      <DropdownMenuLabel
        class="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-stone-500"
      >
        My Account
      </DropdownMenuLabel>
      <DropdownMenuSeparator class="mx-1 bg-stone-200" />
      <DropdownMenuItem class="rounded-md p-0 focus:bg-stone-100 focus:text-brand">
        <RouterLink
          to="/profile"
          :aria-label="`Open ${userName}`"
          class="block w-full rounded-md px-3 py-2 text-lg font-medium text-stone-700 transition-colors hover:text-brand"
        >
          Profile
        </RouterLink>
      </DropdownMenuItem>

      <DropdownMenuItem class="rounded-md p-0 focus:bg-red-50 focus:text-red-700">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-lg font-medium text-red-600 transition-colors hover:cursor-pointer hover:text-red-700"
          @click="handleLogout"
        >
          Log out
          <LogOut :size="16" aria-hidden="true" />
        </button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
