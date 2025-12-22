# Facts Alpha - Funeral Home ERP

A modern, scalable funeral home ERP system built with Vue 3, Vuetify 3, and Feature-Sliced Design architecture.

## Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **UI Library**: Vuetify 3 with MD3 Blueprint
- **Build Tool**: Vite 7
- **Monorepo**: Turborepo + pnpm workspaces
- **Data Fetching**: TanStack Query (Vue Query)
- **State Management**: Pinia (for global state)
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

### Material Design 3 (MD3)

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

### Wrapper Components

Vuetify components with simplified APIs and consistent defaults:

| Component        | Wraps                      | Purpose                                                               |
| ---------------- | -------------------------- | --------------------------------------------------------------------- |
| `FButton`        | `v-btn`                    | Intent-based buttons (primary, secondary, tonal, danger, ghost, text) |
| `FTextField`     | `v-text-field`             | Text input with compact density                                       |
| `FTextarea`      | `v-textarea`               | Multiline text with auto-grow                                         |
| `FSelect`        | `v-select`                 | Dropdown with options array API                                       |
| `FCard`          | `v-card`                   | Cards with variant support (elevated, filled, outlined)               |
| `FDialog`        | `v-dialog`                 | Modal dialogs with preset widths                                      |
| `FDataTable`     | `v-data-table`             | Tables with simplified column definitions                             |
| `FCheckbox`      | `v-checkbox`               | Single checkbox                                                       |
| `FCheckboxGroup` | `v-checkbox`               | Multiple checkboxes with options array                                |
| `FSwitch`        | `v-switch`                 | Toggle switch                                                         |
| `FRadioGroup`    | `v-radio-group`            | Radio buttons with options array                                      |
| `FDatePicker`    | `v-date-input`             | Date selection                                                        |
| `FLoader`        | `v-overlay`                | Loading overlay with spinner (contained to parent)                    |
| `FPageCard`      | `FCard` + `FLoader`        | Page/section wrapper with loading overlay                             |
| `FListCard`      | `FPageCard` + `FDataTable` | Data list wrapper with search, filters, loading                       |
| `FFormDialog`    | `v-dialog` + `FLoader`     | Form dialog with loading overlay and Save/Cancel                      |

### Usage

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
- [x] Domain-centric composable architecture:
  - [x] TanStack Query for data fetching and caching
  - [x] Case domain composables (`useCases`, `useCase`, `useCaseForm`)
  - [x] Mock API client pattern (`caseApi`)
  - [x] Permissions composable (`usePermissions`) ready for auth

### Pending

- [ ] Authentication/Authorization (usePermissions ready)
- [ ] API integration (backend - mock API pattern established)
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

| File                                             | Purpose                       |
| ------------------------------------------------ | ----------------------------- |
| `apps/web/src/app/providers/vuetify.ts`          | MD3 Blueprint + brand colors  |
| `apps/web/src/app/providers/query.ts`            | TanStack Query configuration  |
| `apps/web/src/styles/settings.scss`              | SASS overrides, global styles |
| `apps/web/src/widgets/app-shell/ui/AppShell.vue` | Main layout with sidebar      |
| `apps/web/src/entities/case/model/useCases.ts`   | Example domain composable     |
| `packages/ui/src/tokens/colors.ts`               | Brand color definitions       |
| `packages/ui/src/index.ts`                       | UI package exports            |

## Conventions

### FSD Import Rules

All imports must follow the FSD layer hierarchy (top to bottom, imports flow downward only):

```
app → pages → widgets → features → entities → shared
```

**Within `apps/web/src/`:**

```typescript
// ✅ CORRECT: Import through layer public APIs
import { FButton, FCard, useToast } from '@/shared/ui'
import { formatDate, usePermissions } from '@/shared/lib'
import { useCases, useCase, useCaseForm, CaseStatusBadge } from '@/entities/case'
import { CaseForm } from '@/features/case-form'
import { AppShell } from '@/widgets'

// ❌ WRONG: Direct package imports (bypasses shared layer)
import { FButton } from '@facts/ui'
import { formatDate } from '@facts/utils'

// ❌ WRONG: Deep imports (bypasses public API)
import AppShell from '@/widgets/app-shell/ui/AppShell.vue'
import CaseStatusBadge from '@/entities/case/ui/CaseStatusBadge.vue'
```

**Re-export structure in shared layer:**

- `@/shared/ui` - Re-exports `@facts/ui` + app-specific UI (toast)
- `@/shared/lib` - Re-exports `@facts/utils` + `usePermissions`
- `@/shared/api` - HTTP client utilities
- `@/shared/config` - App constants

### Component Naming

- FSD slices: PascalCase (e.g., `CaseForm`)
- UI components: `F` prefix (e.g., `FButton`, `FCard`)
- Pages: kebab-case files (e.g., `[id].vue`)

### State Management

- **TanStack Query** for server state (data fetching, caching, mutations)
- **Domain Composables**: `useCases()`, `useCase()`, `useCaseForm()`
- **Pinia** for client-only global state (auth, user preferences)
- Composables live in `entities/*/model/`

### Domain-Centric Composables with TanStack Query

The app uses a **domain-centric composable pattern** powered by TanStack Query:

| Pattern                | Example            | Purpose                             |
| ---------------------- | ------------------ | ----------------------------------- |
| `use{Entity}s()`       | `useCases()`       | List with caching, filtering        |
| `use{Entity}(id)`      | `useCase(id)`      | Single entity with cache            |
| `use{Entity}Form(id?)` | `useCaseForm(id?)` | Create/edit with cache invalidation |

**Architecture:**

```
Pages
  ↓
Domain Composables (entities/case/model/)
├── useCases.ts          # useQuery + domain computed
├── useCase.ts           # useQuery with reactive ID
└── useCaseForm.ts       # useQuery + useMutation
  ↓
TanStack Query (automatic caching, deduplication)
  ↓
API Client (entities/case/api/)
```

**Example: Case Entity**

```typescript
// entities/case/model/useCases.ts - List with caching
export function useCases() {
  const search = ref('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cases'],
    queryFn: () => caseApi.list(),
  })

  const cases = computed(() => data.value ?? [])
  const activeCases = computed(() => cases.value.filter((c) => c.status === 'active'))

  return { cases, isLoading, error, search, load: refetch, activeCases }
}

// entities/case/model/useCaseForm.ts - Mutations with cache invalidation
export function useCaseForm(caseId?: string) {
  const isEditing = !!caseId
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => (isEditing ? caseApi.update(caseId!, data) : caseApi.create(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  })

  return { save: mutation.mutateAsync, isSaving: mutation.isPending, isEditing }
}
```

**Usage in Pages:**

```vue
<script setup lang="ts">
  import { useCases, CaseStatusBadge } from '@/entities/case'

  // Data loads automatically, cached across navigation
  const { cases, isLoading, error, search, activeCases } = useCases()
</script>
```

**Benefits:**

- **Automatic caching**: Navigate back without refetch
- **Cache invalidation**: Mutations update related queries
- **Request deduplication**: Multiple components, one request
- **Self-documenting**: Names reflect domain, not implementation
- **Scalable**: Same pattern for all entities

### Public API Pattern

Each FSD slice must have an `index.ts` that exports its public API:

```typescript
// entities/case/index.ts
export type { Case, CaseStatus } from './model/case'
export { useCases, useCase, useCaseForm } from './model/useCases'
export { default as CaseStatusBadge } from './ui/CaseStatusBadge.vue'
```

Consumers import only from the slice root, never from internal paths.

## Browser Support

Modern browsers only (ES2022+). No IE11 support.
