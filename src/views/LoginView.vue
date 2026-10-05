<script setup lang="ts">
import { BaseButton } from '@/components'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref<string>('')
const password = ref<string>('')
const showPassword = ref<boolean>(false)

const handleSubmit = () => {
  alert('Registration successful!')
  router.replace('/')
}
</script>

<template>
  <div class="flex flex-col bg-amber-200 min-h-screen py-10 gap-4">
    <div>SHOPVUE</div>
    <div><p>Login</p></div>
    <form @submit.prevent="handleSubmit">
      <div class="my-2">
        <label for="Email" class="pr-1">Email</label>
        <input type="email" id="Email" name="email" v-model="email" class="px-2 border-2" />
      </div>
      <div class="my-2">
        <label for="password" class="pr-1">Password</label>
        <input
          :type="showPassword ? 'text' : 'password'"
          id="password"
          name="password"
          v-model="password"
          class="px-2 mr-1 border-2"
        />
        <button @click="showPassword = !showPassword">
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <div class="flex bg-amber-400 justify-between">
        <div>Remember me</div>
        <div>Forgot password?</div>
      </div>
      <div>
        <BaseButton type="submit">Login Button</BaseButton>
      </div>
      <div>--------------or---------------</div>
      <div class="flex gap-1">
        Dont have an account?
        <span
          ><RouterLink to="/register"
            ><p class="text-blue-500 hover:underline">Register</p></RouterLink
          ></span
        >
      </div>
      <div>
        <p>Display section</p>
        <div>Email:{{ email }}</div>
        <div>Password:{{ password }}</div>
      </div>
    </form>
  </div>
</template>
