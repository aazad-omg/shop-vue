import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAdmin?: boolean
    requiresAuth?: boolean
  }
}

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
          path: 'product/:slug',
          name: 'product-detail',
          component: () => import('@/views/ProductDetailView.vue'),
        },

        {
          path: 'purchase',
          name: 'purchase',
          component: () => import('@/views/PurchaseView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/AdminDashboardView.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/AdminProductsView.vue'),
        },
        {
          path: 'products/new',
          name: 'admin-product-create',
          component: () => import('@/views/AdminProductFormView.vue'),
        },
        {
          path: 'products/:id/edit',
          name: 'admin-product-edit',
          component: () => import('@/views/AdminProductFormView.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
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
})

// redirect to login page for protected routes
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuth) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !authStore.canManageProducts()) return { name: 'home' }

  const isShopOrAdminRoute = to.matched.some(
    (route) => route.path === '/' || route.path === '/admin',
  )

  if (authStore.isAuth && !isShopOrAdminRoute) return { name: 'home' }
})

export default router
