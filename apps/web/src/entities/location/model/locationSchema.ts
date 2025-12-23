/**
 * Location Zod schemas for form validation
 */

import { z } from 'zod'

// License schema
export const locationLicenseSchema = z.object({
  id: z.string().optional(),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseType: z.enum(['establishment', 'trust', 'insurance', 'coupon_book_id']),
})

// Main location form schema
export const locationFormSchema = z.object({
  identifier: z.string().min(1, 'Location ID is required'),
  name: z.string().min(1, 'Location name is required'),
  type: z.enum(['funeral', 'cemetery', 'corporate']),
  active: z.boolean(),

  // Physical address
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().optional(),

  // Contact
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Mailing address
  mailingSameAsPhysical: z.boolean(),
  mailingAddress1: z.string().optional(),
  mailingAddress2: z.string().optional(),
  mailingCity: z.string().optional(),
  mailingState: z.string().optional(),
  mailingPostalCode: z.string().optional(),
  mailingCountry: z.string().optional(),

  // Licenses
  licenses: z.array(locationLicenseSchema).default([]),
  taxId: z.string().optional(),
})

// Types inferred from schemas
export type LocationLicenseFormValues = z.infer<typeof locationLicenseSchema>
export type LocationFormValues = z.infer<typeof locationFormSchema>

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
    country: 'USA',

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
    mailingCountry: '',

    // Licenses
    licenses: [],
    taxId: '',
  }
}

// Default values for new license
export function getDefaultLicenseFormValues(): LocationLicenseFormValues {
  return {
    id: '',
    licenseNumber: '',
    licenseType: 'establishment',
  }
}
