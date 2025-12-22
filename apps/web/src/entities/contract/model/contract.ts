/**
 * Contract entity types
 */

export type ContractType = 'at_need_funeral' | 'pre_need_funeral' | 'cemetery'

export type ContractStatus = 'draft' | 'finalized' | 'executed' | 'void' | 'cancelled'

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
  caseId?: string // Link to Case entity
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
  date: string
  purchaserName: string
  beneficiaryName: string
  salesPersonName?: string
  grandTotal: number
  balanceDue: number
}

// Status helpers
export const contractStatusLabels: Record<ContractStatus, string> = {
  draft: 'Draft',
  finalized: 'Finalized',
  executed: 'Executed',
  void: 'Void',
  cancelled: 'Cancelled',
}

export const contractStatusColors: Record<ContractStatus, string> = {
  draft: 'grey',
  finalized: 'warning',
  executed: 'success',
  void: 'error',
  cancelled: 'error',
}

export function getContractStatusLabel(status: ContractStatus): string {
  return contractStatusLabels[status] || status
}

export function getContractStatusColor(status: ContractStatus): string {
  return contractStatusColors[status] || 'grey'
}

// Type helpers
export const contractTypeLabels: Record<ContractType, string> = {
  at_need_funeral: 'At-Need Funeral',
  pre_need_funeral: 'Pre-Need Funeral',
  cemetery: 'Cemetery',
}

export function getContractTypeLabel(type: ContractType): string {
  return contractTypeLabels[type] || type
}
