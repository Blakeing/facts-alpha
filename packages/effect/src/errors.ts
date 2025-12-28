/**
 * Tagged error types for API operations
 *
 * These errors align with the backend's Response<T> failure modes and provide
 * type-safe error handling throughout the application.
 *
 * @example
 * ```typescript
 * import { Effect } from 'effect'
 * import { NotFoundError, matchApiError } from '@facts/effect'
 *
 * // Handle specific errors
 * const result = pipe(
 *   getContract(id),
 *   Effect.catchTag('NotFoundError', (e) =>
 *     Effect.succeed(null)
 *   )
 * )
 * ```
 */

import { Data } from 'effect'

/**
 * Resource not found error (HTTP 404)
 *
 * Thrown when a requested resource does not exist.
 */
export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly resource: string
  readonly id: string
}> {}

/**
 * Validation error (HTTP 400)
 *
 * Thrown when request data fails validation.
 * Contains field-level error messages.
 */
export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly fields: Record<string, string[]>
}> {}

/**
 * Unauthorized error (HTTP 401)
 *
 * Thrown when authentication is required or has failed.
 */
export class UnauthorizedError extends Data.TaggedError('UnauthorizedError')<{
  readonly message: string
}> {}

/**
 * Forbidden error (HTTP 403)
 *
 * Thrown when the user lacks permission for the requested operation.
 */
export class ForbiddenError extends Data.TaggedError('ForbiddenError')<{
  readonly permission: string
}> {}

/**
 * Network error
 *
 * Thrown when a network request fails (timeout, connection refused, etc.)
 */
export class NetworkError extends Data.TaggedError('NetworkError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

/**
 * Server error (HTTP 5xx)
 *
 * Thrown when the server returns an error response.
 */
export class ServerError extends Data.TaggedError('ServerError')<{
  readonly message: string
  readonly statusCode: number
}> {}

/**
 * Union type of all API errors
 *
 * Use this type for functions that can fail with any API error.
 *
 * @example
 * ```typescript
 * function getContract(id: string): Effect.Effect<Contract, ApiError> {
 *   // ...
 * }
 * ```
 */
export type ApiError =
  | NotFoundError
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | NetworkError
  | ServerError

/**
 * Error tag type for pattern matching
 */
export type ApiErrorTag = ApiError['_tag']
