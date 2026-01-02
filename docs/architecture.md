# Architecture

## Feature-Sliced Design (FSD)

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
- `model/` - Business logic, state machines, types, domain composables
- `api/` - API calls (if needed)
- `lib/` - Utility functions, feature-specific composables
- `config/` - Constants, configuration

## Project Structure

```
facts-alpha/
├── apps/
│   └── web/                    # Main Vue application
│       └── src/
│           ├── app/            # FSD: App layer (providers, global config)
│           │   └── providers/  # Vue Query, Pinia, Router, Vuetify setup
│           ├── pages/          # FSD: Pages layer (file-based routing)
│           ├── widgets/        # FSD: Widgets layer (composite UI blocks)
│           │   ├── app-shell/  # App shell with navigation
│           │   └── contract-editor/  # Contract editor widget
│           ├── features/       # FSD: Features layer (user interactions)
│           │   ├── contract-dialog/  # Contract editing feature
│           │   │   ├── ui/     # Feature components
│           │   │   ├── model/  # XState machines, context
│           │   │   └── lib/    # Feature-specific utilities
│           │   └── location-dialog/  # Location editing feature
│           ├── entities/       # FSD: Entities layer (business entities)
│           │   ├── contract/   # Contract entity
│           │   │   ├── api/    # Contract API calls
│           │   │   ├── model/  # Domain logic, composables, types
│           │   │   └── ui/     # Entity UI components
│           │   ├── location/   # Location entity
│           │   ├── name/       # Name entity
│           │   └── tenant/     # Tenant entity
│           ├── shared/         # FSD: Shared layer (utilities, API)
│           │   ├── api/        # HTTP client, API utilities
│           │   ├── config/     # App constants, endpoints
│           │   ├── lib/        # Shared utilities
│           │   │   ├── auth/   # Authentication service
│           │   │   ├── composables/  # Shared composables
│           │   │   ├── enums/  # Enum controllers and registries
│           │   │   ├── entity/ # Entity utilities
│           │   │   ├── security/  # Permission system
│           │   │   ├── stores/ # Pinia stores (global state)
│           │   │   └── utilities/  # Helper functions
│           │   └── ui/         # Shared UI components (toast, etc.)
│           └── layouts/        # Layout components (wrappers)
├── packages/
│   ├── ui/                     # @facts/ui - Design system components
│   │   └── src/
│   │       ├── components/     # Wrapper components (FButton, FCard, etc.)
│   │       ├── tokens/         # Design tokens (colors, spacing, typography)
│   │       └── composables/    # Form utilities (useDirtyForm, useConfirm, etc.)
│   └── utils/                  # @facts/utils - Shared utilities
│       └── src/
│           ├── formatters.ts   # Date, currency, number formatting
│           ├── object.ts       # lodash re-exports (cloneDeep, isEqual, etc.)
│           └── validation.ts   # Zod validators (currency, dates, strings)
└── turbo.json                  # Turborepo configuration
```

## Domain-Centric Composables with TanStack Query

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

## State Management

- **TanStack Query** for server state (data fetching, caching, mutations)
- **Domain Composables**: `useCases()`, `useCase()`, `useCaseForm()` - live in `entities/*/model/`
- **Pinia** for client-only global state (auth, user preferences, catalog)
  - Stores located in `shared/lib/stores/`
  - Exported through `@/shared/lib/stores` or `@/shared/lib`
  - Examples: `useUserContextStore`, `useCatalogStore`

## Public API Pattern

Each FSD slice must have an `index.ts` that exports its public API:

```typescript
// entities/case/index.ts
export type { Case, CaseStatus } from './model/case'
export { useCases, useCase, useCaseForm } from './model/useCases'
export { default as CaseStatusBadge } from './ui/CaseStatusBadge.vue'
```

Consumers import only from the slice root, never from internal paths.

## Directory Structure Details

### Shared Layer (`shared/`)

The shared layer contains reusable code that is not tied to business logic:

- **`shared/api/`** - HTTP client, base API classes, API utilities
- **`shared/config/`** - Application constants, endpoint configurations
- **`shared/lib/`** - Shared utilities organized by domain:
  - `auth/` - Authentication service
  - `composables/` - Shared composables (usePermissions, useFormSectionProvider)
  - `enums/` - Enum controllers and registries
  - `entity/` - Entity-related utilities
  - `security/` - Permission system, security keys
  - `stores/` - Pinia stores for global state (user context, catalog)
  - `utilities/` - General helper functions
- **`shared/ui/`** - Shared UI components (toast provider, etc.)

### Features Layer (`features/`)

Features contain user interaction logic and are organized with:

- **`ui/`** - Feature-specific components
- **`model/`** - State machines (XState), context, feature state
- **`lib/`** - Feature-specific utilities and composables (not `composables/`)

### Entities Layer (`entities/`)

Entities represent business domain objects:

- **`api/`** - Entity-specific API calls
- **`model/`** - Domain logic, types, schemas, composables (`useContract`, `useContracts`)
- **`ui/`** - Entity-specific UI components (badges, etc.)

### Layouts (`layouts/`)

Simple layout wrapper components that compose widgets. These are not part of the core FSD layers but provide routing-level structure.
