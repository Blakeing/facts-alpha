<!--
  features/contract-dialog/ui/PersonEditor.vue

  Person editor dialog for editing/creating people within a contract.
  Renders as a nested dialog overlay on top of the contract dialog.
-->

<template>
  <FFullScreenDialog
    v-model="isOpen"
    :busy="busy"
    :capture-focus="false"
    :error="error"
    :title="dialogTitle"
    @after-leave="handleAfterLeave"
    @close="handleClose"
  >
    <template #toolbar>
      <FButton @click="handleSave"> OK </FButton>
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
            v-if="nameModel"
            ref="formRef"
            :get-error="getError"
            :touch="touch"
            :validate-if-touched="validateIfTouched"
          >
            <NamePanel
              :hide-company="false"
              :hide-dates="false"
              :hide-deceased-info="false"
              :hide-demo="false"
              :hide-email="false"
              :hide-military="false"
              :hide-phone="false"
              :hide-relationships="true"
              :hide-s-s-n="false"
              :is-name-required="true"
              :model="nameModel as Name"
              :name-part-readonly="isReadOnly"
              :people-list="peopleNames"
              :show-opt-out-marketing="false"
            />
          </FFormProvider>
        </v-col>
      </v-row>
    </v-container>

    <!-- Unsaved Changes Confirmation Dialog -->
    <FConfirmDialog
      v-model="unsavedConfirm.isOpen.value"
      v-bind="unsavedConfirm.options.value"
      @cancel="unsavedConfirm.handleCancel"
      @confirm="unsavedConfirm.handleConfirm"
    />
  </FFullScreenDialog>
</template>

<script lang="ts" setup>
  import { runEffect } from '@facts/effect'
  import { computed, onMounted, ref, watch } from 'vue'
  import { type ContractPerson, SaleStatus } from '@/entities/contract'
  import { createEmptyName, getFormattedName, type Name, nameSchema } from '@/entities/name'
  import NamePanel from '@/entities/name/ui/NamePanel.vue'
  import { nextIds } from '@/shared/api'
  import {
    FButton,
    FConfirmDialog,
    FFormProvider,
    FFullScreenDialog,
    useConfirm,
    useDirtyForm,
    useFormModel,
  } from '@/shared/ui'
  import { useContractEditorContext } from '../model/useContractEditorContext'

  interface Props {
    /** Person ID to edit, or 'new' to create a new person */
    personId: string
    /** Contract ID */
    contractId: string
    /** Role for new persons (from ContractPersonRole enum) */
    role?: number
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    close: []
    saved: [personId: string]
  }>()

  // Inject editor context from provider
  const editor = useContractEditorContext()
  const draft = computed(() => editor.draft.value)

  // Dialog state
  const isOpen = ref(false)
  const busy = ref(false)
  const error = ref<string | null>(null)

  // Find the person in the draft
  const currentPerson = computed(() => {
    if (!draft.value || !props.personId) return null
    return draft.value.people.find((p) => p.id === props.personId) ?? null
  })

  // Determine if this is a new person
  const isNewPerson = computed(() => {
    return props.personId === 'new' || !currentPerson.value
  })

  // People names for validation (exclude current person)
  const peopleNames = computed(() => {
    if (!draft.value?.people) return []
    return draft.value.people.filter((p) => p.name && p.id !== props.personId).map((p) => p.name!)
  })

  // Read-only if executed or voided
  const isReadOnly = computed(() => {
    const status = draft.value?.meta.status
    return status === SaleStatus.EXECUTED || status === SaleStatus.VOID
  })

  // Dialog title
  const dialogTitle = computed(() => {
    if (isNewPerson.value) {
      return 'Add Person'
    }
    const name = currentPerson.value?.name
    if (name) {
      const displayName = getFormattedName(name) || 'Person'
      return `Edit ${displayName}`
    }
    return 'Edit Person'
  })

  // Form model with validation
  const {
    model: nameModel,
    validate,
    getError,
    touch,
    validateIfTouched,
    reset,
  } = useFormModel(nameSchema, () => {
    if (isNewPerson.value) {
      return createEmptyName()
    }
    return currentPerson.value?.name ? { ...currentPerson.value.name } : createEmptyName()
  })

  // Dirty tracking for unsaved changes
  const { takeSnapshot, canClose } = useDirtyForm(() => nameModel.value)

  // Unsaved changes confirmation dialog
  const unsavedConfirm = useConfirm()

  // Template ref for form
  const formRef = ref<InstanceType<typeof FFormProvider> | null>(null)

  // Track if we've taken the initial snapshot
  const hasTakenInitialSnapshot = ref(false)

  // Initialize form when person changes
  watch(
    () => props.personId,
    () => {
      error.value = null
      hasTakenInitialSnapshot.value = false // Reset snapshot flag when person changes
      if (isNewPerson.value) {
        reset(createEmptyName())
      } else if (currentPerson.value?.name) {
        reset({ ...currentPerson.value.name })
      } else {
        reset(createEmptyName())
      }
    },
    { immediate: true },
  )

  // Open dialog when mounted
  onMounted(() => {
    isOpen.value = true
  })

  // Take snapshot once form is rendered in DOM (no nextTick needed)
  watch(
    [() => isOpen.value, () => nameModel.value, () => formRef.value],
    ([open, model, form]) => {
      if (open && model && form && !hasTakenInitialSnapshot.value) {
        // Form is rendered, safe to take snapshot
        takeSnapshot()
        hasTakenInitialSnapshot.value = true
      }
    },
    { immediate: true },
  )

  async function handleClose() {
    const confirmed = await canClose(() =>
      unsavedConfirm.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Discard them?',
        confirmText: 'Discard',
        confirmColor: 'error',
        cancelText: 'Cancel',
      }),
    )
    if (confirmed) {
      isOpen.value = false
    }
  }

  function handleAfterLeave() {
    // Animation complete, tell parent to clean up
    emit('close')
  }

  async function handleSave() {
    const { valid } = validate()
    if (!valid) {
      error.value = 'Please fix validation errors before saving'
      return
    }

    busy.value = true
    error.value = null

    try {
      // Convert form values to Name
      const now = new Date().toISOString()
      const nameToSave = {
        ...nameModel.value,
        id: nameModel.value.id ?? currentPerson.value?.nameId ?? '0',
        dateCreated: currentPerson.value?.name?.dateCreated ?? now,
        dateLastModified: now,
      } as Name

      let savedPersonId = props.personId

      if (isNewPerson.value) {
        // Create new person
        const ids = await runEffect(nextIds(2))
        const newPersonId = ids[0] || ''
        const newNameId = ids[1] || ''

        const newPerson: ContractPerson = {
          id: newPersonId,
          contractId: props.contractId,
          nameId: newNameId,
          roles: props.role ?? 0,
          addedAfterContractExecution: false,
          conversion: null,
          conversionId: null,
          conversionSource: null,
          name: {
            ...nameToSave,
            id: newNameId,
          },
          dateCreated: now,
          dateLastModified: now,
        }

        // Add to people list
        const updatedPeople = [...(draft.value?.people ?? []), newPerson]
        editor.setField('people', updatedPeople)
        savedPersonId = newPersonId
      } else {
        // Update existing person
        const people = draft.value?.people ?? []
        const personIndex = people.findIndex((p) => p.id === props.personId)
        const person = people[personIndex]

        if (personIndex === -1 || !person) {
          error.value = 'Person not found'
          busy.value = false
          return
        }

        const updatedPerson: ContractPerson = {
          ...person,
          name: { ...nameToSave, id: person.nameId },
          dateLastModified: now,
        }

        const updatedPeople = [...people]
        updatedPeople[personIndex] = updatedPerson
        editor.setField('people', updatedPeople)
      }

      takeSnapshot()
      // Emit saved FIRST (parent can select synchronously)
      emit('saved', savedPersonId)
      // Then start close animation
      isOpen.value = false
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Failed to save person'
    } finally {
      busy.value = false
    }
  }
</script>
