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
        cols="12"
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
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { type ContractPerson, ContractPersonRole, SaleStatus } from '@/entities/contract'
  import { contractPersonRoleController } from '@/entities/contract'
  import { getFormattedName } from '@/entities/name'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { FButton, FConfirmDialog, useConfirm } from '@/shared/ui'
  import ContractPersonSummary from './ContractPersonSummary.vue'

  interface Props {
    /** Person ID to select after save */
    selectedPersonId?: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    selectedPersonId: null,
  })

  // Inject editor context
  const editor = useContractEditorContext()
  const draft = computed(() => editor.draft.value)

  // Router for navigation
  const router = useRouter()
  const route = useRoute()

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

  // Read-only if executed or voided
  const isReadOnly = computed(() => {
    const status = draft.value?.meta.status
    return status === SaleStatus.EXECUTED || status === SaleStatus.VOID
  })

  // UI State
  const activeTab = ref(0)
  const showAddMenu = ref(false)

  // Open person editor via query params
  function openPersonEditor(personId: string, role?: ContractPersonRole) {
    const query: Record<string, string> = { person: personId }
    if (role !== undefined) {
      query.role = role.toString()
    }
    router.push({ query: { ...route.query, ...query } })
  }

  // Remove person confirmation dialog
  const removeConfirm = useConfirm()
  const personToRemove = ref<ContractPerson | null>(null)

  // Watch selectedPersonId prop to select person after save
  watch(
    () => props.selectedPersonId,
    (personId) => {
      if (personId) {
        // Person is already in the draft, so find and select it
        const personIndex = people.value.findIndex((p) => p.id === personId)
        if (personIndex !== -1) {
          activeTab.value = personIndex
        }
      }
    },
  )

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

  // Open add new person dialog
  function handleAddPrimaryBuyer() {
    showAddMenu.value = false
    openPersonEditor('new', ContractPersonRole.PRIMARY_BUYER)
  }
  function handleAddPrimaryBeneficiary() {
    showAddMenu.value = false
    openPersonEditor('new', ContractPersonRole.PRIMARY_BENEFICIARY)
  }
  function handleAddCoBuyer() {
    showAddMenu.value = false
    openPersonEditor('new', ContractPersonRole.CO_BUYER)
  }
  function handleAddBeneficiary() {
    showAddMenu.value = false
    openPersonEditor('new', ContractPersonRole.ADDITIONAL_BENEFICIARY)
  }
  function handleAddPerson() {
    showAddMenu.value = false
    openPersonEditor('new', ContractPersonRole.PERSON)
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

  function editPerson(person: ContractPerson) {
    openPersonEditor(person.id)
  }
</script>
