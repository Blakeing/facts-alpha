/**
 * app/providers/vuetify.ts
 *
 * Vuetify configuration - stripped down to basics for debugging
 */

import { createVuetify } from 'vuetify'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1660c4',
          secondary: '#67544e',
          error: '#ba1a1a',
          success: '#2e7d32',
          warning: '#f57c00',
          info: '#1976d2',
        },
      },
    },
  },
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
    VBtn: {
      rounded: 'pill',
      elevation: 0,
    },
    VCard: {
      rounded: 'lg',
    },
    VList: {
      density: 'compact',
    },
  },
})
