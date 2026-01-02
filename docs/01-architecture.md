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

## Domain-Centric Composables with TanStack Query

The app uses a **domain-centric composable pattern** powered by TanStack Query:

| Pattern                | Example                | Purpose                             |
| ---------------------- | ---------------------- | ----------------------------------- |
| `use{Entity}s()`       | `useContracts()`       | List with caching, filtering        |
| `use{Entity}(id)`      | `useContract(id)`      | Single entity with cache            |
| `use{Entity}Form(id?)` | `useContractForm(id?)` | Create/edit with cache invalidation |

**Architecture:**

```
Pages
  ↓
Domain Composables (entities/contract/model/)
├── useContracts.ts      # useQuery + domain computed
├── useContract.ts        # useQuery with reactive ID
└── useContractForm.ts    # useQuery + useMutation
  ↓
TanStack Query (automatic caching, deduplication)
  ↓
API Client (entities/contract/api/)
```

**Example:**

```typescript
// entities/contract/model/useContracts.ts
export function useContracts() {
  const userContext = useUserContextStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts', userContext.currentLocationId],
    queryFn: () => contractApi.list(),
  })

  const contracts = computed(() => data.value ?? [])
  const filteredContracts = computed(() => {
    // Filter by location, search, status, etc.
    return contracts.value.filter(...)
  })

  return { contracts: filteredContracts, isLoading, error }
}
```

**Benefits:**

- **Automatic caching**: Navigate back without refetch
- **Cache invalidation**: Mutations update related queries
- **Request deduplication**: Multiple components, one request
- **Self-documenting**: Names reflect domain, not implementation

## State Management

- **TanStack Query** for server state (data fetching, caching, mutations)
- **Domain Composables**: `useContracts()`, `useContract()`, `useContractForm()` - live in `entities/*/model/`
- **Pinia** for client-only global state (auth, user preferences, catalog)
  - Stores located in `shared/lib/stores/`
  - Examples: `useUserContextStore`, `useCatalogStore`

## Location Context

The application supports **location-scoped data access**. Users select a location from the toolbar, and all data (contracts, etc.) is automatically filtered to that location.

**Components:**

- **LocationSelector** - Dropdown in AppShell toolbar
- **User Context Store** - Manages current location selection
- **Domain Composables** - Automatically filter by `currentLocationId`

**Usage:**

```typescript
// All domain composables automatically filter by current location
const { contracts } = useContracts() // Already filtered by location

// Access current location
const userContext = useUserContextStore()
const locationId = computed(() => userContext.currentLocationId)
```

## Public API Pattern

Each FSD slice must have an `index.ts` that exports its public API:

```typescript
// entities/contract/index.ts
export type { Contract, ContractPerson } from './model/contract'
export { useContracts, useContract } from './model/useContracts'
export { default as ContractStatusBadge } from './ui/ContractStatusBadge.vue'
```

**Rule:** Consumers import only from the slice root, never from internal paths.

```typescript
// ✅ CORRECT
import { useContracts } from '@/entities/contract'

// ❌ WRONG
import { useContracts } from '@/entities/contract/model/useContracts'
```
