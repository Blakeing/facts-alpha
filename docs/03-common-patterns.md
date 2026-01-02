# Common Patterns

## Forms

### Form Composables

| Composable          | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `useFormModel`      | Live model state management with Zod validation                |
| `useDirtyForm`      | Snapshot-based dirty tracking for unsaved changes detection    |
| `useConfirm`        | Promise-based confirmation dialogs (pairs with FConfirmDialog) |
| `useFormSave`       | Standardized validate-then-save pattern with error handling    |

### Pattern Decision Guide

| What you're editing | Pattern | Example |
|---------------------|---------|---------|
| Simple field (text, select, date) | Form context (`field="path"`) | ContractGeneral |
| Standalone dialog | `useFormModel` | NameEditorDialog |
| Person/Item in array | Dialog-only editing | ContractPeople |

### Dialog-Only Pattern for Arrays

For arrays of complex objects (people, items, payments), use a **dialog-only editing pattern**:

- **Summary view**: Display-only list/cards showing key information
- **Edit dialog**: Full editing happens in a modal dialog
- **No inline editing**: Prevents performance issues and simplifies state management

**Example:** `ContractPeople` displays a summary view of all people with edit/remove buttons. Clicking "Edit" opens `NameEditorDialog` for full editing.

### Example: Form with Validation

```typescript
// Form state with Zod validation
const { model, errors, validate, getError, touch, reset } = useFormModel(
  contractSchema,
  () => getDefaultValues()
)

// Dirty tracking on the model
const { takeSnapshot, canClose } = useDirtyForm(() => model.value)

// Snapshot when dialog opens
watch(dialogOpen, (open) => {
  if (open) setTimeout(() => takeSnapshot(), 0)
})

// Validation on blur
<FTextField
  v-model="model.name"
  :error="getError('name')"
  @blur="touch('name')"
/>

// Validation on save
async function handleSave() {
  const { valid } = validate()
  if (!valid) return
  await save(model.value)
  takeSnapshot() // Reset dirty state
}
```

## API Integration

### BFF Response Format

The backend (BFF) returns data in a specific format:

```typescript
// Contract endpoint returns ContractSession
interface ContractSession {
  contract: Contract
  permissions: ContractPermissions
  data: ContractSessionData
  executeContract: boolean
  finalizeContract: boolean
  voidContract: boolean
}
```

### ID Generation Pattern

**Upfront ID Generation** - Get real IDs from server before creating entities (matches legacy pattern):

```typescript
// Get IDs upfront
const ids = await runEffect(nextIds(2))
const personId = ids[0]
const nameId = ids[1]

// Create entity with real IDs
const person: ContractPerson = {
  id: personId,
  nameId: nameId,
  name: { ...emptyName, id: nameId },
  // ...
}
```

**Benefits:**
- No temp ID cleanup logic needed
- IDs are valid immediately for client-side tracking
- Matches legacy app exactly

### API Client Pattern

```typescript
// entities/contract/api/contractApi.ts
export const contractApi = {
  get: (id: string): Effect.Effect<ContractSession, ApiError> => {
    return Effect.gen(function* () {
      const client = yield* getHttpClient()
      const response = yield* Effect.tryPromise({
        try: () => client.get<ContractSession>(apiUrls.contracts.detail(id)),
        catch: (error) => toApiError(error, 'get'),
      })
      return response.data
    })
  },
  // ...
}
```

## Full-Screen Dialog Pattern

For complex editing workflows (contracts, orders), use the **full-screen dialog pattern**:

```vue
<!-- features/contract-dialog/ui/ContractDialog.vue -->
<template>
  <FFullScreenDialog
    v-model="model"
    :title="contract?.contractNumber"
  >
    <v-tabs v-model="activeTab">
      <v-tab>General</v-tab>
      <v-tab>People</v-tab>
      <v-tab>Items</v-tab>
    </v-tabs>
    <!-- tab content -->
  </FFullScreenDialog>
</template>
```

**Benefits:**
- Context preservation: User stays on list mentally
- Instant open/close: No navigation delay
- Modal workflow: Forces completion or cancellation
- Complex forms: Tabs, sub-dialogs, validation

