/**
 * Contract entity types
 *
 * Main entry point - re-exports all contract types, enums, and helpers
 * Aligned with backend Facts.Entities (Contract, Sale, SaleItem, etc.)
 * @see docs/data-models.md for field mapping details
 */

// Re-export enums
export * from './contract.enums'

// Re-export types
export * from './contract.types'

// Re-export helpers
export * from './contract.helpers'

// Re-export save models
export * from './contract.save-models'

// =============================================================================
// Enum Conversion Helpers (for API integration)
// =============================================================================
//
// NOTE: Old conversion helpers have been removed.
// Use enum controllers from @/entities/contract instead:
//
// import { needTypeController, saleStatusController } from '@/entities/contract'
// const label = needTypeController.getDescription(NeedType.AT_NEED)
