/**
 * Enum choice definition for UI controls
 *
 * @template TEnum - The TypeScript enum type
 */
export interface EnumChoice<TEnum extends number = number> {
  id: TEnum // Enum numeric value
  name: string // Display label
}

/**
 * Base class for enum controllers that provide display labels
 * and UI integration for numeric enums.
 *
 * Since Facts Alpha now uses numeric enums matching the BFF exactly,
 * no conversion is needed - just label/display helpers.
 *
 * @template TEnum - The TypeScript enum type
 *
 * @example
 * ```typescript
 * // Get description for display (legacy-compatible)
 * const label = saleStatusController.getDescription(SaleStatus.DRAFT);
 *
 * // Use in select component
 * <FEnumSelect :controller="saleStatusController" v-model="status" />
 * ```
 */
export abstract class EnumController<TEnum extends number = number> {
  public abstract choices: EnumChoice<TEnum>[]

  /**
   * Get sorted choices (alphabetically by name)
   */
  get sortedChoices(): EnumChoice<TEnum>[] {
    return this.choices.toSorted((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Get choices formatted for select components
   * (Vuetify v-select format)
   */
  get selectItems(): Array<{ title: string; value: TEnum }> {
    return this.choices.map((c) => ({
      title: c.name,
      value: c.id,
    }))
  }

  /**
   * Get description by enum value (legacy-compatible method name)
   * @param id - Numeric enum value
   * @param missing - Default label if not found
   */
  getDescription(id: TEnum, missing = 'Unknown'): string {
    return this.choices.find((c) => c.id === id)?.name ?? missing
  }

}
