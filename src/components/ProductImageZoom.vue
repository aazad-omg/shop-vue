<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const fallbackImage = '/product-placeholder.svg'

const props = defineProps<{
  src: string
  alt: string
}>()

const imageSrc = ref(props.src || fallbackImage)
const isFallbackImage = ref(!props.src || props.src === fallbackImage)

// Disable image zoom for smaller screen sizes
// 64rem = 1024px
const canZoom = useMediaQuery('(min-width: 64rem)')

watch(
  () => props.src,
  (src) => {
    imageSrc.value = src || fallbackImage
    isFallbackImage.value = !src || src === fallbackImage
    isZooming.value = false
  },
)

watch(canZoom, (enabled) => {
  if (!enabled) isZooming.value = false
})

// Provided type null to refs incase the element is not available yet
const imageRef = ref<HTMLImageElement | null>(null)
const lensRef = ref<HTMLDivElement | null>(null)
const resultRef = ref<HTMLDivElement | null>(null)

const isZooming = ref(false)

let zoomX = 1
let zoomY = 1

const moveLens = (event: MouseEvent) => {
  if (!canZoom.value || isFallbackImage.value) return

  const image = imageRef.value
  const lens = lensRef.value
  const result = resultRef.value

  if (!image || !lens || !result) return

  // Ask the browser, the image's positions on the screen and its size
  const rect = image.getBoundingClientRect()

  // Cursor coordinates relative to the displayed image
  // Find the elements and the cursor's position
  let x = event.clientX - rect.left
  let y = event.clientY - rect.top

  // Center the lens around the cursor
  x -= lens.offsetWidth / 2
  y -= lens.offsetHeight / 2

  // Keep the lens inside the image -- Box in the lens
  x = Math.max(0, Math.min(x, rect.width - lens.offsetWidth))
  y = Math.max(0, Math.min(y, rect.height - lens.offsetHeight))

  // Move the lens
  lens.style.left = `${x}px`
  lens.style.top = `${y}px`

  // Align the magnified background with the lens
  //  Update the magnified view
  result.style.backgroundPosition = `-${x * zoomX}px -${y * zoomY}px`
}

const setupZoom = () => {
  if (!canZoom.value || isFallbackImage.value) return

  // To use template refs
  const image = imageRef.value
  const lens = lensRef.value
  const result = resultRef.value

  // Check for null element
  if (!image || !lens || !result) return

  const lensWidth = lens.offsetWidth
  const lensHeight = lens.offsetHeight
  const resultWidth = result.offsetWidth
  const resultHeight = result.offsetHeight

  // Ensure that lens and zoom panel have valid dimensions before continuing
  if (!lensWidth || !lensHeight || !resultWidth || !resultHeight) return

  // Calculate X & Y zoom based on image vs zoom view sizes
  zoomX = resultWidth / lensWidth
  zoomY = resultHeight / lensHeight

  result.style.backgroundImage = `url("${image.currentSrc}")`
  result.style.backgroundSize = `${image.clientWidth * zoomX}px ${image.clientHeight * zoomY}px`
}

const showZoom = async () => {
  if (!canZoom.value || isFallbackImage.value) return

  isZooming.value = true
  // Continue only after vue has finished updating the DOM
  await nextTick()
  setupZoom()
}

const handleImageError = () => {
  if (imageSrc.value === fallbackImage) return

  isFallbackImage.value = true
  isZooming.value = false
  imageSrc.value = fallbackImage
}

onMounted(() => {
  const image = imageRef.value
  if (!image) return

  if (image.complete && image.naturalWidth > 0 && !isFallbackImage.value) {
    setupZoom()
  } else {
    image.addEventListener('load', setupZoom)
  }
})

// Cleanup function
onUnmounted(() => {
  imageRef.value?.removeEventListener('load', setupZoom)
})
</script>

<template>
  <div class="relative w-full">
    <div
      class="w-full cursor-default"
      :class="{ 'cursor-crosshair': canZoom && !isFallbackImage }"
      @mouseenter="showZoom"
      @mouseleave="isZooming = false"
      @mousemove="moveLens"
    >
      <!-- Providing the refs here allows JS to access the elements: HTMLImageElement -->
      <!-- and its associated properties such as naturalWidth,clientWidth and complete -->
      <img
        ref="imageRef"
        :src="imageSrc"
        :alt="props.alt"
        class="absolute inset-0 block h-full w-full object-cover"
        @error="handleImageError"
      />

      <!-- Providing the refs here allows JS to access the elements: HTMLDivElement -->
      <!-- and its associated properties such as offsetWidth, offsetHeight and style -->

      <div
        v-show="isZooming"
        ref="lensRef"
        class="pointer-events-none absolute h-25 w-25 border border-[#888] bg-blue-500/25"
      />
      <div
        v-show="isZooming"
        ref="resultRef"
        class="absolute top-0 left-full z-50 ml-4 h-140 w-160 shrink-0 bg-no-repeat"
      />
    </div>
  </div>
</template>
