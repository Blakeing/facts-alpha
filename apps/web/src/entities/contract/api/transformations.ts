/**
 * Contract data transformation utilities
 *
 * Handles conversion between form data (nested) and JSON Server structure (flat).
 * These transformations mimic what the BFF would do server-side.
 */

import type { ApiError } from '@facts/effect'
import type { Contract, ContractListing, ContractPerson, Sale } from '../model/contract'
import type { ContractPersonFormValues } from '../model/contract.schema'
import { Effect } from 'effect'
import { nextId } from '@/shared/api'
import { ContractPersonRole, NeedType, SaleType } from '../model/contract'

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
 * Assigns IDs using nextId() - matches legacy app pattern
 * Form data already has the correct Name structure, we just assign IDs
 *
 * @param formData - Person form data (already has Name structure)
 * @param contractId - Contract ID to associate person with
 * @param role - ContractPersonRole enum value
 */
export function formPersonToPerson(
  formData: ContractPersonFormValues,
  contractId: string,
  role: ContractPersonRole,
): Effect.Effect<ContractPerson, ApiError> {
  return Effect.gen(function* () {
    const now = new Date().toISOString()
    const id = yield* nextId()
    const nameId = formData.nameId || (yield* nextId())

    // Assign ID to name if not already set (legacy pattern: check for "0" or missing)
    const name = { ...formData.name }
    if (!name.id || name.id === '0') {
      name.id = nameId
    }

    return {
      id,
      contractId,
      nameId,
      roles: role,
      addedAfterContractExecution: formData.addedAfterContractExecution ?? false,
      name: name as ContractPerson['name'], // Form data already has correct structure
      conversion: formData.conversion ?? null,
      conversionId: formData.conversionId ?? null,
      conversionSource: formData.conversionSource ?? null,
      dateCreated: now,
      dateLastModified: now,
    }
  })
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
  const primaryBuyer = people.find((p) => (p.roles & ContractPersonRole.PRIMARY_BUYER) !== 0)
  const primaryBeneficiary = people.find(
    (p) => (p.roles & ContractPersonRole.PRIMARY_BENEFICIARY) !== 0,
  )

  // Find primary sale for this contract
  const sales = allSales.filter((s) => s.contractId === contract.id)
  const primarySale = sales.find((s) => s.saleType === SaleType.CONTRACT) || sales[0]

  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    prePrintedContractNumber: contract.prePrintedContractNumber,
    locationId: contract.locationId,
    needType: contract.needType,
    isCancelled: contract.isCancelled,
    dateExecuted: contract.dateExecuted,
    dateSigned: contract.dateSigned,
    primaryBuyerName: primaryBuyer
      ? `${primaryBuyer.name.first} ${primaryBuyer.name.last}`.trim()
      : '',
    primaryBeneficiaryName: primaryBeneficiary
      ? `${primaryBeneficiary.name.first} ${primaryBeneficiary.name.last}`.trim()
      : '',
    salesPersonName: contract.salesPersonName,
    grandTotal: contract.grandTotal,
    amountPaid: contract.amountPaid,
    balanceDue: contract.balanceDue,
  }
}
