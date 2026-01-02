# Conventions & Style Guide

## Naming Conventions

### Files

| File Type                  | Convention              | Example                                            |
| -------------------------- | ----------------------- | -------------------------------------------------- |
| **Main entity/module**     | `camelCase.ts`          | `contract.ts`, `location.ts`                       |
| **Purpose-specific files** | `{domain}.{purpose}.ts` | `contract.schema.ts`, `contract.validation.ts`     |
| **State machines**         | `{feature}.machine.ts`  | `contractEditor.machine.ts`                        |
| **Vue components**         | `PascalCase.vue`        | `ContractDialog.vue`                               |
| **Composables**            | `use{Feature}.ts`       | `useContract.ts`, `useContractEditor.ts`           |
| **API files**              | `{domain}Api.ts`        | `contractApi.ts`                                   |
| **Test files**             | `{filename}.test.ts`    | `contract.schema.test.ts` (in `__tests__/` folder) |

### Code

| Type                  | Convention                 | Example                              |
| --------------------- | -------------------------- | ------------------------------------ |
| **Classes**           | PascalCase                 | `ContractEditor`, `UserService`      |
| **Interfaces**        | PascalCase (no `I` prefix) | `ContractDraft`, `EditorContext`     |
| **Types**             | PascalCase                 | `ContractSection`, `ValidationMode`  |
| **Enums**             | PascalCase                 | `ContractStatus`, `NeedType`         |
| **Variables**         | camelCase                  | `contractDraft`, `isLoading`         |
| **Functions**         | camelCase                  | `validateContract()`, `getErrors()`  |
| **Constants**         | UPPER_SNAKE_CASE           | `MAX_RETRY_ATTEMPTS`, `API_BASE_URL` |
| **Boolean variables** | `is`, `has`, `can` prefix  | `isValid`, `hasErrors`, `canSave`    |

## FSD Import Rules

All imports must follow the FSD layer hierarchy (top to bottom, imports flow downward only):

```
app → pages → widgets → features → entities → shared
```

**Within `apps/web/src/`:**

```typescript
// ✅ CORRECT: Import through layer public APIs
import { FButton, FCard } from '@/shared/ui'
import { useContracts } from '@/entities/contract'
import { ContractDialog } from '@/features/contract-dialog'

// ❌ WRONG: Direct package imports (bypasses shared layer)
import { FButton } from '@facts/ui'

// ❌ WRONG: Deep imports (bypasses public API)
import { useContracts } from '@/entities/contract/model/useContracts'
```

## File Organization

### Test Files

Tests MUST be placed in `__tests__/` folders:

```
✅ CORRECT
model/
├── contract.schema.ts
├── __tests__/
│   └── contract.schema.test.ts
└── index.ts

❌ INCORRECT
model/
├── contract.schema.ts
├── contract.schema.test.ts  # Clutters directory
```

## Checklist for New Files

- [ ] File name follows naming convention
- [ ] File is in correct FSD segment
- [ ] Test file is in `__tests__/` folder (if applicable)
- [ ] Exports are added to `index.ts`
- [ ] Imports use public API (not internal paths)
