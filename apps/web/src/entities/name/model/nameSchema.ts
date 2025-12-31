/**
 * Name Entity Zod Schemas for form validation
 *
 * Used for validating Name entities in forms and dialogs.
 * Aligned with backend Facts.Entities.Name structure.
 */

import { z } from 'zod'
import { AddressType, Gender, MaritalStatus, PhoneType } from './name'

// =============================================================================
// Name Sub-Entity Schemas
// =============================================================================

export const namePhoneSchema = z.object({
  id: z.string().optional(),
  nameId: z.string().optional(),
  number: z.string().max(25),
  type: z.nativeEnum(PhoneType).default(PhoneType.HOME),
  preferred: z.boolean().default(true),
  active: z.boolean().default(true),
})

export const nameAddressSchema = z.object({
  id: z.string().optional(),
  nameId: z.string().optional(),
  address1: z.string().min(1, 'Address is required').max(255),
  address2: z.string().max(255).optional().default(''),
  city: z.string().min(1, 'City is required').max(255),
  state: z.string().min(2, 'State is required').max(255),
  postalCode: z.string().max(50).optional().default(''),
  county: z.string().max(100).optional().default(''),
  country: z.string().max(255).optional().default('USA'),
  primary: z.boolean().default(true),
  active: z.boolean().default(true),
  addressType: z.nativeEnum(AddressType).default(AddressType.PHYSICAL),
})

export const nameEmailSchema = z.object({
  id: z.string().optional(),
  nameId: z.string().optional(),
  address: z.string().email('Invalid email').max(255),
  preferred: z.boolean().default(true),
  active: z.boolean().default(true),
})

// =============================================================================
// Name Schema
// =============================================================================

export const nameSchema = z.object({
  id: z.string().optional(),
  first: z.string().min(1, 'First name is required').max(255),
  last: z.string().min(1, 'Last name is required').max(255),
  middle: z.string().max(255).optional().default(''),
  prefix: z.string().max(50).optional().default(''),
  suffix: z.string().max(50).optional().default(''),
  nickname: z.string().max(255).optional().default(''),
  companyName: z.string().max(255).optional().default(''),
  maidenName: z.string().max(255).optional().default(''),
  birthDate: z.string().nullable().optional().default(null),
  deathDate: z.string().nullable().optional().default(null),
  timeOfDeath: z.string().nullable().optional().default(null),
  age: z.number().nullable().optional().default(null),
  deceased: z.boolean().optional().default(false),
  weight: z.number().nullable().optional().default(null),
  condition: z.string().nullable().optional().default(null),
  nationalIdentifier: z.string().max(20).optional().default(''),
  driversLicense: z.string().max(50).optional().default(''),
  driversLicenseState: z.string().max(2).optional().default(''),
  gender: z.nativeEnum(Gender).nullable().optional().default(null),
  maritalStatus: z.nativeEnum(MaritalStatus).default(MaritalStatus.UNKNOWN),
  ethnicity: z.string().nullable().optional().default(null),
  race: z.string().nullable().optional().default(null),
  isVeteran: z.boolean().optional().default(false),
  branchOfService: z.number().optional().default(0),
  mailingAddressSameAsPhysical: z.boolean().optional().default(true),
  optOutMarketing: z.boolean().optional().default(false),
  conversion: z.string().nullable().optional().default(null),
  conversionId: z.string().nullable().optional().default(null),
  conversionSource: z.string().nullable().optional().default(null),
  phones: z.array(namePhoneSchema).default([]),
  addresses: z.array(nameAddressSchema).default([]),
  emailAddresses: z.array(nameEmailSchema).default([]),
  relations: z.array(z.any()).default([]), // NameRelation - simplified for now
})

// =============================================================================
// Type Exports
// =============================================================================

export type NameFormValues = z.infer<typeof nameSchema>
export type NamePhoneFormValues = z.infer<typeof namePhoneSchema>
export type NameAddressFormValues = z.infer<typeof nameAddressSchema>
export type NameEmailFormValues = z.infer<typeof nameEmailSchema>
