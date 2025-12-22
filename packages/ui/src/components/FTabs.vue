<template>
  <div>
    <v-tabs
      v-model="model"
      v-bind="$attrs"
    >
      <slot />
    </v-tabs>
  </div>
</template>

<script lang="ts" setup>
  /**
   * FTabs - Styled tabs component
   *
   * Wraps v-tabs with consistent border styling.
   * Use with v-tab children and v-window for tab panels.
   *
   * @example
   * ```vue
   * <FTabs v-model="activeTab">
   *   <v-tab value="general">General</v-tab>
   *   <v-tab value="items">Items</v-tab>
   * </FTabs>
   *
   * <v-window v-model="activeTab">
   *   <v-window-item value="general">...</v-window-item>
   *   <v-window-item value="items">...</v-window-item>
   * </v-window>
   * ```
   */
  import { useVModel } from '@vueuse/core'

  interface Props {
    /** Active tab value (v-model) */
    modelValue?: string | number
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | undefined]
  }>()

  const model = useVModel(props, 'modelValue', emit)
</script>
