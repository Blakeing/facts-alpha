# Effect TS Integration

This document describes the Effect TS integration in Facts Alpha for typed error handling using official Effect patterns and conventions.

## Status

**✅ IMPLEMENTED**: Fully integrated across Contract and Location entities using official Effect patterns.

## Package Overview

The `@facts/effect` package (`packages/effect/`) provides a minimal, idiomatic Effect integration:

```
packages/effect/
  src/
    index.ts              # Re-exports
    errors.ts             # Tagged error types (Data.TaggedError)
    http.ts               # HTTP error mapping (toApiError)
    query.ts              # TanStack Vue Query bridge
```

### Installation

The package is included in the web app's dependencies:

```json
{
  "dependencies": {
    "@facts/effect": "workspace:*",
    "effect": "^3.19.13"
  }
}
```

## Error Types

All API errors use Effect's official `Data.TaggedError` pattern:

```typescript
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  NetworkError,
  ServerError,
  ForbiddenError,
  type ApiError,
} from '@facts/effect'

// Each error has a _tag property for pattern matching
const error = new NotFoundError({ resource: 'contract', id: '123' })
console.log(error._tag) // 'NotFoundError'
```

### Available Error Types

| Error Type          | HTTP Code | Properties                         |
| ------------------- | --------- | ---------------------------------- |
| `NotFoundError`     | 404       | `resource`, `id`                   |
| `ValidationError`   | 400       | `fields: Record<string, string[]>` |
| `UnauthorizedError` | 401       | `message`                          |
| `ForbiddenError`    | 403       | `permission`                       |
| `NetworkError`      | N/A       | `message`, `cause?`                |
| `ServerError`       | 5xx       | `message`, `statusCode`            |

### Union Type

```typescript
type ApiError =
  | NotFoundError
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | NetworkError
  | ServerError
```

## API Effects Pattern

Use `Effect.tryPromise` with `toApiError` to convert HTTP errors to typed Effect errors:

```typescript
// entities/contract/api/contractApi.ts
import * as Effect from 'effect'
import { toApiError, NotFoundError, type ApiError } from '@facts/effect'
import { getHttpClient } from '@/shared/api'

export const ContractApi = {
  /**
   * List all contracts for a location
   */
  list: (): Effect.Effect<ContractListing[], ApiError> =>
    Effect.tryPromise({
      try: () => {
        const client = getHttpClient()
        return client.get<ContractListing[]>(apiUrls.contracts.listing)
      },
      catch: (error: unknown) => toApiError(error, 'contract'),
    }),

  /**
   * Get a single contract by ID
   */
  get: (id: string): Effect.Effect<Contract, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      const response = yield* Effect.tryPromise({
        try: () => client.get<Contract>(apiUrls.contracts.detail(id)),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })

      const contract = response.data
      if (!contract) {
        return yield* Effect.fail(new NotFoundError({ resource: 'contract', id }))
      }

      return contract
    }),
}
```

### HTTP Error Mapping

The `toApiError` utility automatically maps HTTP status codes to typed errors:

- **400 Bad Request** → `ValidationError` (with field-level errors from backend)
- **401 Unauthorized** → `UnauthorizedError`
- **403 Forbidden** → `ForbiddenError`
- **404 Not Found** → `NotFoundError`
- **5xx Server Error** → `ServerError`
- **Network/timeout errors** → `NetworkError`

This aligns with the backend's `Response<T>` pattern and ensures all API errors are type-safe.

## How `toApiError` Works in Practice

### The Problem: Raw Axios Errors

Without `toApiError`, you get raw Axios errors that are:

- ❌ **Untyped** - TypeScript doesn't know what properties exist
- ❌ **Inconsistent** - Different error shapes for different failure modes
- ❌ **Hard to handle** - Manual status code checking everywhere
- ❌ **No pattern matching** - Can't use discriminated unions

**Example: Raw Axios Error (404 Not Found)**

```typescript
// ❌ WITHOUT toApiError - Raw Axios error
try {
  await client.get('/api/v1/contracts/123')
} catch (error) {
  // error is unknown - no type safety!
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      // Manual status checking
      console.log('Not found:', error.response?.data)
      // error.response.data could be anything - string, object, etc.
    } else if (error.response?.status === 400) {
      // More manual checking
      const data = error.response.data
      // How do we know if it has validation errors?
      // Is it { errors: {...} } or { message: "..." } }?
    }
    // ... more manual checks for 401, 403, 500, etc.
  } else if (!error.response) {
    // Network error - but which kind? Timeout? Connection refused?
    console.log('Network error:', error.message)
  }
}
```

**What the error object looks like:**

```typescript
// AxiosError structure (varies by error type)
{
  message: "Request failed with status code 404",
  response: {
    status: 404,
    statusText: "Not Found",
    data: "Contract not found" // or could be { title: "..." } or anything
  },
  code: undefined,
  // ... many other Axios-specific properties
}
```

### The Solution: Typed Effect Errors

With `toApiError`, you get:

- ✅ **Fully typed** - TypeScript knows exactly what properties exist
- ✅ **Consistent** - Same error shape for same failure modes
- ✅ **Pattern matchable** - Discriminated unions with `_tag` property
- ✅ **Effect-compatible** - Works seamlessly with Effect's error handling

**Example: Typed Effect Error (404 Not Found)**

```typescript
// ✅ WITH toApiError - Typed Effect error
Effect.tryPromise({
  try: () => client.get('/api/v1/contracts/123'),
  catch: (error: unknown) => toApiError(error, 'contract', '123'),
})
```

**What the error object looks like:**

```typescript
// NotFoundError - Clean, typed structure
{
  _tag: "NotFoundError",  // Discriminated union tag
  resource: "contract",
  id: "123"
}
```

### Real-World Comparison

#### Scenario 1: 404 Not Found

**❌ Without `toApiError`:**

```typescript
// In API layer
async function getContract(id: string): Promise<Contract> {
  try {
    const response = await client.get(`/api/v1/contracts/${id}`)
    return response.data
  } catch (error) {
    // Manual error handling - no type safety
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`Contract ${id} not found`) // Generic Error
    }
    throw error // Re-throw unknown error
  }
}

// In UI layer
const errorMsg = computed(() => {
  if (!query.error.value) return null

  // Can't pattern match - must check error.message or instanceof
  if (query.error.value instanceof Error) {
    return query.error.value.message
  }
  return 'Unknown error'
})
```

**✅ With `toApiError`:**

```typescript
// In API layer
const getContract = (id: string): Effect.Effect<Contract, ApiError> =>
  Effect.tryPromise({
    try: () => client.get(`/api/v1/contracts/${id}`),
    catch: (error: unknown) => toApiError(error, 'contract', id),
  })

// In UI layer
const errorMsg = computed(() => {
  if (!query.error.value) return null

  // Type-safe pattern matching!
  return handleError(query.error.value, {
    NotFoundError: (e) => `Contract "${e.id}" not found`, // TypeScript knows e.id exists!
    NetworkError: (e) => `Network error: ${e.message}`,
    default: errorMessage,
  })
})
```

#### Scenario 2: 400 Validation Error

**❌ Without `toApiError`:**

```typescript
// Backend returns:
// {
//   "title": "Validation failed",
//   "errors": {
//     "name": ["Name is required"],
//     "identifier": ["Location ID is required"]
//   }
// }

try {
  await client.post('/api/v1/contracts', data)
} catch (error) {
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    const data = error.response.data
    // TypeScript doesn't know the shape - must cast or check manually
    if (typeof data === 'object' && data !== null && 'errors' in data) {
      const errors = (data as { errors: Record<string, string[]> }).errors
      // Now we can use errors, but no type safety
      Object.entries(errors).forEach(([field, messages]) => {
        console.log(`${field}: ${messages.join(', ')}`)
      })
    }
  }
}
```

**✅ With `toApiError`:**

```typescript
// Backend returns same format, but toApiError extracts it cleanly

Effect.tryPromise({
  try: () => client.post('/api/v1/contracts', data),
  catch: (error: unknown) => toApiError(error, 'contract'),
})

// Error is automatically:
{
  _tag: "ValidationError",
  fields: {
    name: ["Name is required"],
    identifier: ["Location ID is required"]
  }
}

// In UI - fully typed!
handleError(error, {
  ValidationError: (e) => {
    // TypeScript knows e.fields exists and is Record<string, string[]>
    return Object.entries(e.fields)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ')
  },
  default: errorMessage,
})
```

#### Scenario 3: Network Error (Timeout)

**❌ Without `toApiError`:**

```typescript
try {
  await client.get('/api/v1/contracts')
} catch (error) {
  if (axios.isAxiosError(error) && !error.response) {
    // Is it a timeout? Connection refused? DNS error?
    if (error.code === 'ECONNABORTED') {
      console.log('Request timed out')
    } else {
      console.log('Network error:', error.message)
    }
  }
}
```

**✅ With `toApiError`:**

```typescript
Effect.tryPromise({
  try: () => client.get('/api/v1/contracts'),
  catch: (error: unknown) => toApiError(error, 'contract'),
})

// Error is automatically:
{
  _tag: "NetworkError",
  message: "Request timed out",  // or "Network request failed"
  cause: <original Axios error>
}

// In UI - consistent handling
handleError(error, {
  NetworkError: (e) => `Network error: ${e.message}`,  // Always consistent
  default: errorMessage,
})
```

### Error Flow Diagram

```
HTTP Request
    │
    ├─ Success → Response.data
    │
    └─ Failure → AxiosError
            │
            ├─ toApiError() transforms it
            │
            ├─ 400 → ValidationError { _tag: "ValidationError", fields: {...} }
            ├─ 401 → UnauthorizedError { _tag: "UnauthorizedError", message: "..." }
            ├─ 403 → ForbiddenError { _tag: "ForbiddenError", permission: "..." }
            ├─ 404 → NotFoundError { _tag: "NotFoundError", resource: "...", id: "..." }
            ├─ 5xx → ServerError { _tag: "ServerError", message: "...", statusCode: 500 }
            └─ Network → NetworkError { _tag: "NetworkError", message: "...", cause: ... }
            │
            └─ Effect.runPromiseExit() preserves typed error
                │
                └─ Thrown to TanStack Query
                    │
                    └─ handleError() pattern matches on _tag
                        │
                        └─ Type-safe error handling in UI
```

### Benefits Summary

| Aspect                 | Without `toApiError`        | With `toApiError`                            |
| ---------------------- | --------------------------- | -------------------------------------------- |
| **Type Safety**        | ❌ `unknown` or `Error`     | ✅ `ApiError` union type                     |
| **Pattern Matching**   | ❌ Manual `if/else` chains  | ✅ `handleError()` with discriminated unions |
| **Error Properties**   | ❌ Must check/cast manually | ✅ TypeScript knows exact properties         |
| **Consistency**        | ❌ Varies by error type     | ✅ Same shape for same error types           |
| **Effect Integration** | ❌ Doesn't work with Effect | ✅ Native Effect error types                 |
| **Code Clarity**       | ❌ Verbose error checking   | ✅ Clean, declarative error handling         |
| **Maintainability**    | ❌ Error handling scattered | ✅ Centralized error mapping                 |

### Complete Example: End-to-End Error Flow

Here's a complete example showing how errors flow from HTTP request to UI display:

**1. API Layer (`entities/contract/api/contractApi.ts`)**

```typescript
import { Effect } from 'effect'
import { toApiError, type ApiError } from '@facts/effect'
import { getHttpClient } from '@/shared/api'

export const ContractApi = {
  get: (id: string): Effect.Effect<Contract, ApiError> =>
    Effect.tryPromise({
      try: () => {
        const client = getHttpClient()
        return client.get<Contract>(`/api/v1/contracts/${id}`)
      },
      catch: (error: unknown) => toApiError(error, 'contract', id),
      // ↑ Converts raw Axios error → typed Effect error
    }),
}
```

**2. What Happens When Request Fails (404)**

```typescript
// HTTP Response:
// Status: 404 Not Found
// Body: "Contract not found"

// Axios throws:
AxiosError {
  message: "Request failed with status code 404",
  response: {
    status: 404,
    statusText: "Not Found",
    data: "Contract not found"
  }
}

// toApiError() transforms it to:
NotFoundError {
  _tag: "NotFoundError",
  resource: "contract",
  id: "123"
}
```

**3. Effect Execution (`packages/effect/src/query.ts`)**

```typescript
// runEffectQuery preserves the typed error
export function runEffectQuery<T, E>(effect: Effect.Effect<T, E>): () => Promise<T> {
  return async () => {
    const exit = await Effect.runPromiseExit(effect)

    if (Exit.isSuccess(exit)) {
      return exit.value
    }

    // Extract typed error and throw it
    const cause = exit.cause
    if (Cause.isFailType(cause)) {
      throw cause.error // ← NotFoundError is thrown (not wrapped!)
    }

    throw new Error(Cause.pretty(cause))
  }
}
```

**4. TanStack Query (`entities/contract/model/useContract.ts`)**

```typescript
const query = useQuery<Contract, Error>({
  queryKey: ['contract', id],
  queryFn: runEffectQuery(ContractApi.get(id)),
  // ↑ Throws NotFoundError when request fails
})

// query.error.value is now:
NotFoundError {
  _tag: "NotFoundError",
  resource: "contract",
  id: "123"
}
```

**5. UI Error Handling (`entities/contract/model/useContract.ts`)**

```typescript
const errorMsg = computed(() => {
  if (!query.error.value) return null

  // Type-safe pattern matching!
  return handleError(query.error.value, {
    NotFoundError: (e) => `Contract "${e.id}" not found`,
    // ↑ TypeScript knows e.id exists!

    NetworkError: (e) => `Network error: ${e.message}`,
    // ↑ TypeScript knows e.message exists!

    UnauthorizedError: () => 'Please log in to view this contract',

    default: errorMessage, // Fallback for other errors
  })
})

// errorMsg.value = "Contract \"123\" not found"
```

**6. Component Usage**

```vue
<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="errorMessage">{{ errorMessage }}</div>
  <!-- ↑ Displays: "Contract \"123\" not found" -->
  <div v-else>{{ contract.name }}</div>
</template>

<script setup lang="ts">
  const { contract, isLoading, errorMessage } = useContract('123')
</script>
```

### Error Transformation Examples

Here are specific examples of how different HTTP errors are transformed:

**Example 1: 400 Validation Error**

```typescript
// Backend Response:
{
  "title": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "identifier": ["Location ID is required", "Location ID must be unique"]
  }
}

// toApiError() produces:
ValidationError {
  _tag: "ValidationError",
  fields: {
    name: ["Name is required"],
    identifier: ["Location ID is required", "Location ID must be unique"]
  }
}

// UI handling:
handleError(error, {
  ValidationError: (e) => {
    // TypeScript knows e.fields is Record<string, string[]>
    return Object.entries(e.fields)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ')
    // Returns: "name: Name is required; identifier: Location ID is required, Location ID must be unique"
  },
})
```

**Example 2: 401 Unauthorized**

```typescript
// Backend Response:
{
  "title": "Authentication required"
}

// toApiError() produces:
UnauthorizedError {
  _tag: "UnauthorizedError",
  message: "Authentication required"
}

// UI handling:
handleError(error, {
  UnauthorizedError: (e) => {
    // TypeScript knows e.message exists
    return `Please log in: ${e.message}`
    // Returns: "Please log in: Authentication required"
  },
})
```

**Example 3: Network Timeout**

```typescript
// Axios throws (no response):
AxiosError {
  code: "ECONNABORTED",
  message: "timeout of 10000ms exceeded",
  response: undefined
}

// toApiError() produces:
NetworkError {
  _tag: "NetworkError",
  message: "Request timed out",
  cause: <original AxiosError>
}

// UI handling:
handleError(error, {
  NetworkError: (e) => {
    // TypeScript knows e.message exists
    return `Connection issue: ${e.message}`
    // Returns: "Connection issue: Request timed out"
  },
})
```

**Example 4: 500 Server Error**

```typescript
// Backend Response:
{
  "message": "Internal server error",
  "statusCode": 500
}

// toApiError() produces:
ServerError {
  _tag: "ServerError",
  message: "Internal server error",
  statusCode: 500
}

// UI handling:
handleError(error, {
  ServerError: (e) => {
    // TypeScript knows e.message and e.statusCode exist
    return `Server error (${e.statusCode}): ${e.message}`
    // Returns: "Server error (500): Internal server error"
  },
})
```

## TanStack Vue Query Bridge

Since `effect-query` is React-only, we provide a minimal Vue Query bridge.

### Query Functions

Convert Effects to TanStack Query functions:

```typescript
import { useQuery } from '@tanstack/vue-query'
import { runEffectQuery } from '@facts/effect'
import { ContractApi } from '../api/contractEffects'

const query = useQuery<ContractListing[], Error>({
  queryKey: ['contracts'],
  queryFn: runEffectQuery(ContractApi.list()),
})
```

### Error Handling

Use `handleError` for type-safe error handling:

```typescript
import { handleError, errorMessage } from '@facts/effect'

const errorMsg = computed(() => {
  if (!query.error.value) return null

  return handleError(query.error.value, {
    NotFoundError: (e) => `${e.resource} "${e.id}" not found`,
    NetworkError: (e) => `Network error: ${e.message}`,
    UnauthorizedError: () => 'Please log in',
    default: errorMessage,
  })
})
```

### Type Guard

Check if an error is an ApiError:

```typescript
import { isApiError, getErrorTag } from '@facts/effect'

if (isApiError(error)) {
  console.log(error._tag) // Type-safe access to tag
}

const tag = getErrorTag(error) // 'NotFoundError' | ... | undefined
```

## Composable Patterns

### List Composable

```typescript
// entities/contract/model/useContracts.ts
import { useQuery } from '@tanstack/vue-query'
import { runEffectQuery, handleError, errorMessage } from '@facts/effect'
import { ContractApi } from '../api/contractEffects'

export function useContracts() {
  const query = useQuery<ContractListing[], Error>({
    queryKey: ['contracts'],
    queryFn: runEffectQuery(ContractApi.list()),
  })

  const errorMsg = computed(() => {
    if (!query.error.value) return null
    return handleError(query.error.value, {
      NetworkError: (e) => `Network error: ${e.message}`,
      UnauthorizedError: () => 'Please log in to view contracts',
      default: errorMessage,
    })
  })

  return {
    contracts: computed(() => query.data.value ?? []),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: errorMsg,
    reload: query.refetch,
  }
}
```

### Single Entity Composable

```typescript
// entities/contract/model/useContract.ts
export function useContract(contractId: MaybeRefOrGetter<string | null | undefined>) {
  const query = useQuery<Contract, Error>({
    queryKey: computed(() => ['contract', toValue(contractId)]),
    queryFn: async () => {
      const id = toValue(contractId)
      if (!id) throw new Error('No contract ID provided')
      return runEffectQuery(ContractApi.get(id))()
    },
    enabled: computed(() => !!toValue(contractId)),
  })

  const errorMsg = computed(() => {
    if (!query.error.value) return null
    return handleError(query.error.value, {
      NotFoundError: (e) => `Contract "${e.id}" not found`,
      NetworkError: (e) => `Network error: ${e.message}`,
      default: errorMessage,
    })
  })

  return {
    contract: computed(() => query.data.value ?? null),
    isLoading: query.isLoading,
    errorMessage: errorMsg,
    reload: query.refetch,
  }
}
```

### Mutations Composable

```typescript
// entities/contract/model/useContractMutations.ts
export function useContractMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation<Contract, Error, ContractFormValues>({
    mutationFn: async (data): Promise<Contract> => {
      return runEffectMutation((data) => ContractApi.create(data))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY })
    },
  })

  return {
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    createErrorMessage: computed(() =>
      createMutation.error.value ? errorMessage(createMutation.error.value) : null,
    ),
  }
}
```

## Architecture

```
packages/effect/src/
  errors.ts         # Tagged error types (Data.TaggedError)
  http.ts           # HTTP error mapping (toApiError)
  query.ts          # Vue Query bridge (runEffectQuery, runEffectMutation, handleError)
  index.ts          # Public exports

entities/contract/
  api/
    contractApi.ts        # Effect-based API client
    contractEffects.ts    # ContractApi object with Effect operations
    index.ts              # Exports ContractApi
  model/
    contract.ts           # Types and enums
    contractSchema.ts     # Zod schemas
    useContracts.ts       # List composable with Effect
    useContract.ts        # Single fetch composable with Effect
    useContractMutations.ts # CRUD composable with Effect
    useContractSession.ts # Complex session logic
    index.ts              # Exports all

entities/location/
  api/
    locationApi.ts        # Effect-based API with HTTP error mapping
    index.ts             # Exports LocationApi
  model/
    useLocations.ts       # List composable with Effect
    useLocation.ts        # Single fetch composable with Effect
    useLocationMutations.ts # CRUD composable with Effect
```

## Function Reference

| Function            | Purpose                                | Example                                                             |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| `runEffect`         | Run Effect as Promise (direct exec)    | `const contract = await runEffect(ContractApi.get(id))`             |
| `runEffectQuery`    | Convert Effect to TanStack Query fn    | `queryFn: runEffectQuery(ContractApi.list())`                       |
| `runEffectMutation` | Convert Effect fn to mutation fn       | `mutationFn: runEffectMutation((data) => ContractApi.create(data))` |
| `toApiError`        | Map HTTP errors to typed Effect errors | `catch: (error) => toApiError(error, 'contract', id)`               |
| `handleError`       | Pattern match on errors                | `handleError(error, { NetworkError: (e) => ... })`                  |
| `errorMessage`      | Convert error to user-friendly string  | `errorMessage(error)`                                               |
| `isApiError`        | Type guard for ApiError                | `if (isApiError(error)) { ... }`                                    |
| `getErrorTag`       | Get error tag safely                   | `getErrorTag(error) // 'NotFoundError' \| undefined`                |

## Official Effect Patterns Used

1. **Data.TaggedError** - For typed error classes
2. **Effect.tryPromise** - For wrapping Promise operations
3. **Effect.gen** - For sequential operations with early exit
4. **Effect.fail** - For explicit failures

## Future Enhancements

### Railway Oriented Programming

Chain operations that can fail:

```typescript
import { Effect, pipe } from 'effect'

const saveContract = (data: ContractFormValues) =>
  pipe(
    validateContract(data),
    Effect.flatMap(() => checkPermissions()),
    Effect.flatMap(() => ContractApi.create(data)),
    Effect.tap(() => invalidateCaches()),
  )
```

### Complex Orchestration

Effect excels at multi-step operations:

```typescript
const finalizeContract = (contractId: string) =>
  Effect.gen(function* () {
    // Step 1: Get and validate contract
    const contract = yield* ContractApi.get(contractId)
    if (contract.balanceDue > 0) {
      return yield* Effect.fail(new BalanceDueError({ amount: contract.balanceDue }))
    }

    // Step 2: Process in parallel
    const results = yield* Effect.all(
      {
        finalized: finalizeContractStatus(contractId),
        documents: generateDocuments(contract),
        notifications: sendNotifications(contract),
      },
      { concurrency: 'unbounded' },
    )

    return results
  })
```

## See Also

- [API Integration](./api-integration.md) - Backend API patterns
- [Data Models](./data-models.md) - Type definitions
- [Roadmap](./roadmap.md) - Future development plans
