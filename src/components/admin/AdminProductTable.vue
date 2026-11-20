<script setup lang="ts">
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/vue-table'
import { Pencil as EditIcon, Ellipsis } from '@lucide/vue'
import { computed } from 'vue'
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components'

import type { AdminProduct } from '@/types/admin'
import type { Product } from '@/types'
import TableHeadSorter from './TableHeadSorter.vue'

type AdminProductRow = Product & Partial<Pick<AdminProduct, 'sku' | 'stock' | 'status'>>

const props = defineProps<{
  products: AdminProductRow[]
  loading?: boolean
}>()

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text },
})

const columnHelper = createColumnHelper<typeof features, AdminProductRow>()
const columns = columnHelper.columns([
  columnHelper.accessor('name', { id: 'name' }),
  columnHelper.accessor('price', { id: 'price', sortFn: 'basic' }),
])

const table = useTable({
  features,
  data: computed(() => props.products),
  columns,
})

const nameColumn = table.getColumn('name')
const priceColumn = table.getColumn('price')

function toggleNameSort() {
  if (!nameColumn) return
  nameColumn.toggleSorting(nameColumn.getIsSorted() !== 'asc')
}

function togglePriceSort() {
  if (!priceColumn) return
  priceColumn.toggleSorting(priceColumn.getIsSorted() !== 'asc')
}
</script>

<template>
  <Table class="min-w-180 border-collapse text-left">
    <TableHeader class="border-y border-stone-100">
      <TableRow
        class="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700 hover:bg-transparent"
      >
        <TableHeadSorter
          label="Product"
          sortable
          class="px-5 py-3.5 font-semibold text-brand-700"
          :sort-direction="nameColumn?.getIsSorted()"
          @sort="toggleNameSort"
        />
        <TableHeadSorter label="SKU" />
        <TableHeadSorter label="Category" />
        <TableHeadSorter
          label="Price"
          sortable
          :sort-direction="priceColumn?.getIsSorted()"
          @sort="togglePriceSort"
        />
        <TableHeadSorter label="Stock" />
        <TableHeadSorter label="Status" />
        <TableHeadSorter label="Actions">
          <span class="sr-only">Actions</span>
        </TableHeadSorter>
      </TableRow>
    </TableHeader>
    <TableBody class="divide-y divide-stone-100">
      <TableEmpty v-if="loading" :colspan="7">
        <div class="flex items-center gap-2 text-sm text-stone-500" role="status">
          <Spinner class="size-8 text-brand-700" aria-hidden="true" />
          <p class="text-brand-700 font-medium">Loading products...</p>
        </div>
      </TableEmpty>
      <template v-else>
        <TableRow
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="group hover:bg-stone-50/70"
        >
          <TableCell class="px-5 py-3.5">
            <div class="flex items-center gap-3">
              <img
                :src="row.original.image"
                :alt="row.original.name"
                class="size-11 rounded-xl bg-stone-100 object-cover"
              />
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-stone-800">{{ row.original.name }}</p>
                <p class="mt-0.5 truncate text-xs text-stone-400">{{ row.original.subtitle }}</p>
              </div>
            </div>
          </TableCell>
          <TableCell class="px-4 py-3.5 text-xs font-medium text-stone-500">
            {{ row.original.sku ?? '—' }}
          </TableCell>
          <TableCell class="px-4 py-3.5 text-sm text-stone-600">
            {{ row.original.categories[0] }}
          </TableCell>
          <TableCell class="px-4 py-3.5 text-sm font-medium text-stone-700">
            NPR {{ row.original.price }}
          </TableCell>
          <TableCell class="px-4 py-3.5">
            <span
              class="text-sm font-medium"
              :class="
                row.original.stock !== undefined && row.original.stock <= 8
                  ? 'text-amber-700'
                  : 'text-stone-700'
              "
            >
              {{ row.original.stock ?? '—' }}
            </span>
            <span v-if="row.original.stock !== undefined" class="ml-1 text-xs text-stone-400">
              units
            </span>
          </TableCell>
          <TableCell class="px-4 py-3.5">
            <Badge
              v-if="row.original.status"
              variant="secondary"
              class="border-transparent px-2.5 py-1 text-[11px] font-semibold"
              :class="{
                'bg-emerald-50 text-emerald-700': row.original.status === 'Active',
                'bg-amber-50 text-amber-700': row.original.status === 'Draft',
                'bg-rose-50 text-rose-700': row.original.status === 'Out of stock',
              }"
            >
              {{ row.original.status }}
            </Badge>
            <span v-else class="text-sm text-stone-400">—</span>
          </TableCell>
          <TableCell class="px-4 py-3.5 text-right">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <RouterLink
                    :to="{ name: 'admin-product-edit', params: { id: row.original.id } }"
                    class="inline-flex size-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-white hover:text-stone-800"
                    :aria-label="`Edit ${row.original.name}`"
                  >
                    <EditIcon :size="20" color="#2a3a5e" :stroke-width="1.75" />
                  </RouterLink>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="inline-flex size-8 items-center justify-center hover:cursor-pointer rounded-lg text-stone-400 transition-colors hover:bg-white hover:text-stone-800"
                  :aria-label="`More actions for ${row.original.name}`"
                >
                  <Ellipsis :size="20" color="#2a3a5e" :stroke-width="1.75" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                :side-offset="8"
                class="w-44 rounded-xl border-stone-200 bg-white text-stone-700 shadow-lg"
              >
                <DropdownMenuItem class="cursor-pointer px-3 py-2"> View details </DropdownMenuItem>
                <DropdownMenuItem class="cursor-pointer px-3 py-2"> Duplicate </DropdownMenuItem>
                <DropdownMenuSeparator class="bg-stone-100" />
                <DropdownMenuItem class="cursor-pointer px-3 py-2 text-amber-700">
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" class="cursor-pointer px-3 py-2">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
