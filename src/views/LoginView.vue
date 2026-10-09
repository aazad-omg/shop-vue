<script setup lang="ts">
import { computed, ref } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { Button, InputGroup, InputGroupAddon, InputGroupInput, Label } from '@/components'
import { Eye, EyeOff } from '@lucide/vue'
import { email as emailValidator, minLength, required } from '@vuelidate/validators'

const router = useRouter()

const email = ref<string>('')
const password = ref<string>('')
const showPassword = ref<boolean>(false)

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
  console.log('$validate resolved:', isValid)
  console.log('v$', v$)
  if (!isValid) return
  console.log('success form submit')
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    router.replace('/')
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : 'Registration failed')
  }
}
</script>

<template>
  <div class="mx-auto my-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
    <div class="text-center text-2xl font-bold tracking-wide text-amber-800">SHOPVUE</div>
    <div><p class="text-center text-xl font-semibold">Login</p></div>
    <form novalidate @submit.prevent="onSubmit">
      <div class="mb-4">
        <Label for="email" class="py-2 text-md">Email</Label>

        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30 text-base"
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
        <Label for="password" class="py-2 text-md">Password</Label>

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

      <div class="mt-2 flex justify-center pt-2">
        <Button type="submit" class="transition-transform active:scale-[0.85] hover:cursor-pointer"
          >Login</Button
        >
      </div>
      <div class="my-4 text-center text-sm text-gray-400">--------------or---------------</div>
      <div class="flex justify-center gap-1 text-md">
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
