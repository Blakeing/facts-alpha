/**
 * entities/index.ts
 *
 * Entities layer - business entities the project works with
 *
 * Note: For full access to an entity's types, schemas, and composables,
 * import directly from the entity path (e.g., '@/entities/contract').
 * This index re-exports the most commonly used items.
 */

// Contract entity
export {
  ContractApi,
  contractFormSchema,
  CONTRACTS_QUERY_KEY,
  ContractStatusBadge,
  getDefaultContractFormValues,
  getNeedTypeLabel,
  getSaleStatusColor,
  getSaleStatusLabel,
  NeedType,
  PaymentMethod,
  SaleStatus,
  useContracts,
} from './contract'
export type {
  Contract,
  ContractFormValues,
  ContractListing,
  ContractPayment,
  Sale,
  SaleItem,
} from './contract'

// Location entity
export {
  getDefaultLocationFormValues,
  getLocationTypeColor,
  getLocationTypeLabel,
  LocationApi,
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
