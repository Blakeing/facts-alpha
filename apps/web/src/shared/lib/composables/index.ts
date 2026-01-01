/**
 * shared/lib/composables/index.ts
 *
 * Shared composables for common patterns.
 */

// Permissions (ready for auth integration)
export { type Permissions, type PermissionsOptions, usePermissions } from './usePermissions'

// Form section provider for two-level inject pattern
export { type FormSectionEmits, useFormSectionProvider } from './useFormSectionProvider'
