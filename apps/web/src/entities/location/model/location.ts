/**
 * Location entity types
 *
 * Aligned with backend Facts.Entities.Location
 * @see docs/data-models.md for field mapping details
 */

export type LocationType = 'funeral' | 'cemetery' | 'corporate'

export type LocationLicenseType = 'establishment' | 'trust' | 'insurance' | 'coupon_book_id'

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

export interface Location {
  id: string
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

  // Timestamps
  createdAt: string
  updatedAt: string
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
  funeral: 'Funeral',
  cemetery: 'Cemetery',
  corporate: 'Corporate',
}

export const locationTypeColors: Record<LocationType, string> = {
  funeral: 'primary',
  cemetery: 'success',
  corporate: 'info',
}

export function getLocationTypeLabel(type: LocationType): string {
  return locationTypeLabels[type] || type
}

export function getLocationTypeColor(type: LocationType): string {
  return locationTypeColors[type] || 'grey'
}

// License type helpers
export const locationLicenseTypeLabels: Record<LocationLicenseType, string> = {
  establishment: 'Establishment',
  trust: 'Trust',
  insurance: 'Insurance',
  coupon_book_id: 'Coupon Book ID',
}

export function getLocationLicenseTypeLabel(type: LocationLicenseType): string {
  return locationLicenseTypeLabels[type] || type
}

// Location type options for select fields
export const locationTypeOptions = Object.entries(locationTypeLabels).map(([value, title]) => ({
  value: value as LocationType,
  title,
}))

// License type options for select fields
export const locationLicenseTypeOptions = Object.entries(locationLicenseTypeLabels).map(
  ([value, title]) => ({
    value: value as LocationLicenseType,
    title,
  }),
)

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
