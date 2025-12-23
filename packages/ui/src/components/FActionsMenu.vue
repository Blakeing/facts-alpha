<template>
  <v-menu
    v-model="isOpen"
    :close-on-content-click="true"
    location="bottom end"
  >
    <template #activator="{ props: menuProps }">
      <v-tooltip
        v-if="tooltip"
        location="bottom"
      >
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...menuProps, ...tooltipProps }"
            :color="color"
            :disabled="disabled"
            :icon="!label"
            :prepend-icon="label ? icon : undefined"
            :size="size"
            :variant="variant"
          >
            <v-icon v-if="!label">{{ icon }}</v-icon>
            <template v-if="label">{{ label }}</template>
          </v-btn>
        </template>
        <span>{{ tooltip }}</span>
      </v-tooltip>
      <v-btn
        v-else
        v-bind="menuProps"
        :color="color"
        :disabled="disabled"
        :icon="!label"
        :prepend-icon="label ? icon : undefined"
        :size="size"
        :variant="variant"
      >
        <v-icon v-if="!label">{{ icon }}</v-icon>
        <template v-if="label">{{ label }}</template>
      </v-btn>
    </template>

    <v-list
      density="compact"
      nav
    >
      <template
        v-for="(item, index) in visibleItems"
        :key="item.key ?? index"
      >
        <!-- Only show divider if not first item and more than 1 item -->
        <v-divider
          v-if="item.divider && index > 0 && visibleItems.length > 1"
          class="my-1"
        />
        <v-list-item
          :disabled="item.disabled"
          :value="item.key"
          @click="handleClick(item)"
        >
          <template
            v-if="item.icon"
            #prepend
          >
            <v-icon
              :icon="item.icon"
              size="small"
              class="mr-2"
            />
          </template>
          <v-list-item-title :class="item.color ? `text-${item.color}` : ''">
            {{ item.label }}
          </v-list-item-title>
          <v-list-item-subtitle v-if="item.subtitle">
            {{ item.subtitle }}
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <v-list-item
        v-if="visibleItems.length === 0"
        disabled
      >
        <v-list-item-title class="text-medium-emphasis"> No actions available </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'

  export interface ActionMenuItem {
    /** Unique key for the action */
    key: string
    /** Display label */
    label: string
    /** Optional subtitle/description */
    subtitle?: string
    /** Optional icon (mdi-*) */
    icon?: string
    /** Handler function when clicked */
    handler: () => void | Promise<void>
    /** Whether to show this item (default: true) */
    visible?: boolean
    /** Whether this item is disabled (default: false) */
    disabled?: boolean
    /** Color for the label (e.g., 'error', 'warning') */
    color?: string
    /** Show a divider before this item */
    divider?: boolean
  }

  interface Props {
    /** Array of action items */
    items: ActionMenuItem[]
    /** Button icon (default: mdi-dots-vertical) */
    icon?: string
    /** Optional button label (shows text button instead of icon) */
    label?: string
    /** Tooltip text */
    tooltip?: string
    /** Button color */
    color?: string
    /** Button variant */
    variant?: 'flat' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'plain'
    /** Button size */
    size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
    /** Disabled state */
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    icon: 'mdi-dots-vertical',
    label: undefined,
    tooltip: undefined,
    color: undefined,
    variant: 'text',
    size: 'small',
    disabled: false,
  })

  const emit = defineEmits<{
    action: [key: string]
  }>()

  const isOpen = ref(false)

  const visibleItems = computed(() => props.items.filter((item) => item.visible !== false))

  async function handleClick(item: ActionMenuItem) {
    emit('action', item.key)
    await item.handler()
  }
</script>
