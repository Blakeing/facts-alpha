/**
 * Name Entity - Person/Organization Name Information
 *
 * Matches BFF structure exactly (no transformation layer needed)
 * Backend: Facts.Entities.Name
 */

// =============================================================================
// Enums
// =============================================================================

/**
 * Phone type enum
 * Backend: PhoneType (Home=0, Work=1, Mobile=2, Fax=3)
 */
export enum PhoneType {
  HOME = 0,
  WORK = 1,
  MOBILE = 2,
  FAX = 3,
}

/**
 * Address type enum
 * Backend: AddressType
 */
export enum AddressType {
  PHYSICAL = 0,
  MAILING = 1,
  BILLING = 2,
}

/**
 * Gender enum
 * Backend: Gender
 */
export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
  OTHER = 3,
}

/**
 * Marital status enum
 * Backend: MaritalStatus
 */
export enum MaritalStatus {
  UNKNOWN = 0,
  SINGLE = 1,
  MARRIED = 2,
  DIVORCED = 3,
  WIDOWED = 4,
  SEPARATED = 5,
}

/**
 * Branch of service enum
 * Backend: BranchOfService
 */
export enum BranchOfService {
  NONE = 0,
  ARMY = 1,
  NAVY = 2,
  AIR_FORCE = 3,
  MARINES = 4,
  COAST_GUARD = 5,
  SPACE_FORCE = 6,
}

// =============================================================================
// Interfaces (matching BFF exactly)
// =============================================================================

/**
 * Phone number for a name
 * Backend: Facts.Entities.NamePhone
 */
export interface NamePhone {
  id: string
  nameId: string
  number: string
  type: PhoneType
  preferred: boolean
  active: boolean
  dateCreated: string
  dateLastModified: string
  createdByUserId?: number
  version?: string
}

/**
 * Address for a name
 * Backend: Facts.Entities.NameAddress
 */
export interface NameAddress {
  id: string
  nameId: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  county: string
  country: string
  primary: boolean
  active: boolean
  addressType: AddressType
  dateCreated: string
  dateLastModified: string
  createdByUserId?: number
  version?: string
}

/**
 * Email address for a name
 * Backend: Facts.Entities.NameEmail
 */
export interface NameEmail {
  id: string
  nameId: string
  address: string
  preferred: boolean
  active: boolean
  dateCreated: string
  dateLastModified: string
  createdByUserId?: number
  version?: string
}

/**
 * Relationship between two names
 * Backend: Facts.Entities.NameRelation
 */
export interface NameRelation {
  id: string
  nameId: string
  relatedNameId: string
  relationshipType: number
  active: boolean
  dateCreated: string
  dateLastModified: string
}

/**
 * Name entity - represents a person or organization
 * Backend: Facts.Entities.Name
 *
 * NOTE: BFF returns this structure exactly - no flattening/transformation needed
 */
export interface Name {
  id: string

  // Name fields
  first: string
  last: string
  middle: string
  prefix: string
  suffix: string
  nickname: string
  companyName: string
  maidenName: string

  // Dates
  birthDate: string | null
  deathDate: string | null
  timeOfDeath: string | null
  age: number | null
  deceased: boolean

  // Physical characteristics
  weight: number | null
  condition: string | null

  // Identifiers
  nationalIdentifier: string // SSN
  driversLicense: string
  driversLicenseState: string

  // Demographics
  gender: Gender | null
  maritalStatus: MaritalStatus
  ethnicity: string | null
  race: string | null

  // Military
  isVeteran: boolean
  branchOfService: BranchOfService

  // Preferences
  mailingAddressSameAsPhysical: boolean
  optOutMarketing: boolean

  // Conversion tracking (for data migration)
  conversion: string | null
  conversionId: string | null
  conversionSource: string | null

  // Nested collections (BFF includes these)
  phones: NamePhone[]
  addresses: NameAddress[]
  emailAddresses: NameEmail[]
  relations: NameRelation[]

  // Timestamps
  dateCreated: string
  dateLastModified: string
  createdByUserId?: number
  version?: string
}
