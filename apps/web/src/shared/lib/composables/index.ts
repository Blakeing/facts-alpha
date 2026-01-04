/**
 * shared/lib/composables/index.ts
 *
 * Shared composables for common patterns.
 */

// Form section provider for two-level inject pattern
export { type FormSectionEmits, useFormSectionProvider } from './useFormSectionProvider'

// Permissions (ready for auth integration)
export { type Permissions, type PermissionsOptions, usePermissions } from './usePermissions'

// Suspense helpers for async route components (re-exported from @facts/ui)
export { useSuspenseReady, useSuspenseReadyAll } from '@facts/ui'
