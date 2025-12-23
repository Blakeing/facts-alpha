/**
 * Location API client (mock implementation)
 */

import type { Location, LocationListing } from '../model/location'
import type { LocationFormValues } from '../model/locationSchema'
import { generateId, locationToListing, mockLocations } from './mockLocations'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory store
let locations = [...mockLocations]

export const locationApi = {
  /**
   * Get all locations (listing format)
   */
  async list(): Promise<LocationListing[]> {
    await delay(300)
    return locations.map((l) => locationToListing(l))
  },

  /**
   * Get a single location by ID with full details
   */
  async get(id: string): Promise<Location | null> {
    await delay(200)
    const location = locations.find((l) => l.id === id)
    return location || null
  },

  /**
   * Create a new location
   */
  async create(data: LocationFormValues): Promise<Location> {
    await delay(400)

    const now = new Date().toISOString()

    const newLocation: Location = {
      id: generateId(),
      identifier: data.identifier,
      name: data.name,
      type: data.type,
      active: data.active,
      address1: data.address1,
      address2: data.address2 || '',
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country || 'USA',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      mailingSameAsPhysical: data.mailingSameAsPhysical,
      mailingAddress1: data.mailingAddress1 || '',
      mailingAddress2: data.mailingAddress2 || '',
      mailingCity: data.mailingCity || '',
      mailingState: data.mailingState || '',
      mailingPostalCode: data.mailingPostalCode || '',
      mailingCountry: data.mailingCountry || '',
      licenses: data.licenses.map((l) => ({
        id: l.id || generateId(),
        licenseNumber: l.licenseNumber,
        licenseType: l.licenseType,
      })),
      taxId: data.taxId || '',
      createdAt: now,
      updatedAt: now,
    }

    locations.push(newLocation)
    return newLocation
  },

  /**
   * Update an existing location
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
      address1: data.address1 ?? existing.address1,
      address2: data.address2 ?? existing.address2,
      city: data.city ?? existing.city,
      state: data.state ?? existing.state,
      postalCode: data.postalCode ?? existing.postalCode,
      country: data.country ?? existing.country,
      phone: data.phone ?? existing.phone,
      email: data.email ?? existing.email,
      website: data.website ?? existing.website,
      mailingSameAsPhysical: data.mailingSameAsPhysical ?? existing.mailingSameAsPhysical,
      mailingAddress1: data.mailingAddress1 ?? existing.mailingAddress1,
      mailingAddress2: data.mailingAddress2 ?? existing.mailingAddress2,
      mailingCity: data.mailingCity ?? existing.mailingCity,
      mailingState: data.mailingState ?? existing.mailingState,
      mailingPostalCode: data.mailingPostalCode ?? existing.mailingPostalCode,
      mailingCountry: data.mailingCountry ?? existing.mailingCountry,
      licenses: data.licenses
        ? data.licenses.map((l) => ({
            id: l.id || generateId(),
            licenseNumber: l.licenseNumber,
            licenseType: l.licenseType,
          }))
        : existing.licenses,
      taxId: data.taxId ?? existing.taxId,
      updatedAt: new Date().toISOString(),
    }

    // Update in-place
    const index = locations.indexOf(existing)
    locations[index] = updated
    return updated
  },

  /**
   * Delete a location
   */
  async delete(id: string): Promise<void> {
    await delay(300)
    locations = locations.filter((l) => l.id !== id)
  },
}
