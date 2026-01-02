<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card
          class="mb-4"
          elevation="0"
          variant="outlined"
        >
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <v-icon
                class="mr-2"
                color="primary"
              >
                mdi-account-group
              </v-icon>
              <h2 class="text-h6 mb-0">People</h2>
              <v-chip
                v-if="people.length > 0"
                class="ml-3"
                color="primary"
                size="small"
                variant="tonal"
              >
                {{ people.length }}
              </v-chip>
            </div>
            <div>
              <v-menu
                v-if="!isReadOnly"
                v-model="showAddMenu"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <FButton
                    v-bind="menuProps"
                    prepend-icon="mdi-plus"
                  >
                    Add Person
                  </FButton>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-if="!hasPrimaryBuyer"
                    @click="handleAddPrimaryBuyer"
                  >
                    <v-list-item-title>Add Primary Buyer</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="handleAddCoBuyer">
                    <v-list-item-title>Add Co-Buyer</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="!hasPrimaryBeneficiary"
                    @click="handleAddPrimaryBeneficiary"
                  >
                    <v-list-item-title>Add Primary Beneficiary</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="handleAddBeneficiary">
                    <v-list-item-title>Add Additional Beneficiary</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="handleAddPerson">
                    <v-list-item-title>Add Other Person</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Person tabs sidebar -->
      <v-col
        v-if="people.length > 0"
        cols="12"
        md="3"
      >
        <v-card
          elevation="0"
          variant="outlined"
        >
          <v-card-title class="text-subtitle-2 pa-3 pb-2"> Select Person </v-card-title>
          <v-divider />
          <v-tabs
            v-model="activeTab"
            class="pa-2"
            direction="vertical"
          >
            <v-tab
              v-for="(person, index) in people"
              :key="`tab-${index}`"
              class="text-left justify-start"
              :value="index"
            >
              <div class="d-flex flex-column align-start w-100">
                <div
                  v-if="getPersonTypeLabel(person)"
                  class="text-caption text-medium-emphasis mb-1"
                >
                  {{ getPersonTypeLabel(person) }}
                </div>
                <div class="text-body-2 font-weight-medium">
                  {{ getDisplayName(person) || 'New Person' }}
                </div>
              </div>
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>

      <!-- Person content -->
      <v-col
        :cols="people.length > 0 ? 12 : 12"
        :md="people.length > 0 ? 9 : 12"
      >
        <v-alert
          v-if="people.length === 0"
          class="mt-4"
          type="info"
          variant="tonal"
        >
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <div class="text-body-1">No people added yet. Click "Add Person" to get started.</div>
        </v-alert>

        <template v-else-if="currentPerson">
          <ContractPersonSummary
            :can-remove="canRemovePerson(currentPerson)"
            :display-name="getDisplayName(currentPerson)"
            :is-deceased="isPersonDeceased(currentPerson)"
            :is-read-only="isReadOnly"
            :name="currentPerson.name"
            :person-type-label="getPersonTypeLabel(currentPerson)"
            @edit="editPerson(currentPerson)"
            @remove="removePerson(currentPerson)"
          />
        </template>
      </v-col>
    </v-row>

    <!-- Name Editor Dialog -->
    <NameEditorDialog
      v-model="editDialog.visible"
      :hide-company="false"
      :hide-deceased-info="false"
      :hide-s-s-n="false"
      :is-name-required="true"
      :model="editDialog.model"
      :name-part-editable="true"
      :people-list="peopleNames"
      :show-opt-out-marketing="false"
      :title="editDialog.title"
      @save="saveName"
    />

    <!-- Remove Person Confirmation Dialog -->
    <FConfirmDialog
      v-model="removeConfirm.isOpen.value"
      v-bind="removeConfirm.options.value"
      @cancel="removeConfirm.handleCancel"
      @confirm="removeConfirm.handleConfirm"
    />
  </v-container>
</template>

<script lang="ts" setup>
  import { runEffect } from '@facts/effect'
  import { computed, ref, watch } from 'vue'
  import { type ContractPerson, ContractPersonRole, SaleStatus } from '@/entities/contract'
  import { contractPersonRoleController } from '@/entities/contract'
  import { createEmptyName, getFormattedName, type Name } from '@/entities/name'
  import { NameEditorDialog } from '@/entities/name/ui'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { nextIds } from '@/shared/api'
  import { FButton, FConfirmDialog, useConfirm } from '@/shared/ui'
  import ContractPersonSummary from './ContractPersonSummary.vue'

  // Inject editor context
  const editor = useContractEditorContext()
  const draft = computed(() => editor.draft.value)

  // People from draft (unsorted - original order)
  const peopleUnsorted = computed(() => draft.value?.people ?? [])

  // People from draft, sorted by role priority:
  // Primary Buyer > Co-Buyer > Primary Beneficiary > Additional Beneficiary > Person
  const people = computed(() => {
    const peopleList = draft.value?.people ?? []
    if (peopleList.length === 0) return []

    // Sort by role priority, then by name for same priority
    return peopleList.toSorted((a, b) => {
      const priorityA = contractPersonRoleController.getRolePriority(a.roles)
      const priorityB = contractPersonRoleController.getRolePriority(b.roles)
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      // Same priority - sort by name
      const nameA = getFormattedName(a.name) || ''
      const nameB = getFormattedName(b.name) || ''
      return nameA.localeCompare(nameB)
    })
  })

  // People names for validation
  const peopleNames = computed(() => {
    return people.value.filter((p) => p.name).map((p) => p.name!)
  })

  // Read-only if executed or voided
  const isReadOnly = computed(() => {
    const status = draft.value?.meta.status
    return status === SaleStatus.EXECUTED || status === SaleStatus.VOID
  })

  // UI State
  const activeTab = ref(0)
  const showAddMenu = ref(false)

  // Track person ID we're waiting to appear (for setting active tab after add)
  const pendingPersonId = ref<string | null>(null)

  // Remove person confirmation dialog
  const removeConfirm = useConfirm()
  const personToRemove = ref<ContractPerson | null>(null)

  // Watch people list and adjust active tab
  watch(people, (newList) => {
    if (newList.length === 0) {
      activeTab.value = 0
    } else if (activeTab.value >= newList.length) {
      activeTab.value = 0
    }

    // If we're waiting for a person to appear, find them and set active tab
    if (pendingPersonId.value) {
      const personIndex = newList.findIndex((p) => p.id === pendingPersonId.value)
      if (personIndex !== -1) {
        activeTab.value = personIndex
        pendingPersonId.value = null // Clear the pending ID
      }
    }
  })

  // Current person
  const currentPerson = computed(() => {
    if (people.value.length === 0) return null
    const index = activeTab.value
    if (index < 0 || index >= people.value.length) return null
    return people.value[index]
  })

  // Role helpers
  function hasRole(person: ContractPerson, role: ContractPersonRole): boolean {
    return (person.roles & role) === role
  }

  function isPrimaryRole(person: ContractPerson): boolean {
    return (
      hasRole(person, ContractPersonRole.PRIMARY_BUYER) ||
      hasRole(person, ContractPersonRole.PRIMARY_BENEFICIARY)
    )
  }

  // Check if primary roles already exist
  const hasPrimaryBuyer = computed(() => {
    return people.value.some((p) => hasRole(p, ContractPersonRole.PRIMARY_BUYER))
  })

  const hasPrimaryBeneficiary = computed(() => {
    return people.value.some((p) => hasRole(p, ContractPersonRole.PRIMARY_BENEFICIARY))
  })

  // Display helpers
  function getDisplayName(person: ContractPerson): string {
    if (!person.name) return ''
    return getFormattedName(person.name) || ''
  }

  function isPersonDeceased(person: ContractPerson): boolean {
    return !!(person.name?.deceased || person.name?.deathDate)
  }

  function getPersonTypeLabel(person: ContractPerson): string {
    return contractPersonRoleController.getDescription(person.roles)
  }

  function canRemovePerson(person: ContractPerson): boolean {
    if (isPrimaryRole(person)) return false
    const isSecondary =
      hasRole(person, ContractPersonRole.CO_BUYER) ||
      hasRole(person, ContractPersonRole.ADDITIONAL_BENEFICIARY)
    if (isReadOnly.value && isSecondary) return false
    return true
  }

  // Factory for creating new person - fetches real IDs from server (like legacy)
  async function createEmptyPerson(role: ContractPersonRole): Promise<ContractPerson> {
    // Get 2 IDs: one for person, one for name (matches legacy pattern)
    const ids = await runEffect(nextIds(2))
    const personId = ids[0] || ''
    const nameId = ids[1] || ''

    const emptyName = createEmptyName()
    return {
      id: personId,
      contractId: draft.value?.id ?? '',
      nameId: nameId,
      roles: role,
      addedAfterContractExecution: false,
      conversion: null,
      conversionId: null,
      conversionSource: null,
      name: {
        ...emptyName,
        id: nameId,
      },
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
    }
  }

  // Open dialog to add a new person (person only added when they save)
  async function openAddPersonDialog(role: ContractPersonRole, title: string) {
    showAddMenu.value = false
    const newPerson = await createEmptyPerson(role)
    editDialog.value = {
      visible: true,
      model: newPerson.name,
      title,
      personId: newPerson.id,
      newPerson,
    }
  }

  function handleAddPrimaryBuyer() {
    openAddPersonDialog(ContractPersonRole.PRIMARY_BUYER, 'Add Primary Buyer')
  }
  function handleAddPrimaryBeneficiary() {
    openAddPersonDialog(ContractPersonRole.PRIMARY_BENEFICIARY, 'Add Primary Beneficiary')
  }
  function handleAddCoBuyer() {
    openAddPersonDialog(ContractPersonRole.CO_BUYER, 'Add Co-Buyer')
  }
  function handleAddBeneficiary() {
    openAddPersonDialog(ContractPersonRole.ADDITIONAL_BENEFICIARY, 'Add Additional Beneficiary')
  }
  function handleAddPerson() {
    openAddPersonDialog(ContractPersonRole.PERSON, 'Add Person')
  }

  async function removePerson(person: ContractPerson) {
    personToRemove.value = person
    const confirmed = await removeConfirm.confirm({
      title: 'Remove Person',
      message: `Are you sure you want to remove "${getDisplayName(person)}" from this contract?`,
      confirmText: 'Remove',
      confirmColor: 'error',
      cancelText: 'Cancel',
    })

    if (confirmed && personToRemove.value) {
      // Remove from unsorted array to preserve order
      const filtered = peopleUnsorted.value.filter((p) => p.id !== personToRemove.value!.id)
      editor.setField('people', filtered)
      personToRemove.value = null
    } else {
      personToRemove.value = null
    }
  }

  // Edit dialog state
  const editDialog = ref({
    visible: false,
    model: null as Name | null,
    title: '',
    personId: '',
    newPerson: null as ContractPerson | null, // Store new person until they save
  })

  function editPerson(person: ContractPerson) {
    editDialog.value = {
      visible: true,
      model: person.name ? { ...person.name } : createEmptyName(),
      title: `Edit ${getDisplayName(person) || 'Person'}`,
      personId: person.id,
      newPerson: null, // Not a new person, editing existing
    }
  }

  function saveName(updatedName: Name) {
    // If this is a new person, add them to the list
    if (editDialog.value.newPerson) {
      const newPerson: ContractPerson = {
        ...editDialog.value.newPerson,
        name: { ...updatedName, dateLastModified: new Date().toISOString() },
        dateLastModified: new Date().toISOString(),
      }
      const personId = newPerson.id
      // Add to unsorted array - sorting will happen in computed
      const updatedPeople = [...peopleUnsorted.value, newPerson]

      // Set pending person ID - the watch will detect when they appear and set active tab
      pendingPersonId.value = personId

      editor.setField('people', updatedPeople)

      editDialog.value.newPerson = null
      editDialog.value.visible = false
      return
    }

    // Otherwise, update existing person
    // Find in unsorted array to preserve original order
    const personIndex = peopleUnsorted.value.findIndex((p) => p.id === editDialog.value.personId)
    if (personIndex === -1) return

    const person = peopleUnsorted.value[personIndex]
    if (!person) return

    // Update person with new name
    const updatedPerson: ContractPerson = {
      ...person,
      name: { ...updatedName, dateLastModified: new Date().toISOString() },
      dateLastModified: new Date().toISOString(),
    }

    // Update the person in the array (preserve original order)
    const updatedPeople = [...peopleUnsorted.value]
    updatedPeople[personIndex] = updatedPerson
    editor.setField('people', updatedPeople)

    // Close dialog
    editDialog.value.visible = false
  }
</script>
