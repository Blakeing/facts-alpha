/**
 * Color tokens for the Facts UI design system
 *
 * These colors define the visual identity of the funeral home ERP.
 * Professional, dignified palette with calming tones.
 */

// Brand colors - Deep slate blue for professionalism
export const colors = {
  // Primary - Main brand color
  primary: {
    50: '#e8eaf6',
    100: '#c5cae9',
    200: '#9fa8da',
    300: '#7986cb',
    400: '#5c6bc0',
    500: '#3f51b5', // Base
    600: '#3949ab',
    700: '#303f9f',
    800: '#283593',
    900: '#1a237e',
  },

  // Secondary - Warm neutral for accents
  secondary: {
    50: '#efebe9',
    100: '#d7ccc8',
    200: '#bcaaa4',
    300: '#a1887f',
    400: '#8d6e63',
    500: '#795548', // Base
    600: '#6d4c41',
    700: '#5d4037',
    800: '#4e342e',
    900: '#3e2723',
  },

  // Semantic colors
  success: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
  },

  warning: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
  },

  error: {
    light: '#e57373',
    main: '#f44336',
    dark: '#d32f2f',
  },

  info: {
    light: '#64b5f6',
    main: '#2196f3',
    dark: '#1976d2',
  },

  // Neutrals - For backgrounds, borders, text
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Surface colors
  surface: {
    background: '#fafafa',
    paper: '#ffffff',
    elevated: '#ffffff',
  },

  // Text colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
  },
} as const

// Vuetify theme-compatible format
export const vuetifyColors = {
  primary: colors.primary[500],
  'primary-darken-1': colors.primary[700],
  'primary-lighten-1': colors.primary[300],
  secondary: colors.secondary[500],
  'secondary-darken-1': colors.secondary[700],
  'secondary-lighten-1': colors.secondary[300],
  success: colors.success.main,
  warning: colors.warning.main,
  error: colors.error.main,
  info: colors.info.main,
  background: colors.surface.background,
  surface: colors.surface.paper,
} as const

export type ColorToken = keyof typeof colors
export type PrimaryShade = keyof typeof colors.primary
export type NeutralShade = keyof typeof colors.neutral

