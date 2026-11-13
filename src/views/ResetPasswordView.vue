<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import useVuelidate from '@vuelidate/core'
import { minLength, required, sameAs } from '@vuelidate/validators'
import { Eye, EyeOff, NepaliRupee } from '@lucide/vue'
import { Button, InputGroup, InputGroupAddon, InputGroupInput, Label, Spinner } from '@/components'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const { error, isChangingPassword, isPasswordRecovery } = storeToRefs(authStore)
const password = ref('')
const confirmPassword = ref('')
const resetSubmitted = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const rules = computed(() => ({
  password: {
    required,
    minLength: minLength(6),
  },
  confirmPassword: {
    required,
    sameAsPassword: sameAs(password),
  },
}))

const v$ = useVuelidate(rules, { password, confirmPassword })

const onSubmit = async () => {
  if (!(await v$.value.$validate())) return

  const updated = await authStore.changePassword(password.value)
  if (!updated) return

  resetSubmitted.value = true
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

    <div class="text-center">
      <h1 class="text-2xl font-semibold text-brand">Reset your password</h1>
      <p class="mt-2 text-sm text-gray-600">Choose a new password for your account.</p>
    </div>

    <form v-if="isPasswordRecovery && !resetSubmitted" novalidate @submit.prevent="onSubmit">
      <div class="mb-4">
        <Label for="password" class="py-2 text-lg text-brand-900">
          New password <span class="text-destructive" aria-hidden="true">*</span>
        </Label>
        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
        >
          <InputGroupInput
            id="password"
            v-model="v$.password.$model"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Enter a new password"
            data-slot="input-group-control"
            :aria-invalid="v$.password.$error"
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" />
              <EyeOff v-else />
            </button>
          </InputGroupAddon>
        </InputGroup>
        <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
          {{ v$.password.$error ? v$.password.$errors[0]?.$message : '' }}
        </p>
      </div>

      <div class="mb-4">
        <Label for="confirm-password" class="py-2 text-lg text-brand-900">
          Confirm password <span class="text-destructive" aria-hidden="true">*</span>
        </Label>
        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
        >
          <InputGroupInput
            id="confirm-password"
            v-model="v$.confirmPassword.$model"
            name="confirm-password"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Confirm your new password"
            data-slot="input-group-control"
            :aria-invalid="v$.confirmPassword.$error"
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showConfirmPassword"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Eye v-if="!showConfirmPassword" />
              <EyeOff v-else />
            </button>
          </InputGroupAddon>
        </InputGroup>
        <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
          {{
            v$.confirmPassword.$error
              ? v$.confirmPassword.$errors[0]?.$message
              : ''
          }}
        </p>
      </div>

      <Button
        type="submit"
        :disabled="isChangingPassword"
        class="w-full bg-brand-900 py-5 transition-transform hover:cursor-pointer active:scale-[0.85]"
      >
        <Spinner v-if="isChangingPassword" class="size-4" />
        {{ isChangingPassword ? 'Updating…' : 'Reset password' }}
      </Button>
      <p v-if="error" class="mt-3 text-center text-sm font-medium text-destructive" role="alert">
        {{ error }}
      </p>
    </form>

    <div
      v-else-if="resetSubmitted"
      class="rounded-lg border border-amber-900/15 bg-amber-50 p-4 text-center text-sm text-brand-900"
      role="status"
    >
      Your password has been updated successfully.
    </div>

    <div v-else class="text-center text-sm text-gray-600">
      This reset link is invalid or has expired.
      <RouterLink
        to="/forgot-password"
        class="font-semibold text-brand-500 hover:text-brand hover:underline"
      >
        Request a new one
      </RouterLink>
    </div>

    <RouterLink
      v-if="isPasswordRecovery || resetSubmitted"
      to="/login"
      class="text-center text-sm font-semibold text-brand-500 hover:text-brand hover:underline"
    >
      Back to login
    </RouterLink>
  </div>
</template>
