<template>
  <v-data-table
    :headers="computedHeaders"
    :items="items"
    :loading="loading"
    v-bind="$attrs"
  >
    <!-- Pass through all slots -->
    <template
      v-for="(_, name) in $slots"
      #[name]="slotData"
    >
      <slot
        :name="name"
        v-bind="slotData ?? {}"
      />
    </template>

    <!-- Empty state -->
    <template
      v-if="!items.length && !loading"
      #bottom
    >
      <div class="d-flex flex-column align-center justify-center pa-8 text-center">
        <v-icon
          v-if="emptyIcon"
          :icon="emptyIcon"
          size="48"
          color="medium-emphasis"
          class="mb-4"
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
  </v-data-table>
</template>

<script lang="ts" setup>
  /**
   * FDataTable - Data table with simplified column definitions
   *
   * Uses `columns` instead of `headers` for a cleaner API.
   * Includes built-in empty state support.
   */
  import { computed } from 'vue'

  export type FColumn = {
    key: string
    title: string
    sortable?: boolean
    align?: 'start' | 'center' | 'end'
    width?: string | number
  }

  export interface FDataTableProps {
    items: Record<string, unknown>[]
    /** Column definitions - maps to Vuetify's `headers` */
    columns: FColumn[]
    loading?: boolean
    emptyIcon?: string
    emptyTitle?: string
    emptySubtitle?: string
  }

  const props = withDefaults(defineProps<FDataTableProps>(), {
    loading: false,
    emptyIcon: undefined,
    emptyTitle: undefined,
    emptySubtitle: undefined,
  })

  // Map our columns to Vuetify's headers format
  const computedHeaders = computed(() =>
    props.columns.map((col) => ({
      key: col.key,
      title: col.title,
      sortable: col.sortable ?? true,
      align: col.align,
      width: col.width,
    })),
  )
</script>
