/**
 * Date, currency, and text formatting utilities
 *
 * Uses date-fns for robust date handling
 * @see https://date-fns.org/
 */

import {
  format,
  formatDistanceToNow,
  formatRelative,
  isValid,
  parseISO,
  differenceInDays,
  differenceInYears,
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
  isSameDay,
} from 'date-fns'

// =============================================================================
// Date Formatting
// =============================================================================

/**
 * Parse a date string or Date object into a valid Date
 */
export function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? d : null
}

/**
 * Format a date with common patterns
 *
 * @example
 * formatDate(new Date()) // "Jan 15, 2025"
 * formatDate(new Date(), 'full') // "Wednesday, January 15, 2025"
 * formatDate(new Date(), 'iso') // "2025-01-15"
 */
export function formatDate(
  date: Date | string | null | undefined,
  style: 'short' | 'medium' | 'long' | 'full' | 'iso' = 'medium',
): string {
  const d = parseDate(date)
  if (!d) return ''

  const formats = {
    short: 'M/d/yy', // 1/15/25
    medium: 'MMM d, yyyy', // Jan 15, 2025
    long: 'MMMM d, yyyy', // January 15, 2025
    full: 'EEEE, MMMM d, yyyy', // Wednesday, January 15, 2025
    iso: 'yyyy-MM-dd', // 2025-01-15
  }

  return format(d, formats[style])
}

/**
 * Format a date with time
 *
 * @example
 * formatDateTime(new Date()) // "Jan 15, 2025 at 2:30 PM"
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  style: 'short' | 'medium' | 'long' = 'medium',
): string {
  const d = parseDate(date)
  if (!d) return ''

  const formats = {
    short: 'M/d/yy h:mm a', // 1/15/25 2:30 PM
    medium: "MMM d, yyyy 'at' h:mm a", // Jan 15, 2025 at 2:30 PM
    long: "MMMM d, yyyy 'at' h:mm:ss a", // January 15, 2025 at 2:30:45 PM
  }

  return format(d, formats[style])
}

/**
 * Format a date relative to now
 *
 * @example
 * formatRelativeDate(yesterday) // "yesterday at 2:30 PM"
 * formatRelativeDate(lastWeek) // "last Friday at 2:30 PM"
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  const d = parseDate(date)
  if (!d) return ''
  return formatRelative(d, new Date())
}

/**
 * Format time elapsed from a date to now
 *
 * @example
 * formatTimeAgo(twoHoursAgo) // "about 2 hours ago"
 * formatTimeAgo(yesterday) // "1 day ago"
 */
export function formatTimeAgo(
  date: Date | string | null | undefined,
  options?: { addSuffix?: boolean },
): string {
  const d = parseDate(date)
  if (!d) return ''
  return formatDistanceToNow(d, { addSuffix: options?.addSuffix ?? true })
}

/**
 * Format a time only
 *
 * @example
 * formatTime(new Date()) // "2:30 PM"
 */
export function formatTime(date: Date | string | null | undefined): string {
  const d = parseDate(date)
  if (!d) return ''
  return format(d, 'h:mm a')
}

// =============================================================================
// Date Math
// =============================================================================

/**
 * Get days between two dates
 */
export function daysBetween(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
): number | null {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (!start || !end) return null
  return differenceInDays(end, start)
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string | null | undefined): number | null {
  const d = parseDate(birthDate)
  if (!d) return null
  return differenceInYears(new Date(), d)
}

// =============================================================================
// Date Ranges
// =============================================================================

/**
 * Get preset date ranges for filtering
 */
export function getDateRangePresets() {
  const today = new Date()

  return {
    today: {
      label: 'Today',
      start: startOfDay(today),
      end: endOfDay(today),
    },
    yesterday: {
      label: 'Yesterday',
      start: startOfDay(addDays(today, -1)),
      end: endOfDay(addDays(today, -1)),
    },
    last7Days: {
      label: 'Last 7 Days',
      start: startOfDay(addDays(today, -6)),
      end: endOfDay(today),
    },
    last30Days: {
      label: 'Last 30 Days',
      start: startOfDay(addDays(today, -29)),
      end: endOfDay(today),
    },
    thisMonth: {
      label: 'This Month',
      start: startOfMonth(today),
      end: endOfMonth(today),
    },
    lastMonth: {
      label: 'Last Month',
      start: startOfMonth(addMonths(today, -1)),
      end: endOfMonth(addMonths(today, -1)),
    },
  }
}

// =============================================================================
// Date Comparisons
// =============================================================================

export { isBefore, isAfter, isSameDay, isValid, addDays, addMonths, startOfDay }

// =============================================================================
// Currency Formatting
// =============================================================================

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// =============================================================================
// Phone Formatting
// =============================================================================

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
