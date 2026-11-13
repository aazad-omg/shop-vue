<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { email as emailValidator, required } from '@vuelidate/validators'
import { NepaliRupee } from '@lucide/vue'
import { Button, InputGroup, InputGroupInput, Label, Spinner } from '@/components'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()
const { error, isRequestingPasswordReset } = storeToRefs(authStore)
const email = ref('')
const requestSubmitted = ref(false)

const rules = computed(() => ({
  email: {
    required,
    email: emailValidator,
  },
}))

const v$ = useVuelidate(rules, { email })

const onSubmit = async () => {
  if (!(await v$.value.$validate())) return

  // reroute to password reset page if the email link is clicked
  const redirectTo = new URL(
    router.resolve({ name: 'reset-password' }).href,
    window.location.origin,
  ).toString()
  const requestSent = await authStore.requestPasswordReset(email.value, redirectTo)

  if (!requestSent) return

  requestSubmitted.value = true
}
</script>

<template>
  <div
    class="mx-auto my-10 flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-amber-900/15 bg-white p-10 shadow-2xl shadow-amber-950/25 md:border"
  >
    <div class="flex items-center justify-center gap-2 pb-5">
      <p class="text-center text-3xl font-bold tracking-wide text-brand-900">ShopVue</p>
      <NepaliRupee :size="35" color="#dd0808" :stroke-width="2.5" />
    </div>

    <h1 class="text-2xl font-semibold text-brand text-center">Forgot your password?</h1>
    <div v-if="!requestSubmitted" class="text-center">
      <p class="mt-2 text-sm text-gray-600">Enter your account email to reset your password.</p>
    </div>

    <form v-if="!requestSubmitted" novalidate @submit.prevent="onSubmit">
      <div class="mb-4">
        <Label for="email" class="py-2 text-lg text-brand-900">
          Email <span class="text-destructive" aria-hidden="true">*</span>
        </Label>
        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
        >
          <InputGroupInput
            id="email"
            v-model.trim="v$.email.$model"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="Enter your email"
            data-slot="input-group-control"
            :aria-invalid="v$.email.$error"
          />
        </InputGroup>
        <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
          {{ v$.email.$error ? v$.email.$errors[0]?.$message : '' }}
        </p>
      </div>

      <Button
        type="submit"
        class="w-full bg-brand-900 py-5 transition-transform hover:cursor-pointer active:scale-[0.85]"
      >
        <Spinner v-if="isRequestingPasswordReset" class="size-4" />
        {{ isRequestingPasswordReset ? 'Sending…' : 'Send recovery email' }}
      </Button>
      <p v-if="error" class="mt-3 text-center text-sm font-medium text-destructive" role="alert">
        {{ error }}
      </p>
    </form>

    <div
      v-else
      class="rounded-lg border border-amber-900/15 bg-amber-50 p-4 text-center text-sm text-brand-900"
      role="status"
    >
      If that email is linked to an account, we’ll send a password recovery link.
    </div>

    <RouterLink
      to="/login"
      class="text-center text-sm font-semibold text-brand-500 hover:text-brand hover:underline"
    >
      Back to login
    </RouterLink>
  </div>
</template>
