/**
 * Contract entity helper functions
 *
 * Utility functions for working with contract data
 */

import type { ContractPerson, SaleItem } from './contract.types'
import { ContractPersonRole, SaleStatus } from './contract.enums'

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
  return people.find((p) => hasRole(p, ContractPersonRole.PRIMARY_BUYER))
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
