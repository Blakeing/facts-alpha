<template>
  <v-breadcrumbs
    :items="vuetifyItems"
    v-bind="$attrs"
  >
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot name="prepend" />
    </template>

    <template #item="{ item, index }">
      <v-breadcrumbs-item
        :disabled="item.disabled"
        :to="item.href"
      >
        <v-icon
          v-if="items[index]?.icon"
          :icon="items[index].icon"
          size="small"
          start
        />
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>

    <template
      v-if="$slots.divider"
      #divider
    >
      <slot name="divider" />
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
  /**
   * FBreadcrumbs - Navigation breadcrumb trail
   *
   * Simplified API for v-breadcrumbs with typed items and icon support.
   *
   * @example
   * <FBreadcrumbs :items="[
   *   { title: 'Home', to: '/', icon: 'mdi-home' },
   *   { title: 'Cases', to: '/cases' },
   *   { title: 'Edit', disabled: true }
   * ]" />
   */
  export interface BreadcrumbItem {
    /** Display text */
    title: string
    /** Route path (makes item clickable) */
    to?: string
    /** Optional icon (MDI icon name) */
    icon?: string
    /** Disable the item (typically for current page) */
    disabled?: boolean
  }

  export interface FBreadcrumbsProps {
    /** Breadcrumb items */
    items: BreadcrumbItem[]
  }
</script>

<script lang="ts" setup>
  import { computed } from 'vue'

  const props = defineProps<FBreadcrumbsProps>()

  // Convert our items to Vuetify's expected format
  const vuetifyItems = computed(() =>
    props.items.map((item) => ({
      title: item.title,
      href: item.to,
      disabled: item.disabled ?? false,
    })),
  )
</script>
