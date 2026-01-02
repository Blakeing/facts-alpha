# Facts Alpha - Style Guide & Refactoring Plan

> **Status**: Draft
> **Last Updated**: January 2026
> **References**:
>
> - [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
> - [Feature-Sliced Design](https://feature-sliced.design/docs/get-started/overview)
> - [Microsoft TypeScript Guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)

---

## Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [File Organization](#file-organization)
3. [Migration Plan](#migration-plan)
4. [Future Improvements](#future-improvements)

---

## Naming Conventions

### File Naming Rules

| File Type                  | Convention               | Example                                           |
| -------------------------- | ------------------------ | ------------------------------------------------- |
| **Main entity/module**     | `camelCase.ts`           | `contract.ts`, `location.ts`                      |
| **Purpose-specific files** | `{domain}.{purpose}.ts`  | `contract.draft.ts`, `contract.validation.ts`     |
| **State machines**         | `{feature}.machine.ts`   | `contractEditor.machine.ts`                       |
| **Schemas**                | `{domain}.schema.ts`     | `contract.schema.ts`                              |
| **Helpers/utilities**      | `{domain}.helpers.ts`    | `contract.helpers.ts`                             |
| **Controllers**            | `{domain}.controller.ts` | `contractPersonRole.controller.ts`                |
| **Test files**             | `{filename}.test.ts`     | `contract.draft.test.ts` (in `__tests__/` folder) |
| **Vue components**         | `PascalCase.vue`         | `ContractDialog.vue`                              |
| **Composables**            | `use{Feature}.ts`        | `useContract.ts`, `useContractEditor.ts`          |
| **API files**              | `{domain}Api.ts`         | `contractApi.ts`                                  |
| **Types-only files**       | `{domain}.types.ts`      | `contractEditor.types.ts`                         |
| **Constants**              | `{domain}.constants.ts`  | `contract.constants.ts`                           |
| **Index/barrel exports**   | `index.ts`               | `index.ts`                                        |

### Code Naming Rules

| Type                  | Convention                 | Example                               |
| --------------------- | -------------------------- | ------------------------------------- |
| **Classes**           | PascalCase                 | `ContractEditor`, `UserService`       |
| **Interfaces**        | PascalCase (no `I` prefix) | `ContractDraft`, `EditorContext`      |
| **Types**             | PascalCase                 | `ContractSection`, `ValidationMode`   |
| **Enums**             | PascalCase                 | `ContractStatus`, `NeedType`          |
| **Enum members**      | PascalCase                 | `NeedType.AtNeed`, `SaleStatus.Draft` |
| **Variables**         | camelCase                  | `contractDraft`, `isLoading`          |
| **Functions**         | camelCase                  | `validateContract()`, `getErrors()`   |
| **Constants**         | UPPER_SNAKE_CASE           | `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`  |
| **Boolean variables** | `is`, `has`, `can` prefix  | `isValid`, `hasErrors`, `canSave`     |

### Folder Naming Rules

| Folder Type       | Convention | Example                                  |
| ----------------- | ---------- | ---------------------------------------- |
| **FSD layers**    | lowercase  | `entities/`, `features/`, `shared/`      |
| **FSD slices**    | kebab-case | `contract-dialog/`, `app-shell/`         |
| **FSD segments**  | lowercase  | `model/`, `ui/`, `api/`, `lib/`          |
| **Grouped files** | camelCase  | `contractEditor/` (for machine grouping) |

---

## File Organization

### FSD Layer Structure

```
src/
├── app/                    # App initialization
│   ├── providers/
│   └── index.ts
├── pages/                  # Route pages
├── widgets/                # Large UI compositions
│   └── {widget-name}/
│       ├── model/
│       ├── ui/
│       └── index.ts
├── features/               # Business features
│   └── {feature-name}/
│       ├── model/
│       ├── ui/
│       ├── lib/
│       └── index.ts
├── entities/               # Business entities
│   └── {entity-name}/
│       ├── model/
│       ├── ui/
│       ├── api/
│       └── index.ts
└── shared/                 # Shared utilities
    ├── api/
    ├── lib/
    ├── ui/
    └── config/
```

### Segment Organization

#### `model/` Segment

```
model/
├── {entity}.ts                    # Main entity types
├── {entity}.schema.ts             # Zod schemas
├── {entity}.validation.ts         # Validation logic
├── {entity}.draft.ts              # Draft utilities
├── {entity}.helpers.ts           # Helper functions
├── {feature}.machine.ts           # State machine
├── {feature}.machine.types.ts     # Machine types (optional)
├── {feature}.machine.logic.ts     # Pure logic functions (optional, for testability)
├── use{Feature}.ts                # Composables
├── __tests__/                     # Test files
│   ├── {entity}.draft.test.ts
│   ├── {entity}.validation.test.ts
│   └── {entity}.schema.test.ts
└── index.ts                       # Public API
```

#### `ui/` Segment

```
ui/
├── {Component}.vue
├── {Component}List.vue
├── {Component}Form.vue
└── index.ts                       # (optional)
```

#### `api/` Segment

```
api/
├── {entity}Api.ts
├── transformations.ts             # API transformations
└── index.ts
```

### Test Organization

Tests MUST be placed in `__tests__/` folders within the same segment:

```
✅ CORRECT - Using __tests__ folder
model/
├── contract.draft.ts
├── contract.validation.ts
├── contract.schema.ts
├── __tests__/
│   ├── contract.draft.test.ts
│   ├── contract.validation.test.ts
│   └── contract.schema.test.ts
└── index.ts

✅ CORRECT - For grouped files (machines)
model/
├── contractEditor/
│   ├── machine.ts              # Actions defined inline in setup() for proper TypeScript inference
│   ├── machine.logic.ts         # Pure functions extracted for testability (no XState dependencies)
│   ├── machine.types.ts        # Context, Events, Input types
│   ├── machine.helpers.ts      # Helper utilities
│   ├── __tests__/
│   │   └── machine.test.ts
│   └── index.ts

**Note:** For XState v5 machines, actions should be defined inline in `setup()` to ensure proper TypeScript type inference. Pure logic functions can be extracted to `machine.logic.ts` for testability, but `assign()` calls should remain in the machine definition. See [XState TypeScript docs](https://stately.ai/docs/typescript).

❌ INCORRECT - Co-location (can get messy)
model/
├── contract.draft.ts
├── contract.draft.test.ts         # Clutters directory
├── contract.validation.ts
├── contract.validation.test.ts
```

**Rationale:**

- Keeps source directories clean and focused
- Easy to filter tests in IDE (search for `__tests__`)
- Common pattern in Jest/Vitest projects
- Scales better as test files grow

---

## Migration Plan

### Phase 1: Naming Convention Standardization

#### 1.1 Files to Rename (entities/contract/model/)

| Current                                   | New                                     | Reason                         |
| ----------------------------------------- | --------------------------------------- | ------------------------------ |
| `contractSchema.ts`                       | `contract.schema.ts`                    | Dot notation for purpose files |
| `contractSchema.test.ts`                  | `contract.schema.test.ts`               | Match source file              |
| `contract-person-role-controller.ts`      | `contractPersonRole.controller.ts`      | Dot notation, camelCase        |
| `contract-person-role-controller.test.ts` | `contractPersonRole.controller.test.ts` | Match source file              |

#### 1.2 Files to Rename (entities/name/model/)

| Current           | New               | Reason                         |
| ----------------- | ----------------- | ------------------------------ |
| `name-helpers.ts` | `name.helpers.ts` | Dot notation for purpose files |
| `nameSchema.ts`   | `name.schema.ts`  | Dot notation for purpose files |

#### 1.3 Files to Rename (entities/location/model/)

| Current             | New                  | Reason                         |
| ------------------- | -------------------- | ------------------------------ |
| `locationSchema.ts` | `location.schema.ts` | Dot notation for purpose files |

#### 1.4 Files to Create

| File                                          | Reason                           |
| --------------------------------------------- | -------------------------------- |
| `entities/contract/model/contract.helpers.ts` | Test file exists, source doesn't |

#### 1.5 Files Already Correct ✅

- `contract.ts` - Main entity
- `contract.draft.ts` - Purpose file
- `contract.draft.test.ts` - Test file
- `contract.validation.ts` - Purpose file
- `contract.validation.test.ts` - Test file
- `contractEditor.machine.ts` - Machine file
- `contractEditor.machine.test.ts` - Test file
- `useContract.ts` - Composable
- `useContracts.ts` - Composable
- `contractApi.ts` - API file

### Phase 2: Machine File Restructuring

#### 2.1 Split contractEditor.machine.ts

**Current structure:**

```
features/contract-dialog/model/
├── contractEditor.machine.ts        # 485 lines (too large)
├── contractEditor.machine.test.ts
├── contractEditorContext.ts
├── useContractEditor.ts
└── ...
```

**New structure:**

```
features/contract-dialog/model/
├── contractEditor/
│   ├── machine.ts                   # State machine with inline actions (~260 lines)
│   ├── machine.logic.ts             # Pure functions for actions (testable)
│   ├── machine.types.ts            # Context, Events, Input
│   ├── machine.helpers.ts           # draftsEqual, getSectionFromPath
│   ├── __tests__/
│   │   └── machine.test.ts
│   └── index.ts                     # Exports
├── contractEditorContext.ts
├── useContractEditor.ts
└── ...
```

### Phase 3: Composable Restructuring

#### 3.1 Split useContractEditor.ts

**Current:** 458 lines doing everything

**New structure:**

```
features/contract-dialog/model/
├── useContractEditor.ts             # Main composable (thin wrapper)
├── useContractEditor.query.ts       # Vue Query setup
├── useContractEditor.mutation.ts    # Save mutation
├── contractEditor.helpers.ts        # buildSaveModel, error messages
```

### Phase 4: Shared Code Cleanup

#### 4.1 Extract Common Patterns

- Create `shared/lib/machine/` for machine helpers
- Create `shared/lib/validation/` for validation utilities
- Standardize enum organization

---

## Future Improvements

### Code Quality

- [ ] Add ESLint rules to enforce naming conventions
- [ ] Add path aliases validation
- [ ] Implement import sorting

### Architecture

- [ ] Consider XState v5 actors for async operations
- [ ] Extract test helpers to shared
- [ ] Add error boundary states to machines

### Documentation

- [ ] Add JSDoc to all public APIs
- [ ] Create ADR (Architecture Decision Records)
- [ ] Document machine state diagrams

---

## Checklist for New Files

When creating a new file, verify:

- [ ] File name follows naming convention
- [ ] File is in correct FSD segment
- [ ] Test file is in `__tests__/` folder (if applicable)
- [ ] Exports are added to `index.ts`
- [ ] Imports use public API (not internal paths)

---

## Examples

### Good Example: Entity Structure

```
entities/contract/
├── api/
│   ├── contractApi.ts
│   ├── transformations.ts
│   └── index.ts
├── model/
│   ├── contract.ts                  # Main entity
│   ├── contract.schema.ts           # Zod schema
│   ├── contract.draft.ts            # Draft utilities
│   ├── contract.validation.ts      # Validation
│   ├── contract.helpers.ts          # Helpers
│   ├── contractPersonRole.controller.ts
│   ├── useContract.ts               # Composables
│   ├── useContracts.ts
│   ├── __tests__/                   # All tests here
│   │   ├── contract.schema.test.ts
│   │   ├── contract.draft.test.ts
│   │   ├── contract.validation.test.ts
│   │   ├── contract.helpers.test.ts
│   │   └── contractPersonRole.controller.test.ts
│   └── index.ts
├── ui/
│   └── ContractStatusBadge.vue
└── index.ts
```

### Good Example: Feature Structure

```
features/contract-dialog/
├── model/
│   ├── contractEditor/              # Grouped machine files
│   │   ├── machine.ts               # Actions inline in setup() for type inference
│   │   ├── machine.logic.ts         # Pure functions (extracted for testability)
│   │   ├── machine.types.ts
│   │   ├── machine.helpers.ts
│   │   ├── __tests__/
│   │   │   └── machine.test.ts
│   │   └── index.ts
│   ├── contractEditorContext.ts
│   ├── useContractEditor.ts
│   ├── useContractEditor.query.ts
│   ├── useContractEditor.mutation.ts
│   ├── useContractEditorContext.ts
│   ├── useContractDialogRoute.ts
│   └── index.ts
├── lib/
│   ├── usePersonEditDialog.ts
│   └── usePersonFieldVisibility.ts
├── ui/
│   ├── ContractDialog.vue
│   ├── ContractGeneral.vue
│   ├── ContractItems.vue
│   ├── ContractPayments.vue
│   └── ContractPeople.vue
└── index.ts
```
