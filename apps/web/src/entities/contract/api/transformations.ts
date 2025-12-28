/**
 * Contract data transformation utilities
 *
 * Handles conversion between form data (nested) and JSON Server structure (flat).
 * These transformations mimic what the BFF would do server-side.
 */

import type {
  Contract,
  ContractListing,
  ContractPerson,
  ContractPersonRole,
  Sale,
} from '../model/contract'
import type { ContractPersonFormValues } from '../model/contractSchema'
import { NeedType, SaleStatus, SaleType } from '../model/contract'

// =============================================================================
// ID Generation
// =============================================================================

/**
 * Generate a temporary ID for immediate use
 * Uses "0" to match legacy app pattern - backend will CREATE new entities
 * These IDs are replaced by backend-generated IDs on save
 * @param _prefix - Optional prefix (ignored, kept for compatibility)
 */
export function generateId(_prefix?: string): string {
  return '0'
}

// =============================================================================
// Contract Number Generation
// =============================================================================

/**
 * Generate a contract number based on need type
 * Format: AN-YYYY-XXXX (At-Need) or PN-YYYY-XXXX (Pre-Need)
 *
 * This function checks existing contracts to find the next available sequence number,
 * preventing duplicates even after page reloads.
 *
 * @param needType - The need type (at_need or pre_need)
 * @param existingContracts - Array of existing contracts to check for sequence numbers
 * @returns A unique contract number
 */
export function generateContractNumber(
  needType: NeedType,
  existingContracts: Contract[] = [],
): string {
  const year = new Date().getFullYear()
  const prefix = needType === NeedType.AT_NEED ? 'AN' : 'PN'
  const pattern = new RegExp(String.raw`^${prefix}-${year}-(\d{4})$`)

  // Find all contract numbers matching this year and need type
  const matchingNumbers = existingContracts
    .map((c) => c.contractNumber)
    .filter((num) => pattern.test(num))
    .map((num): number => {
      if (!num) return 0
      const match = num.match(pattern)
      return match && match[1] ? Number.parseInt(match[1], 10) : 0
    })

  // Find the highest sequence number, or start at 1000 if none exist
  const maxSequence = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) : 999
  const nextSequence = maxSequence + 1

  return `${prefix}-${year}-${String(nextSequence).padStart(4, '0')}`
}

// =============================================================================
// Person Transformations
// =============================================================================

/**
 * Convert form person data to ContractPerson entity
 */
export function formPersonToPerson(
  formData: ContractPersonFormValues,
  contractId: string,
  roles: ContractPersonRole[],
): ContractPerson {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    contractId,
    nameId: generateId(), // Temporary ID - backend will assign proper ID on save
    roles,
    addedAfterContractExecution: formData.addedAfterContractExecution ?? false,
    firstName: formData.firstName,
    middleName: formData.middleName,
    lastName: formData.lastName,
    prefix: formData.prefix,
    suffix: formData.suffix,
    nickname: formData.nickname,
    companyName: formData.companyName,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    dateOfBirth: formData.dateOfBirth,
    dateOfDeath: formData.dateOfDeath,
    nationalIdentifier: formData.nationalIdentifier,
    driversLicense: formData.driversLicense,
    driversLicenseState: formData.driversLicenseState,
    isVeteran: formData.isVeteran,
    dateCreated: now,
    dateLastModified: now,
  }
}

// =============================================================================
// Contract to Listing Transformation
// =============================================================================

/**
 * Convert full Contract to ContractListing for list views
 * Joins people and sales data to build display fields
 */
export function contractToListing(
  contract: Contract,
  allPeople: ContractPerson[],
  allSales: Sale[],
): ContractListing {
  // Find people for this contract
  const people = allPeople.filter((p) => p.contractId === contract.id)
  const primaryBuyer = people.find((p) => p.roles.includes('primary_buyer'))
  const primaryBeneficiary = people.find((p) => p.roles.includes('primary_beneficiary'))

  // Find primary sale for this contract
  const sales = allSales.filter((s) => s.contractId === contract.id)
  const primarySale = sales.find((s) => s.saleType === SaleType.CONTRACT) || sales[0]

  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    prePrintedContractNumber: contract.prePrintedContractNumber,
    locationId: contract.locationId,
    needType: contract.needType,
    saleStatus: (primarySale?.saleStatus as SaleStatus) || SaleStatus.DRAFT,
    isCancelled: contract.isCancelled,
    dateExecuted: contract.dateExecuted,
    dateSigned: contract.dateSigned,
    primaryBuyerName: primaryBuyer
      ? `${primaryBuyer.firstName} ${primaryBuyer.lastName}`.trim()
      : '',
    primaryBeneficiaryName: primaryBeneficiary
      ? `${primaryBeneficiary.firstName} ${primaryBeneficiary.lastName}`.trim()
      : '',
    salesPersonName: contract.salesPersonName,
    grandTotal: contract.grandTotal,
    amountPaid: contract.amountPaid,
    balanceDue: contract.balanceDue,
  }
}
