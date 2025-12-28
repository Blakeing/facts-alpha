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
// Labels & Options
// =============================================================================

export {
  // At-Need Type
  atNeedTypeLabels,
  atNeedTypeOptions,
  // Contract Person Role
  contractPersonRoleLabels,
  getContractPersonRoleLabel,
  getItemTypeLabel,
  getNeedTypeLabel,
  getPaymentMethodLabel,
  getSaleStatusColor,
  getSaleStatusLabel,
  // Item Type
  itemTypeLabels,
  itemTypeOptions,
  // Need Type
  needTypeLabels,
  needTypeOptions,
  // Payment Method
  paymentMethodLabels,
  paymentMethodOptions,
  // Pre-Need Funding Type
  preNeedFundingTypeLabels,
  preNeedFundingTypeOptions,
  saleStatusColors,
  // Sale Status
  saleStatusLabels,
  saleStatusOptions,
} from './contract'

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

export { CONTRACT_SESSION_KEY } from './contractSessionContext'
export type { ContractSessionContext } from './contractSessionContext'

// =============================================================================
// Handlers
// =============================================================================

export { useItemsHandler } from './handlers/useItemsHandler'
export type { ItemsHandler } from './handlers/useItemsHandler'

export { usePaymentsHandler } from './handlers/usePaymentsHandler'
export type { PaymentFormData, PaymentsHandler } from './handlers/usePaymentsHandler'

export { usePeopleHandler } from './handlers/usePeopleHandler'
export type { PeopleHandler, PersonFormData } from './handlers/usePeopleHandler'

// =============================================================================
// Composables
// =============================================================================

export { useContract } from './useContract'
export { useContractMutations } from './useContractMutations'
export { CONTRACTS_QUERY_KEY, useContracts } from './useContracts'

// Session Architecture
export { useContractSession, useContractSessionContext } from './useContractSession'
export type {
  ContractFinancials,
  ContractSession,
  UseContractSessionOptions,
} from './useContractSession'
