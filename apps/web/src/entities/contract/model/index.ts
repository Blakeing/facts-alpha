// Types
export type {
  Address,
  Contract,
  ContractItem,
  ContractListing,
  ContractPayment,
  ContractPerson,
  ContractStatus,
  ContractType,
  PaymentAllocation,
} from './contract'

export {
  contractStatusColors,
  contractStatusLabels,
  contractTypeLabels,
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

export { useContract } from './useContract'
export { useContractForm } from './useContractForm'
// Composables
export { CONTRACTS_QUERY_KEY, useContracts } from './useContracts'
