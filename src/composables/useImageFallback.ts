export function useImageFallback(fallbackImage = '/product-placeholder.svg') {
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
