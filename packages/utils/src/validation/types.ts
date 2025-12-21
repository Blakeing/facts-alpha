/**
 * Validation Types
 *
 * Compatible with Vuetify's form validation rules
 */

/**
 * Result of a validation check
 * - `true` if valid
 * - error message string if invalid
 */
export type ValidationResult = string | true

/**
 * A validator function that checks a single value
 */
export type Validator = (value: unknown) => ValidationResult

/**
 * A factory function that creates a validator with configuration
 */
export type ValidatorFactory<T extends unknown[]> = (...args: T) => Validator

/**
 * Options for customizing validator error messages
 */
export interface ValidatorOptions {
  message?: string
}

