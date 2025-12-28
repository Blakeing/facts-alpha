import type { Api, DataSource } from './types'
import { NotFoundError, toApiError } from '@facts/effect'
import { Effect } from 'effect'

/**
 * Creates a full CRUD Effect-based API from a data source
 *
 * Matches legacy BaseApi pattern but returns Effects
 * for typed error handling.
 */
export function BaseApi<TListing, TEntity, TForm>(
  dataSource: DataSource<TListing, TEntity, TForm>,
  resourceName: string,
): Api<TListing, TEntity, TForm> {
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

    create: (data: TForm) =>
      Effect.tryPromise({
        try: () => dataSource.create(data),
        catch: (error: unknown) => toApiError(error, resourceName),
      }),

    update: (id: string, data: Partial<TForm>) =>
      Effect.gen(function* () {
        const entity = yield* Effect.tryPromise({
          try: () => dataSource.update(id, data),
          catch: (error: unknown) => toApiError(error, resourceName, id),
        })

        if (!entity) {
          return yield* Effect.fail(new NotFoundError({ resource: resourceName, id }))
        }

        return entity
      }),

    delete: (id: string) =>
      Effect.tryPromise({
        try: () => dataSource.delete(id),
        catch: (error: unknown) => toApiError(error, resourceName, id),
      }),
  }
}
