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
    contractApi.ts        # Promise-based mock API (internal)
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

| Function            | Purpose                               | Example                                                      |
| ------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `runEffect`         | Run Effect as Promise (direct exec)   | `const contract = await runEffect(ContractApi.get(id))`      |
| `runEffectQuery`    | Convert Effect to TanStack Query fn   | `queryFn: runEffectQuery(ContractApi.list())`                |
| `runEffectMutation` | Convert Effect fn to mutation fn      | `mutationFn: runEffectMutation((data) => ContractApi.create(data))` |
| `toApiError`        | Map HTTP errors to typed Effect errors | `catch: (error) => toApiError(error, 'contract', id)`        |
| `handleError`       | Pattern match on errors               | `handleError(error, { NetworkError: (e) => ... })`           |
| `errorMessage`      | Convert error to user-friendly string | `errorMessage(error)`                                        |
| `isApiError`        | Type guard for ApiError               | `if (isApiError(error)) { ... }`                             |
| `getErrorTag`        | Get error tag safely                  | `getErrorTag(error) // 'NotFoundError' \| undefined`         |

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
