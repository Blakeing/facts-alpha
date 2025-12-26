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
- `@/shared/lib` - Re-exports `@facts/utils` + security module + composables
  - `@/shared/lib/security` - Security keys, permission types, helpers
  - `@/shared/lib/composables` - `usePermissions` and other composables
- `@/shared/api` - HTTP client utilities
- `@/shared/config` - App constants

## Component Naming

- FSD slices: PascalCase (e.g., `CaseForm`)
- UI components: `F` prefix (e.g., `FButton`, `FCard`)
- Pages: kebab-case files (e.g., `[id].vue`)

## State Management

- **TanStack Query** for server state (data fetching, caching, mutations)
- **Domain Composables**: `useCases()`, `useCase()`, `useCaseForm()`
- **Pinia** for client-only global state (auth, user preferences)
- Composables live in `entities/*/model/`
