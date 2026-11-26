const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
const defaultMaxFileSize = 2 * 1024 * 1024

export function validateImageFile(file: File, maxFileSize = defaultMaxFileSize) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.')
  }

  if (file.size > maxFileSize) {
    throw new Error(`Image must be smaller than ${maxFileSize / (1024 * 1024)} MB.`)
  }
}

export function handleImageFallback(fallbackImage = '/product-placeholder.svg') {
  const handleImageError = (event: Event) => {
    const target = event.currentTarget

    if (!(target instanceof HTMLImageElement)) return

    const currentSrc = target.getAttribute('src')

    if (!currentSrc || currentSrc !== fallbackImage) {
      target.src = fallbackImage
    }
  }

  return {
    fallbackImage,
    handleImageError,
  }
}
