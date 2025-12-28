/**
 * Entity base types and utilities
 * 
 * Provides common interfaces and helpers for domain entities
 */

export type { Entity } from './types'
export {
  EntityState,
  EntityAction,
  deletedEntityAction,
  insertedEntityAction,
  updatedEntityAction,
  unmodifiedEntityAction,
  entityActionArray,
  getDefaultEntityFields,
} from './types'

