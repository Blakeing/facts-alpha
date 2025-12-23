<template>
  <v-data-table
    v-model="selectedItems"
    :class="['f-data-table', { 'f-data-table--clickable': hasRowClickListener }]"
    :headers="tableHeaders"
    :items="items"
    :items-per-page="pagination ? itemsPerPage : -1"
    :loading="loading"
    :search="search"
    :show-select="selectable"
    :sort-by="sortBy"
    :hide-default-footer="!pagination"
    item-value="id"
    return-object
    v-on="rowClickHandler"
  >
    <!-- Loading slot -->
    <template #loading>
      <v-skeleton-loader type="table-row@5" />
    </template>

    <!-- Empty state -->
    <template #no-data>
      <div class="f-data-table__empty">
        <v-icon
          v-if="emptyIcon"
          :icon="emptyIcon"
          class="mb-4"
          color="medium-emphasis"
          size="48"
        />
        <p
          v-if="emptyTitle"
          class="text-h6 mb-1"
        >
          {{ emptyTitle }}
        </p>
        <p
          v-if="emptySubtitle"
          class="text-body-2 text-medium-emphasis mb-4"
        >
          {{ emptySubtitle }}
        </p>
        <slot name="empty" />
      </div>
    </template>

    <!-- Actions column (auto-added when editEnabled) -->
    <template
      v-if="editEnabled"
      #item.actions="{ item }"
    >
      <slot
        name="item.actions"
        :item="item"
      >
        <!-- Default: pencil icon -->
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click.stop="emit('edit', item)"
        />
      </slot>
    </template>

    <!-- Dynamic cell slots -->
    <template
      v-for="col in columns"
      :key="col.key"
      #[`item.${col.key}`]="{ item, value }"
    >
      <slot
        :name="`item.${col.key}`"
        :item="item"
        :value="value"
      >
        <!-- Default: use valueFormatter if provided, otherwise raw value -->
        {{ formatCell(col, value, item) }}
      </slot>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
  /**
   * FDataTable - Vuetify v-data-table wrapper
   *
   * Extends Vuetify's native header format with:
   * - valueFormatter for cell formatting
   * - valueGetter for computed values
   * - Slot-based cell rendering
   * - Selection support
   * - Empty state customization
   *
   * @example
   * ```vue
   * <FDataTable
   *   :items="cases"
   *   :columns="[
   *     { key: 'caseNumber', title: 'Case #', width: 120 },
   *     { key: 'status', title: 'Status' },
   *     { key: 'amount', title: 'Amount', align: 'end', valueFormatter: (p) => formatCurrency(p.value) },
   *   ]"
   *   empty-icon="mdi-folder-open-outline"
   *   empty-title="No cases found"
   * >
   *   <template #item.status="{ item }">
   *     <CaseStatusBadge :status="item.status" />
   *   </template>
   * </FDataTable>
   * ```
   */
  import { computed, ref, useAttrs, watch } from 'vue'

  // ============================================================================
  // Types
  // ============================================================================

  interface ValueFormatterParams<TValue = unknown, TData = unknown> {
    value: TValue
    data: TData
  }

  /**
   * Column definition - extends Vuetify's DataTableHeader with formatting helpers
   */
  export interface FColumn<TData = unknown, TValue = unknown> {
    /** Unique key - maps to field name and slot name (Vuetify native) */
    key: string
    /** Header text (Vuetify native) */
    title?: string
    /** Column width in pixels (Vuetify native) */
    width?: number | string
    /** Whether column is sortable (Vuetify native, default: true) */
    sortable?: boolean
    /** Text alignment (Vuetify native) */
    align?: 'start' | 'center' | 'end'
    /** Value formatter function (FDataTable extension) */
    valueFormatter?: (params: ValueFormatterParams<TValue, TData>) => string
    /** Value getter for computed values (FDataTable extension) */
    valueGetter?: (params: { data: TData }) => TValue
  }

  export interface FDataTableProps {
    /** Row data array */
    items: unknown[]
    /** Column definitions */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: FColumn<any>[]
    /** Loading state */
    loading?: boolean
    /** Search/filter string - filters all columns */
    search?: string
    /** Empty state icon */
    emptyIcon?: string
    /** Empty state title */
    emptyTitle?: string
    /** Empty state subtitle */
    emptySubtitle?: string
    /** Enable row selection with checkboxes */
    selectable?: boolean
    /** Enable pagination (default: false - shows all items) */
    pagination?: boolean
    /** Items per page when pagination enabled (default: 10) */
    itemsPerPage?: number
    /** Enable actions column with edit button (prepended as first column) */
    editEnabled?: boolean
    /** Width of actions column (default: 60) */
    actionsColumnWidth?: number | string
  }

  // ============================================================================
  // Props & Emits
  // ============================================================================

  const props = withDefaults(defineProps<FDataTableProps>(), {
    loading: false,
    search: '',
    emptyIcon: undefined,
    emptyTitle: 'No data',
    emptySubtitle: undefined,
    selectable: false,
    pagination: false,
    itemsPerPage: 10,
    editEnabled: false,
    actionsColumnWidth: 60,
  })

  const emit = defineEmits<{
    'click:row': [event: Event, data: { item: unknown }]
    'update:selected': [items: unknown[]]
    edit: [item: unknown]
  }>()

  // ============================================================================
  // Selection
  // ============================================================================

  const selectedItems = ref<unknown[]>([])

  watch(selectedItems, (newVal) => {
    emit('update:selected', newVal)
  })

  // ============================================================================
  // Headers
  // ============================================================================

  // Actions column definition (prepended when editEnabled)
  const actionsColumn = {
    key: 'actions',
    title: '',
    width:
      typeof props.actionsColumnWidth === 'number'
        ? `${props.actionsColumnWidth}px`
        : props.actionsColumnWidth,
    sortable: false,
    align: 'start' as const,
  }

  // Pass columns directly to Vuetify (already compatible format)
  const tableHeaders = computed(() => {
    const headers = props.columns.map((col) => ({
      key: col.key,
      title: col.title ?? col.key,
      width: typeof col.width === 'number' ? `${col.width}px` : col.width,
      sortable: col.sortable !== false,
      align: col.align ?? 'start',
    }))

    // Prepend actions column when editEnabled (legacy pattern)
    if (props.editEnabled) {
      return [actionsColumn, ...headers]
    }

    return headers
  })

  // Default sort
  const sortBy = ref<{ key: string; order: 'asc' | 'desc' }[]>([])

  // ============================================================================
  // Cell Formatting
  // ============================================================================

  function formatCell(col: FColumn, value: unknown, item: unknown): string {
    // Use valueGetter if provided
    if (col.valueGetter) {
      value = col.valueGetter({ data: item })
    }

    // Use valueFormatter if provided
    if (col.valueFormatter) {
      return col.valueFormatter({ value, data: item })
    }

    // Default: convert to string
    return value != null ? String(value) : ''
  }

  // ============================================================================
  // Events
  // ============================================================================

  // Check if parent has a click:row listener
  const attrs = useAttrs()
  const hasRowClickListener = computed(() => 'onClick:row' in attrs)

  // Only bind click:row handler if parent is listening
  const rowClickHandler = computed(() =>
    hasRowClickListener.value ? { 'click:row': handleRowClick } : {},
  )

  function handleRowClick(event: Event, { item }: { item: unknown }) {
    emit('click:row', event, { item })
  }
</script>

<style scoped>
  .f-data-table__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 16px;
    text-align: center;
  }

  /* Only show pointer cursor on rows when clickable */
  .f-data-table :deep(tbody tr) {
    cursor: default;
  }

  .f-data-table--clickable :deep(tbody tr) {
    cursor: pointer;
  }
</style>
