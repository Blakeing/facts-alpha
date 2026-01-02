/**
 * Helper functions for working with Name entities
 * These utilities handle the nested BFF structure (name.phones[], name.addresses[], etc.)
 */

import type { Name, NameAddress, NameEmail, NamePhone } from './name'

/**
 * Get full display name from a Name object
 * Format: [First] [Middle] [Last]
 */
export function getFullName(name: Name | undefined | null): string {
  if (!name) return ''
  return [name.first, name.middle, name.last].filter(Boolean).join(' ').trim()
}

/**
 * Get formatted name with prefix and suffix
 * Format: [Prefix] [First] [Middle] [Last], [Suffix]
 */
export function getFormattedName(name: Name | undefined | null): string {
  if (!name) return ''

  const nameParts = [name.prefix, name.first, name.middle, name.last].filter(Boolean)
  const fullName = nameParts.join(' ')

  return name.suffix ? `${fullName}, ${name.suffix}` : fullName
}

/**
 * Get last name, first name format
 * Format: [Last], [First] [Middle]
 */
export function getLastFirstName(name: Name | undefined | null): string {
  if (!name) return ''

  const firstName = [name.first, name.middle].filter(Boolean).join(' ')
  return `${name.last}, ${firstName}`.trim()
}

/**
 * Get the primary (preferred) phone number
 * Falls back to first phone if no preferred phone found
 */
export function getPrimaryPhone(name: Name | undefined | null): NamePhone | undefined {
  if (!name?.phones || name.phones.length === 0) return undefined
  return (
    name.phones.find((p) => p.preferred && p.active) ??
    name.phones.find((p) => p.active) ??
    name.phones[0]
  )
}

/**
 * Get the primary phone number as a formatted string
 */
export function getPrimaryPhoneNumber(name: Name | undefined | null): string {
  const phone = getPrimaryPhone(name)
  return phone?.number ?? ''
}

/**
 * Get the primary (preferred) email address
 * Falls back to first email if no preferred email found
 */
export function getPrimaryEmail(name: Name | undefined | null): NameEmail | undefined {
  if (!name?.emailAddresses || name.emailAddresses.length === 0) return undefined
  return (
    name.emailAddresses.find((e) => e.preferred && e.active) ??
    name.emailAddresses.find((e) => e.active) ??
    name.emailAddresses[0]
  )
}

/**
 * Get the primary email address as a string
 */
export function getPrimaryEmailAddress(name: Name | undefined | null): string {
  const email = getPrimaryEmail(name)
  return email?.address ?? ''
}

/**
 * Get the primary address
 * Falls back to first address if no primary address found
 */
export function getPrimaryAddress(name: Name | undefined | null): NameAddress | undefined {
  if (!name?.addresses || name.addresses.length === 0) return undefined
  return (
    name.addresses.find((a) => a.primary && a.active) ??
    name.addresses.find((a) => a.active) ??
    name.addresses[0]
  )
}

/**
 * Format an address as a single line string
 * Format: [Address1], [City], [State] [PostalCode]
 */
export function formatAddressSingleLine(address: NameAddress | undefined | null): string {
  if (!address) return ''

  const parts: string[] = []
  if (address.address1) parts.push(address.address1)
  if (address.city) parts.push(address.city)

  const stateZip = [address.state, address.postalCode].filter(Boolean).join(' ')
  if (stateZip) parts.push(stateZip)

  return parts.join(', ')
}

/**
 * Format an address as multi-line string
 */
export function formatAddressMultiLine(address: NameAddress | undefined | null): string {
  if (!address) return ''

  const lines: string[] = []
  if (address.address1) lines.push(address.address1)
  if (address.address2) lines.push(address.address2)

  const cityStateZip = [address.city, address.state, address.postalCode].filter(Boolean).join(' ')
  if (cityStateZip) lines.push(cityStateZip)

  return lines.join('\n')
}

/**
 * Check if a name represents a person (vs organization)
 */
export function isPerson(name: Name | undefined | null): boolean {
  return !!name && !name.companyName
}

/**
 * Check if a name represents an organization
 */
export function isOrganization(name: Name | undefined | null): boolean {
  return !!name && !!name.companyName
}

/**
 * Get age at death (if deceased)
 */
export function getAgeAtDeath(name: Name | undefined | null): number | null {
  if (!name?.deceased || !name.birthDate || !name.deathDate) return null

  const birth = new Date(name.birthDate)
  const death = new Date(name.deathDate)
  let age = death.getFullYear() - birth.getFullYear()
  const monthDiff = death.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Get current age (if not deceased)
 */
export function getCurrentAge(name: Name | undefined | null): number | null {
  if (!name?.birthDate || name.deceased) return null

  const birth = new Date(name.birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}
