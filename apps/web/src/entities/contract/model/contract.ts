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
 * This is a bitwise flags enum - multiple roles can be combined using | operator
 */
export enum ContractPersonRole {
  PERSON = 0,
  PRIMARY_BUYER = 1,
  CO_BUYER = 2,
  PRIMARY_BENEFICIARY = 4,
  ADDITIONAL_BENEFICIARY = 8,
}

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
 * Matches BFF exactly - numeric enum
 */
export enum FinancingStatus {
  PENDING = 0,
  CALCULATED = 1,
}

/**
 * Late Fee Type
 * Backend: LateFeeType (None=0, FixedAmount=1, PercentageOfPaymentAmount=2)
 * Matches BFF exactly - numeric enum
 */
export enum LateFeeType {
  NONE = 0,
  FIXED_AMOUNT = 1,
  PERCENTAGE_OF_PAYMENT = 2,
}

/**
 * Item Type - Category of sale item
 * Backend: ItemType (Service=0, Merchandise=1, CashAdvance=2, Property=3, Other=4)
 * Matches BFF exactly - numeric enum
 */
export enum ItemType {
  SERVICE = 0,
  MERCHANDISE = 1,
  CASH_ADVANCE = 2,
  PROPERTY = 3,
  OTHER = 4,
}

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
// Enum Helpers
// =============================================================================

// Sale status colors (not provided by controller)
export const saleStatusColors: Record<SaleStatus, string> = {
  [SaleStatus.DRAFT]: 'grey',
  [SaleStatus.EXECUTED]: 'warning',
  [SaleStatus.FINALIZED]: 'success',
  [SaleStatus.VOID]: 'error',
}

export function getSaleStatusColor(status: SaleStatus): string {
  return saleStatusColors[status] || 'grey'
}

/**
 * Get display name for a contract person
 */
export function getContractPersonDisplayName(person: ContractPerson): string {
  return [person.name.first, person.name.middle, person.name.last].filter(Boolean).join(' ')
}

/**
 * Get primary buyer from contract people
 */
/**
 * Check if a person has a specific role
 * Uses bitwise flags: roles is a number where each bit represents a role
 * BFF: PrimaryBuyer = 1, CoBuyer = 2, PrimaryBeneficiary = 4, AdditionalBeneficiary = 8
 */
function hasRole(person: ContractPerson, role: ContractPersonRole): boolean {
  const roles = person.roles
  if (roles === undefined || roles === null) return false
  return (roles & role) !== 0
}

/**
 * Get primary buyer from contract people
 * BFF: PrimaryBuyer = 1 (flags enum)
 */
export function getPrimaryBuyer(people: ContractPerson[]): ContractPerson | undefined {
  console.log(
    '[getPrimaryBuyer] People:',
    people?.map((p) => ({ name: p.name.first, roles: p.roles, rolesType: typeof p.roles })),
  )
  const found = people.find((p) => hasRole(p, ContractPersonRole.PRIMARY_BUYER))
  console.log('[getPrimaryBuyer] Found:', found?.name.first)
  return found
}

/**
 * Get primary beneficiary from contract people
 * BFF: PrimaryBeneficiary = 4 (flags enum)
 */
export function getPrimaryBeneficiary(people: ContractPerson[]): ContractPerson | undefined {
  return people.find((p) => hasRole(p, ContractPersonRole.PRIMARY_BENEFICIARY))
}

/**
 * Get co-buyers from contract people
 * BFF: CoBuyer = 2 (flags enum)
 */
export function getCoBuyers(people: ContractPerson[]): ContractPerson[] {
  return people.filter((p) => hasRole(p, ContractPersonRole.CO_BUYER))
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
 * Contract Person with nameRoles - Used in save models
 * Extends ContractPerson to include nameRoles for save/load operations
 */
export interface ContractPersonWithRoles extends ContractPerson {
  nameRoles?: ContractNameRole[]
}

/**
 * Comment Feed - For contract comments/notes
 */
export interface CommentFeed {
  id: string
  feedType: string
  ownerId: string
  entries: CommentFeedEntry[]
}

/**
 * Comment Feed Entry - Individual comment in a feed
 */
export interface CommentFeedEntry {
  id: string
  commentFeedId: string
  userId: number
  replyToCommentFeedEntryId?: string
  timestamp: string
  message: string
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
  people: ContractPersonWithRoles[]
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
