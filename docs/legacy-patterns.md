# Legacy Frontend Patterns

This document captures valuable patterns from the legacy `facts-app` Vue 2 application that can be leveraged in Facts Alpha.

## Overview

The legacy app (`Facts.App/facts-app`) uses:

- **Vue 2** with Options API and Class Components
- **Vuetify 2**
- **Vuex** for state management
- **Axios** for HTTP requests
- **SignalR** for real-time updates
- **Class-based controllers** for business logic

While Facts Alpha uses Vue 3 with Composition API, many patterns are transferable.

## API Layer Patterns

### BaseApi Pattern

The legacy app uses a generic `BaseApi` class that provides:

```typescript
// Legacy: api/base/BaseApi.ts
abstract class BaseApi<TListModel, TEntity, TEditModel> {
  protected _basePath: string
  protected _listingPath: string

  // CRUD operations
  async insert(model: TEditModel): Promise<TEntity>
  async update(model: TEditModel, id: string): Promise<TEntity>
  async delete(model: TEntity): Promise<void>
  async history(id: string): Promise<ChangeLogEntryModel[]>

  // Cache management
  async added(e: TEntity): void
  async updated(e: TEntity): void
  async deleted(e: TEntity): void

  // Real-time notifications
  protected ReceiveNotifications(subject: string): void
}
```

**Key Features:**

1. **Automatic caching**: Uses `CachedApiCall` to cache listing data
2. **Location-scoped data**: Supports `{locationId}` token in URLs
3. **SignalR integration**: Subscribes to entity change notifications
4. **Cache invalidation**: Automatically updates cache on CRUD operations

**Facts Alpha Equivalent:**
Our domain composables (`useLocations`, `useLocation`, etc.) with TanStack Query provide similar functionality:

- TanStack Query handles caching and deduplication
- Query invalidation on mutations
- Real-time can be added via WebSocket integration

### Listing vs Entity Pattern

The legacy app distinguishes between:

```typescript
// Minimal listing model for list views
interface LocationListing {
  id: string
  identifier: string
  name: string
  city: string
  state: string
  type: string
}

// Full entity for detail/edit views
interface Location {
  // All fields from listing plus...
  address1: string
  address2: string
  // ... many more fields
}

// Form submission model
interface LocationEditModel {
  id: string
  model: LocationModel
  settings: LocationSettings
  areas: LocationArea[]
}
```

**Why This Matters:**

- List views load faster with minimal data
- Detail views fetch full entity on demand
- Form models can include related data (settings, areas)

**Facts Alpha Status:** ✅ Already implemented with `LocationListing` and `Location` types.

## Controller Pattern

### BaseController

The legacy app uses controllers to manage view state:

```typescript
// Legacy: controllers/base/BaseController.ts
abstract class BaseController<TEntity, TModel, TListing, TApi> {
  // List state
  listOptions: DataListParameters = {
    searchString: '',
    searchEnabled: true,
    title: 'Untitled',
    rows: [],
    loading: true,
    sortColumn: '',
    sortDescending: false,
  }

  // Edit state
  editOptions: EditModelOptions<TModel> = {
    model: {} as TModel,
    editPanelVisible: false,
    saveError: '',
    busy: false,
  }

  // Permission checks
  canView(): boolean
  canEdit(): boolean

  // Actions
  abstract showAdd(): void
  abstract showEdit(model: TListing): void
  abstract save(item: TModel, id: string): Promise<void>

  // Protected helper
  protected async doSaveAction(action: () => Promise<TEntity>): Promise<TEntity | undefined>
}
```

**Key Features:**

1. **Centralized state**: List options, edit options in one place
2. **Permission integration**: `canView()` and `canEdit()` check security
3. **Error handling**: `doSaveAction` wraps mutations with error handling
4. **Loading states**: `loading`, `busy` flags for UI

**Facts Alpha Equivalent:**
Our composables handle this, but we should add:

- Permission checks in composables
- Centralized error handling

```typescript
// Recommended pattern for Facts Alpha
export function useLocations() {
  const { hasPermission } = usePermissions()

  // Permission checks
  const canView = computed(() => hasPermission('locations', 'read'))
  const canEdit = computed(() => hasPermission('locations', 'edit'))

  return {
    // ... existing
    canView,
    canEdit,
  }
}
```

## App Service Singleton

### Global State Management

The legacy app uses a singleton `App` class:

```typescript
// Legacy: services/app.ts
class App {
  // HTTP client with auth
  client: AxiosInstance

  // Tenant context
  tenantId: string
  homeTenantId: string

  // Current location context
  currentLocationId: string
  currentLocationName: string
  currentLocationPeriod: Date
  currentLocationSettings: LocationSettings

  // User context
  currentUserId: string
  currentUserFullName: string

  // Security
  securityValidator: SecurityValidator

  // Features flags
  features: Features

  // Methods
  async OpenLocation(locationId: string): Promise<Location>
  async reset(tenantId: string): Promise<void>
}

export const app: App = new App()
```

**Facts Alpha Equivalent:**
We have this split across:

- `stores/userContext.ts` - User and location context (Pinia)
- `shared/api/httpClient.ts` - HTTP client
- Feature flags (TBD)

**Recommendation:** Keep separated but ensure consistent patterns.

## Real-Time Updates

### SignalR Integration

The legacy app subscribes to entity changes:

```typescript
// Legacy: services/SignalRService.ts
class SignalR {
  subscribeToEntityChanges<T>(
    subject: string,
    handler: (evt: ParsedLogEntry<T>) => void
  ): SignalRListener
}

// Usage in BaseApi
protected ReceiveNotifications(subject: string) {
  signalR.subscribeToEntityChanges<TEntity>(
    subject,
    (evt) => {
      if (evt.logEntry.entryType === EntryType.Insert) {
        this.updated(evt.resultingEntity)
      } else if (evt.logEntry.entryType === EntryType.Update) {
        this.updated(evt.resultingEntity)
      } else if (evt.logEntry.entryType === EntryType.Delete) {
        this.deleted(evt.resultingEntity)
      }
    }
  )
}
```

**Facts Alpha Strategy:**
When real-time is needed:

1. Create `services/signalr.ts` with connection management
2. Create composable `useEntitySubscription(entityType, handler)`
3. Integrate with TanStack Query's `queryClient.setQueryData`

```typescript
// Future implementation sketch
export function useLocationSubscription() {
  const queryClient = useQueryClient()

  onMounted(() => {
    const unsubscribe = signalR.subscribe('Location', (event) => {
      if (event.type === 'updated') {
        // Update cache directly
        queryClient.setQueryData(['location', event.entity.id], event.entity)
        // Invalidate list
        queryClient.invalidateQueries({ queryKey: ['locations'] })
      }
    })

    onUnmounted(unsubscribe)
  })
}
```

## Complex Form Orchestration

### ContractSession Pattern

The most complex pattern is `ContractSession` for managing contract editing:

```typescript
// Legacy: models/contracts/ContractSession.ts
class ContractSession {
  // Core model
  model: ContractModel

  // State tracking
  isDirty: boolean
  isNew: boolean

  // Handlers for different sections
  generalHandler: GeneralHandler
  personHandler: PersonHandler
  itemsHandler: ItemsHandler
  paymentsHandler: PaymentsHandler
  // ... 20+ handlers

  // Validation
  async validate(): Promise<ValidationResult>

  // Save orchestration
  async save(): Promise<SaveResult>
}
```

**Key Features:**

1. **Handler composition**: Each section has its own handler
2. **Centralized validation**: Single validate method checks all handlers
3. **Orchestrated save**: Coordinates saving across multiple related entities
4. **State tracking**: Tracks dirty state across all handlers

**Facts Alpha Approach:**
For complex forms like contracts:

```typescript
// Composable composition pattern
export function useContractForm(contractId?: string) {
  // Core form state
  const { model, isDirty, reset } = useFormModel(contractSchema)

  // Section handlers as composables
  const general = useContractGeneralSection(model)
  const persons = useContractPersonsSection(model)
  const items = useContractItemsSection(model)
  const payments = useContractPaymentsSection(model)

  // Combined validation
  const errors = computed(() => ({
    ...general.errors.value,
    ...persons.errors.value,
    ...items.errors.value,
    ...payments.errors.value,
  }))

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  // Orchestrated save
  async function save() {
    if (!isValid.value) return { success: false, errors: errors.value }

    // Save in correct order with proper transaction handling
    // (This is where Effect TS will shine)
  }

  return {
    model,
    isDirty,
    isValid,
    errors,
    save,
    sections: { general, persons, items, payments },
  }
}
```

## Error Handling

### HTTP Error Resolution

The legacy app has a utility for resolving errors:

```typescript
// Legacy: utilities/Http.ts
function resolveErrorString(e: AxiosError | any): string {
  if (e.response) {
    if (e.response.status === 409) {
      return unquoted(e.response.data) ?? 'Value already exists'
    } else if (e.response.status === 500) {
      return 'Server error'
    } else if (e.response.status === 400) {
      return e.response.data?.title ?? unquoted(e.response.data) ?? 'Bad Request'
    } else if (e.response.status === 403) {
      return e.response.data?.title ?? unquoted(e.response.data) ?? 'Access denied'
    }
    // ...
  }
  return e?.toString() ?? 'Unknown error'
}
```

**Facts Alpha Recommendation:**
Create similar utility in `shared/lib/errorUtils.ts`:

```typescript
export function resolveApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// With Effect TS, errors will be typed
export class NotFoundError extends Error {
  readonly _tag = 'NotFoundError'
}
export class ValidationError extends Error {
  readonly _tag = 'ValidationError'
  constructor(public readonly fields: Record<string, string>) {
    super('Validation failed')
  }
}
```

## Security Validation

### Permission Checking

```typescript
// Legacy: services/SecurityValidator.ts
class SecurityValidator {
  userPermissions: UserPermissions | null

  userCanWithKeyNumber(keyNumber: number, level: PermissionLevel): boolean {
    if (!this.userPermissions) return false
    // Check permissions...
  }
}

// Usage
if (
  app.securityValidator.userCanWithKeyNumber(
    SecurityOptionKeys.ProcessContracts,
    PermissionLevel.Edit,
  )
) {
  // Allow action
}
```

**Facts Alpha Status:** ✅ We have `usePermissions()` composable.

## Summary: Patterns to Adopt

| Legacy Pattern       | Facts Alpha Equivalent   | Status                 |
| -------------------- | ------------------------ | ---------------------- |
| BaseApi caching      | TanStack Query           | ✅ Done                |
| Listing/Entity split | LocationListing/Location | ✅ Done                |
| Controller state     | Composables              | ✅ Done                |
| Permission checks    | usePermissions           | ✅ Done                |
| SignalR real-time    | TBD                      | 🔜 Future              |
| Error resolution     | TBD                      | 🔜 Add utility         |
| ContractSession      | Composable composition   | 🔜 For complex forms   |
| App singleton        | Pinia stores             | ✅ Split across stores |

## Migration Path

When implementing new features:

1. **Look at legacy implementation** for business logic
2. **Adapt to Vue 3 patterns** (Composition API, composables)
3. **Use TanStack Query** instead of manual caching
4. **Keep type alignments** with backend models
5. **Plan for Effect TS** for complex async operations
