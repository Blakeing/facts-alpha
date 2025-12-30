/**
 * Entity base types and utilities
 *
 * Provides common interfaces and helpers for domain entities
 */

export type { Entity } from './types'
export {
  deletedEntityAction,
  EntityAction,
  entityActionArray,
  EntityState,
  getDefaultEntityFields,
  insertedEntityAction,
  unmodifiedEntityAction,
  updatedEntityAction,
} from './types'
