/**
 * TanStack Vue Query bridge for Effect
 *
 * Since effect-query is React-only, we provide a minimal Vue Query bridge
 * that follows Effect naming conventions.
 *
 * @example
 * ```typescript
 * import { useQuery } from '@tanstack/vue-query'
 * import { runEffectQuery, handleError } from '@facts/effect'
 *
 * const query = useQuery({
 *   queryKey: ['contracts'],
 *   queryFn: runEffectQuery(ContractApi.list()),
 * })
 *
 * const errorMsg = computed(() =>
 *   handleError(query.error.value, {
 *     NetworkError: (e) => `Network error: ${e.message}`,
 *     default: errorMessage,
 *   })
 * )
 * ```
 */

import { Cause, Effect, Exit } from 'effect'

import type {
  ApiError,
  ApiErrorTag,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from './errors'

/**
 * Error handlers for handleError
 */
export interface ErrorHandlers<R> {
  NotFoundError?: (e: NotFoundError) => R
  ValidationError?: (e: ValidationError) => R
  UnauthorizedError?: (e: UnauthorizedError) => R
  ForbiddenError?: (e: ForbiddenError) => R
  NetworkError?: (e: NetworkError) => R
  ServerError?: (e: ServerError) => R
  default: (e: unknown) => R
}

/**
 * Run an Effect as a Promise, preserving typed errors
 *
 * Similar to Effect.runPromise but preserves typed errors by using runPromiseExit.
 * Use this for direct execution contexts (not TanStack Query).
 *
 * @param effect - The Effect to run
 * @returns A Promise that resolves with the value or throws the typed error
 *
 * @example
 * ```typescript
 * // Direct execution
 * const contract = await runEffect(ContractApi.get(id))
 *
 * // In async functions
 * async function saveContract(data: ContractFormValues) {
 *   const saved = await runEffect(ContractApi.create(data))
 *   return saved
 * }
 * ```
 */
export function runEffect<T, E>(effect: Effect.Effect<T, E>): Promise<T> {
  return Effect.runPromiseExit(effect).then((exit) => {
    if (Exit.isSuccess(exit)) {
      return exit.value
    }

    const cause = exit.cause
    if (Cause.isFailType(cause)) {
      throw cause.error
    }

    throw new Error(Cause.pretty(cause))
  })
}

/**
 * Run an Effect as a TanStack Query function
 *
 * The resulting function can be used as the `queryFn` option in useQuery.
 * On success, returns the value. On failure, throws the typed error.
 *
 * @param effect - The Effect to run
 * @returns A function that returns a Promise suitable for TanStack Query
 *
 * @example
 * ```typescript
 * const query = useQuery({
 *   queryKey: ['contract', id],
 *   queryFn: runEffectQuery(ContractApi.get(id)),
 * })
 * ```
 */
export function runEffectQuery<T, E>(effect: Effect.Effect<T, E>): () => Promise<T> {
  return async () => {
    const exit = await Effect.runPromiseExit(effect)

    if (Exit.isSuccess(exit)) {
      return exit.value
    }

    // Extract the failure cause and throw it for TanStack Query
    const cause = exit.cause
    if (Cause.isFailType(cause)) {
      throw cause.error
    }

    // For other cause types (die, interrupt), throw a generic error
    throw new Error(Cause.pretty(cause))
  }
}

/**
 * Run an Effect-returning function as a TanStack mutation
 *
 * The resulting function can be used as the `mutationFn` option in useMutation.
 *
 * @param fn - A function that takes variables and returns an Effect
 * @returns A function that returns a Promise suitable for TanStack Query mutations
 *
 * @example
 * ```typescript
 * const mutation = useMutation({
 *   mutationFn: runEffectMutation((data: ContractFormValues) =>
 *     ContractApi.create(data)
 *   ),
 * })
 * ```
 */
export function runEffectMutation<TData, TVariables, E>(
  fn: (variables: TVariables) => Effect.Effect<TData, E>,
): (variables: TVariables) => Promise<TData> {
  return async (variables) => {
    const exit = await Effect.runPromiseExit(fn(variables))

    if (Exit.isSuccess(exit)) {
      return exit.value
    }

    const cause = exit.cause
    if (Cause.isFailType(cause)) {
      throw cause.error
    }

    throw new Error(Cause.pretty(cause))
  }
}

/**
 * Type guard to check if an error is an ApiError
 *
 * @param error - The error to check
 * @returns True if the error is an ApiError
 *
 * @example
 * ```typescript
 * if (isApiError(error)) {
 *   switch (error._tag) {
 *     case 'NotFoundError':
 *       // handle not found
 *       break
 *   }
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    typeof (error as ApiError)._tag === 'string'
  )
}

/**
 * Get the tag of an API error
 *
 * @param error - The error to get the tag from
 * @returns The error tag or undefined if not an ApiError
 */
export function getErrorTag(error: unknown): ApiErrorTag | undefined {
  return isApiError(error) ? error._tag : undefined
}

/**
 * Handle API errors with pattern matching
 *
 * Provides a type-safe way to handle different error types.
 * If a handler for the specific error type is not provided, falls back to default.
 *
 * @param error - The error to match against
 * @param handlers - Object with handlers for each error type and a default
 * @returns The result of the matched handler
 *
 * @example
 * ```typescript
 * const message = handleError(error, {
 *   NotFoundError: (e) => `${e.resource} not found`,
 *   ValidationError: (e) => `Validation failed: ${Object.keys(e.fields).join(', ')}`,
 *   UnauthorizedError: () => 'Please log in',
 *   NetworkError: (e) => `Network error: ${e.message}`,
 *   default: (e) => 'An unexpected error occurred',
 * })
 * ```
 */
export function handleError<R>(error: unknown, handlers: ErrorHandlers<R>): R {
  if (!isApiError(error)) {
    return handlers.default(error)
  }

  const handler = handlers[error._tag as keyof Omit<ErrorHandlers<R>, 'default'>]
  if (handler) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (handler as (e: any) => R)(error)
  }

  return handlers.default(error)
}

/**
 * Convert an error to a user-friendly message
 *
 * @param error - The error to convert
 * @returns A user-friendly error message
 */
export function errorMessage(error: unknown): string {
  return handleError(error, {
    NotFoundError: (e) => `${e.resource} not found`,
    ValidationError: (e) => {
      const fieldErrors = Object.entries(e.fields)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ')
      return `Validation failed: ${fieldErrors}`
    },
    UnauthorizedError: (e) => e.message || 'Authentication required',
    ForbiddenError: (e) => `Permission denied: ${e.permission}`,
    NetworkError: (e) => `Network error: ${e.message}`,
    ServerError: (e) => `Server error (${e.statusCode}): ${e.message}`,
    default: (e) => (e instanceof Error ? e.message : 'An unexpected error occurred'),
  })
}
