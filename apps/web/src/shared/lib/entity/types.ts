/**
 * Base entity types - aligned with BFF response format
 *
 * Based on legacy Facts app pattern (Facts.App/src/types/general.ts)
 * @see Entity interface in legacy app
 */

/**
 * Base interface for all domain entities
 * All fields match BFF response format exactly (no conversion needed)
 */
export interface Entity {
  /** Entity ID (BFF sends as string) */
  id: string

  /** Creation timestamp (ISO 8601 string) */
  dateCreated: string

  /** Last modification timestamp (ISO 8601 string) */
  dateLastModified: string

  /** User ID who created the entity */
  createdByUserId?: number

  /** Entity version for optimistic concurrency */
  version?: string
}

/**
 * Entity state for tracking changes in forms/sessions
 * Matches legacy app EntityState enum
 */
export enum EntityState {
  /** Entity unchanged from server state */
  Unmodified = 0,

  /** New entity not yet saved to server */
  New = 1,

  /** Existing entity with unsaved modifications */
  Modified = 2,

  /** Entity marked for deletion */
  Deleted = 3,

  /** Entity moved to different parent/location */
  Moved = 4,
}

/**
 * Wrapper for entity with state tracking
 * Used for batch operations and change tracking
 */
export class EntityAction<T> {
  constructor(
    public state: EntityState,
    public entity: T,
  ) {}
}

// Helper functions for creating EntityActions

export function deletedEntityAction<T>(value: T): EntityAction<T> {
  return new EntityAction<T>(EntityState.Deleted, value)
}

export function insertedEntityAction<T>(value: T): EntityAction<T> {
  return new EntityAction<T>(EntityState.New, value)
}

export function updatedEntityAction<T>(value: T): EntityAction<T> {
  return new EntityAction<T>(EntityState.Modified, value)
}

export function unmodifiedEntityAction<T>(value: T): EntityAction<T> {
  return new EntityAction<T>(EntityState.Unmodified, value)
}

/**
 * Convert arrays of entities to EntityAction array
 * Useful for batch save operations
 */
export function entityActionArray<T>(
  allItems: T[],
  inserted: T[],
  deleted: T[],
): EntityAction<T>[] {
  const result: EntityAction<T>[] = []

  result.push(...deleted.map((x) => deletedEntityAction(x)))
  result.push(...inserted.map((x) => insertedEntityAction(x)))
  result.push(...allItems.filter((x) => !inserted.includes(x)).map((x) => updatedEntityAction(x)))

  return result
}

/**
 * Default values for common entity fields
 * Use when creating new entities
 */
export function getDefaultEntityFields(): Omit<Entity, 'id'> {
  const now = new Date().toISOString()
  return {
    dateCreated: now,
    dateLastModified: now,
    createdByUserId: undefined,
    version: undefined,
  }
}
