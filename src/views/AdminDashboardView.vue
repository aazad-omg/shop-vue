<script setup lang="ts">
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Package,
  TriangleAlert,
  TrendingUp,
  NepaliRupee,
} from '@lucide/vue'
import { RouterLink } from 'vue-router'
import AdminMetricCard from '@/components/admin/AdminMetricCard.vue'
import AdminProductTable from '@/components/admin/AdminProductTable.vue'
import AdminSalesChart from '@/components/admin/AdminSalesChart.vue'
import { ADMIN_PRODUCTS } from '@/data/adminProducts'
</script>

<template>
  <section class="space-y-7">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-brand-900 sm:text-3xl">
          ShopVue Store
        </h1>
        <p class="mt-2 text-sm text-stone-500">A visualization of your store’s performance.</p>
      </div>
      <div
        class="inline-flex w-fit items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-600 shadow-sm"
      >
        <CalendarDays class="size-4 text-stone-400" />
        Last 30 days
      </div>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminMetricCard
        label="Total sales"
        value="NPR 284,500"
        change="+12.8%"
        comparison="vs. previous period"
        tone="green"
      >
        <template #icon> <NepaliRupee :size="30" color="#dd0808" :stroke-width="2.5" /> </template>
      </AdminMetricCard>
      <AdminMetricCard
        label="Orders"
        value="1,284"
        change="+8.2%"
        comparison="vs. previous period"
        tone="blue"
      >
        <template #icon><ClipboardList class="size-5" /></template>
      </AdminMetricCard>
      <AdminMetricCard
        label="Active products"
        value="86"
        change="+4"
        comparison="added this month"
        tone="violet"
      >
        <template #icon><Package class="size-5" /></template>
      </AdminMetricCard>
      <AdminMetricCard
        label="Low stock"
        value="4 items"
        change="Needs attention"
        comparison="at or below 8 units"
        tone="amber"
      >
        <template #icon><TriangleAlert class="size-5" /></template>
      </AdminMetricCard>
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(270px,0.8fr)]">
      <section class="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-stone-900">Sales overview</h2>
            <p class="mt-1 text-sm text-stone-500">Your store’s sales performance over time</p>
          </div>
          <div class="flex items-center gap-2 text-emerald-700">
            <TrendingUp class="size-4" />
            <span class="text-sm font-semibold">12.8%</span>
          </div>
        </div>
        <AdminSalesChart />
      </section>

      <section class="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-stone-900">Order activity</h2>
            <p class="mt-1 text-sm text-stone-500">Order status breakdown</p>
          </div>
          <span class="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
            1,284 total
          </span>
        </div>
        <div class="mt-7 flex items-center gap-5">
          <div
            class="relative flex size-28 shrink-0 items-center justify-center rounded-full"
            style="background: conic-gradient(#292524 0 64%, #a8a29e 64% 84%, #e7e5e4 84% 100%)"
            role="img"
            aria-label="Order status illustration"
          >
            <div class="flex size-19 flex-col items-center justify-center rounded-full bg-white">
              <span class="text-xl font-semibold text-stone-900">1.2k</span>
              <span class="text-[10px] text-stone-400">orders</span>
            </div>
          </div>
          <div class="min-w-0 flex-1 space-y-3">
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="flex items-center gap-2 text-stone-600">
                <span class="size-2 rounded-full bg-stone-800"></span>Completed
              </span>
              <span class="font-semibold text-stone-800">64%</span>
            </div>
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="flex items-center gap-2 text-stone-600">
                <span class="size-2 rounded-full bg-stone-400"></span>Processing
              </span>
              <span class="font-semibold text-stone-800">20%</span>
            </div>
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="flex items-center gap-2 text-stone-600">
                <span class="size-2 rounded-full bg-stone-200"></span>Cancelled
              </span>
              <span class="font-semibold text-stone-800">16%</span>
            </div>
          </div>
        </div>
        <div class="mt-7 rounded-xl bg-stone-50 p-4">
          <div class="flex items-center gap-2 text-sm font-medium text-stone-800">
            <ArrowUpRight class="size-4 text-emerald-700" />
            Orders are up this month
          </div>
          <p class="mt-1.5 pl-6 text-xs leading-5 text-stone-500">
            This chart is a visual preview using sample analytics.
          </p>
        </div>
      </section>
    </div>

    <section class="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <div>
          <h2 class="text-base font-semibold text-stone-900">Products</h2>
          <p class="mt-1 text-sm text-stone-500">A quick look at your product inventory</p>
        </div>
        <RouterLink
          :to="{ name: 'admin-products' }"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 transition hover:text-stone-950"
        >
          View all products
          <ArrowUpRight class="size-4" />
        </RouterLink>
      </div>
      <AdminProductTable :products="ADMIN_PRODUCTS.slice(0, 5)" />
      <div class="border-t border-stone-100 px-5 py-3 text-xs text-stone-400 sm:px-6">
        Sample inventory for layout preview
      </div>
    </section>
  </section>
</template>
