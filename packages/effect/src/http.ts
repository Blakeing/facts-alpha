/**
 * HTTP error mapping utilities
 *
 * Maps Axios HTTP errors to typed Effect errors, aligning with backend Response<T> pattern.
 * This enables type-safe error handling throughout the application.
 *
 * @example
 * ```typescript
 * import { toApiError } from '@facts/effect'
 *
 * Effect.tryPromise({
 *   try: () => client.get('/api/v1/contracts/123'),
 *   catch: (error) => toApiError(error, 'contract', '123'),
 * })
 * ```
 */

// Axios is a peer dependency in consuming apps
// We import axios for the isAxiosError utility function
import axios from 'axios'
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ServerError,
  NetworkError,
  type ApiError,
} from './errors'

/**
 * Maps Axios HTTP errors to typed Effect errors
 *
 * Aligns with backend Response<T> pattern:
 * - 400 Bad Request → ValidationError (with field-level errors)
 * - 401 Unauthorized → UnauthorizedError
 * - 403 Forbidden → ForbiddenError
 * - 404 Not Found → NotFoundError
 * - 5xx Server Error → ServerError
 * - Network/timeout → NetworkError
 *
 * @param error - The error to map (typically from Axios)
 * @param resourceName - Optional resource name for NotFoundError (e.g., 'contract', 'location')
 * @param id - Optional resource ID for NotFoundError
 * @returns A typed Effect error
 *
 * @example
 * ```typescript
 * // In API methods
 * Effect.tryPromise({
 *   try: () => client.get('/api/v1/contracts/123'),
 *   catch: (error) => toApiError(error, 'contract', '123'),
 * })
 * ```
 */
export function toApiError(error: unknown, resourceName?: string, id?: string): ApiError {
  // Check if request was cancelled (using Axios's built-in utility)
  if (axios.isCancel(error)) {
    return new NetworkError({
      message: 'Request was cancelled',
      cause: error,
    })
  }

  // Check if it's an Axios error using Axios's built-in utility
  if (axios.isAxiosError(error)) {
    // Network errors (timeout, connection refused, no response, etc.)
    if (!error.response) {
      const message =
        error.code === 'ECONNABORTED'
          ? 'Request timed out'
          : error.message || 'Network request failed'
      return new NetworkError({
        message,
        cause: error,
      })
    }

    // We have a response, extract common properties once
    const { status, statusText, data } = error.response

    // 400 Bad Request - Validation errors
    if (status === 400) {
      const fields = extractValidationFields(data)
      return new ValidationError({ fields })
    }

    // 401 Unauthorized
    if (status === 401) {
      const message = extractErrorMessage(data) || statusText || 'Authentication required'
      return new UnauthorizedError({ message })
    }

    // 403 Forbidden
    if (status === 403) {
      const permission = extractErrorMessage(data) || statusText || 'Unknown permission'
      return new ForbiddenError({ permission })
    }

    // 404 Not Found
    if (status === 404) {
      return new NotFoundError({
        resource: resourceName || 'resource',
        id: id || 'unknown',
      })
    }

    // 5xx Server Errors
    if (status >= 500) {
      const message = extractErrorMessage(data) || statusText || 'Server error'
      return new ServerError({
        message,
        statusCode: status,
      })
    }
  }

  // Fallback for unknown errors
  return new NetworkError({
    message: error instanceof Error ? error.message : String(error),
    cause: error,
  })
}

/**
 * Extract validation field errors from backend response
 *
 * Backend format (from docs/api-integration.md):
 * {
 *   "title": "Validation failed",
 *   "errors": {
 *     "identifier": ["Location ID is required"],
 *     "name": ["Name is required", "Name must be at least 3 characters"]
 *   }
 * }
 */
function extractValidationFields(data: unknown): Record<string, string[]> {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>

    // Check for nested errors object
    if (obj.errors && typeof obj.errors === 'object') {
      const errors = obj.errors as Record<string, unknown>
      const fields: Record<string, string[]> = {}

      for (const [key, value] of Object.entries(errors)) {
        if (Array.isArray(value)) {
          fields[key] = value.map(String)
        } else if (typeof value === 'string') {
          fields[key] = [value]
        }
      }

      return fields
    }
  }

  return {}
}

/**
 * Extract error message from backend response
 *
 * Handles various response formats:
 * - String: "Unauthorized"
 * - Object with title: { "title": "Validation failed" }
 * - Object with message: { "message": "Error occurred" }
 */
function extractErrorMessage(data: unknown): string | undefined {
  if (typeof data === 'string') {
    return data
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    return (obj.title as string | undefined) || (obj.message as string | undefined)
  }

  return undefined
}
