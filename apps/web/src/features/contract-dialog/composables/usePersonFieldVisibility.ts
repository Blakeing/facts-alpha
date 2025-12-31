/**
 * Person Field Visibility Helper
 *
 * Determines which fields to show/hide based on person type.
 * Used by both inline NamePanel and the edit dialog.
 */

import type { ContractPerson, PeopleHandler } from '@/entities/contract'
import { ContractPersonRole } from '@/entities/contract'

export interface PersonFieldVisibility {
  hideCompany: boolean
  hideSSN: boolean
  hideDeceasedInfo: boolean
  showOptOutMarketing: boolean
}

/**
 * Get field visibility settings for a person based on their role
 */
export function getFieldVisibility(
  person: ContractPerson,
  people: PeopleHandler,
  needType: number,
): PersonFieldVisibility {
  const type = people.getDisplayType(person)

  const hideCompany = type !== 'Buyer' && type !== 'Co-Buyer'
  const hideSSN = type !== 'Beneficiary' && type !== 'Additional Beneficiary' && type !== 'Deceased'
  const hideDeceasedInfo = type !== 'Beneficiary' && type !== 'Deceased'

  // Funeral AN (needType=1) hides opt-out marketing for primary beneficiary (deceased)
  const isFuneralAN = needType === 1
  const isPrimaryBeneficiary = people.hasRole(person, ContractPersonRole.PRIMARY_BENEFICIARY)
  const showOptOutMarketing = !(isFuneralAN && isPrimaryBeneficiary)

  return {
    hideCompany,
    hideSSN,
    hideDeceasedInfo,
    showOptOutMarketing,
  }
}

/**
 * Check if person's name is required (beneficiaries must have names)
 */
export function isNameRequired(person: ContractPerson, people: PeopleHandler): boolean {
  return (
    people.hasRole(person, ContractPersonRole.PRIMARY_BENEFICIARY) ||
    people.hasRole(person, ContractPersonRole.ADDITIONAL_BENEFICIARY)
  )
}

/**
 * Check if person has a name filled in
 */
export function hasName(person: ContractPerson | null | undefined): boolean {
  if (!person?.name) return false
  const { first, last } = person.name
  return !!(first || last)
}

