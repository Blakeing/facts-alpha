/**
 * Permission Types - Aligned with legacy FACTS application
 *
 * These types define the structure for permission checking
 * throughout the application.
 */

import type { SecurityOptionKey } from './securityKeys'

/**
 * Permission level for a security option.
 * Read = View only access
 * Edit = Full read/write access
 */
export enum PermissionLevel {
  Read = 0,
  Edit = 1,
}

/**
 * A permission requirement specifying a security key and required level.
 * Used in route meta and link definitions.
 */
export interface Requirement {
  key: SecurityOptionKey
  level: PermissionLevel
}

/**
 * A permission that has been granted to a user.
 */
export interface GrantedPermission {
  key: SecurityOptionKey
  level: PermissionLevel
}

/**
 * The effective permissions for a user.
 * Retrieved from the backend after authentication.
 */
export interface UserEffectivePermissions {
  /** If true, user has all permissions (bypasses checks) */
  isAdmin: boolean
  /** Array of permissions granted to the user */
  permissionsGranted: GrantedPermission[]
}

/**
 * Location type filter for navigation items.
 * Uses bitmask to support multiple types.
 */
export enum LocationTypeFilter {
  None = 0,
  Funeral = 1,
  Cemetery = 2,
  Corporate = 4,
  /** Funeral | Cemetery */
  FuneralAndCemetery = 3,
  /** All types */
  All = 7,
}

/**
 * Helper to create a read-level requirement.
 */
export function readRequirement(key: SecurityOptionKey): Requirement {
  return { key, level: PermissionLevel.Read }
}

/**
 * Helper to create an edit-level requirement.
 */
export function editRequirement(key: SecurityOptionKey): Requirement {
  return { key, level: PermissionLevel.Edit }
}

/**
 * Helper to create multiple read-level requirements.
 */
export function readRequirements(keys: SecurityOptionKey[]): Requirement[] {
  return keys.map((key) => readRequirement(key))
}

/**
 * Helper to create multiple edit-level requirements.
 */
export function editRequirements(keys: SecurityOptionKey[]): Requirement[] {
  return keys.map((key) => editRequirement(key))
}

/**
 * Route meta interface for permission-protected routes.
 */
export interface PermissionRouteMeta {
  /** Permission requirement for this route */
  permissions?: Requirement
  /** Multiple permission options (user needs at least one) */
  permissionsAny?: Requirement[]
  /** Title for the route (for breadcrumbs, etc.) */
  title?: string
  /** Location type filter for this route */
  locationTypeFilter?: LocationTypeFilter
  /** Allow access without authentication */
  allowAnonymous?: boolean
}

declare module 'vue-router' {
  interface RouteMeta extends PermissionRouteMeta {}
}
