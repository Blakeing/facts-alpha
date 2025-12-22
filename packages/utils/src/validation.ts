/**
 * Common Zod validation refinements and utilities
 *
 * These are reusable validation patterns inspired by legacy FACTS app.
 */
import { z } from 'zod'

// =============================================================================
// Number Validators
// =============================================================================

/**
 * Positive number (greater than 0)
 */
export const positiveNumber = z.number().positive('Value must be greater than zero')

/**
 * Non-negative number (0 or greater)
 */
export const nonNegativeNumber = z.number().min(0, 'Value cannot be negative')

/**
 * Percentage (0-100)
 */
export const percentage = z.number().min(0).max(100, 'Value must be between 0 and 100')

/**
 * Currency amount (positive, allows decimals)
 */
export const positiveCurrency = z
  .number()
  .positive('Amount must be greater than zero')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')

/**
 * Currency amount (non-negative, allows decimals)
 */
export const currency = z
  .number()
  .min(0, 'Amount cannot be negative')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places')

// =============================================================================
// String Validators
// =============================================================================

/**
 * Non-empty trimmed string
 */
export const requiredString = z.string().trim().min(1, 'This field is required')

/**
 * URL with protocol required (http:// or https://)
 */
export const urlWithProtocol = z
  .string()
  .url()
  .refine(
    (val: string) => val.startsWith('http://') || val.startsWith('https://'),
    'URL must start with http:// or https://',
  )

/**
 * Alphanumeric string (no special characters or spaces)
 */
export const alphanumeric = z.string().regex(/^[a-zA-Z0-9]*$/, 'Only letters and numbers allowed')

/**
 * Phone number (basic US format)
 */
export const phoneNumber = z
  .string()
  .regex(/^[\d\s()+-]*$/, 'Invalid phone number format')
  .optional()
  .or(z.literal(''))

/**
 * ZIP code (US format: 12345 or 12345-6789)
 */
export const zipCode = z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')

/**
 * State code (2 uppercase letters)
 */
export const stateCode = z
  .string()
  .length(2, 'Must be 2 letters')
  .regex(/^[A-Z]{2}$/, 'Must be uppercase letters')

// =============================================================================
// Date Validators
// =============================================================================

/**
 * Date string in ISO format (YYYY-MM-DD)
 */
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')

/**
 * Date that is not in the future
 */
export const noFutureDate = z.string().refine((val: string) => {
  if (!val) return true
  const date = new Date(val)
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today
  return date <= today
}, 'Date cannot be in the future')

/**
 * Create a min date validator
 */
export function minDate(min: Date | string, message?: string) {
  const minDateObj = typeof min === 'string' ? new Date(min) : min
  return z.string().refine(
    (val: string) => {
      if (!val) return true
      return new Date(val) >= minDateObj
    },
    message ?? `Date must be on or after ${minDateObj.toLocaleDateString()}`,
  )
}

/**
 * Create a max date validator
 */
export function maxDate(max: Date | string, message?: string) {
  const maxDateObj = typeof max === 'string' ? new Date(max) : max
  return z.string().refine(
    (val: string) => {
      if (!val) return true
      return new Date(val) <= maxDateObj
    },
    message ?? `Date must be on or before ${maxDateObj.toLocaleDateString()}`,
  )
}

// =============================================================================
// Optional Wrappers
// =============================================================================

/**
 * Make a schema optional but validate if provided
 * Treats empty string as undefined
 */
export function optionalString<T extends z.ZodString>(schema: T) {
  return schema.optional().or(z.literal(''))
}

/**
 * Optional email that validates format if provided
 */
export const optionalEmail = z.string().email('Invalid email').optional().or(z.literal(''))
