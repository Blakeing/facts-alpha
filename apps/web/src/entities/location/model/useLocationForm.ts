/**
 * useLocationForm - Location form composable with mutations
 *
 * Uses the generic useEntityForm for CRUD operations.
 *
 * @see docs/data-models.md for field mapping details
 */

import type { MaybeRefOrGetter } from 'vue'
import type { Location } from './location'
import type { LocationFormValues } from './locationSchema'
import { runEffect } from '@facts/effect'
import { useEntityForm } from '@facts/ui'
import { LocationApi } from '../api/locationApi'
import { getDefaultLocationFormValues } from './locationSchema'
import { LOCATIONS_QUERY_KEY } from './useLocations'

interface UseLocationFormOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Transform a Location entity to form values
 *
 * Maps all backend-aligned fields including:
 * - Physical address with county, lat/lng
 * - Mailing address with county
 * - Accounting period and GL settings
 * - Display settings (timezone, contractDisplayName)
 */
function locationToFormValues(l: Location): LocationFormValues {
  return {
    // Identity
    identifier: l.identifier,
    name: l.name,
    type: l.type,
    active: l.active,

    // Physical address
    address1: l.address1,
    address2: l.address2 || '',
    city: l.city,
    state: l.state,
    postalCode: l.postalCode,
    county: l.county || '',
    country: l.country || 'USA',
    latitude: l.latitude ?? null,
    longitude: l.longitude ?? null,

    // Contact
    phone: l.phone || '',
    email: l.email || '',
    website: l.website || '',

    // Mailing address
    mailingSameAsPhysical: l.mailingSameAsPhysical,
    mailingAddress1: l.mailingAddress1 || '',
    mailingAddress2: l.mailingAddress2 || '',
    mailingCity: l.mailingCity || '',
    mailingState: l.mailingState || '',
    mailingPostalCode: l.mailingPostalCode || '',
    mailingCounty: l.mailingCounty || '',
    mailingCountry: l.mailingCountry || '',

    // Accounting (backend-aligned)
    accountingPeriod: l.accountingPeriod,
    glGroupId: l.glGroupId || '',
    intercompanyGlAccountId: l.intercompanyGlAccountId ?? null,
    glMaps:
      l.glMaps?.map((map) => ({
        id: map.id,
        locationId: map.locationId,
        glAccountId: map.glAccountId,
      })) || [],

    // Licenses
    licenses: l.licenses.map((lic) => ({
      id: lic.id,
      locationId: lic.locationId,
      licenseNumber: lic.licenseNumber,
      licenseType: lic.licenseType,
    })),
    taxId: l.taxId || '',

    // Display settings (backend-aligned)
    timezone: l.timezone ?? null,
    contractDisplayName: l.contractDisplayName || '',
  }
}

export function useLocationForm(
  locationId: MaybeRefOrGetter<string | null | undefined>,
  options: UseLocationFormOptions = {},
) {
  return useEntityForm<Location, LocationFormValues>({
    entityId: locationId,
    api: {
      get: (id: string) => runEffect(LocationApi.get(id)),
      create: (data: LocationFormValues) => runEffect(LocationApi.create(data)),
      update: (id: string, data: Partial<LocationFormValues>) =>
        runEffect(LocationApi.update(id, data)),
      delete: (id: string) => runEffect(LocationApi.delete(id)),
    },
    queryKey: (id) => ['location', id] as const,
    listQueryKey: LOCATIONS_QUERY_KEY,
    toFormValues: locationToFormValues,
    getDefaults: getDefaultLocationFormValues,
    onSuccess: options.onSuccess,
    onError: options.onError,
  })
}
