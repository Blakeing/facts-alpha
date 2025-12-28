import type { ApiError } from '@facts/effect'
import type { Effect } from 'effect'

/**
 * Data source interface for Promise-based implementations
 * (mock APIs, HTTP clients, etc.)
 */
export interface DataSource<TListing, TEntity, TForm> {
  list: (locationId?: string) => Promise<TListing[]>
  get: (id: string) => Promise<TEntity | null>
  create: (data: TForm) => Promise<TEntity>
  update: (id: string, data: Partial<TForm>) => Promise<TEntity | null>
  delete: (id: string) => Promise<void>
}

/**
 * Read-only data source
 */
export interface ReaderDataSource<TListing, TEntity> {
  list: (locationId?: string) => Promise<TListing[]>
  get: (id: string) => Promise<TEntity | null>
}

/**
 * Effect-based API interface (returned by factories)
 */
export interface Api<TListing, TEntity, TForm> {
  list: (locationId?: string) => Effect.Effect<TListing[], ApiError>
  get: (id: string) => Effect.Effect<TEntity, ApiError>
  create: (data: TForm) => Effect.Effect<TEntity, ApiError>
  update: (id: string, data: Partial<TForm>) => Effect.Effect<TEntity, ApiError>
  delete: (id: string) => Effect.Effect<void, ApiError>
}

/**
 * Read-only Effect-based API interface
 */
export interface ReaderApi<TListing, TEntity> {
  list: (locationId?: string) => Effect.Effect<TListing[], ApiError>
  get: (id: string) => Effect.Effect<TEntity, ApiError>
}
