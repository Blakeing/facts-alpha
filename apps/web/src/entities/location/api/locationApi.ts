/**
 * Location API client (mock implementation)
 *
 * Aligned with backend BFF endpoints:
 * - GET /api/v1/locations/listing
 * - GET /api/v1/locations/{id}
 * - POST /api/v1/locations
 * - PUT /api/v1/locations/{id}
 *
 * @see docs/data-models.md for field mapping details
 * @see docs/api-integration.md for endpoint details
 */

import type { Location, LocationListing } from '../model/location'
import type { LocationFormValues } from '../model/locationSchema'
import { generateId, locationToListing, mockLocations } from './mockLocations'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get first day of current month as default accounting period
 */
function getDefaultAccountingPeriod(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

// In-memory store
let locations = [...mockLocations]

export const locationApi = {
  /**
   * Get all locations (listing format)
   * Backend: GET /api/v1/locations/listing
   */
  async list(): Promise<LocationListing[]> {
    await delay(300)
    return locations.map((l) => locationToListing(l))
  },

  /**
   * Get a single location by ID with full details
   * Backend: GET /api/v1/locations/{id}
   */
  async get(id: string): Promise<Location | null> {
    await delay(200)
    const location = locations.find((l) => l.id === id)
    return location || null
  },

  /**
   * Create a new location
   * Backend: POST /api/v1/locations
   */
  async create(data: LocationFormValues): Promise<Location> {
    await delay(400)

    const now = new Date().toISOString()
    const newId = generateId()

    const newLocation: Location = {
      id: newId,
      identifier: data.identifier,
      name: data.name,
      type: data.type,
      active: data.active,

      // Physical address
      address1: data.address1,
      address2: data.address2 || '',
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      county: data.county || '',
      country: data.country || 'USA',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,

      // Contact
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',

      // Mailing address
      mailingSameAsPhysical: data.mailingSameAsPhysical,
      mailingAddress1: data.mailingAddress1 || '',
      mailingAddress2: data.mailingAddress2 || '',
      mailingCity: data.mailingCity || '',
      mailingState: data.mailingState || '',
      mailingPostalCode: data.mailingPostalCode || '',
      mailingCounty: data.mailingCounty || '',
      mailingCountry: data.mailingCountry || '',

      // Accounting
      accountingPeriod: data.accountingPeriod || getDefaultAccountingPeriod(),
      glGroupId: data.glGroupId || '',
      intercompanyGlAccountId: data.intercompanyGlAccountId ?? null,
      glMaps:
        data.glMaps?.map((m) => ({
          id: m.id || generateId(),
          locationId: newId,
          glAccountId: m.glAccountId,
        })) || [],

      // Licenses
      licenses: data.licenses.map((l) => ({
        id: l.id || generateId(),
        locationId: newId,
        licenseNumber: l.licenseNumber,
        licenseType: l.licenseType,
      })),
      taxId: data.taxId || '',

      // Display
      timezone: data.timezone ?? null,
      contractDisplayName: data.contractDisplayName || '',

      // Timestamps
      createdAt: now,
      updatedAt: now,
    }

    locations.push(newLocation)
    return newLocation
  },

  /**
   * Update an existing location
   * Backend: PUT /api/v1/locations/{id}
   */
  async update(id: string, data: Partial<LocationFormValues>): Promise<Location> {
    await delay(300)

    const existing = locations.find((l) => l.id === id)
    if (!existing) {
      throw new Error('Location not found')
    }

    const updated: Location = {
      ...existing,
      identifier: data.identifier ?? existing.identifier,
      name: data.name ?? existing.name,
      type: data.type ?? existing.type,
      active: data.active ?? existing.active,

      // Physical address
      address1: data.address1 ?? existing.address1,
      address2: data.address2 ?? existing.address2,
      city: data.city ?? existing.city,
      state: data.state ?? existing.state,
      postalCode: data.postalCode ?? existing.postalCode,
      county: data.county ?? existing.county,
      country: data.country ?? existing.country,
      latitude: data.latitude === undefined ? existing.latitude : data.latitude,
      longitude: data.longitude === undefined ? existing.longitude : data.longitude,

      // Contact
      phone: data.phone ?? existing.phone,
      email: data.email ?? existing.email,
      website: data.website ?? existing.website,

      // Mailing address
      mailingSameAsPhysical: data.mailingSameAsPhysical ?? existing.mailingSameAsPhysical,
      mailingAddress1: data.mailingAddress1 ?? existing.mailingAddress1,
      mailingAddress2: data.mailingAddress2 ?? existing.mailingAddress2,
      mailingCity: data.mailingCity ?? existing.mailingCity,
      mailingState: data.mailingState ?? existing.mailingState,
      mailingPostalCode: data.mailingPostalCode ?? existing.mailingPostalCode,
      mailingCounty: data.mailingCounty ?? existing.mailingCounty,
      mailingCountry: data.mailingCountry ?? existing.mailingCountry,

      // Accounting
      accountingPeriod: data.accountingPeriod ?? existing.accountingPeriod,
      glGroupId: data.glGroupId ?? existing.glGroupId,
      intercompanyGlAccountId:
        data.intercompanyGlAccountId === undefined
          ? existing.intercompanyGlAccountId
          : data.intercompanyGlAccountId,
      glMaps: data.glMaps
        ? data.glMaps.map((m) => ({
            id: m.id || generateId(),
            locationId: id,
            glAccountId: m.glAccountId,
          }))
        : existing.glMaps,

      // Licenses
      licenses: data.licenses
        ? data.licenses.map((l) => ({
            id: l.id || generateId(),
            locationId: id,
            licenseNumber: l.licenseNumber,
            licenseType: l.licenseType,
          }))
        : existing.licenses,
      taxId: data.taxId ?? existing.taxId,

      // Display
      timezone: data.timezone === undefined ? existing.timezone : data.timezone,
      contractDisplayName: data.contractDisplayName ?? existing.contractDisplayName,

      // Timestamps
      updatedAt: new Date().toISOString(),
    }

    // Update in-place
    const index = locations.indexOf(existing)
    locations[index] = updated
    return updated
  },

  /**
   * Delete a location
   * Backend: DELETE /api/v1/locations/{id} (if supported)
   */
  async delete(id: string): Promise<void> {
    await delay(300)
    locations = locations.filter((l) => l.id !== id)
  },
}
