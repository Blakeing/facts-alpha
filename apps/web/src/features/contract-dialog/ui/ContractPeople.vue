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
                    prepend-icon="mdi-account-plus"
                    @click="handleAddCoBuyer"
                  >
                    <v-list-item-title>Add Co-Buyer</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-account-plus"
                    @click="handleAddBeneficiary"
                  >
                    <v-list-item-title>Add Additional Beneficiary</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-account-plus"
                    @click="handleAddPerson"
                  >
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
                <v-chip
                  v-if="person.name?.deceased || person.name?.deathDate"
                  class="mt-1"
                  color="error"
                  size="x-small"
                  variant="tonal"
                >
                  Deceased
                </v-chip>
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
          <FCard>
            <template #title>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center flex-wrap gap-2">
                  <div>
                    <div class="text-h6 font-weight-medium">
                      {{ getDisplayName(currentPerson) || 'New Person' }}
                    </div>
                  </div>
                  <v-chip
                    v-if="getPersonTypeLabel(currentPerson)"
                    color="primary"
                    size="small"
                    variant="tonal"
                  >
                    {{ getPersonTypeLabel(currentPerson) }}
                  </v-chip>
                </div>
                <div class="d-flex gap-1">
                  <v-tooltip text="Edit Person">
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-if="canEditPerson(currentPerson)"
                        v-bind="tooltipProps"
                        color="primary"
                        icon
                        size="small"
                        variant="text"
                        @click="editPerson(currentPerson)"
                      >
                        <v-icon>mdi-pencil-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Remove Person">
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-if="canRemovePerson(currentPerson)"
                        v-bind="tooltipProps"
                        color="error"
                        icon
                        size="small"
                        variant="text"
                        @click="removePerson(currentPerson)"
                      >
                        <v-icon>mdi-delete-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </template>

            <!-- Name panel - editable for new/empty persons, readonly otherwise -->
            <div
              v-if="currentPerson.name"
              class="pa-4"
            >
              <NamePanel
                :hide-company="false"
                :hide-deceased-info="false"
                :hide-s-s-n="false"
                :is-name-required="isNameRequired(currentPerson)"
                :model="currentPerson.name"
                :name-part-readonly="!isPersonEditable(currentPerson)"
                :people-list="peopleNames"
                :show-opt-out-marketing="false"
              />
            </div>
          </FCard>
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
  </v-container>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { type ContractPerson, ContractPersonRole, SaleStatus } from '@/entities/contract'
  import { contractPersonRoleController } from '@/entities/contract/model/ContractPersonRoleController'
  import { createEmptyName, getFormattedName, type Name } from '@/entities/name'
  import { NameEditorDialog, NamePanel } from '@/entities/name/ui'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { FButton, FCard } from '@/shared/ui'

  // Inject editor context
  const editor = useContractEditorContext()
  const draft = computed(() => editor.draft.value)

  // People from draft
  const people = computed(() => draft.value?.people ?? [])

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

  // Watch people list and adjust active tab
  watch(people, (newList) => {
    if (newList.length === 0) {
      activeTab.value = 0
    } else if (activeTab.value >= newList.length) {
      activeTab.value = 0
    }
  })

  // Current person
  const currentPerson = computed(() => {
    if (people.value.length === 0) return null
    const index = activeTab.value
    if (index < 0 || index >= people.value.length) return null
    return people.value[index]
  })

  // Role constants
  const { PRIMARY_BUYER, CO_BUYER, PRIMARY_BENEFICIARY, ADDITIONAL_BENEFICIARY, PERSON } =
    ContractPersonRole

  // Role helpers
  function hasRole(person: ContractPerson, role: ContractPersonRole): boolean {
    return (person.roles & role) === role
  }

  function isPrimaryBuyer(person: ContractPerson): boolean {
    return hasRole(person, PRIMARY_BUYER)
  }

  function isPrimaryBeneficiary(person: ContractPerson): boolean {
    return hasRole(person, PRIMARY_BENEFICIARY)
  }

  function isCoBuyer(person: ContractPerson): boolean {
    return hasRole(person, CO_BUYER)
  }

  function isAdditionalBeneficiary(person: ContractPerson): boolean {
    return hasRole(person, ADDITIONAL_BENEFICIARY)
  }

  // Display helpers
  function getDisplayName(person: ContractPerson): string {
    if (!person.name) return ''
    return getFormattedName(person.name) || ''
  }

  function getPersonTypeLabel(person: ContractPerson): string {
    return contractPersonRoleController.getDescription(person.roles)
  }

  // Permission checks
  function isPersonEditable(person: ContractPerson): boolean {
    if (isReadOnly.value) return false
    if (!person.name?.first || !person.name?.last) return true // Empty name = editable
    return false // Existing name requires dialog
  }

  function canEditPerson(person: ContractPerson): boolean {
    return !!person.name && !isPersonEditable(person)
  }

  function canRemovePerson(person: ContractPerson): boolean {
    if (isPrimaryBuyer(person) || isPrimaryBeneficiary(person)) return false
    if (isReadOnly.value && (isCoBuyer(person) || isAdditionalBeneficiary(person))) return false
    return true
  }

  function isNameRequired(person: ContractPerson): boolean {
    return isPrimaryBuyer(person) || isPrimaryBeneficiary(person)
  }

  // Factory for creating new person
  function createEmptyPerson(role: ContractPersonRole): ContractPerson {
    return {
      id: crypto.randomUUID(),
      contractId: draft.value?.id ?? '',
      nameId: crypto.randomUUID(),
      roles: role,
      addedAfterContractExecution: false,
      conversion: null,
      conversionId: null,
      conversionSource: null,
      name: createEmptyName(),
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
    }
  }

  // Action handlers
  function handleAddCoBuyer() {
    showAddMenu.value = false
    const newPerson = createEmptyPerson(CO_BUYER)
    editor.setField('people', [...people.value, newPerson])
    activeTab.value = people.value.length - 1
  }

  function handleAddBeneficiary() {
    showAddMenu.value = false
    const newPerson = createEmptyPerson(ADDITIONAL_BENEFICIARY)
    editor.setField('people', [...people.value, newPerson])
    activeTab.value = people.value.length - 1
  }

  function handleAddPerson() {
    showAddMenu.value = false
    const newPerson = createEmptyPerson(PERSON)
    editor.setField('people', [...people.value, newPerson])
    activeTab.value = people.value.length - 1
  }

  function removePerson(person: ContractPerson) {
    const confirmed = confirm(
      `Are you sure you want to remove "${getDisplayName(person)}" from this contract?`,
    )
    if (!confirmed) return

    const filtered = people.value.filter((p) => p.id !== person.id)
    editor.setField('people', filtered)
  }

  // Edit dialog state
  const editDialog = ref({
    visible: false,
    model: null as Name | null,
    title: '',
    personId: '',
  })

  function editPerson(person: ContractPerson) {
    if (!person.name) return
    editDialog.value = {
      visible: true,
      model: { ...person.name }, // Clone for editing
      title: `Edit ${getDisplayName(person)}`,
      personId: person.id,
    }
  }

  function saveName(updatedName: Name) {
    const personIndex = people.value.findIndex((p) => p.id === editDialog.value.personId)
    if (personIndex === -1) return

    const person = people.value[personIndex]
    if (!person) return

    // Update person with new name
    const updatedPerson: ContractPerson = {
      ...person,
      name: { ...updatedName, dateLastModified: new Date().toISOString() },
      dateLastModified: new Date().toISOString(),
    }

    // Update the person in the array
    const updatedPeople = [...people.value]
    updatedPeople[personIndex] = updatedPerson
    editor.setField('people', updatedPeople)

    // Close dialog
    editDialog.value.visible = false
  }
</script>
