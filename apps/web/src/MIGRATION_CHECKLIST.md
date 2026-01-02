# Migration Checklist - Naming Conventions

> Track progress on standardizing naming conventions across the codebase.

---

## Phase 1: Entity Renames & Test Organization

### entities/contract/model/

**File Renames:**
| Status | Current File | New File | Notes |
|--------|--------------|----------|-------|
| ⬜ | `contractSchema.ts` | `contract.schema.ts` | Rename + update imports |
| ⬜ | `contract-person-role-controller.ts` | `contractPersonRole.controller.ts` | Rename + update imports |
| ⬜ | (create) | `contract.helpers.ts` | Extract helpers from contract.ts |

**Test File Moves (to **tests** folder):**
| Status | Current File | New File | Notes |
|--------|--------------|----------|-------|
| ⬜ | `contractSchema.test.ts` | `__tests__/contract.schema.test.ts` | Move + update imports |
| ⬜ | `contract-person-role-controller.test.ts` | `__tests__/contractPersonRole.controller.test.ts` | Move + update imports |
| ⬜ | `contract.draft.test.ts` | `__tests__/contract.draft.test.ts` | Move + update imports |
| ⬜ | `contract.validation.test.ts` | `__tests__/contract.validation.test.ts` | Move + update imports |
| ⬜ | `contract.helpers.test.ts` | `__tests__/contract.helpers.test.ts` | Move + update imports |

**Already correct:**

- ✅ `contract.ts` - Main entity
- ✅ `contract.draft.ts` - Purpose file
- ✅ `contract.validation.ts` - Purpose file
- ✅ `useContract.ts` - Composable
- ✅ `useContracts.ts` - Composable
- ✅ `index.ts`

### entities/name/model/

**File Renames:**
| Status | Current File | New File | Notes |
|--------|--------------|----------|-------|
| ⬜ | `name-helpers.ts` | `name.helpers.ts` | Rename + update imports |
| ⬜ | `nameSchema.ts` | `name.schema.ts` | Rename + update imports |

**Test File Moves (if any exist):**
| Status | Current File | New File | Notes |
|--------|--------------|----------|-------|
| ⬜ | (check) | `__tests__/` | Move any test files to **tests** folder |

**Already correct:**

- ✅ `name.ts`
- ✅ `useNameModel.ts`

### entities/location/model/

**File Renames:**
| Status | Current File | New File | Notes |
|--------|--------------|----------|-------|
| ⬜ | `locationSchema.ts` | `location.schema.ts` | Rename + update imports |

**Test File Moves (if any exist):**
| Status | Current File | New File | Notes |
|--------|--------------|----------|-------|
| ⬜ | (check) | `__tests__/` | Move any test files to **tests** folder |

**Already correct:**

- ✅ `location.ts`
- ✅ `useLocation.ts`
- ✅ `useLocations.ts`
- ✅ `useLocationForm.ts`
- ✅ `useLocationMutations.ts`

### entities/\*/api/

| Status | Current File         | New File | Notes           |
| ------ | -------------------- | -------- | --------------- |
| ✅     | `contractApi.ts`     | -        | Already correct |
| ✅     | `locationApi.ts`     | -        | Already correct |
| ✅     | `transformations.ts` | -        | Already correct |

---

## Phase 2: Feature Test Organization

### features/contract-dialog/model/

**Test File Moves:**
| Status | Current File | New File | Notes |
|--------|--------------|----------|-------|
| ⬜ | `contractEditor.machine.test.ts` | `contractEditor/__tests__/machine.test.ts` | Move when restructuring machine |

**Already correct:**
| Status | Current File | Notes |
|--------|--------------|-------|
| ✅ | `contractEditor.machine.ts` | Already correct |
| ✅ | `contractEditorContext.ts` | - | Already correct |
| ✅ | `useContractEditor.ts` | - | Already correct |
| ✅ | `useContractEditorContext.ts` | - | Already correct |
| ✅ | `useContractDialogRoute.ts` | - | Already correct |

### features/contract-dialog/lib/

| Status | Current File                  | New File | Notes           |
| ------ | ----------------------------- | -------- | --------------- |
| ✅     | `usePersonEditDialog.ts`      | -        | Already correct |
| ✅     | `usePersonFieldVisibility.ts` | -        | Already correct |

---

## Phase 3: Shared Renames

### shared/lib/enums/

All enum files are already correctly named (camelCase):

- ✅ `contractPersonRole.ts`
- ✅ `needType.ts`
- ✅ `saleStatus.ts`
- ✅ `saleType.ts`
- ✅ `paymentMethod.ts`
- ✅ `itemType.ts`
- ✅ `lateFeeType.ts`
- ✅ `financingStatus.ts`
- ✅ `atNeedType.ts`
- ✅ `preNeedFundingType.ts`
- ✅ `saleAdjustmentType.ts`
- ✅ `locationType.ts`
- ✅ `licenseType.ts`
- ✅ `EnumController.ts`
- ✅ `EnumRegistry.ts`

### shared/lib/stores/

| Status | Current File     | New File | Notes           |
| ------ | ---------------- | -------- | --------------- |
| ✅     | `userContext.ts` | -        | Already correct |
| ✅     | `catalog.ts`     | -        | Already correct |

### shared/lib/utilities/

| Status | Current File | New File | Notes           |
| ------ | ------------ | -------- | --------------- |
| ✅     | `clone.ts`   | -        | Already correct |

---

## Phase 4: Machine Restructuring

### Split contractEditor.machine.ts (485 lines)

| Status | Task                            | Description                                            |
| ------ | ------------------------------- | ------------------------------------------------------ |
| ✅     | Create `contractEditor/` folder | Group machine files                                    |
| ✅     | Extract `machine.types.ts`      | Context, Events, Input types                           |
| ✅     | Extract `machine.helpers.ts`    | draftsEqual, getSectionFromPath                        |
| ✅     | Extract `machine.logic.ts`      | Pure logic functions (actions defined inline in setup) |
| ✅     | Refactor `machine.ts`           | Actions defined inline for proper TypeScript inference |
| ✅     | Move `machine.test.ts`          | Move to `__tests__/machine.test.ts`                    |
| ✅     | Create `index.ts`               | Export public API                                      |
| ✅     | Update imports                  | All files importing from machine                       |

---

## Phase 5: Composable Restructuring

### Split useContractEditor.ts (458 lines)

| Status | Task                                    | Description                         |
| ------ | --------------------------------------- | ----------------------------------- |
| ⬜     | Extract `useContractEditor.query.ts`    | Vue Query setup                     |
| ⬜     | Extract `useContractEditor.mutation.ts` | Save mutation                       |
| ⬜     | Extract `contractEditor.helpers.ts`     | buildSaveModel, error messages      |
| ⬜     | Slim down `useContractEditor.ts`        | Thin wrapper composable             |
| ⬜     | Update imports                          | All files importing from composable |

---

## Import Updates Required

After each rename, update imports in:

### For contract.schema.ts rename:

- [ ] `entities/contract/model/index.ts`
- [ ] `entities/contract/model/contract.draft.ts`
- [ ] `entities/contract/model/contract.validation.ts`
- [ ] Any other files importing contractSchema

### For contractPersonRole.controller.ts rename:

- [ ] `entities/contract/model/index.ts`
- [ ] `entities/contract/index.ts`

### For name.helpers.ts rename:

- [ ] `entities/name/model/index.ts` (if exists)
- [ ] `entities/name/index.ts`

### For name.schema.ts rename:

- [ ] `entities/name/model/index.ts` (if exists)
- [ ] Any files importing nameSchema

### For location.schema.ts rename:

- [ ] `entities/location/model/index.ts`
- [ ] Any files importing locationSchema

---

## Validation Steps

After completing each phase:

1. [ ] Run `pnpm typecheck` - Verify no TypeScript errors
2. [ ] Run `pnpm test` - Verify all tests pass
3. [ ] Run `pnpm lint` - Verify no linting errors
4. [ ] Manual review - Check for any missed imports

---

## Estimated Effort

| Phase                                | Files                    | Estimated Time |
| ------------------------------------ | ------------------------ | -------------- |
| Phase 1: Entity Renames + Test Moves | 7 renames + 5 test moves | 2-3 hours      |
| Phase 2: Feature Renames             | 0 renames                | Already done   |
| Phase 3: Shared Renames              | 0 renames                | Already done   |
| Phase 4: Machine Restructure         | 7 new files              | 2-3 hours      |
| Phase 5: Composable Restructure      | 4 new files              | 1-2 hours      |

**Total estimated time: 5-8 hours**

**Note:** Phase 1 includes creating `__tests__/` folders and moving all test files.

---

## Notes

- Always run tests after each rename
- Use IDE refactoring tools when available (safer than manual)
- Commit after each phase for easy rollback
- Update this checklist as progress is made
