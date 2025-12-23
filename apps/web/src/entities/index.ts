/**
 * entities/index.ts
 *
 * Entities layer - business entities the project works with
 *
 * Note: For full access to an entity's types, schemas, and composables,
 * import directly from the entity path (e.g., '@/entities/case').
 * This index re-exports the most commonly used items.
 */

// Case entity
export {
  caseApi,
  CaseCard,
  caseFormSchema,
  CASES_QUERY_KEY,
  CaseStatusBadge,
  getStatusColor,
  getStatusLabel,
  useCase,
  useCaseForm,
  useCases,
} from './case'
export type { Case, CaseFormValues, CaseStatus, Decedent, NextOfKin } from './case'

// Contract entity
export {
  contractApi,
  contractFormSchema,
  CONTRACTS_QUERY_KEY,
  ContractStatusBadge,
  getContractStatusColor,
  getContractStatusLabel,
  getContractTypeLabel,
  getDefaultContractFormValues,
  useContract,
  useContractForm,
  useContracts,
} from './contract'
export type {
  Contract,
  ContractFormValues,
  ContractItem,
  ContractListing,
  ContractPayment,
  ContractStatus,
  ContractType,
} from './contract'

// Location entity
export {
  getDefaultLocationFormValues,
  getLocationTypeColor,
  getLocationTypeLabel,
  locationApi,
  locationFormSchema,
  LOCATIONS_QUERY_KEY,
  LocationTypeBadge,
  useLocation,
  useLocationForm,
  useLocations,
} from './location'
export type {
  Location,
  LocationFormValues,
  LocationLicense,
  LocationListing,
  LocationType,
} from './location'

// Tenant entity
export * from './tenant'
