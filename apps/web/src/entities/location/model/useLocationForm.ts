/**
 * useLocationForm - Location form composable with mutations
 */

import type { LocationFormValues } from './locationSchema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { locationApi } from '../api/locationApi'
import { getDefaultLocationFormValues } from './locationSchema'
import { LOCATIONS_QUERY_KEY } from './useLocations'

interface UseLocationFormOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useLocationForm(
  locationId: MaybeRefOrGetter<string | null | undefined>,
  options: UseLocationFormOptions = {},
) {
  const queryClient = useQueryClient()
  const isEditing = computed(() => !!toValue(locationId))

  // Load existing location for editing
  const { data: existingLocation, isLoading: isLoadingInitial } = useQuery({
    queryKey: computed(() => ['location', toValue(locationId)] as const),
    queryFn: () => {
      const id = toValue(locationId)
      return id ? locationApi.get(id) : null
    },
    enabled: isEditing,
  })

  // Initial form values
  const initialValues = computed(() => {
    if (!isEditing.value) {
      return getDefaultLocationFormValues()
    }
    if (!existingLocation.value) return null

    const l = existingLocation.value
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
    } as LocationFormValues
  })

  // Save mutation (create or update)
  const saveMutation = useMutation({
    mutationFn: async (data: LocationFormValues) => {
      const id = toValue(locationId)
      if (isEditing.value && id) {
        return locationApi.update(id, data)
      }
      return locationApi.create(data)
    },
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      const id = toValue(locationId)
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['location', id] })
      }
      options.onSuccess?.()
    },
    onError: (error: Error) => {
      options.onError?.(error)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const id = toValue(locationId)
      if (!id) throw new Error('No location ID')
      return locationApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      options.onSuccess?.()
    },
    onError: (error: Error) => {
      options.onError?.(error)
    },
  })

  return {
    // Form state
    isEditing,
    isLoadingInitial,
    initialValues,

    // Mutations
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    delete: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Combined busy state
    isBusy: computed(() => saveMutation.isPending.value || deleteMutation.isPending.value),
  }
}
