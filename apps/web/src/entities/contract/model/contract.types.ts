/**
 * Contract entity types and interfaces
 *
 * Aligned with backend Facts.Entities (Contract, Sale, SaleItem, etc.)
 * @see docs/data-models.md for field mapping details
 */

import type {
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
} from './contract.enums'
import type { Name } from '@/entities/name'
import type { Entity } from '@/shared/lib'

// =============================================================================
// Address (shared)
// =============================================================================

export interface Address {
  address1: string
  address2?: string
  city: string
  state: string
  postalCode?: string
  county?: string
  country?: string
}

// =============================================================================
// Sale Item Sub-Entities
// =============================================================================

/**
 * Sales tax applied to a sale item
 */
export interface SaleItemSalesTax {
  id: string
  saleItemId: string
  taxProfileItemId: string
  taxRate: number
  taxAmount: number
}

/**
 * Discount applied to a sale item
 */
export interface SaleItemDiscount {
  id: string
  saleItemId: string
  discountTypeId?: string
  description: string
  amount: number
  percentage?: number
}

/**
 * Trust fund allocation for a sale item
 */
export interface SaleItemTrustFund {
  id: string
  saleItemId: string
  trustFundType: string
  amount: number
}

// =============================================================================
// Sale Item
// =============================================================================

/**
 * Individual line item within a Sale
 * Backend: Facts.Entities.SaleItem
 */
export interface SaleItem {
  id: string
  saleId: string
  itemId: string // Reference to catalog Item
  description: string
  needType: NeedType
  quantity: number
  unitPrice: number
  bookPrice: number
  cost: number
  bookCost: number
  size?: number
  statedCare?: number
  salesTaxEnabled: boolean
  serialNumber?: string
  isCancelled: boolean
  cancellationOfSaleItemId?: string
  replacementOfSaleItemId?: string
  ordinal: number // Sort order

  // Computed/display fields
  sku?: string
  itemDescription?: string
  itemType?: ItemType

  // Child collections
  salesTax: SaleItemSalesTax[]
  discounts: SaleItemDiscount[]
  trust: SaleItemTrustFund[]

  // Timestamps (matches BFF field names)
  dateCreated: string
  dateLastModified: string
}

// =============================================================================
// Sale
// =============================================================================

/**
 * A sale record within a contract (can be original sale or adjustment)
 * Backend: Facts.Entities.Sale
 */
export interface Sale extends Omit<Entity, 'createdByUserId' | 'version'> {
  contractId: string
  saleNumber: string
  saleDate?: string
  saleType: SaleType
  saleStatus: SaleStatus
  saleAdjustmentType?: SaleAdjustmentType
  cancellationTypeId?: string
  accountingPeriod?: string
  memo?: string

  // Computed totals
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number

  // Child collections
  items: SaleItem[]
}

// =============================================================================
// Contract Person
// =============================================================================

/**
 * A person associated with a contract (buyer, beneficiary, etc.)
 * Backend: Facts.Entities.ContractPerson -> Name
 *
 * NOTE: BFF returns nested Name object - no flattening needed!
 */
export interface ContractPerson extends Omit<Entity, 'createdByUserId' | 'version'> {
  contractId: string
  nameId: string // Reference to Name entity
  roles: number // Flags enum: 1=PrimaryBuyer, 2=CoBuyer, 4=PrimaryBeneficiary, 8=AdditionalBeneficiary
  addedAfterContractExecution: boolean

  // Nested Name object from BFF (includes phones[], addresses[], emailAddresses[])
  name: Name

  // Conversion tracking (for data migration)
  conversion: string | null
  conversionId: string | null
  conversionSource: string | null

  // Timestamps (matches BFF field names)
  dateCreated: string
  dateLastModified: string
}

/**
 * People Handler Interface
 *
 * Provides methods for working with contract people in the editor context.
 * Used by components and composables that need to interact with the people array.
 */
export interface PeopleHandler {
  /**
   * Get the display type/label for a person based on their role
   * Returns: 'Buyer', 'Co-Buyer', 'Beneficiary', 'Additional Beneficiary', 'Deceased', or 'Person'
   */
  getDisplayType: (person: ContractPerson) => string

  /**
   * Check if a person has a specific role
   */
  hasRole: (person: ContractPerson, role: ContractPersonRole) => boolean

  /**
   * Apply an update to a person in the draft
   */
  applyPersonUpdate: (person: ContractPerson) => void
}

// =============================================================================
// Contract Financing
// =============================================================================

/**
 * Financing/payment terms for a contract
 * Backend: Facts.Entities.ContractFinancing
 */
export interface ContractFinancing extends Omit<Entity, 'createdByUserId' | 'version'> {
  contractId: string
  isFinanced: boolean
  downPayment: number
  otherCredits: number
  interestRate?: number
  term?: number // Number of payments
  paymentsPerYear: number
  firstPaymentDate?: string
  paymentAmount?: number
  useManualPaymentAmount: boolean
  calculatedPaymentAmount?: number
  totalFinanceCharges?: number
  useManualFinanceCharges: boolean
  calculatedTotalFinanceCharges?: number
  finalPaymentAmount?: number
  interestRebateDays: number
  status: FinancingStatus
  receivesCouponBook: boolean
  receivesStatement: boolean

  // Late fees
  lateFeeType: LateFeeType
  lateFeeAmount?: number
  lateFeeMax?: number
  lateFeeGracePeriod?: number

  // Imputed interest (for pre-need)
  imputedInterestRate?: number
  totalImputedInterest?: number
}

// =============================================================================
// Contract Funding Detail (for insurance-funded pre-need)
// =============================================================================

export interface ContractFundingDetail {
  id: string
  contractId: string
  policyNumber: string
  faceValue: number
  insuranceProviderId?: string
}

// =============================================================================
// Payment (for tracking payments received)
// =============================================================================

export interface ContractPayment extends Omit<Entity, 'createdByUserId' | 'version'> {
  contractId: string
  saleId?: string
  date: string
  method: PaymentMethod
  amount: number
  reference?: string
  checkNumber?: string
  notes?: string
}

// =============================================================================
// Contract (Main Entity)
// =============================================================================

/**
 * Main contract entity
 * Backend: Facts.Entities.Contract
 */
export interface Contract {
  id: string
  contractNumber: string
  prePrintedContractNumber?: string
  locationId: string

  // Type classification
  needType: NeedType
  contractTypeId?: string // Reference to ContractType lookup
  contractSaleTypeId?: string
  leadSourceId?: string
  atNeedType?: AtNeedType
  preNeedFundingType?: PreNeedFundingType

  // Sales person
  salesPersonId?: string
  salesPersonName?: string // Denormalized for display
  marketingAgentId?: string
  salesPersonRole?: string

  // Key dates
  dateExecuted?: string
  dateSigned?: string
  dateApproved?: string // For conditional sales

  // State flags
  isCancelled: boolean
  isConditionalSale: boolean

  // References
  contractReferenceId?: string
  firstCallId?: string
  commentFeedOwnerId?: string

  // Computed totals (aggregated from sales)
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  amountPaid: number
  balanceDue: number

  // Related entities (loaded separately or embedded)
  sales?: Sale[]
  people?: ContractPerson[]
  financing?: ContractFinancing
  fundingDetails?: ContractFundingDetail[]
  payments?: ContractPayment[]

  // Notes
  notes?: string

  // Timestamps (matches BFF field names)
  dateCreated: string
  dateLastModified: string
}

// =============================================================================
// Contract Listing (for list views)
// =============================================================================

/**
 * BFF response wrapper for GET /contracts/{id} and POST /contracts/save/draft
 * Contains the contract plus permission/action flags that control what the user can do
 * Aligns with legacy ContractSessionSaveModel
 */
export interface ContractSession {
  contract: Contract
  /** Whether the user can execute this contract */
  executeContract: boolean
  /** Whether the user can finalize this contract */
  finalizeContract: boolean
  /** Whether the user can void this contract */
  voidContract: boolean
  /** Additional form data (attributes, non-mapped values, etc.) */
  data?: ContractSessionData
}

/**
 * Additional session data from BFF
 * Contains form attributes, calculation logs, etc.
 */
export interface ContractSessionData {
  attributeValues?: Record<string, unknown>
  nonMappedFormValues?: Record<string, unknown>
  commissionLog?: Record<string, unknown>
  trustLog?: Record<string, unknown>
  forms?: unknown[]
}

/**
 * Permission flags extracted from ContractSession
 * Used by UI to enable/disable actions
 */
export interface ContractPermissions {
  canExecute: boolean
  canFinalize: boolean
  canVoid: boolean
}

/**
 * Lightweight contract model for list views
 * Aligned with legacy BFF ContractListingModel
 */
export interface ContractListing {
  id: string
  contractNumber: string
  prePrintedContractNumber?: string
  locationId: string
  needType: NeedType
  /** Contract status as string - use this for display (e.g., "Draft", "Executed", "Void") */
  status?: string
  isCancelled: boolean
  dateExecuted?: string
  dateSigned?: string
  /** Date field (BFF may return as 'date' or 'dateSigned') */
  date?: string
  /** Primary buyer name (BFF may return as 'purchaser') */
  primaryBuyerName: string
  purchaser?: string // Legacy BFF field name
  /** Co-buyers array (from legacy BFF) */
  cobuyers?: string[]
  /** Primary beneficiary name (BFF may return as 'beneficiary') */
  primaryBeneficiaryName: string
  beneficiary?: string // Legacy BFF field name
  /** Contract type (from legacy BFF) */
  type?: string
  /** Buyer ID (from legacy BFF) */
  buyerId?: string
  /** Beneficiary ID (from legacy BFF) */
  beneficiaryId?: string
  /** Beneficiary date of death (for At-Need contracts) */
  beneficiaryDateOfDeath?: string | null
  /** Funding details (for insurance-funded pre-need) */
  fundingDetails?: ContractFundingDetail[]
  salesPersonName?: string
  salesPerson?: string // Legacy BFF field name
  salesPersonId?: string // Legacy BFF field name
  grandTotal: number
  amountPaid: number
  balanceDue: number
}
