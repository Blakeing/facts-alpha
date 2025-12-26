# Effect TS Strategy

This document outlines the strategy for integrating Effect TS into Facts Alpha for typed error handling and complex async orchestration.

> **Note:** Effect TS integration is planned for when we connect to the real backend API. This document serves as a design reference.

## Why Effect TS?

### Problem: Untyped Errors

Current JavaScript/TypeScript error handling has limitations:

```typescript
// Current pattern - errors are untyped
async function getLocation(id: string): Promise<Location> {
  const response = await fetch(`/api/locations/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch location') // What kind of error?
  }
  return response.json()
}

// Caller has no idea what errors can occur
try {
  const location = await getLocation('123')
} catch (error) {
  // error is 'unknown' - could be anything
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

### Solution: Typed Errors with Effect

```typescript
import { Effect } from 'effect'

// Define specific error types
class NotFoundError {
  readonly _tag = 'NotFoundError'
  constructor(readonly resource: string, readonly id: string) {}
}

class UnauthorizedError {
  readonly _tag = 'UnauthorizedError'
}

class NetworkError {
  readonly _tag = 'NetworkError'
  constructor(readonly message: string) {}
}

// Function signature declares possible errors
function getLocation(
  id: string
): Effect.Effect<Location, NotFoundError | UnauthorizedError | NetworkError> {
  return Effect.tryPromise({
    try: () => fetch(`/api/locations/${id}`).then(r => r.json()),
    catch: (error) => new NetworkError(String(error)),
  })
}

// Caller knows exactly what errors can occur
const program = getLocation('123').pipe(
  Effect.catchTag('NotFoundError', (e) => 
    Effect.succeed(null) // Handle not found
  ),
  Effect.catchTag('UnauthorizedError', (e) =>
    Effect.fail(new RedirectToLoginError()) // Escalate
  )
)
```

### Backend Alignment

The backend already uses a Result pattern:

```csharp
// Backend C#
public class Response<T> : ResponseBase {
    public T Value { get; set; }
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string ErrorMessage { get; set; }
}
```

Effect TS provides the same pattern with better TypeScript support.

## Implementation Plan

### Phase 1: Package Setup

Create `@facts/effect` package:

```
packages/
  effect/
    src/
      index.ts          # Re-exports
      errors.ts         # Domain error types
      api.ts            # Effect-based HTTP client
      bridge.ts         # TanStack Query integration
    package.json
```

### Phase 2: Error Types

Define domain-specific errors:

```typescript
// packages/effect/src/errors.ts
import { Data } from 'effect'

// Base API errors
export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly resource: string
  readonly id: string
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly fields: Record<string, string[]>
}> {}

export class UnauthorizedError extends Data.TaggedError('UnauthorizedError')<{
  readonly message: string
}> {}

export class ForbiddenError extends Data.TaggedError('ForbiddenError')<{
  readonly permission: string
}> {}

export class NetworkError extends Data.TaggedError('NetworkError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

export class ServerError extends Data.TaggedError('ServerError')<{
  readonly message: string
  readonly statusCode: number
}> {}

// Union type for all API errors
export type ApiError =
  | NotFoundError
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | NetworkError
  | ServerError
```

### Phase 3: Effect-Based API Client

```typescript
// packages/effect/src/api.ts
import { Effect, pipe } from 'effect'
import type { ApiError } from './errors'
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NetworkError,
  ServerError,
} from './errors'

export function apiGet<T>(
  url: string
): Effect.Effect<T, ApiError> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        const response = await fetch(url, {
          headers: getAuthHeaders(),
        })
        return { response, data: await response.json() }
      },
      catch: (error) => new NetworkError({ 
        message: String(error),
        cause: error 
      }),
    }),
    Effect.flatMap(({ response, data }) => {
      if (response.ok) {
        return Effect.succeed(data as T)
      }
      
      // Map HTTP status to typed error
      switch (response.status) {
        case 400:
          return Effect.fail(new ValidationError({ 
            fields: data?.errors ?? {} 
          }))
        case 401:
          return Effect.fail(new UnauthorizedError({ 
            message: data ?? 'Unauthorized' 
          }))
        case 403:
          return Effect.fail(new ForbiddenError({ 
            permission: data ?? 'Unknown' 
          }))
        case 404:
          return Effect.fail(new NotFoundError({ 
            resource: url, 
            id: '' 
          }))
        default:
          return Effect.fail(new ServerError({ 
            message: data ?? 'Server error',
            statusCode: response.status 
          }))
      }
    })
  )
}

export function apiPost<T>(
  url: string, 
  body: unknown
): Effect.Effect<T, ApiError> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
        return { response, data: await response.json() }
      },
      catch: (error) => new NetworkError({ 
        message: String(error),
        cause: error 
      }),
    }),
    Effect.flatMap(({ response, data }) => {
      // Same error mapping as GET
      if (response.ok) {
        return Effect.succeed(data as T)
      }
      // ... error handling
    })
  )
}
```

### Phase 4: TanStack Query Bridge

```typescript
// packages/effect/src/bridge.ts
import { Effect, Runtime } from 'effect'
import type { QueryFunction } from '@tanstack/vue-query'

/**
 * Convert an Effect to a TanStack Query function
 */
export function effectToQueryFn<T, E>(
  effect: Effect.Effect<T, E>,
  runtime = Runtime.defaultRuntime
): QueryFunction<T> {
  return async () => {
    const result = await Runtime.runPromiseExit(runtime)(effect)
    
    if (result._tag === 'Success') {
      return result.value
    }
    
    // Convert Effect failure to thrown error for TanStack Query
    throw result.cause
  }
}

/**
 * Create a query options object from an Effect
 */
export function effectQuery<T, E>(
  queryKey: unknown[],
  effect: Effect.Effect<T, E>
) {
  return {
    queryKey,
    queryFn: effectToQueryFn(effect),
  }
}

/**
 * Create mutation options from an Effect function
 */
export function effectMutation<TData, TVariables, E>(
  mutationFn: (variables: TVariables) => Effect.Effect<TData, E>
) {
  return {
    mutationFn: async (variables: TVariables) => {
      const result = await Effect.runPromise(mutationFn(variables))
      return result
    },
  }
}
```

### Phase 5: Domain API with Effects

```typescript
// entities/location/api/locationEffects.ts
import { Effect, pipe } from 'effect'
import { apiGet, apiPost, apiPut } from '@facts/effect'
import type { Location, LocationListing } from '../model/location'
import type { LocationFormValues } from '../model/locationSchema'

const BASE_URL = '/api/v1/locations'

export const locationEffects = {
  list: (): Effect.Effect<LocationListing[], ApiError> =>
    apiGet(`${BASE_URL}/listing`),

  get: (id: string): Effect.Effect<Location, ApiError> =>
    apiGet(`${BASE_URL}/${id}`),

  create: (data: LocationFormValues): Effect.Effect<Location, ApiError> =>
    apiPost(BASE_URL, { model: data }),

  update: (id: string, data: LocationFormValues): Effect.Effect<Location, ApiError> =>
    apiPut(`${BASE_URL}/${id}`, { model: data }),
}
```

### Phase 6: Composables with Effect

```typescript
// entities/location/model/useLocationEffect.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { Effect } from 'effect'
import { effectQuery, effectMutation } from '@facts/effect'
import { locationEffects } from '../api/locationEffects'

export function useLocations() {
  const query = useQuery(
    effectQuery(['locations'], locationEffects.list())
  )
  
  return {
    locations: computed(() => query.data.value ?? []),
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useLocation(id: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['location', toValue(id)]),
    queryFn: () => Effect.runPromise(locationEffects.get(toValue(id))),
    enabled: computed(() => !!toValue(id)),
  })
  
  return {
    location: computed(() => query.data.value ?? null),
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useLocationMutation() {
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    ...effectMutation(locationEffects.create),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LocationFormValues }) =>
      Effect.runPromise(locationEffects.update(id, data)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['location', id] })
    },
  })
  
  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
```

## Complex Orchestration Example

Effect excels at orchestrating complex operations:

```typescript
// Contract save with multiple steps
function saveContract(
  contractId: string,
  data: ContractFormValues
): Effect.Effect<SaveResult, ContractSaveError> {
  return pipe(
    // Step 1: Validate
    validateContract(data),
    
    // Step 2: Check permissions
    Effect.flatMap(() => checkContractPermissions(contractId)),
    
    // Step 3: Lock contract for editing
    Effect.flatMap(() => acquireContractLock(contractId)),
    
    // Step 4: Save contract data
    Effect.flatMap(() => 
      Effect.all({
        contract: saveContractCore(contractId, data),
        items: saveContractItems(contractId, data.items),
        payments: saveContractPayments(contractId, data.payments),
      }, { concurrency: 'unbounded' })
    ),
    
    // Step 5: Release lock (always, even on failure)
    Effect.ensuring(releaseContractLock(contractId)),
    
    // Step 6: Invalidate caches
    Effect.tap(() => invalidateContractCaches(contractId)),
    
    // Error recovery
    Effect.catchTag('ValidationError', (e) =>
      Effect.fail(new ContractValidationError(e.fields))
    ),
    Effect.catchTag('LockAcquisitionError', (e) =>
      Effect.fail(new ContractBusyError(e.lockedBy))
    ),
  )
}
```

## Migration Strategy

### Incremental Adoption

1. **Keep existing code working** - Effect is opt-in
2. **Start with new features** - Use Effect for new API integrations
3. **Migrate critical paths** - Contract save, payment processing
4. **Document patterns** - As we learn what works

### Compatibility Layer

Keep both patterns available during migration:

```typescript
// Both work during migration
const location1 = await locationApi.get('123') // Promise-based
const location2 = await Effect.runPromise(locationEffects.get('123')) // Effect-based
```

## Learning Resources

- [Effect Documentation](https://effect.website/)
- [Effect GitHub](https://github.com/Effect-TS/effect)
- [Effect Discord](https://discord.gg/effect-ts)

## Package Dependencies

```json
{
  "dependencies": {
    "effect": "^3.0.0",
    "@effect/schema": "^0.70.0"
  }
}
```

## Decision: When to Use Effect

| Scenario | Use Effect? | Reason |
|----------|-------------|--------|
| Simple CRUD | Optional | TanStack Query handles well |
| Complex save operations | Yes | Multiple steps, rollback needed |
| External API integration | Yes | Typed errors crucial |
| Background jobs | Yes | Structured concurrency |
| Form validation | No | Zod handles this well |
| Permission checks | Optional | Simple boolean logic |

## See Also

- [API Integration](./api-integration.md) - Backend API patterns
- [Data Models](./data-models.md) - Type definitions
- [Legacy Patterns](./legacy-patterns.md) - ContractSession orchestration

