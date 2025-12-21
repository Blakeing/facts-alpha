# Facts Alpha - Funeral Home ERP

A modern, scalable funeral home ERP system built with Vue 3, Vuetify 3, and Feature-Sliced Design architecture.

## Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **UI Library**: Vuetify 3 with MD3 Blueprint
- **Build Tool**: Vite 7
- **Monorepo**: Turborepo + pnpm workspaces
- **State Management**: Pinia
- **Routing**: Vue Router (file-based with unplugin-vue-router)
- **Linting**: Oxlint (fast) + ESLint (Vue/Vuetify rules)
- **Formatting**: Prettier
- **TypeScript**: 5.9

## Project Structure

```
facts-alpha/
├── apps/
│   └── web/                    # Main Vue application
│       └── src/
│           ├── app/            # FSD: App layer (providers, global config)
│           ├── pages/          # FSD: Pages layer (file-based routing)
│           ├── widgets/        # FSD: Widgets layer (composite UI blocks)
│           ├── features/       # FSD: Features layer (user interactions)
│           ├── entities/       # FSD: Entities layer (business entities)
│           └── shared/         # FSD: Shared layer (utilities, API)
├── packages/
│   ├── ui/                     # @facts/ui - Design system components
│   │   └── src/
│   │       ├── components/     # Wrapper components (FButton, FCard, etc.)
│   │       ├── tokens/         # Design tokens (colors, spacing, typography)
│   │       └── composables/    # Vue composables
│   └── utils/                  # @facts/utils - Shared utilities
└── turbo.json                  # Turborepo configuration
```

## Architecture: Feature-Sliced Design (FSD)

The application follows [Feature-Sliced Design](https://feature-sliced.design/) methodology:

### Layers (top to bottom, imports flow downward only)

1. **app/** - Application initialization, providers, global styles
2. **pages/** - Route-level components (file-based routing)
3. **widgets/** - Large composite UI blocks (AppShell, etc.)
4. **features/** - User interaction logic (CaseForm, etc.)
5. **entities/** - Business entities (Case, Tenant)
6. **shared/** - Reusable utilities, API clients, UI primitives

### Segments within each slice

- `ui/` - Vue components
- `model/` - Business logic, stores, types
- `api/` - API calls (if needed)
- `lib/` - Utility functions
- `config/` - Constants, configuration

## Design System (`@facts/ui`)

### Design Tokens

Located in `packages/ui/src/tokens/`:

- **colors.ts** - M3 tonal palettes, light/dark color schemes, semantic colors
- **spacing.ts** - Spacing scale (4px base unit)
- **typography.ts** - Font families, sizes, weights

### Wrapper Components

Vuetify components with simplified APIs and consistent defaults:

| Component        | Wraps           | Purpose                                                               |
| ---------------- | --------------- | --------------------------------------------------------------------- |
| `FButton`        | `v-btn`         | Intent-based buttons (primary, secondary, tonal, danger, ghost, text) |
| `FTextField`     | `v-text-field`  | Text input with compact density                                       |
| `FTextarea`      | `v-textarea`    | Multiline text with auto-grow                                         |
| `FSelect`        | `v-select`      | Dropdown with options array API                                       |
| `FCard`          | `v-card`        | Cards with variant support (elevated, filled, outlined)               |
| `FDialog`        | `v-dialog`      | Modal dialogs with preset widths                                      |
| `FDataTable`     | `v-data-table`  | Tables with simplified column definitions                             |
| `FCheckbox`      | `v-checkbox`    | Single checkbox                                                       |
| `FCheckboxGroup` | `v-checkbox`    | Multiple checkboxes with options array                                |
| `FSwitch`        | `v-switch`      | Toggle switch                                                         |
| `FRadioGroup`    | `v-radio-group` | Radio buttons with options array                                      |
| `FDatePicker`    | `v-date-input`  | Date selection                                                        |

### Usage

```vue
<script setup>
  import { FButton, FTextField, FCard } from '@facts/ui'
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

- Uses **MD3 Blueprint** for Material Design 3 defaults
- Light theme only (dark mode stripped for simplicity)
- Custom brand colors applied via `lightScheme` from `@facts/ui`
- Compact density defaults for ERP aesthetic

## Current Implementation Status

### Completed

- [x] Monorepo setup (Turborepo + pnpm)
- [x] FSD folder structure
- [x] Design tokens (colors, spacing, typography)
- [x] Wrapper component library (14 components)
- [x] Application shell with collapsible sidebar (rail mode)
- [x] Vuetify MD3 blueprint integration
- [x] Case Management module:
  - [x] Case list page with filtering and search
  - [x] Case detail page
  - [x] Case create/edit form
  - [x] Case entity (types, store, mock data)
- [x] Linting/formatting setup (Oxlint, ESLint, Prettier)
- [x] VSCode configuration

### Pending

- [ ] Authentication/Authorization
- [ ] API integration (backend)
- [ ] Additional modules (Calendar, Contacts, Settings)
- [ ] Multi-tenant support (entity exists, not implemented)
- [ ] Dark mode (removed for now, tokens ready)

## Development

### Prerequisites

- Node.js 22+
- pnpm 10+

### Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Lint (Oxlint + ESLint)
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

### Development Server

The app runs at `http://localhost:3000` by default.

## Key Files Reference

| File                                             | Purpose                                |
| ------------------------------------------------ | -------------------------------------- |
| `apps/web/src/app/providers/vuetify.ts`          | Vuetify configuration, theme, defaults |
| `apps/web/src/styles/settings.scss`              | SASS overrides, global styles          |
| `apps/web/src/widgets/app-shell/ui/AppShell.vue` | Main layout with sidebar               |
| `packages/ui/src/tokens/colors.ts`               | M3 color system                        |
| `packages/ui/src/index.ts`                       | UI package exports                     |

## Conventions

### Imports

- Use `@facts/ui` for design system components
- Use `@facts/utils` for shared utilities
- Use `@/` alias for app-internal imports

### Component Naming

- FSD slices: PascalCase (e.g., `CaseForm`)
- UI components: `F` prefix (e.g., `FButton`, `FCard`)
- Pages: kebab-case files (e.g., `[id].vue`)

### State Management

- Use Pinia stores for entity state
- Stores live in `entities/*/model/` or `features/*/model/`
- Composables for reusable reactive logic

## Browser Support

Modern browsers only (ES2022+). No IE11 support.
