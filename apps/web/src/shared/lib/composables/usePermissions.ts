/**
 * shared/lib/composables/usePermissions.ts
 *
 * Permission checking composable for gating UI and actions.
 *
 * Currently returns permissive defaults since auth is not yet implemented.
 * When auth is added, this will integrate with the auth store/service.
 *
 * @example
 * ```ts
 * // In a domain composable or component
 * const { canView, canEdit, checkPermission } = usePermissions({
 *   viewPermission: 'cases:read',
 *   editPermission: 'cases:write',
 * })
 *
 * // In template
 * <FButton v-if="canEdit" @click="handleEdit">Edit</FButton>
 * ```
 */

import { computed, type ComputedRef } from 'vue'

export interface PermissionsOptions {
  /**
   * Permission required to view the resource
   */
  viewPermission?: string

  /**
   * Permission required to edit the resource
   */
  editPermission?: string

  /**
   * Permission required to delete the resource
   */
  deletePermission?: string

  /**
   * Permission required to create the resource
   */
  createPermission?: string
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

  /** Check any arbitrary permission */
  checkPermission: (permission: string) => boolean

  /** Whether permission checking is active (auth is configured) */
  isPermissionCheckingActive: ComputedRef<boolean>
}

/**
 * Check if the current user has a specific permission.
 *
 * TODO: Integrate with auth store when authentication is implemented.
 * Currently returns true for all permissions (permissive mode).
 */
function hasPermission(_permission: string): boolean {
  // TODO: When auth is implemented, check against user's permissions
  // Example future implementation:
  // const authStore = useAuthStore()
  // return authStore.hasPermission(permission)
  return true
}

/**
 * Creates permission checking utilities for a resource.
 *
 * @example
 * ```ts
 * // Basic usage
 * const { canView, canEdit } = usePermissions({
 *   viewPermission: 'cases:read',
 *   editPermission: 'cases:write',
 * })
 *
 * // In a computed or template
 * if (canEdit.value) {
 *   showEditButton()
 * }
 *
 * // Check arbitrary permissions
 * const canApprove = checkPermission('cases:approve')
 * ```
 */
export function usePermissions(options: PermissionsOptions = {}): Permissions {
  const { viewPermission, editPermission, deletePermission, createPermission } = options

  // TODO: Set to true when auth is implemented
  const isPermissionCheckingActive = computed(() => false)

  const canView = computed(() => {
    if (!viewPermission) return true
    return hasPermission(viewPermission)
  })

  const canEdit = computed(() => {
    if (!editPermission) return true
    return hasPermission(editPermission)
  })

  const canDelete = computed(() => {
    if (!deletePermission) return true
    return hasPermission(deletePermission)
  })

  const canCreate = computed(() => {
    if (!createPermission) return true
    return hasPermission(createPermission)
  })

  function checkPermission(permission: string): boolean {
    return hasPermission(permission)
  }

  return {
    canView,
    canEdit,
    canDelete,
    canCreate,
    checkPermission,
    isPermissionCheckingActive,
  }
}
