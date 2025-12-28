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
          <NamePanel
            v-if="editModel"
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
            :model="editModel"
            :name-part-readonly="!namePartEditable"
            :people-list="peopleList"
            :relations="relations"
            :show-opt-out-marketing="showOptOutMarketing"
            @set-relation="handleRelationSelected"
          />
        </v-col>
      </v-row>
    </v-container>
  </FFullScreenDialog>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { computed, ref, watch } from 'vue'
  import { FButton, FFullScreenDialog } from '@/shared/ui'
  import { PhoneType } from '../model/name'
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
  const editModel = ref<Name | null>(null)

  function deepCopy<T>(obj: T): T {
    return structuredClone(obj)
  }

  // Ensure all required arrays exist on the model
  function ensureArraysExist() {
    if (!editModel.value) return
    if (!Array.isArray(editModel.value.phones)) {
      editModel.value.phones = []
    }
    if (!Array.isArray(editModel.value.addresses)) {
      editModel.value.addresses = []
    }
    if (!Array.isArray(editModel.value.emailAddresses)) {
      editModel.value.emailAddresses = []
    }
    if (!Array.isArray(editModel.value.relations)) {
      editModel.value.relations = []
    }
  }

  function ensurePhone() {
    if (!editModel.value) return
    ensureArraysExist()
    if (editModel.value.phones.length === 0) {
      editModel.value.phones.push({
        id: '0',
        nameId: editModel.value.id || '0',
        number: '',
        type: PhoneType.MOBILE,
        preferred: true,
        active: true,
        dateCreated: new Date().toISOString(),
        dateLastModified: new Date().toISOString(),
      })
    }
  }

  function ensureEmail() {
    if (!editModel.value) return
    ensureArraysExist()
    if (editModel.value.emailAddresses.length === 0) {
      editModel.value.emailAddresses.push({
        id: '0',
        nameId: editModel.value.id || '0',
        address: '',
        preferred: true,
        active: true,
        dateCreated: new Date().toISOString(),
        dateLastModified: new Date().toISOString(),
      })
    }
  }

  watch(
    () => props.model,
    (newValue) => {
      if (newValue) {
        editModel.value = deepCopy(newValue)
        ensurePhone()
        ensureEmail()
      } else {
        editModel.value = null
      }
    },
    { immediate: true },
  )

  function close() {
    emit('update:modelValue', false)
  }

  function save() {
    if (!editModel.value) return
    emit('save', editModel.value)
    if (!props.saveWithoutAutoClose) {
      close()
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
