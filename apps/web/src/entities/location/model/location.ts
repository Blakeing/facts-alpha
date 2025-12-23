/**
 * Location entity types
 */

export type LocationType = 'funeral' | 'cemetery' | 'corporate'

export type LocationLicenseType = 'establishment' | 'trust' | 'insurance' | 'coupon_book_id'

export interface LocationLicense {
  id: string
  licenseNumber: string
  licenseType: LocationLicenseType
}

export interface Location {
  id: string
  identifier: string // Location code/number
  name: string
  type: LocationType
  active: boolean

  // Physical address
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string

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
  mailingCountry: string

  // Licenses
  licenses: LocationLicense[]
  taxId: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Lighter listing model for list views
export interface LocationListing {
  id: string
  identifier: string
  name: string
  city: string
  state: string
  type: LocationType
  active: boolean
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
