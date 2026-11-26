import { onUnmounted, ref } from 'vue'

export function useImageUpload(upload: (file: File) => Promise<void>) {
  const inputRef = ref<HTMLInputElement | null>(null)
  const previewUrl = ref<string | null>(null)
  const imageFailed = ref(false)
  const isUploading = ref(false)
  const showCropDialog = ref(false)
  const selectedFile = ref<File | null>(null)

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
    selectedFile.value = file
    imageFailed.value = false
    showCropDialog.value = true
    input.value = ''

    return true
  }

  const onCropConfirm = async (croppedFile: File) => {
    isUploading.value = true

    try {
      await upload(croppedFile)
      showCropDialog.value = false
      return true
    } finally {
      isUploading.value = false
      revokePreview()
      selectedFile.value = null
    }
  }

  const onCropCancel = () => {
    showCropDialog.value = false
    revokePreview()
    selectedFile.value = null
  }

  onUnmounted(revokePreview)

  return {
    inputRef,
    previewUrl,
    imageFailed,
    isUploading,
    onFileSelected,
    showCropDialog,
    selectedFile,
    onCropConfirm,
    onCropCancel,
  }
}
