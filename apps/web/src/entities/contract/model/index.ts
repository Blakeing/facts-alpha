// =============================================================================
// Types
// =============================================================================

export type {
  Address,
  Contract,
  ContractFinancing,
  ContractFundingDetail,
  ContractListing,
  ContractPayment,
  ContractPerson,
  Sale,
  SaleItem,
  SaleItemDiscount,
  SaleItemSalesTax,
  SaleItemTrustFund,
} from './contract'

// =============================================================================
// Enums (re-export value + type)
// =============================================================================

export {
  AtNeedType,
  ContractPersonRole,
  FinancingStatus,
  ItemType,
  LateFeeType,
  NeedType,
  PaymentMethod,
  PreNeedFundingType,
  SaleAdjustmentType,
  SaleStatus,
  SaleType,
} from './contract'

// =============================================================================
// Enum Helpers
// =============================================================================

export { getSaleStatusColor } from './contract'

// =============================================================================
// Helper Functions
// =============================================================================

export {
  calculateSaleTotals,
  getCoBuyers,
  getContractPersonDisplayName,
  getPrimaryBeneficiary,
  getPrimaryBuyer,
} from './contract'

// =============================================================================
// Enum Controllers
// =============================================================================

export { contractPersonRoleController } from './ContractPersonRoleController'

// =============================================================================
// Schemas
// =============================================================================

export {
  addressSchema,
  contractFinancingSchema,
  contractFormSchema,
  contractFundingDetailSchema,
  contractPaymentSchema,
  contractPersonSchema,
  // Default value helpers
  getDefaultAddress,
  getDefaultContractFormValues,
  getDefaultContractPerson,
  getDefaultFinancing,
  getDefaultPayment,
  getDefaultSale,
  getDefaultSaleItem,
  saleItemDiscountSchema,
  saleItemSalesTaxSchema,
  saleItemSchema,
  saleItemTrustFundSchema,
  saleSchema,
} from './contractSchema'

export type {
  AddressFormValues,
  ContractFinancingFormValues,
  ContractFormValues,
  ContractFundingDetailFormValues,
  ContractPaymentFormValues,
  ContractPersonFormValues,
  SaleFormValues,
  SaleItemDiscountFormValues,
  SaleItemFormValues,
  SaleItemSalesTaxFormValues,
  SaleItemTrustFundFormValues,
} from './contractSchema'

// =============================================================================
// Session Context
// =============================================================================

export { CONTRACT_SESSION_KEY } from './useContractSession'

// =============================================================================
// Handlers
// =============================================================================

export { useItemsHandler } from './handlers/useItemsHandler'
export type { ItemsHandler } from './handlers/useItemsHandler'

export { usePaymentsHandler } from './handlers/usePaymentsHandler'
export type { PaymentsHandler } from './handlers/usePaymentsHandler'

export { usePeopleHandler } from './handlers/usePeopleHandler'
export type { PeopleHandler } from './handlers/usePeopleHandler'

// =============================================================================
// Composables
// =============================================================================

export { useContract } from './useContract'
export { CONTRACTS_QUERY_KEY, type ContractStatusString, useContracts } from './useContracts'

// Session Architecture
export { useContractSession, useSession } from './useContractSession'
export type { ContractSession, UseContractSessionOptions } from './useContractSession'

// Financials
export { useContractFinancials } from './useContractFinancials'
export type { ContractFinancials } from './useContractFinancials'
