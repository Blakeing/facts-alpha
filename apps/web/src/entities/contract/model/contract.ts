/**
 * Contract entity types
 */

// =============================================================================
// Contract Type - const object pattern (no magic strings)
// =============================================================================

export const ContractType = {
  AT_NEED_FUNERAL: 'at_need_funeral',
  PRE_NEED_FUNERAL: 'pre_need_funeral',
  CEMETERY: 'cemetery',
} as const

export type ContractType = (typeof ContractType)[keyof typeof ContractType]

// =============================================================================
// Contract Status - const object pattern (no magic strings)
// =============================================================================

export const ContractStatus = {
  DRAFT: 'draft',
  FINALIZED: 'finalized',
  EXECUTED: 'executed',
  VOID: 'void',
  CANCELLED: 'cancelled',
} as const

export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus]

export interface Address {
  street: string
  city: string
  state: string
  zip: string
}

export interface ContractPerson {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  phone?: string
  email?: string
  address?: Address
  relationship?: string // For beneficiary/purchaser relationship
  dateOfBirth?: string
  dateOfDeath?: string // For beneficiary
}

export interface ContractItem {
  id: string
  contractId: string
  itemNumber: string
  description: string
  category: 'service' | 'merchandise' | 'cash_advance'
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  total: number
  notes?: string
}

export interface ContractPayment {
  id: string
  contractId: string
  date: string
  method: 'cash' | 'check' | 'credit_card' | 'insurance' | 'financing' | 'other'
  amount: number
  reference?: string
  notes?: string
  allocations?: PaymentAllocation[]
}

export interface PaymentAllocation {
  itemId: string
  amount: number
}

export interface Contract {
  id: string
  contractNumber: string
  prePrintedContractNumber?: string
  type: ContractType
  status: ContractStatus
  locationId: string // Link to Location entity
  date: string
  signDate?: string

  // People
  purchaser: ContractPerson
  coBuyers: ContractPerson[]
  beneficiary: ContractPerson

  // Sales info
  salesPersonId?: string
  salesPersonName?: string

  // Financials (computed from items)
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  amountPaid: number
  balanceDue: number

  // Related data (loaded separately for tabs)
  items?: ContractItem[]
  payments?: ContractPayment[]

  // Notes
  notes?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Listing model (lighter for list views)
export interface ContractListing {
  id: string
  contractNumber: string
  prePrintedContractNumber?: string
  type: ContractType
  status: ContractStatus
  locationId: string
  date: string
  purchaserName: string
  beneficiaryName: string
  salesPersonName?: string
  grandTotal: number
  balanceDue: number
}

// =============================================================================
// Status Helpers
// =============================================================================

export const contractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Draft',
  [ContractStatus.FINALIZED]: 'Finalized',
  [ContractStatus.EXECUTED]: 'Executed',
  [ContractStatus.VOID]: 'Void',
  [ContractStatus.CANCELLED]: 'Cancelled',
}

export const contractStatusColors: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'grey',
  [ContractStatus.FINALIZED]: 'warning',
  [ContractStatus.EXECUTED]: 'success',
  [ContractStatus.VOID]: 'error',
  [ContractStatus.CANCELLED]: 'error',
}

/** Dropdown options for contract status */
export const contractStatusOptions = [
  { title: 'Draft', value: ContractStatus.DRAFT },
  { title: 'Finalized', value: ContractStatus.FINALIZED },
  { title: 'Executed', value: ContractStatus.EXECUTED },
  { title: 'Void', value: ContractStatus.VOID },
  { title: 'Cancelled', value: ContractStatus.CANCELLED },
]

export function getContractStatusLabel(status: ContractStatus): string {
  return contractStatusLabels[status] || status
}

export function getContractStatusColor(status: ContractStatus): string {
  return contractStatusColors[status] || 'grey'
}

// =============================================================================
// Type Helpers
// =============================================================================

export const contractTypeLabels: Record<ContractType, string> = {
  [ContractType.AT_NEED_FUNERAL]: 'At-Need Funeral',
  [ContractType.PRE_NEED_FUNERAL]: 'Pre-Need Funeral',
  [ContractType.CEMETERY]: 'Cemetery',
}

/** Dropdown options for contract type */
export const contractTypeOptions = [
  { title: 'At-Need Funeral', value: ContractType.AT_NEED_FUNERAL },
  { title: 'Pre-Need Funeral', value: ContractType.PRE_NEED_FUNERAL },
  { title: 'Cemetery', value: ContractType.CEMETERY },
]

export function getContractTypeLabel(type: ContractType): string {
  return contractTypeLabels[type] || type
}
