/**
 * useTypedFieldArray - Type-safe field array management with vee-validate
 *
 * This composable wraps vee-validate's useFieldArray to provide a type-safe API
 * for managing dynamic arrays of form fields.
 *
 * @example
 * // In a form with schema that has an array field
 * const { fields, push, remove, move } = useTypedFieldArray<ServiceItem>('services')
 *
 * // In template:
 * <div v-for="(field, index) in fields" :key="field.key">
 *   <FTextField :name="`services[${index}].name`" />
 *   <FButton @click="remove(index)">Remove</FButton>
 * </div>
 * <FButton @click="push({ name: '' })">Add Service</FButton>
 */

import { useFieldArray, type FieldEntry } from 'vee-validate'
import { computed, type ComputedRef } from 'vue'

export interface TypedFieldArrayReturn<TValue> {
  /** Array of field entries with key, value, and isFirst/isLast helpers */
  fields: ComputedRef<FieldEntry<TValue>[]>
  /** Add a new item to the end of the array */
  push: (value: TValue) => void
  /** Add a new item at a specific index */
  insert: (index: number, value: TValue) => void
  /** Remove an item at a specific index */
  remove: (index: number) => void
  /** Replace an item at a specific index */
  replace: (values: TValue[]) => void
  /** Move an item from one index to another */
  move: (fromIndex: number, toIndex: number) => void
  /** Swap two items */
  swap: (indexA: number, indexB: number) => void
  /** Prepend an item to the beginning */
  prepend: (value: TValue) => void
  /** Update an item at a specific index */
  update: (index: number, value: TValue) => void
}

/**
 * Creates a type-safe field array for dynamic form sections
 *
 * @param name - The field path in the form (e.g., 'services' or 'contacts')
 */
export function useTypedFieldArray<TValue = unknown>(
  name: string,
): TypedFieldArrayReturn<TValue> {
  const fieldArray = useFieldArray<TValue>(name)

  // Computed fields with proper typing
  const fields = computed(() => fieldArray.fields.value)

  return {
    fields,
    push: fieldArray.push,
    insert: fieldArray.insert,
    remove: fieldArray.remove,
    replace: fieldArray.replace,
    move: fieldArray.move,
    swap: fieldArray.swap,
    prepend: fieldArray.prepend,
    update: fieldArray.update,
  }
}
