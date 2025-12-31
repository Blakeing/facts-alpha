<!-- eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable -->
<template>
  <div>
    <v-row dense>
      <v-col>
        <FTextField
          v-model="model.prefix"
          field="prefix"
          label="Prefix"
          maxlength="50"
          :readonly="namePartReadonly"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="model.first"
          field="first"
          label="First"
          maxlength="255"
          :readonly="namePartReadonly"
          :required="isNameRequired"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="model.middle"
          field="middle"
          label="Middle"
          maxlength="255"
          :readonly="namePartReadonly"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="model.last"
          field="last"
          label="Last"
          maxlength="255"
          :readonly="namePartReadonly"
          :required="isNameRequired"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="model.suffix"
          field="suffix"
          label="Suffix"
          maxlength="50"
          :readonly="namePartReadonly"
        />
      </v-col>
    </v-row>
  </div>
</template>
<!-- eslint-enable vue/no-mutating-props -->

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { FTextField } from '@/shared/ui'

  /**
   * NamePartName - Name fields (prefix, first, middle, last, suffix)
   *
   * WORKING COPY PATTERN:
   * This component receives a mutable Name object from the parent (NamePanel).
   * Direct v-model binding mutates the model, which is intentional and expected.
   * The parent (NameEditorDialog) owns the model lifecycle and clones it.
   */

  defineProps<{
    model: Name // Mutable working copy
    namePartReadonly?: boolean
    isNameRequired?: boolean
  }>()

  // No emits needed - direct mutation via v-model
  // No computed properties - just pass model.field directly to v-model
</script>
