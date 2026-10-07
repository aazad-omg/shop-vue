<script setup lang="ts">
import { BaseButton, BaseInput } from '@/components'
import { Eye, EyeOff } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, Form } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import z from 'zod'

const router = useRouter()

const initialValues = {
  email: '',
  password: '',
  rememberMe: true,
}

const showPassword = ref<boolean>(false)

const onSubmit = (values: Record<string, string>) => {
  console.log('Form submitted with values:', values)
  alert('Login validation successful!')
  router.replace('/')
}

const validationSchema = toTypedSchema(
  z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean(),
  }),
)
</script>

<template>
  <div class="mx-auto my-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl">
    <div class="text-center text-2xl font-bold tracking-wide text-amber-800">SHOPVUE</div>
    <div><p class="text-center text-xl font-semibold">Login</p></div>

    <Form :initial-values="initialValues" :validation-schema="validationSchema" @submit="onSubmit">
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
          class="text-sm font-medium text-amber-700 hover:text-amber-900 hover:cursor-pointer"
          @click="showPassword = !showPassword"
        >
          <Eye v-if="!showPassword" color="black" />
          <EyeOff v-if="showPassword" color="black" />
        </button>
      </BaseInput>

      <div class="flex justify-between rounded-md bg-amber-100 px-3 py-2 text-md">
        <label>
          <Field
            name="rememberMe"
            as="input"
            type="checkbox"
            :value="true"
            :unchecked-value="false"
          />
          Remember me
        </label>
        <div>Forgot password?</div>
      </div>
      <div class="mt-2 flex justify-center pt-2">
        <BaseButton type="submit">Login</BaseButton>
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
    </Form>
  </div>
</template>
