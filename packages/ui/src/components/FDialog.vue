<template>
  <v-dialog
    v-model="model"
    :max-width="maxWidth"
    :width="width"
    :fullscreen="fullscreen"
    :persistent="persistent"
    :scrollable="scrollable"
    :transition="transition"
    v-bind="$attrs"
  >
    <v-card :rounded="fullscreen ? 0 : 'lg'">
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h5">{{ title }}</span>
        <v-btn
          v-if="closable"
          icon="mdi-close"
          variant="text"
          density="comfortable"
          @click="close"
        />
      </v-card-title>

      <v-divider v-if="dividers" />

      <v-card-text :class="contentClass">
        <slot />
      </v-card-text>

      <v-divider v-if="dividers && $slots.actions" />

      <v-card-actions v-if="$slots.actions" class="pa-4 justify-end">
        <slot name="actions" :close="close" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export type DialogWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string

export interface FDialogProps {
  /** v-model binding for open state */
  modelValue?: boolean
  /** Dialog title */
  title: string
  /** Dialog width preset or custom value */
  size?: DialogWidth
  /** Custom max-width (overrides size) */
  maxWidth?: string | number
  /** Custom width */
  width?: string | number
  /** Fullscreen mode */
  fullscreen?: boolean
  /** Prevent closing on outside click */
  persistent?: boolean
  /** Enable scrolling in content area */
  scrollable?: boolean
  /** Show close button */
  closable?: boolean
  /** Show dividers between sections */
  dividers?: boolean
  /** Transition animation */
  transition?: string
}

const props = withDefaults(defineProps<FDialogProps>(), {
  modelValue: false,
  size: 'md',
  maxWidth: undefined,
  width: undefined,
  fullscreen: false,
  persistent: false,
  scrollable: true,
  closable: true,
  dividers: true,
  transition: 'dialog-bottom-transition',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const sizeMap: Record<string, number> = {
  xs: 320,
  sm: 400,
  md: 560,
  lg: 800,
  xl: 1024,
}

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const maxWidth = computed(() => {
  if (props.maxWidth) return props.maxWidth
  if (props.fullscreen) return undefined
  if (typeof props.size === 'number') return props.size
  return sizeMap[props.size] ?? sizeMap.md
})

const contentClass = computed(() => ({
  'pa-4': true,
  'overflow-y-auto': props.scrollable,
}))

function close() {
  model.value = false
  emit('close')
}
</script>

