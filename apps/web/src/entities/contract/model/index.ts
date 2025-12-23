// Types
export type {
  Address,
  Contract,
  ContractItem,
  ContractListing,
  ContractPayment,
  ContractPerson,
  PaymentAllocation,
} from './contract'

// Re-export ContractStatus and ContractType (value + type in one export)
export { ContractStatus, ContractType } from './contract'

// Helpers and options
export {
  contractStatusColors,
  contractStatusLabels,
  contractStatusOptions,
  contractTypeLabels,
  contractTypeOptions,
  getContractStatusColor,
  getContractStatusLabel,
  getContractTypeLabel,
} from './contract'

// Schemas
export {
  addressSchema,
  contractFormSchema,
  contractItemSchema,
  contractPaymentSchema,
  contractPersonSchema,
  getDefaultContractFormValues,
} from './contractSchema'

export type {
  AddressFormValues,
  ContractFormValues,
  ContractItemFormValues,
  ContractPaymentFormValues,
  ContractPersonFormValues,
} from './contractSchema'

// Session Context
export { CONTRACT_SESSION_KEY } from './contractSessionContext'

export type { ContractSessionContext } from './contractSessionContext'
// Handlers
export { type ItemsHandler, useItemsHandler } from './handlers/useItemsHandler'

export {
  type PaymentFormData,
  type PaymentMethod,
  type PaymentsHandler,
  usePaymentsHandler,
} from './handlers/usePaymentsHandler'
export {
  type PeopleHandler,
  type PersonFormData,
  usePeopleHandler,
} from './handlers/usePeopleHandler'

// Composables
export { CONTRACTS_QUERY_KEY, useContracts } from './useContracts'
// Session Architecture
export { useContractSession, useContractSessionContext } from './useContractSession'
export type {
  ContractFinancials,
  ContractSession,
  UseContractSessionOptions,
} from './useContractSession'
