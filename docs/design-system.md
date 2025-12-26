# Design System

## Material Design 3 (MD3)

The app uses Vuetify's **MD3 Blueprint** which provides:

- M3-compliant shapes (corner radii)
- M3 typography scale
- M3 component behavior and defaults
- M3 motion/transitions

We only define **brand colors** to override the generic M3 palette:

```typescript
// packages/ui/src/tokens/colors.ts
export const brandColors = {
  primary: '#1660c4', // Deep indigo - professionalism
  secondary: '#67544e', // Warm brown - warmth/comfort
  error: '#ba1a1a',
  success: '#2e7d32',
  warning: '#f57c00',
  info: '#1976d2',
}
```

## Wrapper Components

Vuetify components with simplified APIs and consistent defaults:

| Component           | Wraps                      | Purpose                                                               |
| ------------------- | -------------------------- | --------------------------------------------------------------------- |
| `FButton`           | `v-btn`                    | Intent-based buttons (primary, secondary, tonal, danger, ghost, text) |
| `FTextField`        | `v-text-field`             | Text input with compact density                                       |
| `FTextarea`         | `v-textarea`               | Multiline text with auto-grow                                         |
| `FSelect`           | `v-select`                 | Dropdown with options array API                                       |
| `FCard`             | `v-card`                   | Cards with variant support (elevated, filled, outlined)               |
| `FDialog`           | `v-dialog`                 | Modal dialogs with preset widths                                      |
| `FConfirmDialog`    | `v-dialog`                 | Confirmation dialogs with Yes/No actions                              |
| `FDataTable`        | AG Grid                    | Data tables with slot-based cell rendering                            |
| `FCheckbox`         | `v-checkbox`               | Single checkbox                                                       |
| `FCheckboxGroup`    | `v-checkbox`               | Multiple checkboxes with options array                                |
| `FSwitch`           | `v-switch`                 | Toggle switch                                                         |
| `FRadioGroup`       | `v-radio-group`            | Radio buttons with options array                                      |
| `FDatePicker`       | `v-date-input`             | Date selection                                                        |
| `FTabs`             | `v-tabs`                   | Tab navigation with v-model binding                                   |
| `FLoader`           | `v-overlay`                | Loading overlay with spinner (contained to parent)                    |
| `FPageCard`         | `FCard` + `FLoader`        | Page/section wrapper with loading overlay                             |
| `FListCard`         | `FPageCard` + `FDataTable` | Data list wrapper with search, filters, loading                       |
| `FFormDialog`       | `v-dialog` + `FLoader`     | Form dialog with loading overlay and Save/Cancel                      |
| `FFullScreenDialog` | `v-dialog fullscreen`      | Full-screen dialog for complex ERP editing workflows                  |

## Usage

```vue
<script setup>
  // In apps/web, import through shared layer
  import { FButton, FTextField, FCard } from '@/shared/ui'

  // In packages or external apps, import directly
  // import { FButton, FTextField, FCard } from '@facts/ui'
</script>

<template>
  <FCard
    title="Example"
    variant="outlined"
  >
    <FTextField
      label="Name"
      v-model="name"
    />
    <template #actions>
      <FButton intent="primary">Save</FButton>
    </template>
  </FCard>
</template>
```

## Vuetify Configuration

Located in `apps/web/src/app/providers/vuetify.ts`:

```typescript
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'

export default createVuetify({
  blueprint: md3, // M3 shapes, typography, motion
  theme: {
    themes: {
      light: {
        colors: brandColors, // Just brand color overrides
      },
    },
  },
  defaults: {
    /* compact density for ERP */
  },
})
```

- **MD3 Blueprint** handles all M3 design tokens
- Light theme only (dark mode ready via `darkScheme` if needed)
- Compact density defaults for ERP aesthetic
