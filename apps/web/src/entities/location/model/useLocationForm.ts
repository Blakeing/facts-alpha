/**
 * useLocationForm - Location form composable with mutations
 *
 * Uses the generic useEntityForm for CRUD operations.
 */

import type { MaybeRefOrGetter } from 'vue'
import type { Location } from './location'
import type { LocationFormValues } from './locationSchema'
import { useEntityForm } from '@facts/ui'
import { locationApi } from '../api/locationApi'
import { getDefaultLocationFormValues } from './locationSchema'
import { LOCATIONS_QUERY_KEY } from './useLocations'

interface UseLocationFormOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Transform a Location entity to form values
 */
function locationToFormValues(l: Location): LocationFormValues {
  return {
    identifier: l.identifier,
    name: l.name,
    type: l.type,
    active: l.active,
    address1: l.address1,
    address2: l.address2 || '',
    city: l.city,
    state: l.state,
    postalCode: l.postalCode,
    country: l.country || 'USA',
    phone: l.phone || '',
    email: l.email || '',
    website: l.website || '',
    mailingSameAsPhysical: l.mailingSameAsPhysical,
    mailingAddress1: l.mailingAddress1 || '',
    mailingAddress2: l.mailingAddress2 || '',
    mailingCity: l.mailingCity || '',
    mailingState: l.mailingState || '',
    mailingPostalCode: l.mailingPostalCode || '',
    mailingCountry: l.mailingCountry || '',
    licenses: l.licenses.map((lic) => ({
      id: lic.id,
      licenseNumber: lic.licenseNumber,
      licenseType: lic.licenseType,
    })),
    taxId: l.taxId || '',
  }
}

export function useLocationForm(
  locationId: MaybeRefOrGetter<string | null | undefined>,
  options: UseLocationFormOptions = {},
) {
  return useEntityForm<Location, LocationFormValues>({
    entityId: locationId,
    api: locationApi,
    queryKey: (id) => ['location', id] as const,
    listQueryKey: LOCATIONS_QUERY_KEY,
    toFormValues: locationToFormValues,
    getDefaults: getDefaultLocationFormValues,
    onSuccess: options.onSuccess,
    onError: options.onError,
  })
}
