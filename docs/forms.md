# Forms

## Form Composables

Reusable form utilities inspired by legacy FACTS app patterns:

| Composable          | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `useFormModel`      | Live model state management with Zod validation                |
| `useDirtyForm`      | Snapshot-based dirty tracking for unsaved changes detection    |
| `useConfirm`        | Promise-based confirmation dialogs (pairs with FConfirmDialog) |
| `useFormSave`       | Standardized validate-then-save pattern with error handling    |
| `useListController` | Standardized list-to-edit workflow with dialog state           |

## Form State Architecture

Understanding how form state flows is crucial for working with our form patterns. We use a **separation of concerns** approach where source data, form state, and dirty tracking are distinct:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EditDialog.vue                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. SOURCE DATA (read-only from server)                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ const { contract } = useContract(contractId)                │   │
│  │                                                             │   │
│  │ What's saved in the database — NEVER mutated directly       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  2. INITIAL VALUES (transform for form)                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ const { initialValues } = useContractForm(contractId)       │   │
│  │                                                             │   │
│  │ Transforms server data → form-friendly shape                │   │
│  │ (e.g., dates as strings, nested structures flattened)       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  3. FORM STATE (live, editable copy)                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ const { model } = useFormModel(schema, initialValues)       │   │
│  │                                                             │   │
│  │ Reactive copy that user edits — mutated by v-model          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  4. DIRTY CHECK (compare model vs snapshot)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ const { canClose } = useDirtyForm(() => model.value)        │   │
│  │                                                             │   │
│  │ Snapshot taken on open → compared to current model          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Variables:**

| Variable        | Purpose                          | Mutated by User? |
| --------------- | -------------------------------- | ---------------- |
| `contract`      | Server data (TanStack Query)     | ❌ Never         |
| `initialValues` | Form-friendly version of data    | ❌ Never         |
| `model`         | User's working copy              | ✅ Yes           |
| `snapshot`      | Frozen copy for dirty comparison | ❌ Never         |

**Why This Pattern?**

1. **Rollback is easy** — just `reset(initialValues)`
2. **Dirty detection is reliable** — compare `model` vs `snapshot` with deep equality
3. **No accidental mutation** — `contract` is read-only from TanStack Query cache
4. **Clear mental model** — each variable has exactly one job

**Naming Convention:**

We use `model` (not `editModel`) because:

- Vue 3.4's `defineModel` establishes `model` as the convention
- In form context, it's unambiguous — the model IS for editing
- The parent already distinguishes: `contract` (source) vs `model` (form state)
- If explicit naming is needed, rename on destructure: `const { model: editModel } = useFormModel(...)`

## Example: Live Model Pattern

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

// Check before close
async function handleClose() {
  const shouldClose = await canClose(() =>
    confirmDialog.confirm({
      title: 'Unsaved Changes',
      message: 'Discard changes?',
      confirmColor: 'error',
    }),
  )
  if (shouldClose) closeDialog()
}
```

## Example: List Controller Pattern

```typescript
// Standardized list-to-edit workflow with automatic prefetch
const { list, editDialog, showAdd, showEdit } = useListController({
  useList: useContracts,
  getItem: contractApi.get,           // Fetch function
  queryKey: (id) => ['contract', id], // Cache key
})

// In template:
<FListCard
  :items="list.filteredContracts.value"
  :loading="list.isLoading.value"
  :busy="editDialog.isBusy.value"
  @click:row="(e, { item }) => showEdit(item)"
>
  <template #commands>
    <FButton @click="showAdd">New Contract</FButton>
  </template>
</FListCard>

<ContractDialog
  v-model="editDialog.visible.value"
  :contract-id="editDialog.itemId.value"
/>
```

## Full-Screen Dialog Pattern (ERP Workflows)

For complex editing workflows (contracts, orders), use the **full-screen dialog pattern**:

| Approach               | Use Case                                           |
| ---------------------- | -------------------------------------------------- |
| **Route-based pages**  | Simple CRUD, deep linking needed (Cases)           |
| **Full-screen dialog** | Complex tabbed forms, master-detail UX (Contracts) |

**Implementation:**

```vue
<!-- pages/contracts/index.vue -->
<template>
  <FListCard @click:row="openContract">
    <!-- list content -->
  </FListCard>

  <ContractDialog
    v-model="dialogVisible"
    :contract-id="selectedId"
    @saved="handleSaved"
  />
</template>
```

```vue
<!-- features/contract-dialog/ui/ContractDialog.vue -->
<template>
  <FFullScreenDialog
    v-model="model"
    :title="contract?.contractNumber"
    :busy="isBusy"
  >
    <template #toolbar>
      <FButton @click="save">Save</FButton>
    </template>

    <v-tabs v-model="activeTab">
      <v-tab>General</v-tab>
      <v-tab>Items</v-tab>
      <v-tab>Payments</v-tab>
    </v-tabs>
    <!-- tab content -->
  </FFullScreenDialog>
</template>
```

**Benefits:**

- **Context preservation**: User stays on list mentally
- **Instant open/close**: No navigation delay
- **Modal workflow**: Forces completion or cancellation
- **Complex forms**: Tabs, sub-dialogs, validation

