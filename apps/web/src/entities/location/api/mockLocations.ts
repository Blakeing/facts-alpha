/**
 * Mock location data for development
 *
 * Aligned with backend Facts.Entities.Location
 * @see docs/data-models.md for field mapping details
 */

import type { Location, LocationListing } from '../model/location'

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

/**
 * Get first day of current month as accounting period
 */
function getAccountingPeriod(monthsAgo: number = 0): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1).toISOString()
}

// Convert full location to listing format
export function locationToListing(location: Location): LocationListing {
  return {
    id: location.id,
    identifier: location.identifier,
    name: location.name,
    city: location.city,
    state: location.state,
    type: location.type,
    active: location.active,
    glGroupId: location.glGroupId,
  }
}

// Mock locations data - aligned with backend Facts.Entities.Location
export const mockLocations: Location[] = [
  {
    id: 'loc-001',
    identifier: 'FH001',
    name: 'Evergreen Memorial Funeral Home',
    type: 'funeral',
    active: true,

    // Physical address
    address1: '1234 Oak Street',
    address2: 'Suite 100',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    county: 'Sangamon',
    country: 'USA',
    latitude: 39.7817,
    longitude: -89.6501,

    // Contact
    phone: '(217) 555-0100',
    email: 'info@evergreenmemorial.com',
    website: 'https://evergreenmemorial.com',

    // Mailing address
    mailingSameAsPhysical: true,
    mailingAddress1: '',
    mailingAddress2: '',
    mailingCity: '',
    mailingState: '',
    mailingPostalCode: '',
    mailingCounty: '',
    mailingCountry: '',

    // Accounting
    accountingPeriod: getAccountingPeriod(0),
    glGroupId: 'gl-group-001',
    intercompanyGlAccountId: null,
    glMaps: [],

    // Licenses
    licenses: [
      {
        id: 'lic-001',
        locationId: 'loc-001',
        licenseNumber: 'FH-2024-001234',
        licenseType: 'establishment',
      },
      {
        id: 'lic-002',
        locationId: 'loc-001',
        licenseNumber: 'INS-2024-005678',
        licenseType: 'insurance',
      },
    ],
    taxId: '12-3456789',

    // Display
    timezone: 'America/Chicago',
    contractDisplayName: 'Evergreen Memorial',

    // Timestamps
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  },
  {
    id: 'loc-002',
    identifier: 'CEM001',
    name: 'Peaceful Valley Cemetery',
    type: 'cemetery',
    active: true,

    // Physical address
    address1: '5678 Valley Road',
    address2: '',
    city: 'Riverside',
    state: 'CA',
    postalCode: '92501',
    county: 'Riverside',
    country: 'USA',
    latitude: 33.9533,
    longitude: -117.3962,

    // Contact
    phone: '(951) 555-0200',
    email: 'contact@peacefulvalley.com',
    website: 'https://peacefulvalleycemetery.com',

    // Mailing address
    mailingSameAsPhysical: false,
    mailingAddress1: 'PO Box 1234',
    mailingAddress2: '',
    mailingCity: 'Riverside',
    mailingState: 'CA',
    mailingPostalCode: '92502',
    mailingCounty: 'Riverside',
    mailingCountry: 'USA',

    // Accounting
    accountingPeriod: getAccountingPeriod(0),
    glGroupId: 'gl-group-002',
    intercompanyGlAccountId: null,
    glMaps: [],

    // Licenses
    licenses: [
      {
        id: 'lic-003',
        locationId: 'loc-002',
        licenseNumber: 'CEM-2024-009876',
        licenseType: 'establishment',
      },
    ],
    taxId: '98-7654321',

    // Display
    timezone: 'America/Los_Angeles',
    contractDisplayName: 'Peaceful Valley',

    // Timestamps
    createdAt: '2023-06-01T08:00:00Z',
    updatedAt: '2024-03-15T11:45:00Z',
  },
  {
    id: 'loc-003',
    identifier: 'FH002',
    name: 'Sunrise Chapel & Crematory',
    type: 'funeral',
    active: true,

    // Physical address
    address1: '789 Sunrise Boulevard',
    address2: '',
    city: 'Phoenix',
    state: 'AZ',
    postalCode: '85001',
    county: 'Maricopa',
    country: 'USA',
    latitude: 33.4484,
    longitude: -112.074,

    // Contact
    phone: '(602) 555-0300',
    email: 'services@sunrisechapel.com',
    website: 'https://sunrisechapel.com',

    // Mailing address
    mailingSameAsPhysical: true,
    mailingAddress1: '',
    mailingAddress2: '',
    mailingCity: '',
    mailingState: '',
    mailingPostalCode: '',
    mailingCounty: '',
    mailingCountry: '',

    // Accounting
    accountingPeriod: getAccountingPeriod(0),
    glGroupId: 'gl-group-001',
    intercompanyGlAccountId: 'gl-interco-001',
    glMaps: [],

    // Licenses
    licenses: [
      {
        id: 'lic-004',
        locationId: 'loc-003',
        licenseNumber: 'FH-2024-002345',
        licenseType: 'establishment',
      },
      {
        id: 'lic-005',
        locationId: 'loc-003',
        licenseNumber: 'TR-2024-003456',
        licenseType: 'trust',
      },
    ],
    taxId: '45-6789012',

    // Display
    timezone: 'America/Phoenix',
    contractDisplayName: 'Sunrise Chapel',

    // Timestamps
    createdAt: '2024-02-20T09:30:00Z',
    updatedAt: '2024-07-10T16:20:00Z',
  },
  {
    id: 'loc-004',
    identifier: 'CORP01',
    name: 'Memorial Services Corporate Office',
    type: 'corporate',
    active: true,

    // Physical address
    address1: '100 Corporate Plaza',
    address2: '15th Floor',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
    county: 'Cook',
    country: 'USA',
    latitude: 41.8781,
    longitude: -87.6298,

    // Contact
    phone: '(312) 555-0400',
    email: 'corporate@memorialservices.com',
    website: 'https://memorialservicescorp.com',

    // Mailing address
    mailingSameAsPhysical: true,
    mailingAddress1: '',
    mailingAddress2: '',
    mailingCity: '',
    mailingState: '',
    mailingPostalCode: '',
    mailingCounty: '',
    mailingCountry: '',

    // Accounting
    accountingPeriod: getAccountingPeriod(0),
    glGroupId: 'gl-group-corp',
    intercompanyGlAccountId: null,
    glMaps: [],

    // Licenses
    licenses: [],
    taxId: '56-7890123',

    // Display
    timezone: 'America/Chicago',
    contractDisplayName: 'Memorial Services Corp',

    // Timestamps
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'loc-005',
    identifier: 'CEM002',
    name: 'Garden of Memories',
    type: 'cemetery',
    active: true,

    // Physical address
    address1: '2000 Memorial Drive',
    address2: '',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    county: 'Travis',
    country: 'USA',
    latitude: 30.2672,
    longitude: -97.7431,

    // Contact
    phone: '(512) 555-0500',
    email: 'info@gardenofmemories.com',
    website: '',

    // Mailing address
    mailingSameAsPhysical: true,
    mailingAddress1: '',
    mailingAddress2: '',
    mailingCity: '',
    mailingState: '',
    mailingPostalCode: '',
    mailingCounty: '',
    mailingCountry: '',

    // Accounting
    accountingPeriod: getAccountingPeriod(0),
    glGroupId: 'gl-group-002',
    intercompanyGlAccountId: null,
    glMaps: [],

    // Licenses
    licenses: [
      {
        id: 'lic-006',
        locationId: 'loc-005',
        licenseNumber: 'CEM-2024-004567',
        licenseType: 'establishment',
      },
    ],
    taxId: '67-8901234',

    // Display
    timezone: 'America/Chicago',
    contractDisplayName: 'Garden of Memories',

    // Timestamps
    createdAt: '2023-09-15T14:00:00Z',
    updatedAt: '2024-05-22T09:15:00Z',
  },
  {
    id: 'loc-006',
    identifier: 'FH003',
    name: 'Heritage Funeral Home',
    type: 'funeral',
    active: false, // Inactive location for testing

    // Physical address
    address1: '456 Heritage Lane',
    address2: '',
    city: 'Denver',
    state: 'CO',
    postalCode: '80202',
    county: 'Denver',
    country: 'USA',
    latitude: 39.7392,
    longitude: -104.9903,

    // Contact
    phone: '(303) 555-0600',
    email: 'heritage@funeral.com',
    website: 'https://heritagefuneralhome.com',

    // Mailing address
    mailingSameAsPhysical: true,
    mailingAddress1: '',
    mailingAddress2: '',
    mailingCity: '',
    mailingState: '',
    mailingPostalCode: '',
    mailingCounty: '',
    mailingCountry: '',

    // Accounting
    accountingPeriod: getAccountingPeriod(1), // Previous month (closed)
    glGroupId: 'gl-group-001',
    intercompanyGlAccountId: null,
    glMaps: [],

    // Licenses
    licenses: [
      {
        id: 'lic-007',
        locationId: 'loc-006',
        licenseNumber: 'FH-2023-005678',
        licenseType: 'establishment',
      },
    ],
    taxId: '78-9012345',

    // Display
    timezone: 'America/Denver',
    contractDisplayName: 'Heritage Funeral',

    // Timestamps
    createdAt: '2020-03-10T12:00:00Z',
    updatedAt: '2024-08-01T08:00:00Z',
  },
]
