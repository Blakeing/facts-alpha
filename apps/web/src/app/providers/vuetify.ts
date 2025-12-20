/**
 * app/providers/vuetify.ts
 *
 * Vuetify framework configuration with Facts UI design tokens
 * https://vuetifyjs.com
 */

import { colors, vuetifyColors } from '@facts/ui'
import { createVuetify } from 'vuetify'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

/**
 * Light theme using Facts UI design tokens
 */
const lightTheme = {
  dark: false,
  colors: {
    ...vuetifyColors,
    // Additional semantic mappings
    'on-background': colors.text.primary,
    'on-surface': colors.text.primary,
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-error': '#ffffff',
    'on-success': '#ffffff',
    'on-warning': '#000000',
    'on-info': '#ffffff',
  },
}

/**
 * Dark theme (future use)
 */
const darkTheme = {
  dark: true,
  colors: {
    primary: colors.primary[300],
    'primary-darken-1': colors.primary[500],
    'primary-lighten-1': colors.primary[100],
    secondary: colors.secondary[300],
    'secondary-darken-1': colors.secondary[500],
    'secondary-lighten-1': colors.secondary[100],
    success: colors.success.light,
    warning: colors.warning.light,
    error: colors.error.light,
    info: colors.info.light,
    background: colors.neutral[900],
    surface: colors.neutral[800],
    'on-background': '#ffffff',
    'on-surface': '#ffffff',
    'on-primary': '#000000',
    'on-secondary': '#000000',
    'on-error': '#000000',
    'on-success': '#000000',
    'on-warning': '#000000',
    'on-info': '#000000',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    // Global component defaults aligned with design system
    VBtn: {
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VDataTable: {
      hover: true,
    },
  },
})
