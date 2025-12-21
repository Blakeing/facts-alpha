/**
 * Form Validation Module
 *
 * Validators compatible with Vuetify's :rules prop
 *
 * @example
 * import { required, email, minLength } from '@facts/utils'
 *
 * <FTextField :rules="[required, email]" />
 * <FTextField :rules="[required, minLength(3)]" />
 */

// Types
export type { ValidationResult, Validator, ValidatorFactory, ValidatorOptions } from './types'

// Validators
export {
  // Presence
  required,
  // String
  minLength,
  maxLength,
  pattern,
  // Format
  email,
  phone,
  // Number
  min,
  max,
  numeric,
  // Date
  date,
  dateRange,
  futureDate,
  pastDate,
} from './validators'

