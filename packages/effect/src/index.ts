/**
 * @facts/effect - Typed error handling and Effect TS integration
 *
 * This package provides:
 * - Tagged error types for API operations (official Data.TaggedError pattern)
 * - TanStack Vue Query bridge utilities (runEffectQuery, runEffectMutation)
 * - Error handling utilities (handleError, errorMessage)
 *
 * @example
 * ```typescript
 * import { runEffectQuery, handleError, errorMessage, NetworkError } from '@facts/effect'
 *
 * // In composables
 * const query = useQuery({
 *   queryKey: ['contracts'],
 *   queryFn: runEffectQuery(ContractApi.list()),
 * })
 *
 * // Handle errors
 * const errorMsg = handleError(error, {
 *   NetworkError: (e) => e.message,
 *   default: errorMessage,
 * })
 * ```
 */

// Error types (official Data.TaggedError pattern)
export {
  type ApiError,
  type ApiErrorTag,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from './errors'

// TanStack Vue Query bridge and Effect execution
export {
  errorMessage,
  getErrorTag,
  handleError,
  isApiError,
  runEffect,
  runEffectMutation,
  runEffectQuery,
  type ErrorHandlers,
} from './query'

// HTTP error mapping
export { toApiError } from './http'
