/**
 * Contract Zod schemas for form validation
 *
 * Aligned with backend Facts.Entities (Contract, Sale, SaleItem, etc.)
 * @see docs/data-models.md for field mapping details
 */

import { z } from 'zod'
import {
  NeedType,
  SaleStatus,
  SaleType,
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
// Address Schema
// =============================================================================

export const addressSchema = z.object({
  address1: z.string().min(1, 'Address is required').max(255),
  address2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(255),
  state: z.string().min(2, 'State is required').max(255),
  postalCode: z.string().max(50).optional(),
  county: z.string().max(100).optional(),
  country: z.string().max(255).optional(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

// =============================================================================
// Sale Item Sub-Entity Schemas
// =============================================================================

export const saleItemSalesTaxSchema = z.object({
  id: z.string().optional(),
  saleItemId: z.string().optional(),
  taxProfileItemId: z.string(),
  taxRate: z.number().min(0),
  taxAmount: z.number().min(0),
})

export const saleItemDiscountSchema = z.object({
  id: z.string().optional(),
  saleItemId: z.string().optional(),
  discountTypeId: z.string().optional(),
  description: z.string().max(255),
  amount: z.number().min(0),
  percentage: z.number().min(0).max(100).optional(),
})

export const saleItemTrustFundSchema = z.object({
  id: z.string().optional(),
  saleItemId: z.string().optional(),
  trustFundType: z.string(),
  amount: z.number().min(0),
})

export type SaleItemSalesTaxFormValues = z.infer<typeof saleItemSalesTaxSchema>
export type SaleItemDiscountFormValues = z.infer<typeof saleItemDiscountSchema>
export type SaleItemTrustFundFormValues = z.infer<typeof saleItemTrustFundSchema>

// =============================================================================
// Sale Item Schema
// =============================================================================

export const saleItemSchema = z.object({
  id: z.string().optional(),
  saleId: z.string().optional(),
  itemId: z.string().min(1, 'Item is required'),
  description: z.string().min(1, 'Description is required').max(255),
  needType: z.enum([NeedType.AT_NEED, NeedType.PRE_NEED]),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Price cannot be negative'),
  bookPrice: z.number().min(0).optional().default(0),
  cost: z.number().min(0).optional().default(0),
  bookCost: z.number().min(0).optional().default(0),
  size: z.number().min(0).optional(),
  statedCare: z.number().min(0).optional(),
  salesTaxEnabled: z.boolean().optional().default(true),
  serialNumber: z.string().max(255).optional(),
  isCancelled: z.boolean().optional().default(false),
  ordinal: z.number().int().min(0).optional().default(0),

  // Display fields
  sku: z.string().optional(),
  itemDescription: z.string().optional(),
  itemType: z
    .enum([ItemType.SERVICE, ItemType.MERCHANDISE, ItemType.CASH_ADVANCE, ItemType.PROPERTY])
    .optional(),

  // Child collections
  salesTax: z.array(saleItemSalesTaxSchema).optional().default([]),
  discounts: z.array(saleItemDiscountSchema).optional().default([]),
  trust: z.array(saleItemTrustFundSchema).optional().default([]),
})

export type SaleItemFormValues = z.infer<typeof saleItemSchema>

// =============================================================================
// Sale Schema
// =============================================================================

export const saleSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().optional(),
  saleNumber: z.string().max(50).optional(),
  saleDate: z.string().optional(),
  saleType: z.enum([SaleType.CONTRACT, SaleType.CONTRACT_ADJUSTMENT, SaleType.MISC_CASH]),
  saleStatus: z.enum([SaleStatus.DRAFT, SaleStatus.EXECUTED, SaleStatus.FINALIZED, SaleStatus.VOID]),
  saleAdjustmentType: z
    .enum([
      SaleAdjustmentType.SALES_TAX,
      SaleAdjustmentType.DISCOUNT,
      SaleAdjustmentType.CANCELLATION,
      SaleAdjustmentType.EXCHANGE,
      SaleAdjustmentType.TRANSFER,
      SaleAdjustmentType.ADDENDUM,
      SaleAdjustmentType.NEED_TYPE_SWAP,
      SaleAdjustmentType.LATE_FEE,
      SaleAdjustmentType.PROPERTY_EXCHANGE,
      SaleAdjustmentType.ITEM_CREDIT,
    ])
    .optional(),
  cancellationTypeId: z.string().optional(),
  accountingPeriod: z.string().optional(),
  memo: z.string().max(2000).optional().default(''),

  // Items
  items: z.array(saleItemSchema).default([]),
})

export type SaleFormValues = z.infer<typeof saleSchema>

// =============================================================================
// Contract Person Schema
// =============================================================================

export const contractPersonSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().optional(),
  nameId: z.string().optional(), // Reference to Name entity
  roles: z
    .array(
      z.enum([
        ContractPersonRole.PERSON,
        ContractPersonRole.PRIMARY_BUYER,
        ContractPersonRole.CO_BUYER,
        ContractPersonRole.PRIMARY_BENEFICIARY,
        ContractPersonRole.ADDITIONAL_BENEFICIARY,
      ]),
    )
    .default([ContractPersonRole.PERSON]),
  addedAfterContractExecution: z.boolean().optional().default(false),

  // Name fields
  firstName: z.string().min(1, 'First name is required').max(255),
  middleName: z.string().max(255).optional().default(''),
  lastName: z.string().min(1, 'Last name is required').max(255),
  prefix: z.string().max(50).optional().default(''),
  suffix: z.string().max(50).optional().default(''),
  nickname: z.string().max(255).optional().default(''),
  companyName: z.string().max(255).optional().default(''),
  phone: z.string().max(25).optional().default(''),
  email: z.string().email('Invalid email').max(255).optional().or(z.literal('')).default(''),
  address: addressSchema.optional(),
  dateOfBirth: z.string().optional().default(''),
  dateOfDeath: z.string().optional().default(''),
  nationalIdentifier: z.string().max(20).optional().default(''),
  driversLicense: z.string().max(50).optional().default(''),
  driversLicenseState: z.string().max(2).optional().default(''),
  isVeteran: z.boolean().optional().default(false),
})

export type ContractPersonFormValues = z.infer<typeof contractPersonSchema>

// =============================================================================
// Contract Financing Schema
// =============================================================================

export const contractFinancingSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().optional(),
  isFinanced: z.boolean().default(false),
  downPayment: z.number().min(0).default(0),
  otherCredits: z.number().min(0).default(0),
  interestRate: z.number().min(0).max(100).optional(),
  term: z.number().int().min(1).optional(),
  paymentsPerYear: z.number().int().min(1).max(52).default(12),
  firstPaymentDate: z.string().optional(),
  paymentAmount: z.number().min(0).optional(),
  useManualPaymentAmount: z.boolean().default(false),
  totalFinanceCharges: z.number().min(0).optional(),
  useManualFinanceCharges: z.boolean().default(false),
  status: z.enum([FinancingStatus.PENDING, FinancingStatus.CALCULATED]).default(FinancingStatus.PENDING),
  receivesCouponBook: z.boolean().default(false),
  receivesStatement: z.boolean().default(true),

  // Late fees
  lateFeeType: z
    .enum([LateFeeType.NONE, LateFeeType.FIXED_AMOUNT, LateFeeType.PERCENTAGE_OF_PAYMENT])
    .default(LateFeeType.NONE),
  lateFeeAmount: z.number().min(0).optional(),
  lateFeeMax: z.number().min(0).optional(),
  lateFeeGracePeriod: z.number().int().min(0).optional(),
})

export type ContractFinancingFormValues = z.infer<typeof contractFinancingSchema>

// =============================================================================
// Contract Funding Detail Schema (for insurance-funded pre-need)
// =============================================================================

export const contractFundingDetailSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().optional(),
  policyNumber: z.string().min(1, 'Policy number is required').max(100),
  faceValue: z.number().min(0),
  insuranceProviderId: z.string().optional(),
})

export type ContractFundingDetailFormValues = z.infer<typeof contractFundingDetailSchema>

// =============================================================================
// Contract Payment Schema
// =============================================================================

export const contractPaymentSchema = z.object({
  id: z.string().optional(),
  contractId: z.string().optional(),
  saleId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  method: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.CHECK,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.ACH,
    PaymentMethod.INSURANCE,
    PaymentMethod.FINANCING,
    PaymentMethod.OTHER,
  ]),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  reference: z.string().max(255).optional().default(''),
  checkNumber: z.string().max(50).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
})

export type ContractPaymentFormValues = z.infer<typeof contractPaymentSchema>

// =============================================================================
// Main Contract Form Schema
// =============================================================================

export const contractFormSchema = z.object({
  // Core fields
  locationId: z.string().min(1, 'Location is required'),
  prePrintedContractNumber: z.string().max(50).optional().default(''),

  // Type classification
  needType: z.enum([NeedType.AT_NEED, NeedType.PRE_NEED]),
  contractTypeId: z.string().optional(),
  contractSaleTypeId: z.string().optional(),
  leadSourceId: z.string().optional(),
  atNeedType: z.enum([AtNeedType.WALK_IN, AtNeedType.PN_MATURITY]).optional(),
  preNeedFundingType: z.enum([PreNeedFundingType.TRUST, PreNeedFundingType.INSURANCE]).optional(),

  // Sales person
  salesPersonId: z.string().optional(),
  marketingAgentId: z.string().optional(),

  // Key dates
  dateSigned: z.string().optional(),

  // State flags
  isConditionalSale: z.boolean().default(false),

  // People - simplified for form (actual data uses ContractPerson)
  primaryBuyer: contractPersonSchema,
  coBuyers: z.array(contractPersonSchema).default([]),
  primaryBeneficiary: contractPersonSchema,
  additionalBeneficiaries: z.array(contractPersonSchema).default([]),

  // Financing
  financing: contractFinancingSchema.optional(),

  // Funding details (for insurance-funded pre-need)
  fundingDetails: z.array(contractFundingDetailSchema).default([]),

  // Notes
  notes: z.string().max(5000).optional().default(''),
})

export type ContractFormValues = z.infer<typeof contractFormSchema>

// =============================================================================
// Default Value Helpers
// =============================================================================

/**
 * Get default address
 */
export function getDefaultAddress(): AddressFormValues {
  return {
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    county: '',
    country: 'USA',
  }
}

/**
 * Get default contract person
 */
export function getDefaultContractPerson(
  roles: ContractPersonRole[] = [ContractPersonRole.PERSON],
): ContractPersonFormValues {
  return {
    id: '',
    contractId: '',
    nameId: '',
    roles,
    addedAfterContractExecution: false,
    firstName: '',
    middleName: '',
    lastName: '',
    prefix: '',
    suffix: '',
    nickname: '',
    companyName: '',
    phone: '',
    email: '',
    address: undefined,
    dateOfBirth: '',
    dateOfDeath: '',
    nationalIdentifier: '',
    driversLicense: '',
    driversLicenseState: '',
    isVeteran: false,
  }
}

/**
 * Get default sale item
 */
export function getDefaultSaleItem(needType: NeedType = NeedType.AT_NEED): SaleItemFormValues {
  return {
    id: '',
    saleId: '',
    itemId: '',
    description: '',
    needType,
    quantity: 1,
    unitPrice: 0,
    bookPrice: 0,
    cost: 0,
    bookCost: 0,
    salesTaxEnabled: true,
    isCancelled: false,
    ordinal: 0,
    salesTax: [],
    discounts: [],
    trust: [],
  }
}

/**
 * Get default sale
 */
export function getDefaultSale(contractId?: string): SaleFormValues {
  return {
    id: '',
    contractId: contractId ?? '',
    saleNumber: '',
    saleDate: new Date().toISOString().split('T')[0],
    saleType: SaleType.CONTRACT,
    saleStatus: SaleStatus.DRAFT,
    memo: '',
    items: [],
  }
}

/**
 * Get default financing
 */
export function getDefaultFinancing(): ContractFinancingFormValues {
  return {
    id: '',
    contractId: '',
    isFinanced: false,
    downPayment: 0,
    otherCredits: 0,
    paymentsPerYear: 12,
    useManualPaymentAmount: false,
    useManualFinanceCharges: false,
    status: FinancingStatus.PENDING,
    receivesCouponBook: false,
    receivesStatement: true,
    lateFeeType: LateFeeType.NONE,
  }
}

/**
 * Get default payment
 */
export function getDefaultPayment(): ContractPaymentFormValues {
  return {
    id: '',
    contractId: '',
    date: new Date().toISOString().split('T')[0] ?? '',
    method: PaymentMethod.CASH,
    amount: 0,
    reference: '',
    checkNumber: '',
    notes: '',
  }
}

/**
 * Get default contract form values
 */
export function getDefaultContractFormValues(locationId: string): ContractFormValues {
  return {
    locationId,
    prePrintedContractNumber: '',
    needType: NeedType.AT_NEED,
    atNeedType: AtNeedType.WALK_IN,
    salesPersonId: '',
    marketingAgentId: '',
    dateSigned: '', // Empty until user sets it
    isConditionalSale: false,
    primaryBuyer: getDefaultContractPerson([ContractPersonRole.PRIMARY_BUYER]),
    coBuyers: [],
    primaryBeneficiary: getDefaultContractPerson([ContractPersonRole.PRIMARY_BENEFICIARY]),
    additionalBeneficiaries: [],
    financing: getDefaultFinancing(),
    fundingDetails: [],
    notes: '',
  }
}
