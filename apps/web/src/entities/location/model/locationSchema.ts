/**
 * Location Zod schemas for form validation
 *
 * Aligned with backend Facts.Entities.Location
 * @see docs/data-models.md for field mapping details
 */

import { z } from 'zod'

// License schema
export const locationLicenseSchema = z.object({
  id: z.string().optional(),
  locationId: z.string().optional(),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseType: z.enum(['establishment', 'trust', 'insurance', 'coupon_book_id']),
})

// GL Account mapping schema (placeholder for future)
export const locationGLAccountMapSchema = z.object({
  id: z.string().optional(),
  locationId: z.string().optional(),
  glAccountId: z.string(),
})

// Main location form schema
export const locationFormSchema = z.object({
  identifier: z.string().min(1, 'Location ID is required').max(25, 'Max 25 characters'),
  name: z.string().min(1, 'Location name is required').max(255, 'Max 255 characters'),
  type: z.enum(['funeral', 'cemetery', 'corporate']),
  active: z.boolean(),

  // Physical address
  address1: z.string().min(1, 'Address is required').max(255, 'Max 255 characters'),
  address2: z.string().max(255, 'Max 255 characters').optional().default(''),
  city: z.string().min(1, 'City is required').max(255, 'Max 255 characters'),
  state: z.string().min(2, 'State is required').max(255, 'Max 255 characters'),
  postalCode: z.string().max(50, 'Max 50 characters'),
  county: z.string().max(100, 'Max 100 characters').optional().default(''),
  country: z.string().max(255, 'Max 255 characters').optional().default('USA'),
  latitude: z.number().nullable().optional().default(null),
  longitude: z.number().nullable().optional().default(null),

  // Contact
  phone: z.string().max(25, 'Max 25 characters').optional().default(''),
  email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  website: z
    .string()
    .url('Invalid URL')
    .max(255, 'Max 255 characters')
    .optional()
    .or(z.literal(''))
    .default(''),

  // Mailing address
  mailingSameAsPhysical: z.boolean(),
  mailingAddress1: z.string().max(255, 'Max 255 characters').optional().default(''),
  mailingAddress2: z.string().max(255, 'Max 255 characters').optional().default(''),
  mailingCity: z.string().max(255, 'Max 255 characters').optional().default(''),
  mailingState: z.string().max(255, 'Max 255 characters').optional().default(''),
  mailingPostalCode: z.string().max(50, 'Max 50 characters').optional().default(''),
  mailingCounty: z.string().max(100, 'Max 100 characters').optional().default(''),
  mailingCountry: z.string().max(255, 'Max 255 characters').optional().default(''),

  // Accounting (backend fields - optional in form, set by system)
  accountingPeriod: z.string().optional(), // ISO date string
  glGroupId: z.string().optional().default(''),
  intercompanyGlAccountId: z.string().nullable().optional().default(null),
  glMaps: z.array(locationGLAccountMapSchema).optional().default([]),

  // Licenses
  licenses: z.array(locationLicenseSchema).default([]),
  taxId: z.string().max(255, 'Max 255 characters').optional().default(''),

  // Display settings
  timezone: z.string().max(255, 'Max 255 characters').nullable().optional().default(null),
  contractDisplayName: z.string().max(255, 'Max 255 characters').optional().default(''),
})

// Types inferred from schemas
export type LocationLicenseFormValues = z.infer<typeof locationLicenseSchema>
export type LocationGLAccountMapFormValues = z.infer<typeof locationGLAccountMapSchema>
export type LocationFormValues = z.infer<typeof locationFormSchema>

/**
 * Get first day of current month as accounting period default
 */
function getDefaultAccountingPeriod(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

// Default values for new locations
export function getDefaultLocationFormValues(): LocationFormValues {
  return {
    identifier: '',
    name: '',
    type: 'funeral',
    active: true,

    // Physical address
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    county: '',
    country: 'USA',
    latitude: null,
    longitude: null,

    // Contact
    phone: '',
    email: '',
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
    accountingPeriod: getDefaultAccountingPeriod(),
    glGroupId: '',
    intercompanyGlAccountId: null,
    glMaps: [],

    // Licenses
    licenses: [],
    taxId: '',

    // Display
    timezone: null,
    contractDisplayName: '',
  }
}

// Default values for new license
export function getDefaultLicenseFormValues(): LocationLicenseFormValues {
  return {
    id: '',
    locationId: '',
    licenseNumber: '',
    licenseType: 'establishment',
  }
}
