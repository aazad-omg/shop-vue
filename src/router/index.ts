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
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/product/:name',
      name: 'product-detail',
      component: ProductDetailView,
    },

    {
      path: '/cart',
      name: 'cart',
      component: CartView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

export default router
