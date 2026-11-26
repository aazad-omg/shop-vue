import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores'

import App from './App.vue'
import router from './router'
import '@/assets/styles/main.css'
import 'vue-sonner/style.css'

// Import Cropper.js styles and VuePictureCropper styles
import 'cropperjs/dist/cropper.css'
import 'vue-picture-cropper/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// intial hydration of auth values from supabase's browser storage
// create a bootstrap/init file
// dont directly use vue features in main.ts
await useAuthStore(pinia).initialize()

app.use(router)
app.mount('#app')
