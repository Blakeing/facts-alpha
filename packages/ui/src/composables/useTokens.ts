/**
 * Composable for accessing brand color tokens in Vue components
 *
 * With MD3 Blueprint, most design tokens are handled by Vuetify.
 * This composable provides access to brand colors if needed.
 */

import { brandColors } from '../tokens/colors'

export function useTokens() {
  return {
    brandColors,
  }
}
