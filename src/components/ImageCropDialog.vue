<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCropper, type VuePictureCropperProps } from 'vue-picture-cropper'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Spinner } from '@/components'

const props = defineProps<{
  open: boolean
  imageSrc: string
}>()

const emit = defineEmits<{
  confirm: [croppedFile: File]
  cancel: []
}>()

const cropOptions: VuePictureCropperProps['options'] = {
  aspectRatio: 1,
}

// Pass reactive props as a computed so the cropper follows imageSrc changes
const [CropperComponent, cropper] = useCropper(
  computed(() => ({
    img: props.imageSrc,
    options: cropOptions,
  })),
)

const DEFAULT_ASPECT_RATIO = 4 / 3
const MAX_CROP_AREA_HEIGHT = '60vh'
const imageSize = ref({ width: 0, height: 0 })

watch(
  () => props.imageSrc,
  (src) => {
    if (!src) return
    const image = new Image()
    image.onload = () => {
      imageSize.value = { width: image.naturalWidth, height: image.naturalHeight }
    }
    image.src = src
  },
  { immediate: true },
)

// Shrink the crop area to the image's natural size, capped at the dialog width and at a max height
const cropAreaStyle = computed(() => {
  const { width, height } = imageSize.value
  if (!width || !height) return { width: '100%', aspectRatio: String(DEFAULT_ASPECT_RATIO) }
  const ratio = width / height
  return {
    width: `min(${width}px, 100%, calc(${MAX_CROP_AREA_HEIGHT} * ${ratio}))`,
    aspectRatio: String(ratio),
  }
})

const isProcessing = ref(false)

const handleConfirm = async () => {
  isProcessing.value = true
  try {
    const file = await cropper.getFile()
    if (!file) return
    emit('confirm', file)
  } catch (error) {
    console.error('Crop failed:', error)
  } finally {
    isProcessing.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleCancel">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Crop Your Profile Picture</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Crop Area -->
        <div class="relative mx-auto overflow-hidden rounded-md bg-red-200" :style="cropAreaStyle">
          <CropperComponent />
        </div>

        <!-- Instructions -->
        <p class="text-center text-sm text-stone-600">
          Drag to reposition • Drag the circle to resize • Scroll to zoom
        </p>

        <!-- Actions -->
        <div class="flex gap-2">
          <Button
            type="button"
            variant="outline"
            :disabled="isProcessing"
            @click="handleCancel"
            class="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            :disabled="isProcessing"
            @click="handleConfirm"
            class="flex-1 bg-brand-900"
          >
            <Spinner v-if="isProcessing" class="size-4" />
            {{ isProcessing ? 'Processing...' : 'Apply Crop' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Let the image span the full width; height follows its aspect ratio */
:deep(.vpc-img) {
  width: 100%;
  max-width: none;
  max-height: none;
  height: auto;
}

/* Show the crop box as a circle while the image stays rectangular */
:deep(.cropper-crop-box),
:deep(.cropper-view-box),
:deep(.cropper-face) {
  border-radius: 50%;
}
</style>
