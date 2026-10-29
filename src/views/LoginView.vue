<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import useVuelidate from '@vuelidate/core'
import { Button, InputGroup, InputGroupAddon, InputGroupInput, Label, Spinner } from '@/components'
import { Eye, EyeOff } from '@lucide/vue'
import { email as emailValidator, minLength, required } from '@vuelidate/validators'

const router = useRouter()
const authStore = useAuthStore()
const { isLoading, error } = storeToRefs(authStore)

const email = ref<string>('')
const password = ref<string>('')
const showPassword = ref<boolean>(false)
const rememberMe = ref<boolean>(false)
const rememberedEmailKey = 'shopvue-remembered-email'

onMounted(() => {
  const rememberedEmail = localStorage.getItem(rememberedEmailKey)
  if (!rememberedEmail) return

  email.value = rememberedEmail
  rememberMe.value = true
})

const rules = computed(() => ({
  email: {
    required,
    email: emailValidator,
  },
  password: {
    required,
    minLength: minLength(6),
  },
}))

const v$ = useVuelidate(rules, { email, password })

const onSubmit = async () => {
  const isValid = await v$.value.$validate()

  if (!isValid) return

  const signedIn = await authStore.signIn(email.value, password.value)

  if (!signedIn) {
    alert(error.value ?? 'Login failed')
    return
  }

  if (rememberMe.value) {
    localStorage.setItem(rememberedEmailKey, email.value)
  } else {
    localStorage.removeItem(rememberedEmailKey)
  }

  await router.replace('/')
}
</script>

<template>
  <div
    class="mx-auto my-10 flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-amber-900/15 bg-white p-10 shadow-2xl shadow-amber-950/25"
  >
    <div class="text-center text-3xl font-bold tracking-wide text-amber-800">SHOPVUE</div>
    <div><p class="text-center text-2xl font-semibold">Login</p></div>
    <form novalidate @submit.prevent="onSubmit">
      <div class="mb-4">
        <Label for="email" class="py-2 text-lg">Email</Label>

        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
        >
          <InputGroupInput
            id="email"
            name="email"
            v-model.trim="v$.email.$model"
            type="email"
            placeholder="Enter your email"
            data-slot="input-group-control"
            :aria-invalid="v$.email.$error"
          />
        </InputGroup>
        <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
          {{ v$.email.$error ? v$.email.$errors[0]?.$message : '' }}
        </p>
      </div>

      <div class="mb-4">
        <Label for="password" class="py-2 text-lg">Password</Label>

        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
        >
          <InputGroupInput
            id="password"
            name="password"
            v-model="v$.password.$model"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
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

      <div class="mb-4 flex items-center gap-2">
        <input
          id="remember-me"
          v-model="rememberMe"
          name="remember-me"
          type="checkbox"
          class="size-5 accent-brand-700"
        />
        <Label for="remember-me">Remember me</Label>
      </div>

      <div class="mt-2 flex justify-center pt-2">
        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full py-5 transition-transform active:scale-[0.85] hover:cursor-pointer bg-brand-900"
        >
          <Spinner v-if="isLoading" class="size-4" />
          {{ isLoading ? 'Logging in…' : 'Login' }}
        </Button>
      </div>
      <div class="my-4 text-center text-sm text-gray-400">--------------or---------------</div>
      <div class="flex justify-center gap-1 text-base">
        Dont have an account?
        <span
          ><RouterLink to="/register"
            ><p class="text-blue-500 font-semibold hover:underline">Register</p></RouterLink
          ></span
        >
      </div>
    </form>
  </div>
</template>
