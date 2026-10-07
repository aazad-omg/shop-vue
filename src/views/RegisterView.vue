<script setup lang="ts">
import { BaseButton, BaseInput } from '@/components'
import { Eye, EyeOff } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { Form } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import z from 'zod'

const router = useRouter()
const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const onSubmit = (values: Record<string, string>) => {
  console.log('Registration submitted with values:', values)
  alert('Registration successful!')
  router.replace('/login')
}

const validationSchema = toTypedSchema(
  z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Password confirmation must be at least 6 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
)
</script>

<template>
  <div class="mx-auto my-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
    <div class="text-center text-2xl font-bold tracking-wide text-amber-800">SHOPVUE</div>
    <div><p class="text-center text-xl font-semibold">Create your account</p></div>

    <Form :initial-values="initialValues" :validation-schema="validationSchema" @submit="onSubmit">
      <BaseInput
        name="name"
        label="Name"
        type="text"
        placeholder="Enter your name"
        :validate-on-input="true"
      />

      <BaseInput
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        :validate-on-input="true"
      />

      <BaseInput
        name="password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Enter your password"
        :validate-on-input="true"
      >
        <button
          type="button"
          class="text-sm font-medium text-amber-700 hover:text-amber-900"
          @click="showPassword = !showPassword"
        >
          <Eye v-if="!showPassword" color="black" />
          <EyeOff v-if="showPassword" color="black" />
        </button>
      </BaseInput>

      <BaseInput
        name="confirmPassword"
        label="Confirm Password"
        :type="showConfirmPassword ? 'text' : 'password'"
        placeholder="Confirm your password"
        :validate-on-input="true"
      >
        <button
          type="button"
          class="text-sm font-medium text-amber-700 hover:text-amber-900 hover:cursor-pointer"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          <Eye v-if="!showConfirmPassword" color="black" />
          <EyeOff v-if="showConfirmPassword" color="black" />
        </button>
      </BaseInput>

      <div class="mt-2 flex justify-center pt-2">
        <BaseButton type="submit">Register</BaseButton>
      </div>

      <div class="flex justify-center items-center mt-4 text-center text-md text-gray-400">
        Already have an account?
        <span class="ml-1">
          <RouterLink to="/login">
            <p class="text-blue-500 hover:underline font-semibold">Login</p>
          </RouterLink></span
        >
      </div>
    </Form>
  </div>
</template>
