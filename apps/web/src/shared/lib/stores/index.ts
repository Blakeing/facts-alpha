/**
 * Pinia Stores - Global state management
 *
 * Stores are located in shared/lib/stores/ to align with FSD architecture.
 * They provide global client-side state (auth, user context, catalog).
 */

export { useBootstrapperStore } from './bootstrapper'

export { useCatalogStore } from './catalog'
export type { CatalogItem, TaxRate } from './catalog'

export { useUserContextStore } from './userContext'
export type { Location, User } from './userContext'
