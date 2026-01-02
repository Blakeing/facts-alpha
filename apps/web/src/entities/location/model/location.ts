/**
 * Location entity types
 *
 * Aligned with backend Facts.Entities.Location
 * @see docs/data-models.md for field mapping details
 */

import type { Entity } from '@/shared/lib'

/**
 * Location Type
 * Backend: LocationType (Funeral=0, Cemetery=1, Corporate=2)
 * Matches BFF exactly - numeric enum
 */
export enum LocationType {
  FUNERAL = 0,
  CEMETERY = 1,
  CORPORATE = 2,
}

/**
 * Location License Type
 * Backend: LocationLicenseType (Establishment=1, Trust=2, Insurance=3, CouponBookId=4)
 * Matches BFF exactly - numeric enum
 */
export enum LocationLicenseType {
  ESTABLISHMENT = 1,
  TRUST = 2,
  INSURANCE = 3,
  COUPON_BOOK_ID = 4,
}

export interface LocationLicense {
  id: string
  locationId?: string // Reference to parent location
  licenseNumber: string
  licenseType: LocationLicenseType
}

/**
 * GL Account mapping for location-specific accounting
 * Placeholder structure - will be expanded when GL features are implemented
 */
export interface LocationGLAccountMapAssignment {
  id: string
  locationId: string
  glAccountId: string
}

export interface Location extends Entity {
  identifier: string // Location code/number (e.g., "001")
  name: string
  type: LocationType
  active: boolean

  // Physical address
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  county: string // Added: backend has this field
  country: string
  latitude: number | null // Added: for mapping features
  longitude: number | null // Added: for mapping features

  // Contact
  phone: string
  email: string
  website: string

  // Mailing address (if different)
  mailingSameAsPhysical: boolean
  mailingAddress1: string
  mailingAddress2: string
  mailingCity: string
  mailingState: string
  mailingPostalCode: string
  mailingCounty: string // Added: backend has this field
  mailingCountry: string

  // Accounting (backend fields)
  accountingPeriod: string // ISO date string - current accounting period
  glGroupId: string // GL group assignment
  intercompanyGlAccountId: string | null // For intercompany transactions
  glMaps: LocationGLAccountMapAssignment[] // GL account mappings

  // Licenses
  licenses: LocationLicense[]
  taxId: string

  // Display settings
  timezone: string | null // IANA timezone (e.g., "America/New_York")
  contractDisplayName: string // Custom name for contracts
}

// Lighter listing model for list views (performance optimization)
export interface LocationListing {
  id: string
  identifier: string
  name: string
  city: string
  state: string
  type: LocationType
  active: boolean
  glGroupId: string // Added: needed for filtering by GL group
}

// Type helpers
export const locationTypeLabels: Record<LocationType, string> = {
  [LocationType.FUNERAL]: 'Funeral',
  [LocationType.CEMETERY]: 'Cemetery',
  [LocationType.CORPORATE]: 'Corporate',
}

export const locationTypeColors: Record<LocationType, string> = {
  [LocationType.FUNERAL]: 'primary',
  [LocationType.CEMETERY]: 'success',
  [LocationType.CORPORATE]: 'info',
}

export function getLocationTypeLabel(type: LocationType): string {
  return locationTypeLabels[type] || String(type)
}

export function getLocationTypeColor(type: LocationType): string {
  return locationTypeColors[type] || 'grey'
}

// License type helpers
export const locationLicenseTypeLabels: Record<LocationLicenseType, string> = {
  [LocationLicenseType.ESTABLISHMENT]: 'Establishment',
  [LocationLicenseType.TRUST]: 'Trust',
  [LocationLicenseType.INSURANCE]: 'Insurance',
  [LocationLicenseType.COUPON_BOOK_ID]: 'Coupon Book ID',
}

export function getLocationLicenseTypeLabel(type: LocationLicenseType): string {
  return locationLicenseTypeLabels[type] || String(type)
}

// Location type options for select fields
export const locationTypeOptions = [
  { value: LocationType.FUNERAL, title: 'Funeral' },
  { value: LocationType.CEMETERY, title: 'Cemetery' },
  { value: LocationType.CORPORATE, title: 'Corporate' },
]

// License type options for select fields
export const locationLicenseTypeOptions = [
  { value: LocationLicenseType.ESTABLISHMENT, title: 'Establishment' },
  { value: LocationLicenseType.TRUST, title: 'Trust' },
  { value: LocationLicenseType.INSURANCE, title: 'Insurance' },
  { value: LocationLicenseType.COUPON_BOOK_ID, title: 'Coupon Book ID' },
]

// Display name helper (like legacy app)
export function getLocationDisplayName(location: {
  identifier: string
  name: string
  city?: string
  state?: string
}): string {
  const { identifier, name, city, state } = location

  if (city && state) {
    return `${identifier} ${name} (${city}, ${state})`
  } else if (state) {
    return `${identifier} ${name} (${state})`
  }
  return `${identifier} ${name}`
}
