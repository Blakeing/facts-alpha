<template>
  <FPageCard
    :busy="busy"
    :class="{ 'fill-height': fillHeight }"
    :error="error"
    :fill-height="fillHeight"
    :subtitle="subtitle"
    :title="title"
    @error="handleError"
  >
    <template
      v-if="$slots.commands"
      #commands
    >
      <slot name="commands" />
    </template>

    <!-- Filters slot (e.g., for status chips) -->
    <slot name="filters" />

    <!-- Search Field -->
    <v-text-field
      v-if="searchable"
      v-model="searchValue"
      class="mb-4"
      clearable
      density="compact"
      hide-details
      :placeholder="searchPlaceholder"
      prepend-inner-icon="mdi-magnify"
      style="max-width: 400px"
      variant="outlined"
    />

    <!-- Data Table -->
    <FDataTable
      :columns="columns"
      :empty-icon="emptyIcon"
      :empty-subtitle="emptySubtitle"
      :empty-title="emptyTitle"
      :items="items"
      :loading="loading"
      :search="searchValue"
      v-bind="$attrs"
      @click:row="handleRowClick"
      @edit="handleEdit"
    >
      <!-- Pass through all item slots -->
      <template
        v-for="(_, name) in itemSlots"
        :key="name"
        #[name]="slotData"
      >
        <slot
          :name="name"
          v-bind="slotData ?? {}"
        />
      </template>

      <!-- Empty state slot -->
      <template
        v-if="$slots.empty"
        #empty
      >
        <slot name="empty" />
      </template>
    </FDataTable>
  </FPageCard>
</template>

<script lang="ts" setup generic="T">
  /**
   * FListCard - Data table with search, loading, and empty states
   *
   * Combines FPageCard + FDataTable for a complete list view component.
   *
   * @example
   * ```vue
   * <FListCard
   *   title="Cases"
   *   :items="cases"
   *   :columns="[
   *     { key: 'caseNumber', title: 'Case #', width: 120 },
   *     { key: 'decedentName', title: 'Decedent' },
   *     { key: 'status', title: 'Status' },
   *   ]"
   *   edit-enabled
   *   @edit="showEdit"
   * >
   *   <template #item.status="{ item }">
   *     <CaseStatusBadge :status="item.status" />
   *   </template>
   * </FListCard>
   * ```
   */
  import { computed, useSlots } from 'vue'
  import type { FColumn } from './FDataTable.vue'
  import FDataTable from './FDataTable.vue'
  import FPageCard from './FPageCard.vue'

  const props = withDefaults(
    defineProps<{
      /** Section title */
      title?: string
      /** Section subtitle */
      subtitle?: string
      /** Shows loading overlay when true (covers entire card) */
      busy?: boolean
      /** Error message - emits 'error' event when set */
      error?: string | null
      /** Table data items */
      items: T[]
      /** Column definitions */
      columns: FColumn<T>[]
      /** Table loading state (shows in table, not overlay) */
      loading?: boolean
      /** Show search field */
      searchable?: boolean
      /** Search field placeholder */
      searchPlaceholder?: string
      /** Search value (v-model:search) */
      search?: string
      /** Empty state icon */
      emptyIcon?: string
      /** Empty state title */
      emptyTitle?: string
      /** Empty state subtitle */
      emptySubtitle?: string
      /** Fill available height - table scrolls internally */
      fillHeight?: boolean
    }>(),
    {
      title: undefined,
      subtitle: undefined,
      busy: false,
      error: null,
      loading: false,
      searchable: true,
      searchPlaceholder: 'Search...',
      search: '',
      emptyIcon: undefined,
      emptyTitle: undefined,
      emptySubtitle: undefined,
      fillHeight: false,
    },
  )

  const emit = defineEmits<{
    error: [message: string]
    'click:row': [event: Event, data: { item: T }]
    'update:search': [value: string]
    edit: [item: T]
  }>()

  const searchValue = computed({
    get: () => props.search,
    set: (val: string) => emit('update:search', val || ''),
  })

  function handleRowClick(event: Event, data: { item: unknown }) {
    emit('click:row', event, data as { item: T })
  }

  function handleEdit(item: unknown) {
    emit('edit', item as T)
  }

  function handleError(message: string) {
    emit('error', message)
  }

  // Filter slots to only pass item.* slots to FDataTable
  const slots = useSlots()
  const itemSlots = computed(() => {
    const result: Record<string, unknown> = {}
    for (const name in slots) {
      if (name.startsWith('item.')) {
        result[name] = slots[name]
      }
    }
    return result
  })
</script>
