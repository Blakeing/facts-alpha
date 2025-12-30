import type { AddressType, Name, NameAddress, NameEmail, NamePhone } from './name'
import { PhoneType } from './name'

/**
 * Creates a deep copy of a Name model using structuredClone.
 * Useful when you need a mutable copy of readonly data (e.g., from Vue Query).
 */
export function deepCopyName(name: Name | null | undefined): Name | null {
  if (!name) return null
  return structuredClone(name)
}

/**
 * Ensures all required arrays exist on a Name model.
 * Mutates the name object in place.
 */
export function ensureNameArrays(name: Name): Name {
  if (!Array.isArray(name.phones)) {
    name.phones = []
  }
  if (!Array.isArray(name.addresses)) {
    name.addresses = []
  }
  if (!Array.isArray(name.emailAddresses)) {
    name.emailAddresses = []
  }
  if (!Array.isArray(name.relations)) {
    name.relations = []
  }
  return name
}

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
