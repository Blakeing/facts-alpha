/**
 * app/providers/vuetify.ts
 *
 * Vuetify configuration with MD3 Blueprint
 * Using Material Design 3 defaults with custom brand colors
 *
 * @see https://vuetifyjs.com/en/features/blueprints/#material-design-3
 * @see https://m3.material.io/
 * @see https://vuetifyjs.com/en/features/dates/
 */

import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { VDateInput } from 'vuetify/labs/VDateInput'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Brand colors - custom palette for funeral home ERP
// Vuetify automatically generates:
// - Contrast colors (light/dark text)
// - Hover/active/focus states
// - Tonal variants (for chips, badges)
// - Opacity overlays
//
// You can provide just the base color (current approach) OR
// provide the full structure for more control (see comment below)
const brandColors = {
  primary: '#1660c4', // Deep indigo - professionalism
}

// Optional: Full color structure for explicit control
// If you want to override specific variants, you can do:
// const brandColors = {
//   primary: {
//     base: '#1660c4',
//     darken1: '#0d4a8f',  // Vuetify auto-generates if not provided
//     lighten1: '#1e7ce8',  // Vuetify auto-generates if not provided
//     // ... etc
//   }
// }

export default createVuetify({
  // MD3 Blueprint provides M3-compliant:
  // - Shapes (corner radii)
  // - Typography scale
  // - Component defaults
  // - Motion/transitions
  blueprint: md3,

  // Lab components (date input is still in labs)
  components: {
    VDateInput,
  },

  theme: {
    themes: {
      light: {
        colors: brandColors,
      },
    },
  },

  // Density overrides for ERP aesthetic (compact forms)
  // M3-aligned defaults for shapes and density
  defaults: {
    VTextField: {
      density: 'compact',
    },
    VTextarea: {
      density: 'compact',
    },
    VSelect: {
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
    VDateInput: {
      density: 'compact',
    },
    VTab: {
      rounded: '0',
    },
  },
})
