<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { email as emailValidator, minLength, required, sameAs } from '@vuelidate/validators'
import { toast } from 'vue-sonner'
import { ChevronDown, Eye, EyeOff, Pencil } from '@lucide/vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  FullPageSpinner,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const { user, profile, avatarUrl, isLoading, isUploadingAvatar, isChangingPassword, error } =
  storeToRefs(authStore)

const initialName = user.value?.user_metadata?.full_name ?? user.value?.user_metadata?.name ?? ''
const name = ref(typeof initialName === 'string' ? initialName : '')
const email = ref(user.value?.email ?? '')
const phone = ref(user.value?.phone ?? '')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isEditing = ref(false)
const profileAccordionValue = ref<string | undefined>('item-1')
const savedProfile = ref({ name: name.value, email: email.value, phone: phone.value })
const avatarInput = ref<HTMLInputElement | null>(null)
const selectedAvatar = ref<File | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
const avatarImageFailed = ref(false)
const visibleAvatarUrl = computed(() =>
  avatarImageFailed.value ? null : (avatarPreviewUrl.value ?? avatarUrl.value),
)

const onAvatarSelected = (event: Event) => {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  selectedAvatar.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
  avatarImageFailed.value = false
}

const clearAvatarSelection = () => {
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  selectedAvatar.value = null
  avatarPreviewUrl.value = null
  if (avatarInput.value) avatarInput.value.value = ''
}

const uploadSelectedAvatar = async () => {
  if (!selectedAvatar.value) return

  const uploaded = await authStore.uploadProfileAvatar(selectedAvatar.value)
  if (!uploaded) {
    toast.error(error.value ?? 'Profile picture upload failed')
    return
  }

  clearAvatarSelection()
  avatarImageFailed.value = false
  toast.success('Profile picture updated.')
}

onUnmounted(() => {
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
})

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

const passwordRules = computed(() => ({
  newPassword: {
    required,
    minLength: minLength(6),
  },
  confirmPassword: {
    required,
    sameAsPassword: sameAs(newPassword),
  },
}))
const passwordV$ = useVuelidate(passwordRules, { newPassword, confirmPassword }, { $scope: false })

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
  // trigger the first accordion to open
  profileAccordionValue.value = 'item-1'
  isEditing.value = true
}

const onSubmit = async () => {
  // toast.error('Profile updated successfully.')

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

const onChangePassword = async () => {
  const isValid = await passwordV$.value.$validate()
  if (!isValid) return

  const changed = await authStore.changePassword(newPassword.value)

  if (!changed) {
    toast.error(error.value ?? 'Password update failed')
    return
  }

  newPassword.value = ''
  confirmPassword.value = ''
  showNewPassword.value = false
  showConfirmPassword.value = false
  passwordV$.value.$reset()
  toast.success('Password changed successfully.')
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
          <div class="flex shrink-0 flex-col items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div class="group relative size-16">
                    <input
                      id="profile-picture"
                      ref="avatarInput"
                      class="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label="Choose a profile picture"
                      :disabled="isUploadingAvatar"
                      @change="onAvatarSelected"
                    />

                    <!-- refine the image button -->
                    <!-- provide an outer border -->
                    <!-- Profile picture button -->
                    <button
                      type="button"
                      class="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-brand text-xl font-bold text-white transition-transform duration-150 hover:cursor-pointer group-hover:scale-[1.2]"
                      :disabled="isUploadingAvatar"
                      @click="avatarInput?.click()"
                    >
                      <img
                        v-if="visibleAvatarUrl"
                        :src="visibleAvatarUrl"
                        alt=""
                        class="size-full object-cover"
                        @error="avatarImageFailed = true"
                      />
                      <span v-else aria-hidden="true">{{ initials }}</span>
                    </button>

                    <!-- Lower pencil button -->
                    <button
                      type="button"
                      class="absolute bottom-0 right-0 flex size-5 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-brand/80"
                      :disabled="isUploadingAvatar"
                      @click="avatarInput?.click()"
                    >
                      <Pencil class="size-3.5" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="text-sm font-semibold text-white">Avatar requirements</p>
                  <p class="mt-1 text-xs text-gray-300">Maximum size: 2 MB</p>
                  <p class="text-xs text-gray-300">Formats: JPG, PNG, or WebP</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="flex shrink-0 flex-col items-center gap-2">
            <div v-if="selectedAvatar" class="flex gap-2">
              <Button
                type="button"
                class="bg-brand-900"
                :disabled="isUploadingAvatar"
                @click="uploadSelectedAvatar"
              >
                <Spinner v-if="isUploadingAvatar" class="size-4" />
                {{ isUploadingAvatar ? 'Uploading…' : 'Upload' }}
              </Button>
              <Button
                type="button"
                class="border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 hover:cursor-pointer"
                :disabled="isUploadingAvatar"
                @click="clearAvatarSelection"
              >
                Cancel
              </Button>
            </div>
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

        <Accordion v-model="profileAccordionValue" type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger
              class="px-4 hover:cursor-pointer hover:bg-brand-100 hover:no-underline"
            >
              <span>
                <h2 class="text-xl font-bold text-stone-900">Profile details</h2>
              </span>
              <template #icon>
                <ChevronDown :size="25" color="#2a3a5e" :stroke-width="3" />
              </template>
            </AccordionTrigger>
            <AccordionContent class="px-4">
              <form
                id="profile-edit-form"
                class="border-b border-stone-200 py-6"
                novalidate
                @submit.prevent="onSubmit"
              >
                <div class="grid gap-x-6 sm:grid-cols-2">
                  <div class="mb-4">
                    <Label for="name" class="py-2 text-lg text-brand-900">
                      Name <span class="text-destructive" aria-hidden="true">*</span>
                    </Label>
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
                        class="text-stone-900 disabled:pointer-events-auto disabled:text-stone-700 disabled:opacity-100 disabled:hover:bg-red-100"
                        :class="{ 'hover:cursor-not-allowed': !isEditing || isLoading }"
                        :disabled="!isEditing || isLoading"
                        :aria-invalid="isEditing && v$.name.$error"
                      />
                    </InputGroup>
                    <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
                      {{ isEditing && v$.name.$error ? v$.name.$errors[0]?.$message : '' }}
                    </p>
                  </div>

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
                        class="text-stone-900 disabled:pointer-events-auto disabled:text-stone-700 disabled:opacity-100 disabled:hover:bg-red-100"
                        :class="{ 'hover:cursor-not-allowed': !isEditing || isLoading }"
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
                        class="text-stone-900 disabled:pointer-events-auto disabled:text-stone-700 disabled:opacity-100 disabled:hover:bg-red-100"
                        :class="{ 'hover:cursor-not-allowed': !isEditing || isLoading }"
                        :disabled="!isEditing || isLoading"
                      />
                    </InputGroup>
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
                    class="border border-stone-300 bg-white py-5 text-stone-800 hover:bg-stone-100 hover:cursor-pointer sm:px-8"
                    @click="toggleEditing"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible default-value="item-2">
          <AccordionItem value="item-2">
            <AccordionTrigger
              class="px-4 hover:cursor-pointer hover:bg-brand-100 hover:no-underline"
            >
              <span>
                <h2 class="text-xl font-bold text-stone-900">Account security</h2>
              </span>
              <template #icon>
                <ChevronDown :size="25" color="#2a3a5e" :stroke-width="3" />
              </template>
            </AccordionTrigger>

            <AccordionContent class="px-4">
              <p class="mb-4 text-sm text-stone-600">Choose a new password for your account.</p>
              <form
                class="border-b border-stone-200 py-6"
                novalidate
                @submit.prevent="onChangePassword"
              >
                <div class="grid gap-x-6 sm:grid-cols-2">
                  <div class="mb-4">
                    <Label for="new-password" class="py-2 text-lg text-brand-900"
                      >New password
                      <span class="text-destructive" aria-hidden="true">*</span></Label
                    >
                    <InputGroup
                      class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
                    >
                      <InputGroupInput
                        id="new-password"
                        v-model="passwordV$.newPassword.$model"
                        name="new-password"
                        :type="showNewPassword ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="Enter a new password"
                        data-slot="input-group-control"
                        :disabled="isChangingPassword"
                        :aria-invalid="passwordV$.newPassword.$error"
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          type="button"
                          :aria-label="showNewPassword ? 'Hide new password' : 'Show new password'"
                          :aria-pressed="showNewPassword"
                          :disabled="isChangingPassword"
                          class="rounded-sm hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed"
                          @click="showNewPassword = !showNewPassword"
                        >
                          <Eye v-if="!showNewPassword" aria-hidden="true" />
                          <EyeOff v-else aria-hidden="true" />
                        </button>
                      </InputGroupAddon>
                    </InputGroup>
                    <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
                      {{
                        passwordV$.newPassword.$error
                          ? passwordV$.newPassword.$errors[0]?.$message
                          : ''
                      }}
                    </p>
                  </div>

                  <div class="mb-4">
                    <Label for="confirm-password" class="py-2 text-lg text-brand-900">
                      Confirm new password
                      <span class="text-destructive" aria-hidden="true">*</span>
                    </Label>
                    <InputGroup
                      class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
                    >
                      <InputGroupInput
                        id="confirm-password"
                        v-model="passwordV$.confirmPassword.$model"
                        name="confirm-password"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="Re-enter your new password"
                        data-slot="input-group-control"
                        :disabled="isChangingPassword"
                        :aria-invalid="passwordV$.confirmPassword.$error"
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          type="button"
                          :aria-label="
                            showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                          "
                          :aria-pressed="showConfirmPassword"
                          :disabled="isChangingPassword"
                          class="rounded-sm hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed"
                          @click="showConfirmPassword = !showConfirmPassword"
                        >
                          <Eye v-if="!showConfirmPassword" aria-hidden="true" />
                          <EyeOff v-else aria-hidden="true" />
                        </button>
                      </InputGroupAddon>
                    </InputGroup>
                    <p class="mt-1.5 min-h-5 text-sm font-medium text-destructive" role="alert">
                      {{
                        passwordV$.confirmPassword.$error
                          ? passwordV$.confirmPassword.$errors[0]?.$message
                          : ''
                      }}
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  :disabled="isChangingPassword"
                  class="bg-brand-900 py-5 transition-transform hover:cursor-pointer active:scale-[0.98] sm:px-8"
                >
                  <Spinner v-if="isChangingPassword" class="size-4" />
                  {{ isChangingPassword ? 'Changing password…' : 'Change password' }}
                </Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <dl class="grid px-4 gap-x-8 sm:grid-cols-2">
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
