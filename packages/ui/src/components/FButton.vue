<template>
  <v-btn
    :variant="computedVariant"
    :color="computedColor"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :rounded="computedRounded"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :elevation="0"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  /**
   * M3 Button Intent
   *
   * Maps to Material Design 3 button types:
   * - primary: Filled button (highest emphasis)
   * - secondary: Outlined button (medium emphasis)
   * - tonal: Filled tonal (medium-high emphasis, softer)
   * - danger: Filled button with error color
   * - ghost: Text button with tonal background on hover
   * - text: Text button (lowest emphasis)
   */
  export type ButtonIntent = 'primary' | 'secondary' | 'tonal' | 'danger' | 'ghost' | 'text'

  /**
   * Button size options
   */
  export type ButtonSize = 'x-small' | 'small' | 'default' | 'large' | 'x-large'

  export interface FButtonProps {
    /** Visual intent/purpose of the button */
    intent?: ButtonIntent
    /** Size of the button */
    size?: ButtonSize
    /** Show loading spinner */
    loading?: boolean
    /** Disable the button */
    disabled?: boolean
    /** Full width button */
    block?: boolean
    /** Border radius style */
    rounded?: string | number | boolean
    /** Icon before text */
    prependIcon?: string
    /** Icon after text */
    appendIcon?: string
  }

  const props = withDefaults(defineProps<FButtonProps>(), {
    intent: 'primary',
    size: 'default',
    loading: false,
    disabled: false,
    block: false,
    rounded: undefined,
    prependIcon: undefined,
    appendIcon: undefined,
  })

  /**
   * M3 Button configuration
   *
   * Filled: flat + primary (highest emphasis)
   * Filled Tonal: tonal + primary (softer background)
   * Outlined: outlined + primary (border only)
   * Text: text + primary (no background)
   */
  const intentConfig = {
    primary: { variant: 'flat', color: 'primary' },
    secondary: { variant: 'outlined', color: 'primary' },
    tonal: { variant: 'tonal', color: 'primary' },
    danger: { variant: 'flat', color: 'error' },
    ghost: { variant: 'tonal', color: 'default' },
    text: { variant: 'text', color: 'primary' },
  } as const

  const computedVariant = computed(() => intentConfig[props.intent].variant)
  const computedColor = computed(() => intentConfig[props.intent].color)

  // ERP uses rounded-lg for professional look
  const computedRounded = computed(() => props.rounded ?? 'lg')
</script>
