/**
 * Spacing tokens for the Facts UI design system
 *
 * Based on a 4px base unit for consistent rhythm.
 */

export const spacing = {
  /** 0px */
  none: 0,
  /** 4px - Tight spacing for compact elements */
  xs: 4,
  /** 8px - Small gaps between related elements */
  sm: 8,
  /** 12px - Default gap for form elements */
  md: 12,
  /** 16px - Standard section spacing */
  lg: 16,
  /** 24px - Large section breaks */
  xl: 24,
  /** 32px - Major section divisions */
  '2xl': 32,
  /** 48px - Page-level spacing */
  '3xl': 48,
  /** 64px - Hero/banner spacing */
  '4xl': 64,
} as const

// Vuetify uses a 4px base, so these map to their spacing scale
export const vuetifySpacing = {
  xs: 1, // 4px
  sm: 2, // 8px
  md: 3, // 12px
  lg: 4, // 16px
  xl: 6, // 24px
  '2xl': 8, // 32px
  '3xl': 12, // 48px
  '4xl': 16, // 64px
} as const

// Common spacing combinations for components
export const componentSpacing = {
  /** Card internal padding */
  cardPadding: spacing.lg,
  /** Dialog internal padding */
  dialogPadding: spacing.xl,
  /** Form field gap */
  formGap: spacing.md,
  /** Button group gap */
  buttonGap: spacing.sm,
  /** Section margin */
  sectionMargin: spacing.xl,
  /** Page padding */
  pagePadding: spacing['2xl'],
} as const

export type SpacingToken = keyof typeof spacing
export type VuetifySpacing = keyof typeof vuetifySpacing

