/**
 * shared/lib/composables/usePermissions.ts
 *
 * Permission checking composable for gating UI and actions.
 *
 * Integrates with the userContext store for centralized permission checking.
 * Aligned with the legacy FACTS application security model.
 *
 * @example
 * ```ts
 * // Using security keys (recommended)
 * import { SecurityOptionKeys, PermissionLevel } from '@/shared/lib/security'
 *
 * const { canView, canEdit, canWithKey } = usePermissions()
 *
 * // Check specific permissions
 * if (canWithKey(SecurityOptionKeys.ProcessContracts, PermissionLevel.Edit)) {
 *   showEditButton()
 * }
 * ```
 *
 * @example
 * ```ts
 * // Using string-based permissions (for future expansion)
 * const { canView, canEdit, checkPermission } = usePermissions({
 *   viewPermission: 'contracts:read',
 *   editPermission: 'contracts:write',
 * })
 *
 * // In template
 * <FButton v-if="canEdit" @click="handleEdit">Edit</FButton>
 * ```
 */

import { computed, type ComputedRef } from 'vue'
import { PermissionLevel, type SecurityOptionKey, useUserContextStore } from '@/shared/lib'

export interface PermissionsOptions {
  /**
   * Permission required to view the resource (string-based, for future use)
   */
  viewPermission?: string

  /**
   * Permission required to edit the resource (string-based, for future use)
   */
  editPermission?: string

  /**
   * Permission required to delete the resource (string-based, for future use)
   */
  deletePermission?: string

  /**
   * Permission required to create the resource (string-based, for future use)
   */
  createPermission?: string

  /**
   * Security key for view permission (legacy FACTS style)
   */
  viewKey?: SecurityOptionKey

  /**
   * Security key for edit permission (legacy FACTS style)
   */
  editKey?: SecurityOptionKey

  /**
   * Security key for delete permission (legacy FACTS style)
   */
  deleteKey?: SecurityOptionKey

  /**
   * Security key for create permission (legacy FACTS style)
   */
  createKey?: SecurityOptionKey
}

export interface Permissions {
  /** Whether the user can view the resource */
  canView: ComputedRef<boolean>

  /** Whether the user can edit the resource */
  canEdit: ComputedRef<boolean>

  /** Whether the user can delete the resource */
  canDelete: ComputedRef<boolean>

  /** Whether the user can create the resource */
  canCreate: ComputedRef<boolean>

  /** Check any arbitrary string permission (for future use) */
  checkPermission: (permission: string) => boolean

  /** Check permission using security key and level */
  canWithKey: (key: SecurityOptionKey, level: PermissionLevel) => boolean

  /** Whether user is admin (bypasses all checks) */
  isAdmin: ComputedRef<boolean>

  /** Whether permission checking is active (auth is configured) */
  isPermissionCheckingActive: ComputedRef<boolean>
}

/**
 * Creates permission checking utilities for a resource.
 *
 * Supports both legacy FACTS security keys and future string-based permissions.
 *
 * @example
 * ```ts
 * // Using security keys (aligned with legacy app)
 * import { SecurityOptionKeys } from '@/shared/lib/security'
 *
 * const { canView, canEdit, canWithKey } = usePermissions({
 *   viewKey: SecurityOptionKeys.ProcessContracts,
 *   editKey: SecurityOptionKeys.ProcessContracts,
 * })
 *
 * // Check read permission
 * if (canView.value) { ... }
 *
 * // Check edit permission
 * if (canEdit.value) { ... }
 *
 * // Check arbitrary key
 * if (canWithKey(SecurityOptionKeys.ExecuteContracts, PermissionLevel.Edit)) { ... }
 * ```
 */
export function usePermissions(options: PermissionsOptions = {}): Permissions {
  const userContext = useUserContextStore()

  const { viewPermission, editPermission, deletePermission, createPermission } = options
  const { viewKey, editKey, deleteKey, createKey } = options

  // Permission checking is active when user has permissions loaded
  const isPermissionCheckingActive = computed(() => !!userContext.userPermissions)

  // Admin status
  const isAdmin = computed(() => userContext.isAdmin)

  // View permission check
  const canView = computed(() => {
    // Admin bypasses all checks
    if (userContext.isAdmin) return true

    // Check security key first (legacy style)
    if (viewKey !== undefined) {
      return userContext.userCanWithKey(viewKey, PermissionLevel.Read)
    }

    // Fall back to string permission (future expansion)
    if (viewPermission) {
      return hasStringPermission(viewPermission)
    }

    // No permission requirement = allow
    return true
  })

  // Edit permission check
  const canEdit = computed(() => {
    if (userContext.isAdmin) return true

    if (editKey !== undefined) {
      return userContext.userCanWithKey(editKey, PermissionLevel.Edit)
    }

    if (editPermission) {
      return hasStringPermission(editPermission)
    }

    return true
  })

  // Delete permission check
  const canDelete = computed(() => {
    if (userContext.isAdmin) return true

    if (deleteKey !== undefined) {
      return userContext.userCanWithKey(deleteKey, PermissionLevel.Edit)
    }

    if (deletePermission) {
      return hasStringPermission(deletePermission)
    }

    return true
  })

  // Create permission check
  const canCreate = computed(() => {
    if (userContext.isAdmin) return true

    if (createKey !== undefined) {
      return userContext.userCanWithKey(createKey, PermissionLevel.Edit)
    }

    if (createPermission) {
      return hasStringPermission(createPermission)
    }

    return true
  })

  /**
   * Check a string-based permission.
   * Currently returns true (permissive) - will integrate with future auth system.
   */
  function hasStringPermission(_permission: string): boolean {
    // TODO: When future permission system is implemented, check here
    // For now, return true for backward compatibility
    return true
  }

  /**
   * Check any arbitrary string permission.
   */
  function checkPermission(permission: string): boolean {
    if (userContext.isAdmin) return true
    return hasStringPermission(permission)
  }

  /**
   * Check permission using security key and level.
   * This is the primary method for legacy FACTS-style permission checks.
   */
  function canWithKey(key: SecurityOptionKey, level: PermissionLevel): boolean {
    return userContext.userCanWithKey(key, level)
  }

  return {
    canView,
    canEdit,
    canDelete,
    canCreate,
    checkPermission,
    canWithKey,
    isAdmin,
    isPermissionCheckingActive,
  }
}
