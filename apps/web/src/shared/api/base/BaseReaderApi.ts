import type { ReaderApi, ReaderDataSource } from './types'
import { NotFoundError, toApiError } from '@facts/effect'
import { Effect } from 'effect'

/**
 * Creates a read-only Effect-based API from a data source
 *
 * Matches legacy BaseReaderApi pattern but returns Effects
 * instead of Promises for typed error handling.
 */
export function BaseReaderApi<TListing, TEntity>(
  dataSource: ReaderDataSource<TListing, TEntity>,
  resourceName: string,
): ReaderApi<TListing, TEntity> {
  return {
    list: (locationId?: string) =>
      Effect.tryPromise({
        try: () => dataSource.list(locationId),
        catch: (error: unknown) => toApiError(error, resourceName),
      }),

    get: (id: string) =>
      Effect.gen(function* () {
        const entity = yield* Effect.tryPromise({
          try: () => dataSource.get(id),
          catch: (error: unknown) => toApiError(error, resourceName, id),
        })

        if (!entity) {
          return yield* Effect.fail(new NotFoundError({ resource: resourceName, id }))
        }

        return entity
      }),
  }
}
