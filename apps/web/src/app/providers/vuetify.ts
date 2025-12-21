/**
 * app/providers/vuetify.ts
 *
 * Vuetify configuration using MD3 blueprint with custom brand colors
 */

import { lightScheme, semanticColors } from '@facts/ui'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  blueprint: md3,
  theme: {
    themes: {
      light: {
        colors: {
          // Primary
          primary: lightScheme.primary,
          'on-primary': lightScheme.onPrimary,
          'primary-container': lightScheme.primaryContainer,
          'on-primary-container': lightScheme.onPrimaryContainer,

          // Secondary
          secondary: lightScheme.secondary,
          'on-secondary': lightScheme.onSecondary,
          'secondary-container': lightScheme.secondaryContainer,
          'on-secondary-container': lightScheme.onSecondaryContainer,

          // Tertiary
          tertiary: lightScheme.tertiary,
          'on-tertiary': lightScheme.onTertiary,
          'tertiary-container': lightScheme.tertiaryContainer,
          'on-tertiary-container': lightScheme.onTertiaryContainer,

          // Error
          error: lightScheme.error,
          'on-error': lightScheme.onError,
          'error-container': lightScheme.errorContainer,
          'on-error-container': lightScheme.onErrorContainer,

          // Semantic (non-M3 standard)
          success: semanticColors.success.main,
          warning: semanticColors.warning.main,
          info: semanticColors.info.main,

          // Surface
          background: lightScheme.background,
          surface: lightScheme.surface,
          'surface-variant': lightScheme.surfaceVariant,
          'on-background': lightScheme.onBackground,
          'on-surface': lightScheme.onSurface,
          'on-surface-variant': lightScheme.onSurfaceVariant,

          // Outline
          outline: lightScheme.outline,
          'outline-variant': lightScheme.outlineVariant,
        },
      },
    },
  },
})
