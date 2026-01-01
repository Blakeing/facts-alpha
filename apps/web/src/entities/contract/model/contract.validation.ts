/**
 * entities/contract/model/contract.validation.ts
 *
 * Section-based validation schemas for contract editor
 * Extends the existing contractSchema.ts with section-specific validations
 *
 * Validation rules match legacy ContractSaveHandler.preValidate():
 * - For DRAFT saves: Only location and sale date (for Cemetery/Pre-Need) are required
 * - For EXECUTE/FINALIZE: All fields including people, items, etc. are required
 */

import type { ContractDraft } from './contract.draft'
import { isAfter, isBefore, parseDate, startOfDay } from '@facts/utils'
import { z } from 'zod'
import { LocationType } from '@/entities/location'
import { ContractPersonRole, getPrimaryBeneficiary, NeedType } from './contract'
import { contractPaymentSchema, contractPersonSchema, saleItemSchema } from './contractSchema'

// =============================================================================
// Section Schemas (for step-by-step validation)
// =============================================================================

/**
 * People section - validates that we have required parties
 * Only required for execute/finalize, not for draft saves
 */
export const PeopleSectionSchema = z.object({
  people: z
    .array(contractPersonSchema)
    .min(2, 'At least a buyer and beneficiary are required')
    .refine(
      (people) =>
        people.some(
          (p) => (p.roles & ContractPersonRole.PRIMARY_BUYER) === ContractPersonRole.PRIMARY_BUYER,
        ),
      { message: 'A primary buyer is required' },
    )
    .refine(
      (people) =>
        people.some(
          (p) =>
            (p.roles & ContractPersonRole.PRIMARY_BENEFICIARY) ===
            ContractPersonRole.PRIMARY_BENEFICIARY,
        ),
      { message: 'A primary beneficiary is required' },
    ),
})

/**
 * People section for draft saves - optional (no validation)
 */
export const PeopleSectionDraftSchema = z.object({
  people: z.array(contractPersonSchema),
})

/**
 * Items section - validates sale items
 * Only required for execute/finalize, not for draft saves
 */
export const ItemsSectionSchema = z.object({
  sale: z.object({
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  }),
})

/**
 * Items section for draft saves - optional (no validation)
 */
export const ItemsSectionDraftSchema = z.object({
  sale: z.object({
    items: z.array(saleItemSchema),
  }),
})

/**
 * Payments section - validates payment records
 */
export const PaymentsSectionSchema = z.object({
  payments: z.array(contractPaymentSchema),
})

/**
 * General section - validates core contract info
 * For draft saves, also validates sale date for Cemetery/Pre-Need
 * Note: Location type check (Cemetery) is done in validateDraftPreConditions
 */
export const GeneralSectionSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  needType: z.number(),
  prePrintedContractNumber: z.string().optional(),
  sale: z.object({
    saleDate: z.string().optional(),
  }),
})

/**
 * Review section - validates entire draft for execute/finalize
 */
export const ReviewSectionSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  needType: z.number(),
  people: z.array(contractPersonSchema).min(2),
  sale: z.object({
    items: z.array(saleItemSchema).min(1),
  }),
})

/**
 * Review section for draft saves - only validates location
 * Note: Sale date validation (Cemetery/Pre-Need) is done in validateDraftPreConditions
 */
export const ReviewSectionDraftSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  needType: z.number(),
  sale: z.object({
    saleDate: z.string().optional(),
  }),
})

// =============================================================================
// Section Type Mapping
// =============================================================================

export type ContractSection = 'general' | 'people' | 'items' | 'payments' | 'review'

/**
 * Validation mode - determines which validation rules to apply
 * Matches legacy ContractSaveHandler.preValidate() pattern:
 * - DRAFT: Lenient validation (only location and sale date for Pre-Need)
 * - EXECUTE: Strict validation (all fields required for execute/finalize)
 */
export enum ValidationMode {
  DRAFT = 0,
  EXECUTE = 1,
}

const sectionSchemas = {
  general: GeneralSectionSchema,
  people: PeopleSectionSchema,
  items: ItemsSectionSchema,
  payments: PaymentsSectionSchema,
  review: ReviewSectionSchema,
}

const sectionSchemasDraft = {
  general: GeneralSectionSchema,
  people: PeopleSectionDraftSchema,
  items: ItemsSectionDraftSchema,
  payments: PaymentsSectionSchema,
  review: ReviewSectionDraftSchema,
}

/**
 * Validate a specific section of the draft
 * @param mode - ValidationMode.DRAFT for lenient validation, ValidationMode.EXECUTE for strict validation
 */
export function validateSection(
  draft: ContractDraft,
  section: ContractSection,
  mode: ValidationMode = ValidationMode.DRAFT,
): { valid: boolean; errors: Record<string, string> } {
  const schemas = mode === ValidationMode.DRAFT ? sectionSchemasDraft : sectionSchemas
  const schema = schemas[section]

  if (!schema) {
    return { valid: true, errors: {} }
  }

  const result = schema.safeParse(draft)

  if (result.success) {
    return { valid: true, errors: {} }
  }

  const errors = zodErrorsToPathMap(result.error)

  // Prefix errors with section name for clarity
  const prefixedErrors: Record<string, string> = {}
  for (const [path, message] of Object.entries(errors)) {
    // Keep original path since our draft paths already match
    prefixedErrors[path] = message
  }

  return { valid: false, errors: prefixedErrors }
}

/**
 * Helper to convert Zod errors to errorsByPath format
 */
export function zodErrorsToPathMap(error: z.ZodError): Record<string, string> {
  const errorsByPath: Record<string, string> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.')
    errorsByPath[path] = issue.message
  }

  return errorsByPath
}

/**
 * Validate all sections at once
 * @param mode - ValidationMode.DRAFT for lenient validation (only location and sale date), ValidationMode.EXECUTE for strict validation
 */
export function validateAllSections(
  draft: ContractDraft,
  mode: ValidationMode = ValidationMode.DRAFT,
): {
  validity: Record<ContractSection, boolean>
  errorsByPath: Record<string, string>
} {
  const sections: ContractSection[] = ['general', 'people', 'items', 'payments', 'review']

  const validity: Record<ContractSection, boolean> = {
    general: false,
    people: false,
    items: false,
    payments: false,
    review: false,
  }

  const allErrors: Record<string, string> = {}

  for (const section of sections) {
    const { valid, errors } = validateSection(draft, section, mode)
    validity[section] = valid

    // Merge errors
    for (const [path, message] of Object.entries(errors)) {
      allErrors[path] = message
    }
  }

  return { validity, errorsByPath: allErrors }
}

// =============================================================================
// Additional Validation Helpers
// =============================================================================

/**
 * Validation result for draft pre-conditions
 */
export interface DraftPreConditionErrors {
  errors: string[]
  errorsByPath: Record<string, string>
}

/** Helper: check if date is in future (compares to today at midnight) */
function isFutureDate(dateStr: string): boolean {
  const date = parseDate(dateStr)
  if (!date) return false
  return isAfter(date, startOfDay(new Date()))
}

/** Helper: get appropriate date field label based on location/need type */
function getSaleDateLabel(locationType: LocationType | null | undefined, needType: NeedType) {
  return locationType === LocationType.FUNERAL && needType === NeedType.AT_NEED
    ? 'Service date'
    : 'Sale date'
}

/**
 * Validate draft pre-conditions - matches legacy ContractSaveHandler.preValidate()
 *
 * Business rules for ALL draft saves (matches legacy):
 * 1. ✅ No corporate locations
 * 2. ✅ Sale/service date required
 * 3. ✅ Date signed not in future
 * 4. ✅ Deceased: birth/death dates required & valid
 * 5. ⚠️ Sale date range - basic min check (1900); full validation requires settings
 * 6. ❌ Financing interest rebate - not yet in ContractDraft model
 *
 * @param draft - The contract draft to validate
 * @param locationType - The type of location (from userContext)
 * @returns Validation errors (empty if valid)
 */
export function validateDraftPreConditions(
  draft: ContractDraft,
  locationType: LocationType | null | undefined,
): DraftPreConditionErrors {
  const errors: string[] = []
  const errorsByPath: Record<string, string> = {}

  const addError = (message: string, path?: string) => {
    errors.push(message)
    if (path) errorsByPath[path] = message
  }

  // 1. No corporate locations
  if (locationType === LocationType.CORPORATE) {
    addError('Contracts at corporate locations is not supported', 'locationId')
  }

  // 2. Sale/service date required
  const dateLabel = getSaleDateLabel(locationType, draft.needType)
  if (draft.sale.saleDate) {
    const saleDate = parseDate(draft.sale.saleDate)
    if (saleDate) {
      // Basic range check - not before 1900
      const minDate = new Date(1900, 0, 1)
      if (isBefore(saleDate, minDate)) {
        addError(
          `${dateLabel} must be on or after ${minDate.toLocaleDateString()}`,
          'sale.saleDate',
        )
      }
    }
  } else {
    addError(`${dateLabel} is required.`, 'sale.saleDate')
  }

  // 3. Date signed not in future
  if (draft.meta.dateSigned && isFutureDate(draft.meta.dateSigned)) {
    addError('Contract/Sign date cannot be in the future', 'meta.dateSigned')
  }

  // 4. Deceased person validations (only if beneficiary is marked deceased)
  const beneficiary = getPrimaryBeneficiary(draft.people)
  const deceased = beneficiary?.name

  if (deceased?.deceased) {
    // Birth and death dates required
    if (!deceased.birthDate || !deceased.deathDate) {
      addError(
        'Date of death and date of birth are required for deceased. Enter 1/1/YYYY for date of birth if unknown.',
      )
      if (!deceased.birthDate)
        errorsByPath['people.beneficiary.name.birthDate'] = 'Required for deceased'
      if (!deceased.deathDate)
        errorsByPath['people.beneficiary.name.deathDate'] = 'Required for deceased'
    }

    // Date sanity checks
    const birthDate = parseDate(deceased.birthDate)
    const deathDate = parseDate(deceased.deathDate)

    if (birthDate && deathDate && isAfter(birthDate, deathDate)) {
      addError(
        'Deceased date of birth cannot be after date of death',
        'people.beneficiary.name.birthDate',
      )
    }
    if (deceased.birthDate && isFutureDate(deceased.birthDate)) {
      addError(
        'Deceased date of birth cannot be in the future',
        'people.beneficiary.name.birthDate',
      )
    }
    if (deceased.deathDate && isFutureDate(deceased.deathDate)) {
      addError(
        'Deceased date of death cannot be in the future',
        'people.beneficiary.name.deathDate',
      )
    }
  }

  return { errors, errorsByPath }
}
