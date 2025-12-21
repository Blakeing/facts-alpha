/**
 * app/providers/vuetify.ts
 *
 * Vuetify configuration with MD3 Blueprint
 * Using Material Design 3 defaults with custom brand colors
 *
 * @see https://vuetifyjs.com/en/features/blueprints/#material-design-3
 * @see https://m3.material.io/
 */

import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Brand colors - custom palette for funeral home ERP
const brandColors = {
  primary: '#1660c4', // Deep indigo - professionalism
  secondary: '#67544e', // Warm brown - warmth/comfort
  error: '#ba1a1a', // M3 error red
  success: '#2e7d32', // Green for positive states
  warning: '#f57c00', // Orange for warnings
  info: '#1976d2', // Blue for informational
}

export default createVuetify({
  // MD3 Blueprint provides M3-compliant:
  // - Shapes (corner radii)
  // - Typography scale
  // - Component defaults
  // - Motion/transitions
  blueprint: md3,

  theme: {
    themes: {
      light: {
        colors: brandColors,
      },
    },
  },

  // Density overrides for ERP aesthetic (compact forms)
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'compact',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'compact',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
    },
    VCheckbox: {
      density: 'compact',
    },
    VRadioGroup: {
      density: 'compact',
    },
    VSwitch: {
      density: 'compact',
    },
    VList: {
      density: 'compact',
    },
  },
})
