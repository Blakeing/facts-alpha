export type {
  Name,
  NameAddress,
  NameEmail,
  NamePhone,
  NameRelation,
} from './model/name'

export {
  AddressType,
  BranchOfService,
  Gender,
  MaritalStatus,
  PhoneType,
} from './model/name'

export {
  formatAddressMultiLine,
  formatAddressSingleLine,
  getAgeAtDeath,
  getCurrentAge,
  getFormattedName,
  getFullName,
  getLastFirstName,
  getPrimaryAddress,
  getPrimaryEmail,
  getPrimaryEmailAddress,
  getPrimaryPhone,
  getPrimaryPhoneNumber,
  isOrganization,
  isPerson,
} from './model/nameHelpers'

export * from './ui'

