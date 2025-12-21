/**
 * Color tokens for the Facts UI design system
 *
 * Material Design 3 compliant color system with tonal palettes
 * and semantic color roles for the funeral home ERP.
 *
 * @see https://m3.material.io/styles/color/overview
 */

// =============================================================================
// TONAL PALETTES
// =============================================================================

/**
 * Primary tonal palette - Deep indigo for professionalism
 * Generated using M3 tonal palette principles
 */
export const primaryPalette = {
  0: '#000000',
  10: '#001849',
  20: '#002d6d',
  25: '#003882',
  30: '#004397',
  35: '#004fad',
  40: '#1660c4',
  50: '#3c79e0',
  60: '#5b93fb',
  70: '#8db0ff',
  80: '#b6c9ff',
  90: '#dce1ff',
  95: '#eff0ff',
  99: '#fefbff',
  100: '#ffffff',
} as const

/**
 * Secondary tonal palette - Warm brown for accents
 */
export const secondaryPalette = {
  0: '#000000',
  10: '#1f1410',
  20: '#352723',
  25: '#41322d',
  30: '#4d3d38',
  35: '#5a4843',
  40: '#67544e',
  50: '#816c66',
  60: '#9c857e',
  70: '#b89f98',
  80: '#d4bab2',
  90: '#f1d5cd',
  95: '#ffede8',
  99: '#fffbff',
  100: '#ffffff',
} as const

/**
 * Tertiary tonal palette - Teal for additional accent
 */
export const tertiaryPalette = {
  0: '#000000',
  10: '#001f24',
  20: '#00363d',
  25: '#00424a',
  30: '#004f58',
  35: '#005c66',
  40: '#006974',
  50: '#008492',
  60: '#00a1b1',
  70: '#26bdd0',
  80: '#52d9ed',
  90: '#9cf0ff',
  95: '#d1f7ff',
  99: '#f6feff',
  100: '#ffffff',
} as const

/**
 * Neutral tonal palette - For backgrounds and surfaces
 */
export const neutralPalette = {
  0: '#000000',
  4: '#0d0e11',
  6: '#121316',
  10: '#1b1b1f',
  12: '#1f1f23',
  17: '#292a2d',
  20: '#303034',
  22: '#343539',
  24: '#39393d',
  25: '#3b3b3f',
  30: '#46464a',
  35: '#525256',
  40: '#5e5e62',
  50: '#77777a',
  60: '#919094',
  70: '#acaaaf',
  80: '#c7c6ca',
  87: '#dad8dd',
  90: '#e4e1e6',
  92: '#e9e7ec',
  94: '#efe6f1',
  95: '#f2f0f5',
  96: '#f5f2f7',
  98: '#faf8fc',
  99: '#fdfbff',
  100: '#ffffff',
} as const

/**
 * Neutral variant palette - For outlines and subtle variations
 */
export const neutralVariantPalette = {
  0: '#000000',
  10: '#191b23',
  20: '#2e3038',
  25: '#393b43',
  30: '#44464f',
  35: '#50525a',
  40: '#5c5e67',
  50: '#757780',
  60: '#8f9099',
  70: '#a9abb4',
  80: '#c5c6d0',
  90: '#e1e2ec',
  95: '#eff0fa',
  99: '#fdfbff',
  100: '#ffffff',
} as const

/**
 * Error tonal palette
 */
export const errorPalette = {
  0: '#000000',
  10: '#410002',
  20: '#690005',
  25: '#7e0007',
  30: '#93000a',
  35: '#a80710',
  40: '#ba1a1a',
  50: '#de3730',
  60: '#ff5449',
  70: '#ff897d',
  80: '#ffb4ab',
  90: '#ffdad6',
  95: '#ffedea',
  99: '#fffbff',
  100: '#ffffff',
} as const

// =============================================================================
// M3 COLOR ROLES - LIGHT THEME
// =============================================================================

export const lightScheme = {
  // Primary colors
  primary: primaryPalette[40],
  onPrimary: primaryPalette[100],
  primaryContainer: primaryPalette[90],
  onPrimaryContainer: primaryPalette[10],

  // Secondary colors
  secondary: secondaryPalette[40],
  onSecondary: secondaryPalette[100],
  secondaryContainer: secondaryPalette[90],
  onSecondaryContainer: secondaryPalette[10],

  // Tertiary colors
  tertiary: tertiaryPalette[40],
  onTertiary: tertiaryPalette[100],
  tertiaryContainer: tertiaryPalette[90],
  onTertiaryContainer: tertiaryPalette[10],

  // Error colors
  error: errorPalette[40],
  onError: errorPalette[100],
  errorContainer: errorPalette[90],
  onErrorContainer: errorPalette[10],

  // Surface colors
  surface: neutralPalette[98],
  onSurface: neutralPalette[10],
  surfaceVariant: neutralVariantPalette[90],
  onSurfaceVariant: neutralVariantPalette[30],

  // Surface container hierarchy (M3 elevation)
  surfaceDim: neutralPalette[87],
  surfaceBright: neutralPalette[98],
  surfaceContainerLowest: neutralPalette[100],
  surfaceContainerLow: neutralPalette[96],
  surfaceContainer: neutralPalette[94],
  surfaceContainerHigh: neutralPalette[92],
  surfaceContainerHighest: neutralPalette[90],

  // Outline colors
  outline: neutralVariantPalette[50],
  outlineVariant: neutralVariantPalette[80],

  // Background
  background: neutralPalette[98],
  onBackground: neutralPalette[10],

  // Inverse colors
  inverseSurface: neutralPalette[20],
  inverseOnSurface: neutralPalette[95],
  inversePrimary: primaryPalette[80],

  // Special
  shadow: neutralPalette[0],
  scrim: neutralPalette[0],
} as const

// =============================================================================
// M3 COLOR ROLES - DARK THEME
// =============================================================================

export const darkScheme = {
  // Primary colors
  primary: primaryPalette[80],
  onPrimary: primaryPalette[20],
  primaryContainer: primaryPalette[30],
  onPrimaryContainer: primaryPalette[90],

  // Secondary colors
  secondary: secondaryPalette[80],
  onSecondary: secondaryPalette[20],
  secondaryContainer: secondaryPalette[30],
  onSecondaryContainer: secondaryPalette[90],

  // Tertiary colors
  tertiary: tertiaryPalette[80],
  onTertiary: tertiaryPalette[20],
  tertiaryContainer: tertiaryPalette[30],
  onTertiaryContainer: tertiaryPalette[90],

  // Error colors
  error: errorPalette[80],
  onError: errorPalette[20],
  errorContainer: errorPalette[30],
  onErrorContainer: errorPalette[90],

  // Surface colors
  surface: neutralPalette[6],
  onSurface: neutralPalette[90],
  surfaceVariant: neutralVariantPalette[30],
  onSurfaceVariant: neutralVariantPalette[80],

  // Surface container hierarchy (M3 elevation)
  surfaceDim: neutralPalette[6],
  surfaceBright: neutralPalette[24],
  surfaceContainerLowest: neutralPalette[4],
  surfaceContainerLow: neutralPalette[10],
  surfaceContainer: neutralPalette[12],
  surfaceContainerHigh: neutralPalette[17],
  surfaceContainerHighest: neutralPalette[22],

  // Outline colors
  outline: neutralVariantPalette[60],
  outlineVariant: neutralVariantPalette[30],

  // Background
  background: neutralPalette[6],
  onBackground: neutralPalette[90],

  // Inverse colors
  inverseSurface: neutralPalette[90],
  inverseOnSurface: neutralPalette[20],
  inversePrimary: primaryPalette[40],

  // Special
  shadow: neutralPalette[0],
  scrim: neutralPalette[0],
} as const

// =============================================================================
// SEMANTIC COLORS (for status indicators)
// =============================================================================

export const semanticColors = {
  success: {
    light: '#4caf50',
    main: '#2e7d32',
    dark: '#1b5e20',
    container: '#c8e6c9',
    onContainer: '#1b5e20',
  },
  warning: {
    light: '#ffb74d',
    main: '#f57c00',
    dark: '#e65100',
    container: '#fff3e0',
    onContainer: '#e65100',
  },
  info: {
    light: '#64b5f6',
    main: '#1976d2',
    dark: '#0d47a1',
    container: '#bbdefb',
    onContainer: '#0d47a1',
  },
} as const

// =============================================================================
// LEGACY EXPORTS (for backward compatibility)
// =============================================================================

export const colors = {
  primary: {
    50: primaryPalette[95],
    100: primaryPalette[90],
    200: primaryPalette[80],
    300: primaryPalette[70],
    400: primaryPalette[60],
    500: primaryPalette[40],
    600: primaryPalette[35],
    700: primaryPalette[30],
    800: primaryPalette[25],
    900: primaryPalette[20],
  },
  secondary: {
    50: secondaryPalette[95],
    100: secondaryPalette[90],
    200: secondaryPalette[80],
    300: secondaryPalette[70],
    400: secondaryPalette[60],
    500: secondaryPalette[40],
    600: secondaryPalette[35],
    700: secondaryPalette[30],
    800: secondaryPalette[25],
    900: secondaryPalette[20],
  },
  success: semanticColors.success,
  warning: semanticColors.warning,
  error: {
    light: errorPalette[60],
    main: errorPalette[40],
    dark: errorPalette[30],
  },
  info: semanticColors.info,
  neutral: {
    0: neutralPalette[100],
    50: neutralPalette[98],
    100: neutralPalette[96],
    200: neutralPalette[94],
    300: neutralPalette[90],
    400: neutralPalette[80],
    500: neutralPalette[60],
    600: neutralPalette[50],
    700: neutralPalette[40],
    800: neutralPalette[20],
    900: neutralPalette[10],
  },
  surface: {
    background: lightScheme.background,
    paper: lightScheme.surface,
    elevated: lightScheme.surfaceContainerLow,
  },
  text: {
    primary: lightScheme.onSurface,
    secondary: lightScheme.onSurfaceVariant,
    disabled: neutralVariantPalette[50],
    hint: neutralVariantPalette[50],
  },
} as const

// Vuetify theme-compatible format (light)
export const vuetifyColors = {
  primary: lightScheme.primary,
  'primary-darken-1': primaryPalette[30],
  'primary-lighten-1': primaryPalette[60],
  secondary: lightScheme.secondary,
  'secondary-darken-1': secondaryPalette[30],
  'secondary-lighten-1': secondaryPalette[60],
  success: semanticColors.success.main,
  warning: semanticColors.warning.main,
  error: lightScheme.error,
  info: semanticColors.info.main,
  background: lightScheme.background,
  surface: lightScheme.surface,
  'surface-variant': lightScheme.surfaceVariant,
  'surface-bright': lightScheme.surfaceBright,
  'surface-light': lightScheme.surfaceContainerLowest,
  'on-background': lightScheme.onBackground,
  'on-surface': lightScheme.onSurface,
  'on-surface-variant': lightScheme.onSurfaceVariant,
  outline: lightScheme.outline,
  'outline-variant': lightScheme.outlineVariant,
} as const

// Vuetify theme-compatible format (dark)
export const vuetifyColorsDark = {
  primary: darkScheme.primary,
  'primary-darken-1': primaryPalette[70],
  'primary-lighten-1': primaryPalette[90],
  secondary: darkScheme.secondary,
  'secondary-darken-1': secondaryPalette[70],
  'secondary-lighten-1': secondaryPalette[90],
  success: semanticColors.success.light,
  warning: semanticColors.warning.light,
  error: darkScheme.error,
  info: semanticColors.info.light,
  background: darkScheme.background,
  surface: darkScheme.surface,
  'surface-variant': darkScheme.surfaceVariant,
  'surface-bright': darkScheme.surfaceBright,
  'surface-light': darkScheme.surfaceContainerLowest,
  'on-background': darkScheme.onBackground,
  'on-surface': darkScheme.onSurface,
  'on-surface-variant': darkScheme.onSurfaceVariant,
  outline: darkScheme.outline,
  'outline-variant': darkScheme.outlineVariant,
} as const

// Type exports
export type ColorScheme = typeof lightScheme
export type TonalPalette = typeof primaryPalette
