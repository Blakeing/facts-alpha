/**
 * Location API client (HTTP-based)
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
import { apiUrls, BaseApi, createHttpDataSource } from '@/shared/api'

// =============================================================================
// HTTP Data Source (for JSON Server / BFF)
// =============================================================================

const httpDataSource = createHttpDataSource<LocationListing, Location, LocationFormValues>({
  list: apiUrls.locations.listing,
  detail: apiUrls.locations.detail,
})

// =============================================================================
// Data Source Selection (always HTTP now)
// =============================================================================

const dataSource = httpDataSource

// =============================================================================
// Effect-based API (using BaseApi factory)
// =============================================================================

export const LocationApi = BaseApi<LocationListing, Location, LocationFormValues>(
  dataSource,
  'location',
)
