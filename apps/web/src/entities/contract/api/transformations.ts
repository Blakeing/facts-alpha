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
  NeedType,
  Sale,
  SaleStatus,
} from '../model/contract'
import type { ContractPersonFormValues } from '../model/contractSchema'
import { nanoid } from 'nanoid'

// =============================================================================
// ID Generation (temporary - will be replaced with /api/v1/nextid endpoint)
// =============================================================================

/**
 * Generate a unique ID
 * TODO: Replace with actual backend nextId() call when connecting to BFF
 */
export function generateId(): string {
  return nanoid()
}

// =============================================================================
// Contract Number Generation
// =============================================================================

// In-memory counter for sequential contract numbers (reset on page reload)
// TODO: Replace with actual backend logic when connecting to BFF
let contractCounter = 1000

/**
 * Generate a contract number based on need type
 * Format: AN-YYYY-XXXX (At-Need) or PN-YYYY-XXXX (Pre-Need)
 */
export function generateContractNumber(needType: NeedType): string {
  const year = new Date().getFullYear()
  const sequence = String(contractCounter++).padStart(4, '0')
  const prefix = needType === 'at_need' ? 'AN' : 'PN'
  return `${prefix}-${year}-${sequence}`
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
    nameId: generateId(), // Generate nameId (in real app, this would link to Name entity)
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
    createdAt: now,
    updatedAt: now,
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
  const primarySale = sales.find((s) => s.saleType === 'contract') || sales[0]

  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    prePrintedContractNumber: contract.prePrintedContractNumber,
    locationId: contract.locationId,
    needType: contract.needType,
    saleStatus: (primarySale?.saleStatus as SaleStatus) || 'draft',
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

