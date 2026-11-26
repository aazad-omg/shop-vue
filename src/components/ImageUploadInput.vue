<script setup lang="ts">
import { computed, watch } from 'vue'
import { Pencil } from '@lucide/vue'
import { useImageUpload } from '@/composables'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'
import { Button } from '@/components'
import ImageCropDialog from './ImageCropDialog.vue'

const props = defineProps<{
  src: string | null
  fallback: string
  upload: (file: File) => Promise<void>
}>()

const emit = defineEmits<{
  'upload-success': []
  'upload-error': [message: string]
}>()

const {
  inputRef,
  previewUrl,
  imageFailed,
  isUploading,
  onFileSelected,
  showCropDialog,
  onCropConfirm,
  onCropCancel,
} = useImageUpload(props.upload)

const visibleImageUrl = computed(() => (imageFailed.value ? null : previewUrl.value ?? props.src))

watch(
  () => props.src,
  () => {
    imageFailed.value = false
  },
)

const handleFileSelected = async (event: Event) => {
  try {
    await onFileSelected(event)
  } catch (error: unknown) {
    emit('upload-error', error instanceof Error ? error.message : 'Profile picture upload failed')
  }
}

const handleCropConfirm = async (croppedFile: File) => {
  try {
    if (await onCropConfirm(croppedFile)) {
      emit('upload-success')
    }
  } catch (error: unknown) {
    emit('upload-error', error instanceof Error ? error.message : 'Profile picture upload failed')
  }
}

const handleCropCancel = () => {
  onCropCancel()
}
</script>

<template>
  <div class="flex shrink-0 flex-col items-center gap-1">
    <!-- Crop Dialog -->
    <ImageCropDialog
      :open="showCropDialog"
      :image-src="previewUrl || ''"
      @confirm="handleCropConfirm"
      @cancel="handleCropCancel"
    />

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div class="group relative size-16">
            <input
              ref="inputRef"
              class="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Choose a profile picture"
              :disabled="isUploading"
              @change="handleFileSelected"
            />

            <Button
              type="button"
              variant="ghost"
              class="relative size-full overflow-hidden rounded-full bg-brand p-0 text-xl text-white transition-transform duration-150 group-hover:scale-[1.2] hover:bg-brand"
              :disabled="isUploading"
              @click="inputRef?.click()"
            >
              <img
                v-if="visibleImageUrl"
                :src="visibleImageUrl"
                alt=""
                class="size-full object-cover"
                @error="imageFailed = true"
              />
              <span v-else aria-hidden="true">{{ fallback }}</span>
            </Button>

            <Button
              type="button"
              size="icon-xs"
              class="absolute bottom-0 right-0 size-5 rounded-full border-2 border-white bg-brand p-0 text-white shadow-sm hover:bg-brand/80"
              :disabled="isUploading"
              aria-label="Choose a profile picture"
              @click="inputRef?.click()"
            >
              <Pencil class="size-3.5" />
            </Button>
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
</template>
