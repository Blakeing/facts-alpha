/**
 * entities/case/model/caseSchema.ts
 *
 * Zod schemas for case form validation
 * These schemas define both validation rules and infer TypeScript types
 */

import { z } from 'zod'

// =============================================================================
// ENUMS
// =============================================================================

export const caseStatusSchema = z.enum([
  'pending',
  'active',
  'in_progress',
  'completed',
  'archived',
])

export const serviceTypeSchema = z.enum([
  'visitation',
  'funeral',
  'graveside',
  'cremation',
  'memorial',
  'transport',
])

// =============================================================================
// ADDRESS SCHEMA
// =============================================================================

export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
})

// =============================================================================
// DECEDENT SCHEMA
// =============================================================================

export const decedentFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long'),
  middleName: z.string().max(100, 'Middle name is too long'),
  dateOfBirth: z.string(),
  dateOfDeath: z.string().min(1, 'Date of death is required'),
  placeOfDeath: z.string().max(200, 'Place of death is too long'),
  ssn: z
    .string()
    .regex(/^$|^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format (XXX-XX-XXXX)'),
  veteranStatus: z.boolean(),
})

// =============================================================================
// NEXT OF KIN SCHEMA
// =============================================================================

export const nextOfKinFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/,
      'Invalid phone number format',
    ),
  email: z.string().email('Invalid email address').or(z.literal('')),
  address: addressSchema,
})

// =============================================================================
// CASE FORM SCHEMA
// =============================================================================

export const caseFormSchema = z.object({
  decedent: decedentFormSchema,
  nextOfKin: nextOfKinFormSchema,
  services: z.array(serviceTypeSchema),
  notes: z.string().max(5000, 'Notes are too long'),
  status: caseStatusSchema,
})

// =============================================================================
// INFERRED TYPES
// =============================================================================

export type CaseFormValues = z.infer<typeof caseFormSchema>
export type DecedentFormValues = z.infer<typeof decedentFormSchema>
export type NextOfKinFormValues = z.infer<typeof nextOfKinFormSchema>
export type AddressValues = z.infer<typeof addressSchema>
export type CaseStatus = z.infer<typeof caseStatusSchema>
export type ServiceType = z.infer<typeof serviceTypeSchema>

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export function getDefaultCaseFormValues(): CaseFormValues {
  return {
    decedent: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      dateOfDeath: '',
      placeOfDeath: '',
      ssn: '',
      veteranStatus: false,
    },
    nextOfKin: {
      firstName: '',
      lastName: '',
      relationship: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
    services: [],
    notes: '',
    status: 'pending',
  }
}

