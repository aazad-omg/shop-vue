<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { email as emailValidator, minLength, required } from '@vuelidate/validators'
import { toast } from 'vue-sonner'
import {
  Button,
  Card,
  FullPageSpinner,
  InputGroup,
  InputGroupInput,
  Label,
  Spinner,
} from '@/components'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const { user, profile, isLoading, error } = storeToRefs(authStore)

const initialName = user.value?.user_metadata?.full_name ?? user.value?.user_metadata?.name ?? ''
const name = ref(typeof initialName === 'string' ? initialName : '')
const email = ref(user.value?.email ?? '')
const phone = ref(user.value?.phone ?? '')
const isEditing = ref(false)
const savedProfile = ref({ name: name.value, email: email.value, phone: phone.value })

const loadProfile = async () => {
  const loaded = await authStore.fetchProfile()

  if (!loaded) {
    toast.error(error.value ?? 'Profile load failed')
    return
  }

  if (!profile.value) return

  name.value = profile.value.full_name ?? name.value
  email.value = profile.value.email ?? email.value
  phone.value = profile.value.phone_number ?? phone.value
  savedProfile.value = {
    name: name.value,
    email: email.value,
    phone: phone.value,
  }
}

onMounted(() => {
  void loadProfile()
})

const rules = computed(() => ({
  name: {
    required,
    minLength: minLength(2),
  },
  email: {
    required,
    email: emailValidator,
  },
}))
const v$ = useVuelidate(rules, { name, email })

const cancelEditing = () => {
  name.value = savedProfile.value.name
  email.value = savedProfile.value.email
  phone.value = savedProfile.value.phone
  v$.value.$reset()
  isEditing.value = false
}

const toggleEditing = () => {
  if (isEditing.value) {
    cancelEditing()
    return
  }

  v$.value.$reset()
  isEditing.value = true
}

const onSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  const updated = await authStore.updateProfile(
    name.value.trim(),
    email.value.trim(),
    phone.value.trim(),
  )

  if (!updated) {
    toast.error(error.value ?? 'Profile update failed')
    return
  }

  savedProfile.value = {
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
  }
  isEditing.value = false
  toast.success('Profile updated successfully.')
}

const displayName = computed(() => savedProfile.value.name.trim() || 'ShopVue customer')

const initials = computed(
  () =>
    displayName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase() || '?',
)

const memberSince = computed(() => {
  const createdAt = user.value?.created_at
  if (!createdAt) return 'Not available'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Not available'

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date)
})
</script>

<template>
  <FullPageSpinner :loading="isLoading" />

  <main class="min-h-screen bg-amber-50 px-4 py-8 sm:px-8 sm:py-12 flex justify-center">
    <Card class="w-full max-w-4xl border-stone-200/80 px-5 shadow-sm sm:px-8">
      <header class="border-b border-stone-200 py-0">
        <p class="text-xs font-bold tracking-[0.18em] text-amber-800 uppercase">Your account</p>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">Profile</h1>
        <p class="mt-2 text-stone-600">View and update your account details.</p>
      </header>

      <section aria-label="Profile details">
        <div class="flex items-center gap-4 border-b border-stone-200 py-5">
          <div
            aria-hidden="true"
            class="p-4 items-center justify-center rounded-full bg-brand text-xl font-bold text-white"
          >
            {{ initials }}
          </div>
          <div class="min-w-0">
            <h2 class="wrap-break-word text-xl font-bold text-stone-900 sm:text-2xl">
              {{ displayName }}
            </h2>
            <p class="mt-1 break-all text-sm text-stone-600">
              {{ savedProfile.email || 'No email address available' }}
            </p>
          </div>
          <Button
            type="button"
            class="ml-auto bg-brand-900 transition-transform hover:cursor-pointer active:scale-[0.98]"
            :disabled="isEditing || isLoading"
            @click="toggleEditing"
          >
            Edit profile
          </Button>
        </div>

        <form
          id="profile-edit-form"
          class="border-b border-stone-200 py-6"
          novalidate
          @submit.prevent="onSubmit"
        >
          <h2 class="mb-4 text-xl font-bold text-stone-900">Profile details</h2>
          <div class="grid gap-x-6 sm:grid-cols-2">
            <div class="mb-4">
              <Label for="name" class="py-2 text-lg text-brand-900">Name</Label>
              <InputGroup
                class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
              >
                <InputGroupInput
                  id="name"
                  v-model.trim="v$.name.$model"
                  name="name"
                  type="text"
                  autocomplete="name"
                  placeholder="Enter your name"
                  data-slot="input-group-control"
                  :disabled="!isEditing || isLoading"
                  :aria-invalid="isEditing && v$.name.$error"
                />
              </InputGroup>
              <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
                {{ isEditing && v$.name.$error ? v$.name.$errors[0]?.$message : '' }}
              </p>
            </div>

            <div class="mb-4">
              <Label for="email" class="py-2 text-lg text-brand-900">Email</Label>
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
                  :disabled="!isEditing || isLoading"
                  :aria-invalid="isEditing && v$.email.$error"
                />
              </InputGroup>
              <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
                {{ isEditing && v$.email.$error ? v$.email.$errors[0]?.$message : '' }}
              </p>
            </div>

            <div class="mb-4">
              <Label for="phone" class="py-2 text-lg text-brand-900">Phone number</Label>
              <InputGroup
                class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
              >
                <InputGroupInput
                  id="phone"
                  v-model.trim="phone"
                  name="phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="Enter your phone number"
                  data-slot="input-group-control"
                  :disabled="!isEditing || isLoading"
                />
              </InputGroup>
              <p class="mt-1.5 min-h-5 text-sm text-stone-500">Optional</p>
            </div>
          </div>

          <div v-if="isEditing" class="mt-2 flex gap-3">
            <Button
              type="submit"
              :disabled="isLoading"
              class="bg-brand-900 py-5 transition-transform hover:cursor-pointer active:scale-[0.98] sm:px-8"
            >
              <Spinner v-if="isLoading" class="size-4" />
              {{ isLoading ? 'Saving…' : 'Save changes' }}
            </Button>
            <Button
              type="button"
              :disabled="isLoading"
              class="border border-stone-300 bg-white py-5 text-stone-800 hover:bg-stone-100 sm:px-8"
              @click="toggleEditing"
            >
              Cancel
            </Button>
          </div>
        </form>

        <dl class="grid gap-x-8 sm:grid-cols-2">
          <div class="border-b border-stone-200 py-4">
            <dt class="text-sm font-medium text-stone-500">Member since</dt>
            <dd class="mt-1 font-semibold text-stone-900">{{ memberSince }}</dd>
          </div>
          <div class="border-b border-stone-200 py-4">
            <dt class="text-sm font-medium text-stone-500">Email status</dt>
            <dd class="mt-1 font-semibold text-stone-900">
              {{ user?.email_confirmed_at ? 'Verified' : 'Not verified' }}
            </dd>
          </div>
        </dl>
      </section>
    </Card>
  </main>
</template>
