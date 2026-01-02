# Conventions

## FSD Import Rules

All imports must follow the FSD layer hierarchy (top to bottom, imports flow downward only):

```
app → pages → widgets → features → entities → shared
```

**Within `apps/web/src/`:**

```typescript
// ✅ CORRECT: Import through layer public APIs
import { FButton, FCard, useToast } from '@/shared/ui'
import { formatDate, usePermissions, SecurityOptionKeys, readRequirement } from '@/shared/lib'
import { useUserContextStore, useCatalogStore } from '@/shared/lib/stores'
// or import { useUserContextStore } from '@/shared/lib' (re-exported)
import { useContracts, useContract, ContractStatusBadge } from '@/entities/contract'
import { ContractDialog, useContractEditor } from '@/features/contract-dialog'
import { AppShell } from '@/widgets'

// ❌ WRONG: Direct package imports (bypasses shared layer)
import { FButton } from '@facts/ui'
import { formatDate } from '@facts/utils'

// ❌ WRONG: Deep imports (bypasses public API)
import AppShell from '@/widgets/app-shell/ui/AppShell.vue'
import ContractStatusBadge from '@/entities/contract/ui/ContractStatusBadge.vue'
import { ContractApi } from '@/entities/contract/api/contractApi' // Should use @/entities/contract
import { contractPersonRoleController } from '@/entities/contract/model/contract-person-role-controller' // Should use @/entities/contract
import { SaleStatus } from '@/entities/contract/model/contract' // Should use @/entities/contract
```

**Re-export structure in shared layer:**

- `@/shared/ui` - Re-exports `@facts/ui` + app-specific UI (toast)
- `@/shared/lib` - Re-exports `@facts/utils` + security module + composables + stores
  - `@/shared/lib/security` - Security keys, permission types, helpers
  - `@/shared/lib/composables` - `usePermissions`, `useFormSectionProvider`
  - `@/shared/lib/stores` - Pinia stores (`useUserContextStore`, `useCatalogStore`)
  - `@/shared/lib/enums` - Enum controllers and registries
  - `@/shared/lib/auth` - Authentication service
- `@/shared/api` - HTTP client utilities, API base classes
- `@/shared/config` - App constants, endpoints

## File Naming

### TypeScript/JavaScript Files

- **Format**: kebab-case (lowercase with hyphens)
- **Examples**:
  - `contract-api.ts`
  - `use-contract-editor.ts`
  - `contract-person-role-controller.ts`
  - `name-helpers.ts`
  - `contract-validation.ts`

### Vue Component Files

- **Format**: PascalCase (Vue.js official style guide)
- **Examples**:
  - `ContractDialog.vue`
  - `AppShell.vue`
  - `ContractStatusBadge.vue`

### Test Files

- **Format**: kebab-case + `.test.ts` suffix
- **Examples**:
  - `contract-validation.test.ts`
  - `contract-person-role-controller.test.ts`
  - `contract-editor.machine.test.ts`

## Export Naming

### Functions & Variables

- **Format**: camelCase
- **Examples**: `useContracts()`, `getPrimaryBuyer()`, `calculateSaleTotals()`

### Types & Interfaces

- **Format**: PascalCase
- **Examples**: `Contract`, `ContractPerson`, `ContractFormValues`

### Classes

- **Format**: PascalCase
- **Examples**: `ContractPersonRoleController`, `EnumController`

### Enums

- **Format**: PascalCase
- **Examples**: `SaleStatus`, `NeedType`, `ContractPersonRole`

### Constants

- **Primitive constants**: UPPER_SNAKE_CASE
  - Examples: `CONTRACTS_QUERY_KEY`, `APP_NAME`, `PAGINATION_DEFAULT_PAGE_SIZE`
- **Configuration objects**: camelCase
  - Examples: `apiUrls`, `saleStatusColors`, `PaymentMethod`
- **Zod schemas**: camelCase with `Schema` suffix
  - Examples: `PeopleSectionSchema`, `ContractFormSchema`
- **API service objects**: PascalCase
  - Examples: `ContractApi`, `LocationApi`, `NextIdApi`
- **Pinia stores**: camelCase with `use` prefix
  - Examples: `useUserContextStore`, `useCatalogStore`
- **Injection keys**: UPPER_SNAKE_CASE
  - Examples: `CONTRACT_EDITOR_KEY`

## Component Naming

- FSD slices: PascalCase (e.g., `CaseForm`)
- UI components: `F` prefix (e.g., `FButton`, `FCard`)
- Pages: kebab-case files (e.g., `[id].vue`)

## State Management

- **TanStack Query** for server state (data fetching, caching, mutations)
- **Domain Composables**: `useCases()`, `useCase()`, `useCaseForm()` - live in `entities/*/model/`
- **Pinia** for client-only global state (auth, user preferences, catalog)
  - Stores located in `shared/lib/stores/`
  - Import from `@/shared/lib/stores` or `@/shared/lib`
  - Examples: `useUserContextStore`, `useCatalogStore`

## Feature Structure

Features should use `lib/` (not `composables/`) for feature-specific utilities:

```
features/contract-dialog/
├── ui/              # Feature components
├── model/           # XState machines, context, state
└── lib/             # Feature-specific utilities (usePersonEditDialog, etc.)
```
