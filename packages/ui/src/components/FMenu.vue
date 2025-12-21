<template>
  <v-menu
    v-model="isOpen"
    :close-on-content-click="closeOnClick"
    :location="location"
    v-bind="$attrs"
  >
    <template #activator="{ props: activatorProps }">
      <slot
        name="activator"
        :props="activatorProps"
        :is-open="isOpen"
      />
    </template>

    <v-list
      :density="density"
      :min-width="minWidth"
    >
      <!-- Items from prop -->
      <template v-if="items.length > 0">
        <template
          v-for="(item, index) in items"
          :key="item.value ?? index"
        >
          <v-divider
            v-if="item.divider"
            class="my-1"
          />
          <v-list-item
            v-else
            :disabled="item.disabled"
            :prepend-icon="item.icon"
            :title="item.title"
            :value="item.value"
            @click="handleItemClick(item)"
          />
        </template>
      </template>

      <!-- Slot for custom content -->
      <slot v-else />
    </v-list>
  </v-menu>
</template>

<script lang="ts">
  /**
   * FMenu - Dropdown menu component
   *
   * Simplified API for v-menu with built-in v-list support.
   * Can use either `items` prop for simple menus or default slot for custom content.
   *
   * @example
   * // Simple menu with items
   * <FMenu :items="[
   *   { title: 'Edit', icon: 'mdi-pencil', value: 'edit' },
   *   { divider: true },
   *   { title: 'Delete', icon: 'mdi-delete', value: 'delete' }
   * ]" @select="handleAction">
   *   <template #activator="{ props }">
   *     <FButton v-bind="props" icon="mdi-dots-vertical" />
   *   </template>
   * </FMenu>
   *
   * @example
   * // Custom content
   * <FMenu>
   *   <template #activator="{ props }">
   *     <FButton v-bind="props">Options</FButton>
   *   </template>
   *   <v-list-item title="Custom Item" />
   * </FMenu>
   */
  export interface MenuItem {
    /** Display text */
    title?: string
    /** Optional icon (MDI icon name) */
    icon?: string
    /** Value emitted on click */
    value?: string | number
    /** Disable the item */
    disabled?: boolean
    /** Render as divider instead of item */
    divider?: boolean
  }

  export interface FMenuProps {
    /** Menu items (alternative to default slot) */
    items?: MenuItem[]
    /** Menu position relative to activator */
    location?:
      | 'top'
      | 'bottom'
      | 'start'
      | 'end'
      | 'top start'
      | 'top end'
      | 'bottom start'
      | 'bottom end'
    /** Close menu when item is clicked */
    closeOnClick?: boolean
    /** Minimum width of menu */
    minWidth?: string | number
    /** List density */
    density?: 'default' | 'comfortable' | 'compact'
  }
</script>

<script lang="ts" setup>
  import { ref } from 'vue'

  const props = withDefaults(defineProps<FMenuProps>(), {
    items: () => [],
    location: 'bottom end',
    closeOnClick: true,
    minWidth: 200,
    density: 'compact',
  })

  const emit = defineEmits<{
    select: [value: string | number | undefined]
  }>()

  const isOpen = ref(false)

  function handleItemClick(item: MenuItem) {
    emit('select', item.value)
    if (props.closeOnClick) {
      isOpen.value = false
    }
  }
</script>
