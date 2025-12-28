/**
 * Next ID API Client
 *
 * Fetches unique IDs from the backend ID generator service.
 * Matches legacy app NextIdApi pattern.
 *
 * @see Facts/src/Facts.App/facts-app/src/api/common/NextIdApi.ts
 */

import { type ApiError, toApiError } from '@facts/effect'
import { Effect } from 'effect'
import { apiUrls, getHttpClient } from './index'

export const NextIdApi = {
  /**
   * Get a single next ID from the backend
   * BFF endpoint: GET /api/v1/nextid
   * Returns: string (the next ID)
   */
  nextId: (): Effect.Effect<string, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const response = yield* Effect.tryPromise({
        try: () => client.get<string>(apiUrls.nextId),
        catch: (error: unknown) => toApiError(error, 'nextId'),
      })
      return response.data
    }),

  /**
   * Get multiple next IDs from the backend
   * BFF endpoint: GET /api/v1/nextids/{count}
   * Returns: string[] (array of next IDs)
   */
  nextIds: (count: number): Effect.Effect<string[], ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const response = yield* Effect.tryPromise({
        try: () => client.get<string[]>(apiUrls.nextIds(count)),
        catch: (error: unknown) => toApiError(error, 'nextIds'),
      })
      return response.data
    }),
}

/**
 * Convenience function for getting a single next ID
 * Usage: const id = await runEffect(nextId())
 */
export function nextId(): Effect.Effect<string, ApiError> {
  return NextIdApi.nextId()
}

/**
 * Convenience function for getting multiple next IDs
 * Usage: const ids = await runEffect(nextIds(5))
 */
export function nextIds(count: number): Effect.Effect<string[], ApiError> {
  return NextIdApi.nextIds(count)
}
