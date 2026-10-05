<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showPasswords = ref(false)
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleSubmit = () => {
  alert('Registration successful!')
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <form class="register-form" @submit.prevent="handleSubmit">
      <h2 class="register-title">Register</h2>

      <div class="form-group my-2 gap-1">
        <label for="name" class="mr-2">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="px-2 border-2"
          placeholder="Enter your name"
        />
      </div>

      <div class="form-group my-2">
        <label for="email" class="mr-2">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="px-2 border-2"
          placeholder="Enter your email"
        />
      </div>

      <div class="form-group my-2">
        <label for="password" class="mr-2">Password</label>
        <input
          id="password"
          v-model="form.password"
          :type="showPasswords ? 'text' : 'password'"
          class="px-2 border-2"
          placeholder="Enter your password"
        />
      </div>

      <div class="form-group form-group-last my-2">
        <label for="confirmPassword" class="mr-2">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          :type="showPasswords ? 'text' : 'password'"
          class="px-2 border-2"
          placeholder="Confirm your password"
        />
      </div>

      <button type="button" @click="showPasswords = !showPasswords">
        {{ showPasswords ? 'Hide passwords' : 'Show passwords' }}
      </button>

      <button type="submit" class="justify-center">
        <p class="text-blue-500 hover:underline">Register</p>
      </button>
    </form>
  </div>
</template>
