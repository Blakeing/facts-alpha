/**
 * Typography tokens for the Facts UI design system
 *
 * Clean, readable typography suitable for business applications.
 */

export const fontFamily = {
  /** Primary font for UI text */
  sans: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  /** Monospace for code, IDs, numbers */
  mono: '"Roboto Mono", "Consolas", monospace',
} as const

export const fontSize = {
  /** 12px - Fine print, labels */
  xs: '0.75rem',
  /** 14px - Secondary text, captions */
  sm: '0.875rem',
  /** 16px - Body text (base) */
  md: '1rem',
  /** 18px - Emphasized body, subtitles */
  lg: '1.125rem',
  /** 20px - Section headers */
  xl: '1.25rem',
  /** 24px - Page titles */
  '2xl': '1.5rem',
  /** 30px - Major headings */
  '3xl': '1.875rem',
  /** 36px - Display text */
  '4xl': '2.25rem',
} as const

export const fontWeight = {
  /** 300 - Light, for large display text */
  light: 300,
  /** 400 - Regular body text */
  regular: 400,
  /** 500 - Medium, for emphasis */
  medium: 500,
  /** 600 - Semibold, for headings */
  semibold: 600,
  /** 700 - Bold, for strong emphasis */
  bold: 700,
} as const

export const lineHeight = {
  /** Tight - for headings */
  tight: 1.25,
  /** Normal - for body text */
  normal: 1.5,
  /** Relaxed - for readable paragraphs */
  relaxed: 1.75,
} as const

// Pre-composed text styles
export const textStyles = {
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.light,
    lineHeight: lineHeight.tight,
  },
  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.tight,
  },
  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
  },
  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
  },
  h5: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  },
  h6: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
  },
  body1: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },
  body2: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },
  button: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.0892857143em',
  },
} as const

export type FontSize = keyof typeof fontSize
export type FontWeight = keyof typeof fontWeight
export type TextStyle = keyof typeof textStyles
