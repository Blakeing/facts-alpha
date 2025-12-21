/**
 * Brand color tokens for the Facts UI design system
 *
 * These are the custom brand colors that override MD3 Blueprint defaults.
 * The MD3 Blueprint handles all other color roles (surfaces, containers, etc.)
 *
 * @see https://m3.material.io/styles/color/overview
 */

/**
 * Brand colors for the funeral home ERP
 * - Primary: Deep indigo for professionalism and trust
 * - Secondary: Warm brown for comfort and warmth
 */
export const brandColors = {
  /** Deep indigo - primary brand color */
  primary: '#1660c4',
  /** Warm brown - secondary accent */
  secondary: '#67544e',
  /** Error red - M3 compliant */
  error: '#ba1a1a',
  /** Success green */
  success: '#2e7d32',
  /** Warning orange */
  warning: '#f57c00',
  /** Info blue */
  info: '#1976d2',
} as const

export type BrandColor = keyof typeof brandColors
