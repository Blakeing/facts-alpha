/**
 * entities/case/model/caseSchema.ts
 *
 * Zod schemas for case form validation
 * These schemas define both validation rules and infer TypeScript types
 */

// Import Case type for conversion functions
import type { Case, CaseService } from './case'

// =============================================================================
// CONVERSION UTILITIES
// =============================================================================

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
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  middleName: z.string().max(100, 'Middle name is too long'),
  dateOfBirth: z.string(),
  dateOfDeath: z.string().min(1, 'Date of death is required'),
  placeOfDeath: z.string().max(200, 'Place of death is too long'),
  ssn: z.string().regex(/^$|^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format (XXX-XX-XXXX)'),
  veteranStatus: z.boolean(),
})

// =============================================================================
// NEXT OF KIN SCHEMA
// =============================================================================

export const nextOfKinFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone number format'),
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

/**
 * Convert a Case entity to form values for editing
 */
export function caseToFormValues(c: Case): CaseFormValues {
  return {
    decedent: {
      firstName: c.decedent.firstName,
      lastName: c.decedent.lastName,
      middleName: c.decedent.middleName || '',
      dateOfBirth: c.decedent.dateOfBirth || '',
      dateOfDeath: c.decedent.dateOfDeath,
      placeOfDeath: c.decedent.placeOfDeath || '',
      ssn: c.decedent.ssn || '',
      veteranStatus: c.decedent.veteranStatus || false,
    },
    nextOfKin: {
      firstName: c.nextOfKin.firstName,
      lastName: c.nextOfKin.lastName,
      relationship: c.nextOfKin.relationship,
      phone: c.nextOfKin.phone,
      email: c.nextOfKin.email || '',
      address: c.nextOfKin.address
        ? {
            street: c.nextOfKin.address.street,
            city: c.nextOfKin.address.city,
            state: c.nextOfKin.address.state,
            zip: c.nextOfKin.address.zip,
          }
        : { street: '', city: '', state: '', zip: '' },
    },
    services: c.services.map((s) => s.type),
    notes: c.notes || '',
    status: c.status,
  }
}

/**
 * Generate a random ID
 */
function generateId(): string {
  return Math.random().toString(36).slice(2, 15)
}

/**
 * Generate a case number (YYYY-XXXX format)
 */
function generateCaseNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, '0')
  return `${year}-${random}`
}

/**
 * Convert form values to a Case entity
 *
 * @param values - Form values from the form
 * @param existing - Existing case (for updates) - preserves id, caseNumber, createdAt
 * @param tenantId - Tenant ID for new cases
 */
export function formValuesToCase(
  values: CaseFormValues,
  existing?: Case,
  tenantId = 'default',
): Case {
  const now = new Date().toISOString()

  // Convert services array to CaseService objects
  const services: CaseService[] = values.services.map((type) => ({
    id: generateId(),
    type,
  }))

  return {
    id: existing?.id || generateId(),
    caseNumber: existing?.caseNumber || generateCaseNumber(),
    tenantId: existing?.tenantId || tenantId,
    status: values.status,
    decedent: {
      firstName: values.decedent.firstName,
      lastName: values.decedent.lastName,
      middleName: values.decedent.middleName || undefined,
      dateOfBirth: values.decedent.dateOfBirth || undefined,
      dateOfDeath: values.decedent.dateOfDeath,
      placeOfDeath: values.decedent.placeOfDeath || undefined,
      ssn: values.decedent.ssn || undefined,
      veteranStatus: values.decedent.veteranStatus || undefined,
    },
    nextOfKin: {
      firstName: values.nextOfKin.firstName,
      lastName: values.nextOfKin.lastName,
      relationship: values.nextOfKin.relationship,
      phone: values.nextOfKin.phone,
      email: values.nextOfKin.email || undefined,
      address: values.nextOfKin.address.street
        ? {
            street: values.nextOfKin.address.street,
            city: values.nextOfKin.address.city,
            state: values.nextOfKin.address.state,
            zip: values.nextOfKin.address.zip,
          }
        : undefined,
    },
    services,
    notes: values.notes || undefined,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
}
