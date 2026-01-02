/**
 * entities/contract/index.ts
 *
 * Contract entity - funeral/cemetery contract management
 */

// API
export { ContractApi } from './api'

// Model (types, schemas, composables)
export * from './model'

// Enum Controllers (import triggers registration)
import './lib/controllers'
export * from './lib/controllers'

// UI components
export { default as ContractStatusBadge } from './ui/ContractStatusBadge.vue'
