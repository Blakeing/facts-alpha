<template>
  <v-dialog
    v-model="model"
    :max-width="computedWidth"
    v-bind="$attrs"
  >
    <v-card rounded="xl">
      <v-card-title v-if="title">{{ title }}</v-card-title>
      <v-card-text>
        <slot />
      </v-card-text>
      <v-card-actions
        v-if="$slots.actions"
        class="justify-end"
      >
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  /**
   * FDialog - Dialog wrapper with preset widths
   */
  import { computed } from 'vue'
  import { useVModel } from '@vueuse/core'

  // Align dialog width presets with Vuetify container max-widths
  // https://vuetifyjs.com/en/components/containers/#max-width
  export type DialogWidth = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number

  export interface FDialogProps {
    modelValue?: boolean
    title?: string
    width?: DialogWidth
  }

  const props = withDefaults(defineProps<FDialogProps>(), {
    modelValue: false,
    title: undefined,
    width: 'md',
  })

  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
  const model = useVModel(props, 'modelValue', emit)

  const widthMap = {
    sm: 600,
    md: 780,
    lg: 920,
    xl: 1080,
    xxl: 1280,
  } as const
  const computedWidth = computed(() =>
    typeof props.width === 'number' ? props.width : widthMap[props.width],
  )
</script>
