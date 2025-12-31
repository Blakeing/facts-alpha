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
                v-if="peopleList.length > 0"
                class="ml-3"
                color="primary"
                size="small"
                variant="tonal"
              >
                {{ peopleList.length }}
              </v-chip>
            </div>
            <div>
              <v-menu
                v-if="isDraft"
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
                    v-if="isDraft"
                    prepend-icon="mdi-account-plus"
                    @click="handleAddCoBuyer"
                  >
                    <v-list-item-title>Add Co-Buyer</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="canHaveAdditionalBeneficiaries"
                    prepend-icon="mdi-account-plus"
                    @click="handleAddAdditionalBeneficiary"
                  >
                    <v-list-item-title>Add Additional Beneficiary</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-account-plus"
                    @click="handleAddGenericPerson"
                  >
                    <v-list-item-title>Add Other Person</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <FButton
                v-else-if="!isVoided"
                prepend-icon="mdi-plus"
                @click="handleAddGenericPerson"
              >
                Add Person
              </FButton>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Person tabs sidebar -->
      <v-col
        v-if="peopleList.length > 0"
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
              v-for="(person, index) in peopleList"
              :key="`tab-${index}`"
              class="text-left justify-start"
              :value="index"
            >
              <div class="d-flex flex-column align-start w-100">
                <div
                  v-if="personTypeLabel(person)"
                  class="text-caption text-medium-emphasis mb-1"
                >
                  {{ personTypeLabel(person) }}
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
        :cols="peopleList.length > 0 ? 12 : 12"
        :md="peopleList.length > 0 ? 9 : 12"
      >
        <v-alert
          v-if="peopleList.length === 0"
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
                    <div
                      v-if="personDeceasedLabel(currentPerson)"
                      class="text-caption text-error mt-1"
                    >
                      {{ personDeceasedLabel(currentPerson) }}
                    </div>
                  </div>
                  <v-chip
                    v-if="personTypeLabel(currentPerson)"
                    color="primary"
                    size="small"
                    variant="tonal"
                  >
                    {{ personTypeLabel(currentPerson) }}
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
                  <v-menu v-if="canChangeRole(currentPerson)">
                    <template #activator="{ props: menuProps }">
                      <v-tooltip text="Change Person Type">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            v-bind="{ ...menuProps, ...tooltipProps }"
                            color="primary"
                            icon
                            size="small"
                            variant="text"
                          >
                            <v-icon>mdi-swap-horizontal</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        v-for="option in getRoleOptions(currentPerson)"
                        :key="option.role"
                        @click="changeRole(currentPerson, option.role)"
                      >
                        <v-list-item-title>{{ option.label }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
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

            <!-- No beneficiary message for executed contracts -->
            <v-alert
              v-if="isPrimaryBeneficiary(currentPerson) && isExecuted && !hasName(currentPerson)"
              class="ma-4"
              density="compact"
              type="warning"
              variant="tonal"
            >
              <template #prepend>
                <v-icon>mdi-alert</v-icon>
              </template>
              <div class="text-body-2">
                No primary {{ beneficiaryLabel }} has been provided. Please use the edit button to
                update this information.
              </div>
            </v-alert>

            <!-- Name panel - editable for new/empty persons, readonly otherwise -->
            <div v-else-if="currentPerson.name">
              <NamePanel
                :hide-company="hideCompany(currentPerson)"
                :hide-deceased-info="hideDeceasedInfo(currentPerson)"
                :hide-s-s-n="hideSSN(currentPerson)"
                :is-name-required="isNameRequiredForCurrentPerson"
                :model="currentPerson.name"
                :name-part-readonly="!isCurrentPersonEditable"
                :people-list="peopleNames"
                :show-opt-out-marketing="showOptOutMarketing(currentPerson)"
              />
            </div>
          </FCard>
        </template>
      </v-col>
    </v-row>

    <!-- Name Editor Dialog -->
    <NameEditorDialog
      v-model="editDialog.visible.value"
      :hide-company="editDialog.hideCompany.value"
      :hide-deceased-info="editDialog.hideDeceasedInfo.value"
      :hide-s-s-n="editDialog.hideSSN.value"
      :is-name-required="editDialog.isNameRequired.value"
      :model="editDialog.model.value"
      :name-part-editable="editDialog.canEditNameParts.value"
      :people-list="peopleNames"
      :show-opt-out-marketing="editDialog.showOptOutMarketing.value"
      :title="editDialog.title.value"
      @save="saveName"
    />
  </v-container>
</template>

<script lang="ts" setup>
  import type { ContractPerson } from '@/entities/contract'
  import type { Name } from '@/entities/name'
  import { computed, ref, watch } from 'vue'
  import { ContractPersonRole, useSession } from '@/entities/contract'
  import { getFormattedName } from '@/entities/name'
  import { NameEditorDialog, NamePanel } from '@/entities/name/ui'
  import { FButton, FCard } from '@/shared/ui'
  import { usePersonEditDialog } from '../composables/usePersonEditDialog'
  import {
    getFieldVisibility,
    hasName,
    isNameRequired,
  } from '../composables/usePersonFieldVisibility'

  // ==========================================================================
  // Session & Status
  // ==========================================================================

  const session = useSession()

  const isDraft = computed(() => session.hasDraftStatus.value)
  const isVoided = computed(() => session.isVoided.value)
  const isExecuted = computed(() => session.isExecuted.value)
  const isFinalized = computed(() => session.isFinalized.value)
  const needType = computed(() => session.needType.value)

  // ==========================================================================
  // UI State
  // ==========================================================================

  const activeTab = ref(0)
  const showAddMenu = ref(false)

  // Edit dialog (extracted to composable)
  const editDialog = usePersonEditDialog(
    session.people,
    () => isDraft.value,
    () => needType.value,
  )

  // ==========================================================================
  // People List & Current Selection
  // ==========================================================================

  const peopleList = computed(() => session.people.allPeople.value)

  watch(peopleList, (newList) => {
    if (newList.length === 0) {
      activeTab.value = 0
    } else if (activeTab.value >= newList.length) {
      activeTab.value = 0
    }
  })

  const currentPerson = computed(() => {
    if (peopleList.value.length === 0) return null
    const index = activeTab.value
    if (index < 0 || index >= peopleList.value.length) return null
    return peopleList.value[index]
  })

  const peopleNames = computed(() => {
    return peopleList.value.filter((p) => p.name).map((p) => p.name!)
  })

  // ==========================================================================
  // Role Helpers (simplified using enum constants)
  // ==========================================================================

  const { PRIMARY_BUYER, CO_BUYER, PRIMARY_BENEFICIARY, ADDITIONAL_BENEFICIARY, PERSON } =
    ContractPersonRole

  function isPrimaryBuyer(p: ContractPerson) {
    return session.people.hasRole(p, PRIMARY_BUYER)
  }
  function isCoBuyer(p: ContractPerson) {
    return session.people.hasRole(p, CO_BUYER)
  }
  function isPrimaryBeneficiary(p: ContractPerson) {
    return session.people.hasRole(p, PRIMARY_BENEFICIARY)
  }
  function isAdditionalBeneficiary(p: ContractPerson) {
    return session.people.hasRole(p, ADDITIONAL_BENEFICIARY)
  }
  function isGenericPerson(p: ContractPerson) {
    return p.roles === PERSON
  }

  // ==========================================================================
  // Configuration
  // ==========================================================================

  // TODO: Determine based on location type (cemetery vs funeral)
  const canHaveAdditionalBeneficiaries = computed(() => true)

  const beneficiaryLabel = computed(() => {
    return needType.value === 1 ? 'deceased' : 'beneficiary' // 1 = At-Need
  })

  // ==========================================================================
  // Display Helpers
  // ==========================================================================

  function getDisplayName(person: ContractPerson): string {
    if (!person.name) return ''
    return getFormattedName(person.name) || ''
  }

  function personTypeLabel(person: ContractPerson): string {
    return session.people.getDisplayType(person)
  }

  function personDeceasedLabel(person: ContractPerson): string {
    if (person.name?.deathDate) {
      const date = new Date(person.name.deathDate)
      return ` - Deceased ${date.toLocaleDateString()}`
    }
    return ''
  }

  // ==========================================================================
  // Permission Checks
  // ==========================================================================

  function isPersonEditableInline(person: ContractPerson): boolean {
    if (!person) return false
    if (isGenericPerson(person)) return true
    if (isDraft.value) return true
    if (!hasName(person)) return true
    return false
  }

  function canEditPerson(person: ContractPerson): boolean {
    return !!person.name && !isPersonEditableInline(person)
  }

  function canRemovePerson(person: ContractPerson): boolean {
    if (isPrimaryBuyer(person) || isPrimaryBeneficiary(person)) return false
    if (isCoBuyer(person) || isAdditionalBeneficiary(person)) return isDraft.value
    return true
  }

  function canChangeRole(person: ContractPerson): boolean {
    if (!isDraft.value) return false
    if (isPrimaryBuyer(person) || isPrimaryBeneficiary(person)) return false
    if (!hasName(person)) return false
    return true
  }

  function getRoleOptions(person: ContractPerson) {
    const options: { role: ContractPersonRole; label: string }[] = []
    if (!isCoBuyer(person)) {
      options.push({ role: CO_BUYER, label: 'Change to Co-Buyer' })
    }
    if (!isAdditionalBeneficiary(person) && canHaveAdditionalBeneficiaries.value) {
      options.push({ role: ADDITIONAL_BENEFICIARY, label: 'Change to Additional Beneficiary' })
    }
    if (!isGenericPerson(person)) {
      options.push({ role: PERSON, label: 'Remove Person Type' })
    }
    return options
  }

  // ==========================================================================
  // Field Visibility (using helper)
  // ==========================================================================

  function getVisibility(person: ContractPerson) {
    return getFieldVisibility(person, session.people, needType.value)
  }

  // Inline panel visibility
  const hideCompany = (p: ContractPerson) => getVisibility(p).hideCompany
  const hideSSN = (p: ContractPerson) => getVisibility(p).hideSSN
  const hideDeceasedInfo = (p: ContractPerson) => getVisibility(p).hideDeceasedInfo
  const showOptOutMarketing = (p: ContractPerson) => getVisibility(p).showOptOutMarketing

  // Current person computed
  const isCurrentPersonEditable = computed(() =>
    currentPerson.value ? isPersonEditableInline(currentPerson.value) : false,
  )
  const isNameRequiredForCurrentPerson = computed(() =>
    currentPerson.value ? isNameRequired(currentPerson.value, session.people) : false,
  )

  // ==========================================================================
  // Tab Position Calculator (DRY helper)
  // ==========================================================================

  function calculateNewTabPosition(addedRole: ContractPersonRole) {
    const counts = {
      purchaser: peopleList.value.some((p) => isPrimaryBuyer(p)) ? 1 : 0,
      coBuyers: peopleList.value.filter((p) => isCoBuyer(p)).length,
      beneficiary: peopleList.value.some((p) => isPrimaryBeneficiary(p)) ? 1 : 0,
      additionalBeneficiaries: peopleList.value.filter((p) => isAdditionalBeneficiary(p)).length,
      genericPeople: peopleList.value.filter((p) => isGenericPerson(p)).length,
    }

    switch (addedRole) {
      case CO_BUYER: {
        return counts.purchaser + counts.coBuyers
      }
      case ADDITIONAL_BENEFICIARY: {
        return (
          counts.purchaser + counts.coBuyers + counts.beneficiary + counts.additionalBeneficiaries
        )
      }
      case PERSON: {
        return (
          counts.purchaser +
          counts.coBuyers +
          counts.beneficiary +
          counts.additionalBeneficiaries +
          counts.genericPeople
        )
      }
      default: {
        return 0
      }
    }
  }

  // ==========================================================================
  // Action Handlers
  // ==========================================================================

  function handleAddCoBuyer() {
    showAddMenu.value = false
    if (isFinalized.value || isVoided.value) return
    activeTab.value = calculateNewTabPosition(CO_BUYER)
    session.people.addCoBuyer()
  }

  function handleAddAdditionalBeneficiary() {
    showAddMenu.value = false
    if (isVoided.value || !canHaveAdditionalBeneficiaries.value) return
    activeTab.value = calculateNewTabPosition(ADDITIONAL_BENEFICIARY)
    const model = session.people.addAdditionalBeneficiary()
    if (isExecuted.value) {
      model.addedAfterContractExecution = true
    }
  }

  function handleAddGenericPerson() {
    showAddMenu.value = false
    if (isVoided.value) return
    activeTab.value = calculateNewTabPosition(PERSON)
    session.people.addGenericPerson()
  }

  function editPerson(person: ContractPerson) {
    editDialog.open(person, beneficiaryLabel.value)
  }

  function changeRole(person: ContractPerson, newRole: ContractPersonRole) {
    session.people.changePersonRole(person, newRole)
  }

  function removePerson(person: ContractPerson) {
    if (!person?.name) return
    const confirmed = confirm(
      `Are you sure you want to remove "${getDisplayName(person)}" from this contract?`,
    )
    if (!confirmed) return

    if (isCoBuyer(person)) session.people.removeCoBuyer(person.id)
    else if (isAdditionalBeneficiary(person)) session.people.removeAdditionalBeneficiary(person.id)
    else if (isGenericPerson(person)) session.people.removeGenericPerson(person.id)
  }

  function saveName(model: Name) {
    editDialog.save(model, (person) => {
      const index = peopleList.value.findIndex((p) => p.id === person.id || p.nameId === model.id)
      if (index !== -1) activeTab.value = index
    })
  }
</script>
