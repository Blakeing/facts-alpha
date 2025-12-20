/**
 * Composable for accessing design tokens in Vue components
 */

import { colors, vuetifyColors } from '../tokens/colors'
import { spacing, vuetifySpacing, componentSpacing } from '../tokens/spacing'
import { fontFamily, fontSize, fontWeight, lineHeight, textStyles } from '../tokens/typography'

export function useTokens() {
  return {
    colors,
    vuetifyColors,
    spacing,
    vuetifySpacing,
    componentSpacing,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    textStyles,
  }
}

