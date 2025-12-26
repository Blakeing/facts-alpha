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
  NeedType,
  SaleType,
  SaleStatus,
  SaleAdjustmentType,
  ContractPersonRole,
  AtNeedType,
  PreNeedFundingType,
  FinancingStatus,
  LateFeeType,
  ItemType,
  PaymentMethod,
} from './contract'

// =============================================================================
// Labels & Options
// =============================================================================

export {
  // Need Type
  needTypeLabels,
  needTypeOptions,
  getNeedTypeLabel,
  // Sale Status
  saleStatusLabels,
  saleStatusColors,
  saleStatusOptions,
  getSaleStatusLabel,
  getSaleStatusColor,
  // At-Need Type
  atNeedTypeLabels,
  atNeedTypeOptions,
  // Pre-Need Funding Type
  preNeedFundingTypeLabels,
  preNeedFundingTypeOptions,
  // Contract Person Role
  contractPersonRoleLabels,
  getContractPersonRoleLabel,
  // Item Type
  itemTypeLabels,
  itemTypeOptions,
  getItemTypeLabel,
  // Payment Method
  paymentMethodLabels,
  paymentMethodOptions,
  getPaymentMethodLabel,
} from './contract'

// =============================================================================
// Helper Functions
// =============================================================================

export {
  getContractPersonDisplayName,
  getPrimaryBuyer,
  getPrimaryBeneficiary,
  getCoBuyers,
  calculateSaleTotals,
  // Backend conversion helpers
  needTypeFromBackend,
  needTypeToBackend,
  saleStatusFromBackend,
  saleStatusToBackend,
  saleTypeFromBackend,
  saleTypeToBackend,
} from './contract'

// =============================================================================
// Schemas
// =============================================================================

export {
  addressSchema,
  contractFormSchema,
  contractPaymentSchema,
  contractPersonSchema,
  contractFinancingSchema,
  contractFundingDetailSchema,
  saleSchema,
  saleItemSchema,
  saleItemSalesTaxSchema,
  saleItemDiscountSchema,
  saleItemTrustFundSchema,
  // Default value helpers
  getDefaultAddress,
  getDefaultContractPerson,
  getDefaultSaleItem,
  getDefaultSale,
  getDefaultFinancing,
  getDefaultPayment,
  getDefaultContractFormValues,
} from './contractSchema'

export type {
  AddressFormValues,
  ContractFormValues,
  ContractPaymentFormValues,
  ContractPersonFormValues,
  ContractFinancingFormValues,
  ContractFundingDetailFormValues,
  SaleFormValues,
  SaleItemFormValues,
  SaleItemSalesTaxFormValues,
  SaleItemDiscountFormValues,
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
export type { PaymentsHandler, PaymentFormData } from './handlers/usePaymentsHandler'

export { usePeopleHandler } from './handlers/usePeopleHandler'
export type { PeopleHandler, PersonFormData } from './handlers/usePeopleHandler'

// =============================================================================
// Composables
// =============================================================================

export { CONTRACTS_QUERY_KEY, useContracts } from './useContracts'

// Session Architecture
export { useContractSession, useContractSessionContext } from './useContractSession'
export type {
  ContractFinancials,
  ContractSession,
  UseContractSessionOptions,
} from './useContractSession'
