<script setup lang="ts">
import useVuelidate from '@vuelidate/core'

import { computed, ref } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'
import { email as emailValidator, minLength, sameAs } from '@vuelidate/validators'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput, Label } from '@/components'
import { Eye, EyeOff } from '@lucide/vue'

const router = useRouter()

const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')

const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)

const rules = computed(() => ({
  name: {
    required: true,
    minLength: 2,
  },
  email: {
    required: true,
    email: emailValidator,
  },
  password: {
    required: true,
    minLength: minLength(6),
  },
  confirmPassword: {
    required: true,
    minLength: minLength(6),
    sameAsPassword: sameAs(password),
  },
}))
const v$ = useVuelidate(rules, { name, email, password, confirmPassword })

const onSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: name.value,
        },
      },
    })
    if (error) throw error
    router.push('/login')
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : 'Registration failed')
  }
}
</script>

<template>
  <div class="mx-auto my-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
    <div class="text-center text-2xl font-bold tracking-wide text-amber-800">SHOPVUE</div>
    <div><p class="text-center text-xl font-semibold">Create your account</p></div>

    <form novalidate @submit.prevent="onSubmit">
      <div class="">
        <Label for="name" class="py-2 text-md">Name</Label>

        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30 text-base"
        >
          <InputGroupInput
            id="name"
            name="name"
            v-model.trim="v$.name.$model"
            type="name"
            placeholder="Enter your name"
            data-slot="input-group-control"
            :aria-invalid="v$.name.$error"
          />
        </InputGroup>
        <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
          {{ v$.name.$error ? v$.name.$errors[0]?.$message : '' }}
        </p>
      </div>

      <div class="">
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

      <div class="">
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

      <div class="">
        <Label for="confirmPassword" class="py-2 text-md">Confirm Password</Label>

        <InputGroup
          class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
        >
          <InputGroupInput
            id="confirmPassword"
            name="confirmPassword"
            v-model="v$.confirmPassword.$model"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm your password"
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
          {{ v$.confirmPassword.$error ? v$.confirmPassword.$errors[0]?.$message : '' }}
        </p>
      </div>

      <div class="mt-2 flex justify-center pt-2">
        <Button type="submit" class="transition-transform duration-100 active:scale-[0.98]"
          >Register</Button
        >
      </div>

      <div class="flex justify-center items-center mt-4 text-center text-md text-gray-400">
        Already have an account?
        <span class="ml-1">
          <RouterLink to="/login">
            <p class="text-blue-500 hover:underline font-semibold">Login</p>
          </RouterLink></span
        >
      </div>
    </form>
  </div>
</template>
