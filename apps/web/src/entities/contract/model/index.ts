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
  ContractSessionSaveModel,
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
// Draft Model & Validation
// =============================================================================

export {
  applyPatch,
  createDraftFromServer,
  createNewContractDraft,
  draftToContract,
  getValueByPath,
  resetDraft,
} from './contract.draft'

export type { ContractDraft } from './contract.draft'

export {
  type ContractSection,
  ValidationMode,
  validateAllSections,
  validateDraftPreConditions,
  validateSection,
  zodErrorsToPathMap,
} from './contract.validation'

export type { DraftPreConditionErrors } from './contract.validation'

// =============================================================================
// Composables
// =============================================================================

export { useContract } from './useContract'
export { CONTRACTS_QUERY_KEY, type ContractStatusString, useContracts } from './useContracts'

// =============================================================================
// Legacy Exports (deprecated - only for .old.vue files)
// =============================================================================
// The following are kept for backward compatibility with legacy .old.vue files
// but should not be used in new code. Use ContractEditorContext instead.
//
// @deprecated Use ContractEditorContext from @/features/contract-dialog
// export { useContractSession, useSession } from './useContractSession'
// export { useItemsHandler, usePaymentsHandler, usePeopleHandler } from './handlers'
