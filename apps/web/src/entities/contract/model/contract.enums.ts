/**
 * Contract entity enums
 *
 * Backend-aligned numeric enums matching Facts.Entities
 * @see docs/data-models.md for field mapping details
 */

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
