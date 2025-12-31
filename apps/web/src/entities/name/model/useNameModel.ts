import type { AddressType, Name, NameAddress, NameEmail, NamePhone } from './name'
import { PhoneType } from './name'

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create an empty Name entity with default values
 */
export function createEmptyName(): Name {
  return {
    id: '0',
    first: '',
    last: '',
    middle: '',
    prefix: '',
    suffix: '',
    nickname: '',
    companyName: '',
    maidenName: '',
    birthDate: null,
    deathDate: null,
    timeOfDeath: null,
    age: null,
    deceased: false,
    weight: null,
    condition: null,
    nationalIdentifier: '',
    driversLicense: '',
    driversLicenseState: '',
    gender: null,
    maritalStatus: 0,
    ethnicity: null,
    race: null,
    isVeteran: false,
    branchOfService: 0,
    mailingAddressSameAsPhysical: true,
    optOutMarketing: false,
    conversion: null,
    conversionId: null,
    conversionSource: null,
    phones: [],
    addresses: [],
    emailAddresses: [],
    relations: [],
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

// =============================================================================
// Factory Functions for Nested Entities
// =============================================================================

/**
 * Creates an empty phone entry
 */
export function createEmptyPhone(nameId: string): NamePhone {
  return {
    id: '0',
    nameId,
    number: '',
    type: PhoneType.MOBILE,
    preferred: false,
    active: true,
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

/**
 * Creates an empty email entry
 */
export function createEmptyEmail(nameId: string): NameEmail {
  return {
    id: '0',
    nameId,
    address: '',
    preferred: false,
    active: true,
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

/**
 * Creates an empty address entry
 */
export function createEmptyAddress(
  nameId: string,
  addressType: AddressType,
  country = 'USA',
): NameAddress {
  return {
    id: '0',
    nameId,
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    county: '',
    country,
    primary: true,
    active: true,
    addressType,
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}
