import { onUnmounted, ref } from 'vue'

export function useImageUpload(upload: (file: File) => Promise<void>) {
  const inputRef = ref<HTMLInputElement | null>(null)
  const previewUrl = ref<string | null>(null)
  const imageFailed = ref(false)
  const isUploading = ref(false)

  const revokePreview = () => {
    if (!previewUrl.value) return

    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }

  const onFileSelected = async (event: Event) => {
    const input = event.currentTarget
    if (!(input instanceof HTMLInputElement)) return false

    const file = input.files?.[0]
    if (!file) return false

    revokePreview()
    previewUrl.value = URL.createObjectURL(file)
    imageFailed.value = false
    isUploading.value = true

    try {
      await upload(file)
      return true
    } finally {
      isUploading.value = false
      revokePreview()
      input.value = ''
    }
  }

  onUnmounted(revokePreview)

  return {
    inputRef,
    previewUrl,
    imageFailed,
    isUploading,
    onFileSelected,
  }
}
