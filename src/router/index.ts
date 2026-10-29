import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/ShopLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'product/:name',
          name: 'product-detail',
          component: () => import('@/views/ProductDetailView.vue'),
        },

        {
          path: 'cart',
          name: 'cart',
          component: () => import('@/views/CartView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],

  // scrollBehavior() {
  //   return { top: 0 }
  // },
})

// redirect to login page for protected routes
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuthStore().isAuth) {
    return { name: 'login' }
  }
})

export default router
