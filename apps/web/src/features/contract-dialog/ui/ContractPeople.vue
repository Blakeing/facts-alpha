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

            <!-- Name panel - always show if name exists -->
            <div v-else-if="currentPerson.name && ensureNameArrays(currentPerson.name)">
              <NamePanel
                :hide-company="hideCompany(currentPerson)"
                :hide-deceased-info="hideDeceasedInfo(currentPerson)"
                :hide-s-s-n="hideSSN(currentPerson)"
                :model="currentPerson.name"
                :name-part-readonly="readonlyIfNotDraft"
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
      v-model="nameEditVisible"
      :hide-company="hideCompanyForEdit"
      :hide-deceased-info="hideDeceasedInfoForEdit"
      :hide-s-s-n="hideSSNForEdit"
      :is-name-required="isNameRequiredForEdit"
      :model="nameEditModel"
      :name-part-editable="canEditNamePartsForEdit"
      :people-list="peopleNames"
      :show-opt-out-marketing="showOptOutMarketingForEdit"
      :title="nameEditTitle"
      @save="saveName"
    />
  </v-container>
</template>

<script lang="ts" setup>
  import type { ContractPerson, PeopleHandler } from '@/entities/contract'
  import type { Name } from '@/entities/name'
  import { computed, ref, watch } from 'vue'
  import { getFormattedName } from '@/entities/name'
  import { NameEditorDialog, NamePanel } from '@/entities/name/ui'
  import { FButton, FCard } from '@/shared/ui'

  interface Props {
    people: PeopleHandler
    isDraft: boolean
    isVoided: boolean
    isExecuted: boolean
    isFinalized: boolean
    locationId?: string
    needType?: number
  }

  const props = defineProps<Props>()

  const activeTab = ref(0)
  const showAddMenu = ref(false)
  const nameEditVisible = ref(false)
  const nameEditModel = ref<Name | null>(null)
  const nameEditTitle = ref('Edit Person')
  const nameEditContext = ref<{
    person: ContractPerson
    isInsert: boolean
    isPrimaryBuyer: boolean
    isPrimaryBeneficiary: boolean
    isCoBuyer: boolean
    isAdditionalBeneficiary: boolean
    isGenericPerson: boolean
  } | null>(null)

  // Safe accessor for people list
  const peopleList = computed(() => {
    try {
      if (!props.people?.allPeople) return []
      const people = props.people.allPeople.value
      return Array.isArray(people) ? people : []
    } catch {
      return []
    }
  })

  // Reset activeTab when people list changes
  watch(peopleList, (newList) => {
    if (newList.length === 0) {
      activeTab.value = 0
    } else if (activeTab.value >= newList.length) {
      activeTab.value = 0
    }
  })

  // Get the currently selected person
  const currentPerson = computed(() => {
    if (peopleList.value.length === 0) return null
    const index = activeTab.value
    if (index < 0 || index >= peopleList.value.length) return null
    return peopleList.value[index]
  })

  const peopleNames = computed(() => {
    return peopleList.value
      .filter((p: ContractPerson) => p.name)
      .map((p: ContractPerson) => p.name!)
  })

  const readonlyIfNotDraft = computed(() => !props.isDraft)

  // Cemetery locations can have additional beneficiaries
  // TODO: Determine based on location type (cemetery vs funeral) - currently allows for all
  const canHaveAdditionalBeneficiaries = computed(() => {
    return true
  })

  const beneficiaryLabel = computed(() => {
    // Funeral AN uses "deceased" instead of "beneficiary"
    const isFuneralAN = props.needType === 1 // At-Need
    return isFuneralAN ? 'deceased' : 'beneficiary'
  })

  function getDisplayName(person: ContractPerson): string {
    if (!person.name) return ''
    return getFormattedName(person.name) || ''
  }

  function personTypeLabel(person: ContractPerson): string {
    if (!props.people?.getDisplayType) return 'Person'
    return props.people.getDisplayType(person)
  }

  function personDeceasedLabel(person: ContractPerson): string {
    if (person.name?.deathDate) {
      const date = new Date(person.name.deathDate)
      return ` - Deceased ${date.toLocaleDateString()}`
    }
    return ''
  }

  function hasName(person: ContractPerson): boolean {
    if (!person?.name) return false
    const { first, last } = person.name
    return !!(first || last)
  }

  // Ensure name has required arrays for NamePanel
  function ensureNameArrays(name: Name | null | undefined): name is Name {
    if (!name) return false
    // Ensure arrays exist (NamePanel handles empty arrays)
    if (!Array.isArray(name.phones)) {
      name.phones = []
    }
    if (!Array.isArray(name.addresses)) {
      name.addresses = []
    }
    if (!Array.isArray(name.emailAddresses)) {
      name.emailAddresses = []
    }
    if (!Array.isArray(name.relations)) {
      name.relations = []
    }
    return true
  }

  function isPrimaryBuyer(person: ContractPerson): boolean {
    if (!props.people?.hasRole) return false
    return props.people.hasRole(person, 1)
  }

  function isCoBuyer(person: ContractPerson): boolean {
    if (!props.people?.hasRole) return false
    return props.people.hasRole(person, 2)
  }

  function isPrimaryBeneficiary(person: ContractPerson): boolean {
    if (!props.people?.hasRole) return false
    return props.people.hasRole(person, 4)
  }

  function isAdditionalBeneficiary(person: ContractPerson): boolean {
    if (!props.people?.hasRole) return false
    return props.people.hasRole(person, 8)
  }

  function isGenericPerson(person: ContractPerson): boolean {
    return person.roles === 0
  }

  function canEditPerson(person: ContractPerson): boolean {
    // Can edit if person has a name
    return !!person.name
  }

  function canRemovePerson(person: ContractPerson): boolean {
    if (isPrimaryBuyer(person)) return false
    if (isPrimaryBeneficiary(person)) return false
    if (isCoBuyer(person)) return props.isDraft
    if (isAdditionalBeneficiary(person)) return props.isDraft
    return true
  }

  function canChangeRole(person: ContractPerson): boolean {
    if (!props.isDraft) return false
    if (isPrimaryBuyer(person)) return false
    if (isPrimaryBeneficiary(person)) return false
    if (!hasName(person)) return false
    return true
  }

  function getRoleOptions(person: ContractPerson) {
    const options: { role: number; label: string }[] = []

    if (!isCoBuyer(person)) {
      options.push({ role: 2, label: 'Change to Co-Buyer' })
    }

    if (!isAdditionalBeneficiary(person) && canHaveAdditionalBeneficiaries.value) {
      options.push({ role: 8, label: 'Change to Additional Beneficiary' })
    }

    if (!isGenericPerson(person)) {
      options.push({ role: 0, label: 'Remove Person Type' })
    }

    return options
  }

  function changeRole(person: ContractPerson, newRole: number) {
    if (!props.people?.changePersonRole) return
    props.people.changePersonRole(person, newRole)
  }

  function hideCompany(person: ContractPerson): boolean {
    if (!props.people?.getDisplayType) return true
    const type = props.people.getDisplayType(person)
    return type !== 'Buyer' && type !== 'Co-Buyer'
  }

  function hideSSN(person: ContractPerson): boolean {
    if (!props.people?.getDisplayType) return true
    const type = props.people.getDisplayType(person)
    return type !== 'Beneficiary' && type !== 'Additional Beneficiary' && type !== 'Deceased'
  }

  function hideDeceasedInfo(person: ContractPerson): boolean {
    if (!props.people?.getDisplayType) return true
    const type = props.people.getDisplayType(person)
    return type !== 'Beneficiary' && type !== 'Deceased'
  }

  function showOptOutMarketing(person: ContractPerson): boolean {
    const isFuneralAN = props.needType === 1
    if (isFuneralAN && isPrimaryBeneficiary(person)) {
      return false
    }
    return true
  }

  // Edit dialog computed values
  const hideCompanyForEdit = computed(() => {
    if (!nameEditContext.value || !props.people?.getDisplayType) return true
    const type = props.people.getDisplayType(nameEditContext.value.person)
    return type !== 'Buyer' && type !== 'Co-Buyer'
  })

  const hideSSNForEdit = computed(() => {
    if (!nameEditContext.value || !props.people?.getDisplayType) return true
    const type = props.people.getDisplayType(nameEditContext.value.person)
    return type !== 'Beneficiary' && type !== 'Additional Beneficiary' && type !== 'Deceased'
  })

  const hideDeceasedInfoForEdit = computed(() => {
    if (!nameEditContext.value || !props.people?.getDisplayType) return true
    const type = props.people.getDisplayType(nameEditContext.value.person)
    return type !== 'Beneficiary' && type !== 'Deceased'
  })

  const canEditNamePartsForEdit = computed(() => {
    if (!nameEditContext.value) return false
    if (nameEditContext.value.isInsert) return true
    if (nameEditContext.value.isGenericPerson) return true
    if (props.isDraft) return true
    if (!hasName(nameEditContext.value.person)) return true
    return false
  })

  const isNameRequiredForEdit = computed(() => {
    if (!nameEditContext.value) return false
    return (
      nameEditContext.value.isPrimaryBeneficiary || nameEditContext.value.isAdditionalBeneficiary
    )
  })

  const showOptOutMarketingForEdit = computed(() => {
    if (!nameEditContext.value) return true
    const isFuneralAN = props.needType === 1
    if (isFuneralAN && nameEditContext.value.isPrimaryBeneficiary) {
      return false
    }
    return true
  })

  // Action handlers
  async function handleAddCoBuyer() {
    showAddMenu.value = false
    if (props.isFinalized || props.isVoided) return

    const model = props.people.addCoBuyer()
    if (!model.name) return

    nameEditModel.value = model.name
    nameEditContext.value = {
      person: model,
      isInsert: true,
      isPrimaryBuyer: false,
      isPrimaryBeneficiary: false,
      isCoBuyer: true,
      isAdditionalBeneficiary: false,
      isGenericPerson: false,
    }
    nameEditTitle.value = 'Add Co-Buyer'
    nameEditVisible.value = true
  }

  async function handleAddAdditionalBeneficiary() {
    showAddMenu.value = false
    if (props.isVoided) return
    if (!canHaveAdditionalBeneficiaries.value) return

    const model = props.people.addAdditionalBeneficiary()
    if (props.isExecuted) {
      model.addedAfterContractExecution = true
    }

    nameEditModel.value = model.name
    nameEditContext.value = {
      person: model,
      isInsert: true,
      isPrimaryBuyer: false,
      isPrimaryBeneficiary: false,
      isCoBuyer: false,
      isAdditionalBeneficiary: true,
      isGenericPerson: false,
    }
    nameEditTitle.value = 'Add Additional Beneficiary'
    nameEditVisible.value = true
  }

  async function handleAddGenericPerson() {
    showAddMenu.value = false
    if (props.isVoided) return

    const model = props.people.addGenericPerson()

    nameEditModel.value = model.name
    nameEditContext.value = {
      person: model,
      isInsert: true,
      isPrimaryBuyer: false,
      isPrimaryBeneficiary: false,
      isCoBuyer: false,
      isAdditionalBeneficiary: false,
      isGenericPerson: true,
    }
    nameEditTitle.value = 'Add Person'
    nameEditVisible.value = true
  }

  function editPerson(person: ContractPerson) {
    if (!person.name || !props.people?.hasRole) return

    const isPrimaryBuyerRole = props.people.hasRole(person, 1)
    const isPrimaryBeneficiaryRole = props.people.hasRole(person, 4)
    const isCoBuyerRole = props.people.hasRole(person, 2)
    const isAdditionalBeneficiaryRole = props.people.hasRole(person, 8)
    const isGenericPersonRole = person.roles === 0

    nameEditModel.value = person.name
    nameEditContext.value = {
      person,
      isInsert: false,
      isPrimaryBuyer: isPrimaryBuyerRole,
      isPrimaryBeneficiary: isPrimaryBeneficiaryRole,
      isCoBuyer: isCoBuyerRole,
      isAdditionalBeneficiary: isAdditionalBeneficiaryRole,
      isGenericPerson: isGenericPersonRole,
    }

    if (isPrimaryBuyerRole) {
      nameEditTitle.value = 'Edit Buyer'
    } else if (isCoBuyerRole) {
      nameEditTitle.value = 'Edit Co-Buyer'
    } else if (isPrimaryBeneficiaryRole) {
      nameEditTitle.value = `Edit ${beneficiaryLabel.value}`
    } else if (isAdditionalBeneficiaryRole) {
      nameEditTitle.value = 'Edit Additional Beneficiary'
    } else {
      nameEditTitle.value = 'Edit Person'
    }

    nameEditVisible.value = true
  }

  async function removePerson(person: ContractPerson) {
    if (!person?.name) return

    const confirmed = confirm(
      `Are you sure you want to remove "${getDisplayName(person)}" from this contract?`,
    )
    if (!confirmed) return

    if (isCoBuyer(person)) {
      props.people.removeCoBuyer(person.id)
    } else if (isAdditionalBeneficiary(person)) {
      props.people.removeAdditionalBeneficiary(person.id)
    } else if (isGenericPerson(person)) {
      props.people.removeGenericPerson(person.id)
    }
  }

  async function saveName(model: Name) {
    if (!nameEditContext.value) return

    const { person } = nameEditContext.value
    person.name = model

    // Navigate to the saved person's tab
    const index = peopleList.value.findIndex(
      (p: ContractPerson) => p.id === person.id || p.nameId === model.id,
    )
    if (index !== -1) {
      activeTab.value = index
    }

    nameEditVisible.value = false
    nameEditContext.value = null
  }
</script>
