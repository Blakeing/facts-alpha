/**
 * Contract entity types
 *
 * Aligned with backend Facts.Entities (Contract, Sale, SaleItem, etc.)
 * @see docs/data-models.md for field mapping details
 */

import type { Name } from '@/entities/name'
import type { Entity, EntityState } from '@/shared/lib/entity'

// =============================================================================
// Backend-Aligned Enums
// =============================================================================

/**
 * Need Type - At-Need vs Pre-Need
 * Backend: NeedType (AN=1, PN=2)
 * Matches BFF exactly - numeric enum
 */
export enum NeedType {
  AT_NEED = 1,
  PRE_NEED = 2,
}

/**
 * Sale Type - What kind of sale record
 * Backend: SaleType (Contract=0, ContractAdjustment=1, MiscCash=2)
 * Matches BFF exactly - numeric enum
 */
export enum SaleType {
  CONTRACT = 0,
  CONTRACT_ADJUSTMENT = 1,
  MISC_CASH = 2,
}

/**
 * Sale Status - Lifecycle state of a sale
 * Backend: SaleStatus (Draft=0, Executed=1, Finalized=2, Void=3)
 * Matches BFF exactly - numeric enum
 */
export enum SaleStatus {
  DRAFT = 0,
  EXECUTED = 1,
  FINALIZED = 2,
  VOID = 3,
}

/**
 * Sale Adjustment Type - Type of adjustment being made
 * Backend: SaleAdjustmentType
 * Matches BFF exactly - numeric enum
 */
export enum SaleAdjustmentType {
  SALES_TAX = 0,
  DISCOUNT = 1,
  CANCELLATION = 2,
  EXCHANGE = 3,
  TRANSFER = 4,
  ADDENDUM = 5,
  NEED_TYPE_SWAP = 6,
  LATE_FEE = 7,
  PROPERTY_EXCHANGE = 8,
  ITEM_CREDIT = 9,
}

/**
 * Contract Person Role - Flags enum for person's role(s) on contract
 * Backend: ContractPersonRole (flags: Person=0, PrimaryBuyer=1, CoBuyer=2, etc.)
 */
export const ContractPersonRole = {
  PERSON: 'person',
  PRIMARY_BUYER: 'primary_buyer',
  CO_BUYER: 'co_buyer',
  PRIMARY_BENEFICIARY: 'primary_beneficiary',
  ADDITIONAL_BENEFICIARY: 'additional_beneficiary',
} as const
export type ContractPersonRole = (typeof ContractPersonRole)[keyof typeof ContractPersonRole]

/**
 * At-Need Type - How an at-need contract was initiated
 * Backend: AtNeedType (WalkIn=0, PN_Maturity=1)
 * Matches BFF exactly - numeric enum
 */
export enum AtNeedType {
  WALK_IN = 0,
  PN_MATURITY = 1,
}

/**
 * Pre-Need Funding Type - How a pre-need contract is funded
 * Backend: PreNeedFundingType (Trust=0, Insurance=1)
 * Matches BFF exactly - numeric enum
 */
export enum PreNeedFundingType {
  TRUST = 0,
  INSURANCE = 1,
}

/**
 * Financing Status
 * Backend: ContractFinancingStatus (Pending=0, Calculated=1)
 */
export const FinancingStatus = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
} as const
export type FinancingStatus = (typeof FinancingStatus)[keyof typeof FinancingStatus]

/**
 * Late Fee Type
 * Backend: LateFeeType (None=0, FixedAmount=1, PercentageOfPaymentAmount=2)
 */
export const LateFeeType = {
  NONE: 'none',
  FIXED_AMOUNT: 'fixed_amount',
  PERCENTAGE_OF_PAYMENT: 'percentage_of_payment',
} as const
export type LateFeeType = (typeof LateFeeType)[keyof typeof LateFeeType]

/**
 * Item Type - Category of sale item
 * Backend: ItemType
 */
export const ItemType = {
  SERVICE: 'service',
  MERCHANDISE: 'merchandise',
  CASH_ADVANCE: 'cash_advance',
  PROPERTY: 'property',
} as const
export type ItemType = (typeof ItemType)[keyof typeof ItemType]

/**
 * Payment Method
 * Used for payment tracking
 */
export const PaymentMethod = {
  CASH: 'cash',
  CHECK: 'check',
  CREDIT_CARD: 'credit_card',
  ACH: 'ach',
  INSURANCE: 'insurance',
  FINANCING: 'financing',
  OTHER: 'other',
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

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
 * BFF response wrapper for GET /contracts/{id}
 * The BFF returns a wrapper object, not the contract directly
 */
export interface ContractResponse {
  contract: Contract
  executeContract: boolean
  finalizeContract: boolean
  voidContract: boolean
  data?: unknown
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
  /**
   * Contract status as numeric enum - BUG: BFF always returns 0 (Draft) regardless of actual status.
   * Use `status` string field instead for display/filtering.
   * @deprecated Use `status` string field instead
   */
  contractStatus: SaleStatus
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

// =============================================================================
// Enum Labels & Helpers
// =============================================================================

export const needTypeLabels: Record<NeedType, string> = {
  [NeedType.AT_NEED]: 'At-Need',
  [NeedType.PRE_NEED]: 'Pre-Need',
}

export const needTypeOptions = [
  { title: 'At-Need', value: NeedType.AT_NEED },
  { title: 'Pre-Need', value: NeedType.PRE_NEED },
]

export const saleStatusLabels: Record<SaleStatus, string> = {
  [SaleStatus.DRAFT]: 'Draft',
  [SaleStatus.EXECUTED]: 'Executed',
  [SaleStatus.FINALIZED]: 'Finalized',
  [SaleStatus.VOID]: 'Void',
}

export const saleStatusColors: Record<SaleStatus, string> = {
  [SaleStatus.DRAFT]: 'grey',
  [SaleStatus.EXECUTED]: 'warning',
  [SaleStatus.FINALIZED]: 'success',
  [SaleStatus.VOID]: 'error',
}

export const saleStatusOptions = [
  { title: 'Draft', value: SaleStatus.DRAFT },
  { title: 'Executed', value: SaleStatus.EXECUTED },
  { title: 'Finalized', value: SaleStatus.FINALIZED },
  { title: 'Void', value: SaleStatus.VOID },
]

export const atNeedTypeLabels: Record<AtNeedType, string> = {
  [AtNeedType.WALK_IN]: 'Walk-In',
  [AtNeedType.PN_MATURITY]: 'Pre-Need Maturity',
}

export const atNeedTypeOptions = [
  { title: 'Walk-In', value: AtNeedType.WALK_IN },
  { title: 'Pre-Need Maturity', value: AtNeedType.PN_MATURITY },
]

export const preNeedFundingTypeLabels: Record<PreNeedFundingType, string> = {
  [PreNeedFundingType.TRUST]: 'Trust',
  [PreNeedFundingType.INSURANCE]: 'Insurance',
}

export const preNeedFundingTypeOptions = [
  { title: 'Trust', value: PreNeedFundingType.TRUST },
  { title: 'Insurance', value: PreNeedFundingType.INSURANCE },
]

export const contractPersonRoleLabels: Record<ContractPersonRole, string> = {
  [ContractPersonRole.PERSON]: 'Person',
  [ContractPersonRole.PRIMARY_BUYER]: 'Primary Buyer',
  [ContractPersonRole.CO_BUYER]: 'Co-Buyer',
  [ContractPersonRole.PRIMARY_BENEFICIARY]: 'Primary Beneficiary',
  [ContractPersonRole.ADDITIONAL_BENEFICIARY]: 'Additional Beneficiary',
}

export const itemTypeLabels: Record<ItemType, string> = {
  [ItemType.SERVICE]: 'Service',
  [ItemType.MERCHANDISE]: 'Merchandise',
  [ItemType.CASH_ADVANCE]: 'Cash Advance',
  [ItemType.PROPERTY]: 'Property',
}

export const itemTypeOptions = [
  { title: 'Service', value: ItemType.SERVICE },
  { title: 'Merchandise', value: ItemType.MERCHANDISE },
  { title: 'Cash Advance', value: ItemType.CASH_ADVANCE },
  { title: 'Property', value: ItemType.PROPERTY },
]

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CHECK]: 'Check',
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.ACH]: 'ACH',
  [PaymentMethod.INSURANCE]: 'Insurance',
  [PaymentMethod.FINANCING]: 'Financing',
  [PaymentMethod.OTHER]: 'Other',
}

export const paymentMethodOptions = [
  { title: 'Cash', value: PaymentMethod.CASH },
  { title: 'Check', value: PaymentMethod.CHECK },
  { title: 'Credit Card', value: PaymentMethod.CREDIT_CARD },
  { title: 'ACH', value: PaymentMethod.ACH },
  { title: 'Insurance', value: PaymentMethod.INSURANCE },
  { title: 'Financing', value: PaymentMethod.FINANCING },
  { title: 'Other', value: PaymentMethod.OTHER },
]

// =============================================================================
// Helper Functions
// =============================================================================

export function getNeedTypeLabel(type: NeedType): string {
  return needTypeLabels[type] || String(type)
}

export function getSaleStatusLabel(status: SaleStatus): string {
  return saleStatusLabels[status] || String(status)
}

export function getSaleStatusColor(status: SaleStatus): string {
  return saleStatusColors[status] || 'grey'
}

export function getContractPersonRoleLabel(role: ContractPersonRole): string {
  return contractPersonRoleLabels[role] || role
}

export function getItemTypeLabel(type: ItemType): string {
  return itemTypeLabels[type] || type
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return paymentMethodLabels[method] || method
}

/**
 * Get display name for a contract person
 */
export function getContractPersonDisplayName(person: ContractPerson): string {
  const parts = [person.firstName, person.middleName, person.lastName].filter(Boolean)
  return parts.join(' ')
}

/**
 * Get primary buyer from contract people
 */
/**
 * Check if a person has a specific role
 * Handles both:
 * - Array format: roles: ['primary_buyer'] or roles: [1]
 * - Flags format: roles: 1 (BFF returns this)
 */
function hasRole(person: ContractPerson, roleValue: number, roleString: string): boolean {
  const roles = person.roles
  if (!roles && roles !== 0) return false

  // If roles is a number (flags enum from BFF), use bitwise check
  if (typeof roles === 'number') {
    return (roles & roleValue) !== 0
  }

  // If roles is an array, check for both string and numeric values
  if (Array.isArray(roles)) {
    return (
      roles.includes(roleString as ContractPersonRole) ||
      roles.includes(roleValue as unknown as ContractPersonRole)
    )
  }

  return false
}

/**
 * Get primary buyer from contract people
 * BFF: PrimaryBuyer = 1 (flags enum)
 */
export function getPrimaryBuyer(people: ContractPerson[]): ContractPerson | undefined {
  console.log(
    '[getPrimaryBuyer] People:',
    people?.map((p) => ({ name: p.firstName, roles: p.roles, rolesType: typeof p.roles })),
  )
  const found = people.find((p) => hasRole(p, 1, ContractPersonRole.PRIMARY_BUYER))
  console.log('[getPrimaryBuyer] Found:', found?.firstName)
  return found
}

/**
 * Get primary beneficiary from contract people
 * BFF: PrimaryBeneficiary = 4 (flags enum)
 */
export function getPrimaryBeneficiary(people: ContractPerson[]): ContractPerson | undefined {
  return people.find((p) => hasRole(p, 4, ContractPersonRole.PRIMARY_BENEFICIARY))
}

/**
 * Get co-buyers from contract people
 * BFF: CoBuyer = 2 (flags enum)
 */
export function getCoBuyers(people: ContractPerson[]): ContractPerson[] {
  return people.filter((p) => hasRole(p, 2, ContractPersonRole.CO_BUYER))
}

/**
 * Calculate totals for a sale from its items
 */
export function calculateSaleTotals(items: SaleItem[]): {
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
} {
  const activeItems = items.filter((item) => !item.isCancelled)

  const subtotal = activeItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const taxTotal = activeItems.reduce(
    (sum, item) => sum + item.salesTax.reduce((t, tax) => t + tax.taxAmount, 0),
    0,
  )

  const discountTotal = activeItems.reduce(
    (sum, item) => sum + item.discounts.reduce((d, disc) => d + disc.amount, 0),
    0,
  )

  const grandTotal = subtotal + taxTotal - discountTotal

  return { subtotal, taxTotal, discountTotal, grandTotal }
}

// =============================================================================
// Enum Conversion Helpers (for API integration)
// =============================================================================
//
// NOTE: Old conversion helpers have been removed.
// Use enum controllers from @/shared/lib/enums instead:
//
// import { needTypeController, saleStatusController } from '@/shared/lib/enums/contract'
// const needType = yield* needTypeController.fromApi(backendValue)
// const backendValue = yield* needTypeController.toApi(frontendValue)

// =============================================================================
// Save Model Types (for BFF API)
// =============================================================================

/**
 * Contract Name Role - Role assignments at contract level
 * Used for tracking relationships between people and contracts
 */
export interface ContractNameRole {
  id?: string
  contractId: string
  nameId: string
  roleType?: string
  // Additional fields as needed
}

/**
 * Comment Feed - For contract comments/notes
 */
export interface CommentFeed {
  feedType: string
  ownerId: number
  // Additional fields as needed
}

/**
 * Contract Session Data - Additional session-specific data
 */
export interface ContractSessionDataSaveModel {
  forms?: unknown[]
  attributeValues?: unknown
  nonMappedFormValues?: unknown
  commissionLog?: unknown
  trustLog?: unknown
}

/**
 * Payment Save Model - Wrapper with entity state tracking
 * Used to indicate whether payment is new, modified, deleted, or moved
 */
export interface PaymentSaveModel {
  state: EntityState
  payment: ContractPayment
}

/**
 * Contract Save Model - Nested structure for saving contract
 * Includes all related entities (people, sales, items, payments)
 */
export interface ContractSaveModel {
  id?: string
  locationId: string
  needType: NeedType
  dateSigned?: string
  dateExecuted?: string
  contractNumber?: string
  prePrintedContractNumber?: string
  isConditionalSale?: boolean
  isCancelled?: boolean
  notes?: string

  // Related entities (nested)
  people: ContractPerson[]
  sales: Sale[]
  financing?: ContractFinancing

  // Name roles (gathered from people on save)
  nameRoles?: ContractNameRole[]

  // Optional fields from Contract entity
  contractTypeId?: string
  contractSaleTypeId?: string
  leadSourceId?: string
  atNeedType?: AtNeedType
  preNeedFundingType?: PreNeedFundingType
  salesPersonId?: string
  marketingAgentId?: string
  contractReferenceId?: string
  firstCallId?: string
  commentFeedOwnerId?: string
  dateApproved?: string
}

/**
 * Contract Session Save Model - Complete payload for BFF save endpoint
 * Matches legacy ContractSessionSaveModel structure
 * POST /api/v1/contracts/save/draft
 */
export interface ContractSessionSaveModel {
  executeContract: boolean
  finalizeContract: boolean
  voidContract: boolean
  contract: ContractSaveModel
  payments: PaymentSaveModel[]
  commentFeed?: CommentFeed
  temporaryAttachmentOwnerId?: string
  data?: ContractSessionDataSaveModel
}
