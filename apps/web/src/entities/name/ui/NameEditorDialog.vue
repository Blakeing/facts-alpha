<template>
  <FFullScreenDialog
    v-model="dialogValue"
    :busy="busy"
    :error="error"
    :title="title"
    @close="close"
  >
    <template #toolbar>
      <FButton @click="save"> OK </FButton>
    </template>

    <v-container
      class="pa-4"
      fluid
    >
      <v-row justify="center">
        <v-col
          cols="12"
          lg="10"
          xl="8"
        >
          <FFormProvider
            :get-error="getError"
            :touch="touch"
            :validate-if-touched="validateIfTouched"
          >
            <NamePanel
              v-if="model"
              :hide-company="hideCompany"
              :hide-dates="hideDates"
              :hide-deceased-info="hideDeceasedInfo"
              :hide-demo="hideDemo"
              :hide-email="hideEmail"
              :hide-military="hideMilitary"
              :hide-phone="hidePhone"
              :hide-relationships="hideRelationships"
              :hide-s-s-n="hideSSN"
              :inverse-relations="inverseRelations"
              :is-name-required="isNameRequired"
              :model="model as Name"
              :name-part-readonly="!namePartEditable"
              :people-list="peopleList"
              :relations="relations"
              :show-opt-out-marketing="showOptOutMarketing"
              @set-relation="handleRelationSelected"
            />
          </FFormProvider>
        </v-col>
      </v-row>
    </v-container>
  </FFullScreenDialog>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { computed, ref, watch } from 'vue'
  import {
    FButton,
    FFormProvider,
    FFullScreenDialog,
    useDirtyForm,
    useFormModel,
  } from '@/shared/ui'
  import { nameSchema } from '../model/nameSchema'
  import { createEmptyName } from '../model/useNameModel'
  import NamePanel from './NamePanel.vue'

  interface PersonRelation {
    id: string
    description: string
  }

  interface PersonInverseRelation {
    id: string
    description: string
  }

  const props = defineProps<{
    modelValue: boolean
    title: string
    model?: Name | null
    namePartEditable?: boolean
    hideCompany?: boolean
    hideSSN?: boolean
    hideDates?: boolean
    hideEmail?: boolean
    hidePhone?: boolean
    hideDeceasedInfo?: boolean
    hideDemo?: boolean
    hideMilitary?: boolean
    hideRelationships?: boolean
    peopleList?: Name[]
    relations?: PersonRelation[]
    inverseRelations?: PersonInverseRelation[]
    showOptOutMarketing?: boolean
    isNameRequired?: boolean
    saveWithoutAutoClose?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: [model: Name]
    'set-relation': [currentPersonId: string, relation: string, relatedNameId: string]
  }>()

  const dialogValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })

  const busy = ref(false)
  const error = ref<string | null>(null)

  // Form model with validation
  const { model, validate, getError, touch, validateIfTouched, reset } = useFormModel(
    nameSchema,
    () => props.model ?? createEmptyName(),
  )

  // Dirty tracking for unsaved changes
  const { takeSnapshot, canClose } = useDirtyForm(() => model.value)

  // Reset form when dialog opens
  watch(dialogValue, (visible) => {
    if (visible) {
      error.value = null
      reset(props.model ?? createEmptyName())
      takeSnapshot()
    }
  })

  // Update form when model prop changes (only if dialog is open)
  watch(
    () => props.model,
    (newValue) => {
      if (dialogValue.value) {
        reset(newValue ?? createEmptyName())
        takeSnapshot()
      }
    },
  )

  async function close() {
    const confirmed = await canClose(() =>
      Promise.resolve(confirm('You have unsaved changes. Discard them?')),
    )
    if (confirmed) {
      emit('update:modelValue', false)
    }
  }

  function save() {
    const { valid } = validate()
    if (!valid) {
      error.value = 'Please fix validation errors before saving'
      return
    }

    // Convert form values to Name (ensure required fields are set)
    // Note: Nested arrays (phones, addresses, emails) may need timestamps added
    // but for now we cast since the schema validation ensures structure is correct
    const now = new Date().toISOString()
    const nameToSave = {
      ...model.value,
      id: model.value.id ?? props.model?.id ?? '0',
      dateCreated: props.model?.dateCreated ?? now,
      dateLastModified: now,
    } as Name

    emit('save', nameToSave)
    takeSnapshot() // Reset dirty state after save
    if (!props.saveWithoutAutoClose) {
      emit('update:modelValue', false)
    }
  }

  function handleRelationSelected(
    currentPersonId: string,
    relation: string,
    relatedNameId: string,
  ) {
    emit('set-relation', currentPersonId, relation, relatedNameId)
  }
</script>
