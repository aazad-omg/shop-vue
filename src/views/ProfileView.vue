<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import {
  nameRules,
  emailRules,
  passwordRules as sharedPasswordRules,
  confirmPasswordRules,
} from '@/validations/common'
import { toast } from 'vue-sonner'
import { ChevronDown, Eye, EyeOff } from '@lucide/vue'
import { getInitials } from '@/helpers'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  ImageUploadInput,
  Label,
  PasswordStrengthIndicator,
  Spinner,
  CardContent,
  CardHeader,
} from '@/components'
import { useAuthStore, useUiStore } from '@/stores'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { user, authUser, avatarUrl, isLoading, isChangingPassword, error } = storeToRefs(authStore)

const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const profileDraft = ref({ name: '', email: '', phone: '' })
watch(
  [() => user.value?.full_name, () => user.value?.email, () => user.value?.phone_number],
  ([name, email, phone]) => {
    if (!user.value) {
      profileDraft.value = { name: '', email: '', phone: '' }
      return
    }

    profileDraft.value = {
      name: name ?? '',
      email: email ?? '',
      phone: phone ?? '',
    }
  },
  { immediate: true },
)

watch(
  isLoading,
  (loading) => {
    if (loading) {
      uiStore.startSpinner()
    } else {
      uiStore.stopSpinner()
    }
  },
  { immediate: true },
)
onUnmounted(() => uiStore.stopSpinner())

const uploadAvatar = async (file: File) => {
  uiStore.startSpinner()
  try {
    const uploaded = await authStore.uploadProfileAvatar(file)
    if (!uploaded) throw new Error(error.value ?? 'Profile picture upload failed')
  } finally {
    uiStore.stopSpinner()
  }
}

const onAvatarUploadSuccess = () => toast.success('Profile picture updated.')
const onAvatarUploadError = (message: string) => toast.error(message)

const loadProfile = async () => {
  const loaded = await authStore.fetchProfile()

  if (!loaded) {
    toast.error(error.value ?? 'Profile load failed')
    return
  }
}

onMounted(() => {
  loadProfile()
})

const profileRules = computed(() => ({
  name: nameRules,
  email: emailRules,
  phone: {},
}))
const profileV$ = useVuelidate(profileRules, profileDraft, { $scope: 'PROFILE_VALIDATION' })

const onSaveProfile = async () => {
  if (!(await profileV$.value.$validate())) return

  const name = profileDraft.value.name.trim()
  const email = profileDraft.value.email.trim()
  const phone = profileDraft.value.phone.trim()
  const updated = await authStore.updateProfile(name, email, phone)

  if (!updated) {
    toast.error(error.value ?? 'Profile update failed')
    return
  }

  profileDraft.value = { name, email, phone }
  profileV$.value.$reset()
  toast.success('Profile updated successfully.')
}

const passwordRules = computed(() => ({
  newPassword: sharedPasswordRules,
  confirmPassword: confirmPasswordRules(newPassword),
}))
const passwordV$ = useVuelidate(
  passwordRules,
  { newPassword, confirmPassword },
  { $scope: 'PASSWORD_VALIDATION' },
)

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

const displayName = computed(() => user.value?.full_name?.trim() || 'ShopVue customer')
const initials = computed(() => getInitials(displayName.value))

const memberSince = computed(() => {
  const createdAt = authUser.value?.created_at
  if (!createdAt) return 'Not available'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Not available'

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date)
})
</script>

<template>
  <main class="min-h-screen bg-amber-50 px-4 py-8 sm:px-8 sm:py-12 flex justify-center">
    <Card class="w-full max-w-4xl border-stone-200/80 px-5 shadow-sm sm:px-8 gap-0">
      <CardHeader class="items-center">
        <CardTitle>
          <header class="border-b border-stone-200 pb-2">
            <h1 class="mt-2 text-3xl text-brand sm:text-4xl">Profile</h1>
            <p class="mt-2 text-stone-600">View and update your account details.</p>
          </header>
        </CardTitle>
      </CardHeader>

      <CardContent class="items-center">
        <section aria-label="Profile details">
          <div class="flex gap-4 border-b border-stone-200 py-3">
            <ImageUploadInput
              :src="avatarUrl"
              :fallback="initials"
              :upload="uploadAvatar"
              @upload-success="onAvatarUploadSuccess"
              @upload-error="onAvatarUploadError"
            />
            <div class="min-w-0">
              <div class="flex gap-2">
                <h2 class="wrap-break-word text-xl font-bold text-stone-900 sm:text-2xl">
                  {{ displayName }}
                </h2>
                <Badge variant="secondary" class="bg-brand-900 text-white dark:bg-blue-600">
                  Admin
                </Badge>
              </div>
              <p class="mt-1 break-all text-sm text-stone-600">
                {{ user?.email || 'No email address available' }}
              </p>
            </div>
          </div>
          <Accordion type="single" collapsible default-value="item-1">
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
                  class="border-b border-stone-200 pb-4"
                  novalidate
                  @submit.prevent="onSaveProfile"
                >
                  <div class="grid gap-x-6 sm:grid-cols-2">
                    <div>
                      <Label for="name" class="py-2 text-lg text-brand-900">
                        Name <span class="text-destructive" aria-hidden="true">*</span>
                      </Label>
                      <InputGroup
                        class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
                      >
                        <InputGroupInput
                          id="name"
                          v-model.trim="profileV$.name.$model"
                          name="name"
                          type="text"
                          autocomplete="name"
                          placeholder="Enter your name"
                          data-slot="input-group-control"
                          class="text-stone-900"
                          :aria-invalid="profileV$.name.$error"
                        />
                      </InputGroup>
                      <p
                        v-if="profileV$.name.$error"
                        class="mt-1.5 text-sm font-medium text-destructive"
                        role="alert"
                      >
                        {{ profileV$.name.$error ? profileV$.name.$errors[0]?.$message : '' }}
                      </p>
                    </div>
                    <div>
                      <Label for="email" class="py-2 text-lg text-brand-900">
                        Email <span class="text-destructive" aria-hidden="true">*</span>
                      </Label>
                      <InputGroup
                        class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
                      >
                        <InputGroupInput
                          id="email"
                          v-model.trim="profileV$.email.$model"
                          name="email"
                          type="email"
                          autocomplete="email"
                          placeholder="Enter your email"
                          data-slot="input-group-control"
                          class="text-stone-900"
                          :aria-invalid="profileV$.email.$error"
                        />
                      </InputGroup>
                      <p
                        v-if="profileV$.email.$error"
                        class="mt-1.5 text-sm font-medium text-destructive"
                        role="alert"
                      >
                        {{ profileV$.email.$error ? profileV$.email.$errors[0]?.$message : '' }}
                      </p>
                    </div>
                    <div class="mb-4">
                      <Label for="phone" class="py-2 text-lg text-brand-900">Phone number</Label>
                      <InputGroup
                        class="has-[[data-slot=input-group-control]:focus-visible]:border-amber-500 has-[[data-slot=input-group-control]:focus-visible]:ring-amber-500/30"
                      >
                        <InputGroupInput
                          id="phone"
                          v-model.trim="profileV$.phone.$model"
                          name="phone"
                          type="tel"
                          autocomplete="tel"
                          placeholder="Enter your phone number"
                          data-slot="input-group-control"
                          class="text-stone-900"
                        />
                      </InputGroup>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    :disabled="isLoading || !profileV$.$anyDirty"
                    class="bg-brand-900 py-5 transition-transform hover:cursor-pointer disabled:pointer-events-auto disabled:hover:cursor-not-allowed active:scale-[0.98] sm:px-8"
                  >
                    <Spinner v-if="isLoading" class="size-4" />
                    {{ isLoading ? 'Saving…' : 'Save changes' }}
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible>
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
                            :aria-label="
                              showNewPassword ? 'Hide new password' : 'Show new password'
                            "
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
                      <PasswordStrengthIndicator :password="newPassword" />
                      <p class="mt-1.5 text-sm font-medium text-destructive" role="alert">
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
                              showConfirmPassword
                                ? 'Hide confirm password'
                                : 'Show confirm password'
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
                      <p class="mt-1.5 text-sm font-medium text-destructive" role="alert">
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
                {{ authUser?.email_confirmed_at ? 'Verified' : 'Not verified' }}
              </dd>
            </div>
          </dl>
        </section>
      </CardContent>
    </Card>
  </main>
</template>
