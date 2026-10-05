<script setup lang="ts">
import { BaseButton } from '@/components'
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const categories = ref<string[]>([
  'All goods',
  'Kitchen',
  'Home',
  'Audio & Tech',
  'Travel',
  'Outdoors',
  'Stationery',
  'Seasonal markdowns',
])

const products = ref([
  {
    id: 1,
    name: 'Ceramic Mug',
    subtitle: 'Handcrafted',
    price: 24,
    description: 'A cozy ceramic mug designed for warm drinks and slower mornings.',
    image:
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Desk Lamp',
    subtitle: 'Minimal design',
    price: 39,
    description: 'Soft ambient lighting for productive evenings and cozy corners.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Leather Tote',
    subtitle: 'Everyday carry',
    price: 58,
    description: 'A structured tote made for commute days, markets, and weekend travel.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Bluetooth Speaker',
    subtitle: 'Portable sound',
    price: 69,
    description: 'Clear audio in a compact body for your desk, patio, and playlists.',
    image:
      'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Travel Backpack',
    subtitle: 'Adventure ready',
    price: 82,
    description: 'Comfortable storage for quick getaways and busy city days alike.',
    image:
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    name: 'Notebook Set',
    subtitle: 'Paper goods',
    price: 18,
    description: 'Soft-touch pages and sturdy covers for jotting ideas and planning ahead.',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    name: 'Throw Blanket',
    subtitle: 'Warm textures',
    price: 44,
    description: 'A lightweight layer for reading corners, movie nights, and chilly mornings.',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    name: 'Wireless Headphones',
    subtitle: 'Immersive audio',
    price: 95,
    description: 'Comfortable, all-day listening with a sleek finish and deep bass.',
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    name: 'Thermos Bottle',
    subtitle: 'Everyday essential',
    price: 32,
    description: 'Keeps drinks warm and ready through long days, commutes, and hikes.',
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 10,
    name: 'Candle Trio',
    subtitle: 'Home ambiance',
    price: 27,
    description: 'Three layered scents to soften a room and elevate a quiet evening.',
    image:
      'https://images.unsplash.com/photo-1602872029707-8d1b9b4f7b6a?auto=format&fit=crop&w=900&q=80',
  },
])

const addToCart = () => {
  alert('Item added to cart!')
}

const handleLogout = () => {
  alert('Logged out successfully!')
  router.replace('/login')
}
</script>

<template>
  <!-- Root div -->
  <div class="min-h-screen bg-amber-50 justify-center items-center">
    <div>
      <nav class="flex justify-around items-center bg-blue-200 py-2">
        <div>Logo</div>
        <div>Search</div>
        <RouterLink to="/profile">
          <BaseButton> <div>Profile Icon</div> </BaseButton>
        </RouterLink>

        <div>Cart Icon</div>

        <BaseButton @click="handleLogout">Log out</BaseButton>
      </nav>
    </div>
    <!-- Category Navigation -->
    <nav>
      <ul class="grid grid-cols-2 gap-4 list-none sm:grid-cols-4 lg:grid-cols-8 justify-center">
        <li
          v-for="(category, index) in categories"
          :key="index"
          class="border-2 bg-red-300 text-center"
        >
          <p>{{ category }}</p>
        </li>
      </ul>
    </nav>

    <div class="mt-8 px-4">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <RouterLink
          v-for="product in products"
          :key="product.id"
          :to="`/product/${product.id}`"
          class="hover:cursor-pointer"
        >
          <div class="mx-auto max-w-xs overflow-hidden rounded-2xl bg-white shadow-lg">
            <img :src="product.image" :alt="product.name" class="h-56 w-full object-cover" />
            <div class="p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-gray-800">{{ product.name }}</h2>
                  <p class="text-sm text-gray-500">{{ product.subtitle }}</p>
                </div>
                <span class="text-lg font-bold text-amber-700">${{ product.price }}</span>
              </div>
              <p class="mt-3 text-sm text-gray-600">{{ product.description }}</p>
              <BaseButton class="mt-4 w-full" @click.stop.prevent="addToCart"
                >Add to cart</BaseButton
              >
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
