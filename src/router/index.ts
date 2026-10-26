import ShopLayout from '@/layouts/ShopLayout.vue'
import {
  CartView,
  HomeView,
  LoginView,
  NotFoundView,
  ProductDetailView,
  ProfileView,
  RegisterView,
} from '@/views'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ShopLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
        },
        {
          path: 'login',
          name: 'login',
          component: LoginView,
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
        },
        {
          path: 'product/:name',
          name: 'product-detail',
          component: ProductDetailView,
        },

        {
          path: 'cart',
          name: 'cart',
          component: CartView,
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: NotFoundView,
        },
      ],
    },
  ],
})

export default router
