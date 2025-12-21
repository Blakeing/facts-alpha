/**
 * Form Validation Utilities
 *
 * Validators compatible with Vuetify's :rules prop
 *
 * @example
 * <FTextField :rules="[required, email]" />
 * <FTextField :rules="[required, minLength(3), maxLength(50)]" />
 */

import type { ValidationResult, Validator, ValidatorOptions } from './types'

// =============================================================================
// PRESENCE VALIDATORS
// =============================================================================

/**
 * Validates that a value is not empty
 *
 * @example
 * <FTextField :rules="[required]" />
 */
export function required(
  value: unknown,
  options: ValidatorOptions = {},
): ValidationResult {
  const message = options.message ?? 'This field is required'

  if (value === null || value === undefined) {
    return message
  }

  if (typeof value === 'string' && value.trim() === '') {
    return message
  }

  if (Array.isArray(value) && value.length === 0) {
    return message
  }

  return true
}

// =============================================================================
// STRING VALIDATORS
// =============================================================================

/**
 * Validates minimum string length
 *
 * @example
 * <FTextField :rules="[minLength(3)]" />
 */
export function minLength(min: number, options: ValidatorOptions = {}): Validator {
  const message = options.message ?? `Must be at least ${min} characters`

  return (value: unknown): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return true // Let required handle empty values
    }

    if (typeof value === 'string' && value.length < min) {
      return message
    }

    return true
  }
}

/**
 * Validates maximum string length
 *
 * @example
 * <FTextField :rules="[maxLength(100)]" />
 */
export function maxLength(max: number, options: ValidatorOptions = {}): Validator {
  const message = options.message ?? `Must be no more than ${max} characters`

  return (value: unknown): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return true
    }

    if (typeof value === 'string' && value.length > max) {
      return message
    }

    return true
  }
}

/**
 * Validates against a regular expression pattern
 *
 * @example
 * <FTextField :rules="[pattern(/^[A-Z]+$/, { message: 'Uppercase only' })]" />
 */
export function pattern(regex: RegExp, options: ValidatorOptions = {}): Validator {
  const message = options.message ?? 'Invalid format'

  return (value: unknown): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return true
    }

    if (typeof value === 'string' && !regex.test(value)) {
      return message
    }

    return true
  }
}

// =============================================================================
// FORMAT VALIDATORS
// =============================================================================

/**
 * Email validation regex
 * Simplified but covers most common cases
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates email format
 *
 * @example
 * <FTextField :rules="[required, email]" />
 */
export function email(
  value: unknown,
  options: ValidatorOptions = {},
): ValidationResult {
  const message = options.message ?? 'Invalid email address'

  if (value === null || value === undefined || value === '') {
    return true
  }

  if (typeof value === 'string' && !EMAIL_REGEX.test(value)) {
    return message
  }

  return true
}

/**
 * US phone number regex
 * Accepts: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
 */
const PHONE_REGEX = /^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/

/**
 * Validates US phone number format
 *
 * @example
 * <FTextField :rules="[phone]" />
 */
export function phone(
  value: unknown,
  options: ValidatorOptions = {},
): ValidationResult {
  const message = options.message ?? 'Invalid phone number'

  if (value === null || value === undefined || value === '') {
    return true
  }

  if (typeof value === 'string') {
    // Remove all whitespace for validation
    const cleaned = value.replace(/\s/g, '')
    if (!PHONE_REGEX.test(cleaned)) {
      return message
    }
  }

  return true
}

// =============================================================================
// NUMBER VALIDATORS
// =============================================================================

/**
 * Validates minimum numeric value
 *
 * @example
 * <FTextField type="number" :rules="[min(0)]" />
 */
export function min(minValue: number, options: ValidatorOptions = {}): Validator {
  const message = options.message ?? `Must be at least ${minValue}`

  return (value: unknown): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return true
    }

    const num = typeof value === 'number' ? value : Number(value)

    if (!isNaN(num) && num < minValue) {
      return message
    }

    return true
  }
}

/**
 * Validates maximum numeric value
 *
 * @example
 * <FTextField type="number" :rules="[max(100)]" />
 */
export function max(maxValue: number, options: ValidatorOptions = {}): Validator {
  const message = options.message ?? `Must be no more than ${maxValue}`

  return (value: unknown): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return true
    }

    const num = typeof value === 'number' ? value : Number(value)

    if (!isNaN(num) && num > maxValue) {
      return message
    }

    return true
  }
}

/**
 * Validates that a value is a valid number
 *
 * @example
 * <FTextField :rules="[numeric]" />
 */
export function numeric(
  value: unknown,
  options: ValidatorOptions = {},
): ValidationResult {
  const message = options.message ?? 'Must be a valid number'

  if (value === null || value === undefined || value === '') {
    return true
  }

  const num = typeof value === 'number' ? value : Number(value)

  if (isNaN(num)) {
    return message
  }

  return true
}

// =============================================================================
// DATE VALIDATORS
// =============================================================================

/**
 * Validates that a value is a valid date
 *
 * @example
 * <FDatePicker :rules="[date]" />
 */
export function date(
  value: unknown,
  options: ValidatorOptions = {},
): ValidationResult {
  const message = options.message ?? 'Invalid date'

  if (value === null || value === undefined || value === '') {
    return true
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? message : true
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? message : true
  }

  return message
}

/**
 * Validates that a date is within a range
 *
 * @example
 * <FDatePicker :rules="[dateRange(new Date('2020-01-01'), new Date())]" />
 */
export function dateRange(
  minDate: Date,
  maxDate: Date,
  options: ValidatorOptions = {},
): Validator {
  const message =
    options.message ??
    `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`

  return (value: unknown): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return true
    }

    let dateValue: Date

    if (value instanceof Date) {
      dateValue = value
    } else if (typeof value === 'string') {
      dateValue = new Date(value)
    } else {
      return message
    }

    if (isNaN(dateValue.getTime())) {
      return message
    }

    if (dateValue < minDate || dateValue > maxDate) {
      return message
    }

    return true
  }
}

/**
 * Validates that a date is not in the past
 *
 * @example
 * <FDatePicker :rules="[futureDate]" />
 */
export function futureDate(
  value: unknown,
  options: ValidatorOptions = {},
): ValidationResult {
  const message = options.message ?? 'Date must be in the future'

  if (value === null || value === undefined || value === '') {
    return true
  }

  let dateValue: Date

  if (value instanceof Date) {
    dateValue = value
  } else if (typeof value === 'string') {
    dateValue = new Date(value)
  } else {
    return message
  }

  if (isNaN(dateValue.getTime())) {
    return message
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (dateValue < today) {
    return message
  }

  return true
}

/**
 * Validates that a date is not in the future
 *
 * @example
 * <FDatePicker :rules="[pastDate]" />
 */
export function pastDate(
  value: unknown,
  options: ValidatorOptions = {},
): ValidationResult {
  const message = options.message ?? 'Date must be in the past'

  if (value === null || value === undefined || value === '') {
    return true
  }

  let dateValue: Date

  if (value instanceof Date) {
    dateValue = value
  } else if (typeof value === 'string') {
    dateValue = new Date(value)
  } else {
    return message
  }

  if (isNaN(dateValue.getTime())) {
    return message
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (dateValue > today) {
    return message
  }

  return true
}

