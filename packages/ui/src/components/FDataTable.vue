<template>
  <div class="f-data-table">
    <!-- Empty state when no items -->
    <EmptyState
      v-if="!loading && items.length === 0"
      :title="emptyTitle"
      :subtitle="emptySubtitle"
      :icon="emptyIcon"
    >
      <template v-if="$slots.empty" #actions>
        <slot name="empty" />
      </template>
    </EmptyState>

    <!-- Data table -->
    <v-data-table
      v-else
      v-model:sort-by="sortByModel"
      v-model:items-per-page="itemsPerPageModel"
      v-model:page="pageModel"
      :headers="computedHeaders"
      :items="items"
      :item-value="itemValue"
      :loading="loading"
      :hover="hover"
      :density="density"
      :show-select="showSelect"
      :return-object="returnObject"
      v-bind="$attrs"
    >
      <!-- Pass through all slots -->
      <template v-for="(_, name) in $slots" #[name]="slotData" :key="name">
        <slot :name="name" v-bind="slotData" />
      </template>

      <!-- Loading state -->
      <template #loading>
        <v-skeleton-loader type="table-row@5" />
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" setup generic="T">
import { computed } from 'vue'
import EmptyState from './EmptyState.vue'

export type TableDensity = 'default' | 'comfortable' | 'compact'
export type SortDirection = 'asc' | 'desc'

export interface SortBy {
  key: string
  order: SortDirection
}

/**
 * Simplified column definition
 */
export interface FColumn {
  /** Column key (property name on item) */
  key: string
  /** Display title */
  title: string
  /** Enable sorting */
  sortable?: boolean
  /** Column alignment */
  align?: 'start' | 'center' | 'end'
  /** Fixed width */
  width?: string | number
  /** Custom cell slot name */
  slot?: string
}

export interface FDataTableProps<T> {
  /** Array of items to display */
  items: T[]
  /** Column definitions */
  columns: FColumn[]
  /** Property to use as unique key */
  itemValue?: string
  /** Loading state */
  loading?: boolean
  /** Show hover effect on rows */
  hover?: boolean
  /** Table density */
  density?: TableDensity
  /** Enable row selection */
  showSelect?: boolean
  /** Return full objects for selection */
  returnObject?: boolean
  /** Sort configuration */
  sortBy?: SortBy[]
  /** Items per page */
  itemsPerPage?: number
  /** Current page */
  page?: number
  /** Empty state title */
  emptyTitle?: string
  /** Empty state subtitle */
  emptySubtitle?: string
  /** Empty state icon */
  emptyIcon?: string
}

const props = withDefaults(defineProps<FDataTableProps<T>>(), {
  itemValue: 'id',
  loading: false,
  hover: true,
  density: 'comfortable',
  showSelect: false,
  returnObject: false,
  sortBy: () => [],
  itemsPerPage: 10,
  page: 1,
  emptyTitle: 'No data',
  emptySubtitle: 'There are no items to display.',
  emptyIcon: 'mdi-database-off-outline',
})

const emit = defineEmits<{
  'update:sortBy': [value: SortBy[]]
  'update:itemsPerPage': [value: number]
  'update:page': [value: number]
}>()

// Convert simplified columns to Vuetify headers format
const computedHeaders = computed(() =>
  props.columns.map((col) => ({
    key: col.key,
    title: col.title,
    sortable: col.sortable ?? false,
    align: col.align ?? 'start',
    width: col.width,
  }))
)

const sortByModel = computed({
  get: () => props.sortBy,
  set: (value) => emit('update:sortBy', value),
})

const itemsPerPageModel = computed({
  get: () => props.itemsPerPage,
  set: (value) => emit('update:itemsPerPage', value),
})

const pageModel = computed({
  get: () => props.page,
  set: (value) => emit('update:page', value),
})
</script>

<style scoped>
.f-data-table {
  width: 100%;
}
</style>

