<template>
  <div :class="['f-data-table', { 'f-data-table--fill': fillHeight }]">
    <ag-grid-vue
      :theme="gridTheme"
      :rowData="items"
      :columnDefs="gridColumns"
      :defaultColDef="defaultColDef"
      :loading="loading"
      :getRowId="getRowId"
      :suppressCellFocus="true"
      :rowSelection="undefined"
      :loadingOverlayComponent="loadingOverlay"
      :noRowsOverlayComponent="noRowsOverlay"
      :noRowsOverlayComponentParams="noRowsOverlayParams"
      :domLayout="fillHeight ? 'normal' : 'autoHeight'"
      :pagination="pagination"
      :paginationPageSize="pageSize"
      :paginationPageSizeSelector="pageSizeOptions"
      @row-clicked="handleRowClick"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<script lang="ts" setup>
  /**
   * FDataTable - AG Grid powered data table
   *
   * Extends AG Grid's ColDef with a `key` shorthand and slot-based rendering.
   * Use any ColDef property - we just add conveniences on top.
   *
   * @example
   * ```vue
   * <FDataTable
   *   :items="cases"
   *   :columns="[
   *     { key: 'caseNumber', headerName: 'Case #', width: 120 },
   *     { key: 'status', headerName: 'Status' },
   *     { key: 'amount', headerName: 'Amount', filter: true, editable: true },
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
  import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    RowClickedEvent,
  } from 'ag-grid-community'
  import { AllCommunityModule, ModuleRegistry, themeMaterial } from 'ag-grid-community'
  import { AgGridVue } from 'ag-grid-vue3'
  import { computed, defineComponent, h, shallowRef, useSlots, type VNode } from 'vue'
  import { VIcon, VProgressCircular } from 'vuetify/components'

  // Register AG Grid modules once
  ModuleRegistry.registerModules([AllCommunityModule])

  // ============================================================================
  // Types
  // ============================================================================

  /**
   * Extended ColDef with a `key` shorthand.
   *
   * - `key` sets both `colId` and `field` (unless you override them)
   * - Slots `#item.{key}` automatically become cellRenderers
   * - All other ColDef properties work as documented by AG Grid
   */
  export interface FColumn<TData = unknown, TValue = unknown> extends ColDef<TData, TValue> {
    /**
     * Shorthand that sets both `colId` and `field`.
     * Also used for slot-based rendering: `#item.{key}`
     */
    key: string
  }

  export interface FDataTableProps {
    /** Row data array */
    items: unknown[]
    /** Column definitions (extends AG Grid ColDef with `key` shorthand) */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: FColumn<any>[]
    /** Loading state */
    loading?: boolean
    /** Field name to use as row ID (default: 'id') */
    rowIdField?: string
    /** Empty state icon */
    emptyIcon?: string
    /** Empty state title */
    emptyTitle?: string
    /** Empty state subtitle */
    emptySubtitle?: string
    /** Fill available height (uses normal domLayout with internal scrolling) */
    fillHeight?: boolean
    /** Enable pagination */
    pagination?: boolean
    /** Rows per page (default: 10) */
    pageSize?: number
    /** Page size options for dropdown (default: [10, 25, 50, 100]) */
    pageSizeOptions?: number[]
  }

  // ============================================================================
  // Props & Emits
  // ============================================================================

  const props = withDefaults(defineProps<FDataTableProps>(), {
    loading: false,
    rowIdField: 'id',
    emptyIcon: undefined,
    emptyTitle: 'No data',
    emptySubtitle: undefined,
    fillHeight: false,
    pagination: false,
    pageSize: 10,
    pageSizeOptions: () => [10, 25, 50, 100],
  })

  const emit = defineEmits<{
    'click:row': [event: Event, data: { item: unknown }]
  }>()

  // ============================================================================
  // Theme Configuration - Material 3 Aligned
  // ============================================================================

  const gridTheme = themeMaterial.withParams({
    accentColor: '#1867C0',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#1C1B1F',
    borderColor: '#CAC4D0',
    headerBackgroundColor: '#FFFFFF',
    headerTextColor: '#49454F',
    rowHoverColor: 'rgba(28, 27, 31, 0.08)',
    selectedRowBackgroundColor: 'rgba(24, 103, 192, 0.12)',
    oddRowBackgroundColor: 'transparent',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    headerFontSize: 14,
    headerFontWeight: 500,
    borderRadius: 12,
    spacing: 8,
    cellHorizontalPadding: 16,
    rowHeight: 52,
    wrapperBorder: false,
    rowBorder: true,
    columnBorder: false,
    headerRowBorder: true,
    headerColumnBorder: false,
  })

  // ============================================================================
  // Grid Setup
  // ============================================================================

  const slots = useSlots()
  const gridApi = shallowRef<GridApi | null>(null)

  const defaultColDef = computed<ColDef>(() => ({
    sortable: true,
    resizable: true,
    suppressMovable: true,
  }))

  function getRowId(params: GetRowIdParams): string {
    const data = params.data as Record<string, unknown>
    return String(data[props.rowIdField] ?? Math.random())
  }

  // ============================================================================
  // No Rows Overlay
  // ============================================================================

  interface NoRowsOverlayParams {
    icon?: string
    title?: string
    subtitle?: string
    actionSlot?: () => VNode[]
  }

  const noRowsOverlay = defineComponent({
    props: ['params'],
    setup(componentProps: { params: NoRowsOverlayParams }) {
      return () => {
        const params = componentProps.params

        const children: VNode[] = []

        // Icon
        if (params.icon) {
          children.push(
            h(VIcon, {
              icon: params.icon,
              size: 48,
              color: 'medium-emphasis',
              class: 'mb-4',
            }),
          )
        }

        // Title
        if (params.title) {
          children.push(h('p', { class: 'text-h6 mb-1' }, params.title))
        }

        // Subtitle
        if (params.subtitle) {
          children.push(h('p', { class: 'text-body-2 text-medium-emphasis mb-4' }, params.subtitle))
        }

        // Action slot
        if (params.actionSlot) {
          children.push(...params.actionSlot())
        }

        return h(
          'div',
          {
            class: 'f-data-table__empty',
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              textAlign: 'center',
            },
          },
          children,
        )
      }
    },
  })

  const noRowsOverlayParams = computed<NoRowsOverlayParams>(() => ({
    icon: props.emptyIcon,
    title: props.emptyTitle,
    subtitle: props.emptySubtitle,
    actionSlot: slots.empty,
  }))

  // ============================================================================
  // Loading Overlay
  // ============================================================================

  const loadingOverlay = defineComponent({
    setup() {
      return () =>
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            },
          },
          [
            h(VProgressCircular, {
              indeterminate: true,
              color: 'primary',
              size: 48,
              width: 4,
            }),
          ],
        )
    },
  })

  // ============================================================================
  // Cell Renderers
  // ============================================================================

  /**
   * Creates a Vue cell renderer component for a column slot
   */
  function createSlotRenderer(slotName: string) {
    return defineComponent({
      props: ['params'],
      setup(componentProps: { params: ICellRendererParams }) {
        return () => {
          const params = componentProps.params
          const slot = slots[slotName]
          if (slot) {
            return slot({ item: params.data, value: params.value })
          }
          return h('span', String(params.value ?? ''))
        }
      },
    })
  }

  /**
   * Maps FColumn definitions to AG Grid ColDef
   * - Spreads all ColDef properties from the column
   * - Sets colId and field from `key` (unless explicitly provided)
   * - Auto-wires slot-based cell renderers for #item.{key}
   */
  const gridColumns = computed<ColDef[]>(() =>
    props.columns.map((col): ColDef => {
      const { key, ...colDefProps } = col
      const slotName = `item.${key}`
      const hasSlot = !!slots[slotName]

      // Build ColDef: spread user props, then apply defaults
      const colDef: ColDef = {
        // User-provided ColDef properties take precedence
        ...colDefProps,
        // Set colId and field from key (user can override via spread)
        colId: colDefProps.colId ?? key,
        field: colDefProps.field ?? (colDefProps.valueGetter ? undefined : key),
        // Default flex if no width specified
        flex: colDefProps.width ? undefined : (colDefProps.flex ?? 1),
      }

      // Auto-wire slot-based cell renderer if slot exists
      if (hasSlot && !colDef.cellRenderer) {
        colDef.cellRenderer = createSlotRenderer(slotName)
        // Disable type inference for slot-rendered columns
        colDef.cellDataType = false
      }

      return colDef
    }),
  )

  function onGridReady(params: GridReadyEvent) {
    gridApi.value = params.api
  }

  function handleRowClick(event: RowClickedEvent) {
    emit('click:row', event.event as Event, { item: event.data })
  }

  // ============================================================================
  // Expose
  // ============================================================================

  defineExpose({ gridApi })
</script>

<style scoped>
  .f-data-table {
    width: 100%;
  }

  /*
   * Auto-height mode: only apply min-height when empty overlay is shown
   * Uses :has() to conditionally expand - no wasted space with data
   */
  .f-data-table:not(.f-data-table--fill)
    :deep(.ag-root-wrapper:has(.ag-overlay-no-rows-wrapper))
    .ag-body-viewport {
    min-height: 300px;
  }

  /* Fill-height mode: grid fills container with internal scrolling */
  .f-data-table--fill {
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
  }

  .f-data-table--fill :deep(.ag-root-wrapper) {
    height: 100%;
  }

  /* Clickable rows */
  .f-data-table :deep(.ag-row) {
    cursor: pointer;
  }
</style>
