<script lang="ts" setup generic="TValue">
  /**
   * FFieldArray - Renderless component for dynamic field arrays
   *
   * Exposes field array operations via scoped slots for flexible UI composition.
   *
   * @example
   * <FFieldArray name="services" #default="{ fields, push, remove }">
   *   <div v-for="(field, index) in fields" :key="field.key">
   *     <FTextField :name="`services[${index}].name`" label="Service Name" />
   *     <FButton intent="danger" @click="remove(index)">Remove</FButton>
   *   </div>
   *   <FButton intent="secondary" @click="push({ name: '' })">Add Service</FButton>
   * </FFieldArray>
   */
  import { useFieldArray, type FieldEntry } from 'vee-validate'
  import { computed } from 'vue'

  export interface FFieldArrayProps {
    /** Field path in the form schema */
    name: string
  }

  export interface FFieldArraySlotProps<T> {
    /** Array of field entries with key and value */
    fields: FieldEntry<T>[]
    /** Add a new item to the end of the array */
    push: (value: T) => void
    /** Add a new item at a specific index */
    insert: (index: number, value: T) => void
    /** Remove an item at a specific index */
    remove: (index: number) => void
    /** Replace an item at a specific index */
    replace: (index: number, value: T) => void
    /** Move an item from one index to another */
    move: (fromIndex: number, toIndex: number) => void
    /** Swap two items */
    swap: (indexA: number, indexB: number) => void
    /** Prepend an item to the beginning */
    prepend: (value: T) => void
    /** Update an item at a specific index */
    update: (index: number, value: T) => void
  }

  const props = defineProps<FFieldArrayProps>()

  const fieldArray = useFieldArray<TValue>(props.name)

  const fields = computed(() => fieldArray.fields.value)
</script>

<template>
  <slot
    :fields="fields"
    :insert="fieldArray.insert"
    :move="fieldArray.move"
    :prepend="fieldArray.prepend"
    :push="fieldArray.push"
    :remove="fieldArray.remove"
    :replace="fieldArray.replace"
    :swap="fieldArray.swap"
    :update="fieldArray.update"
  />
</template>
