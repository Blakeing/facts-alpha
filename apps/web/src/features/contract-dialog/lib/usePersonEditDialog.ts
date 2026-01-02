/**
 * Person Edit Dialog Composable
 *
 * Extracts dialog state and logic from ContractPeople.vue for cleaner component code.
 */

import type { ContractPerson, PeopleHandler } from '@/entities/contract'
import type { Name } from '@/entities/name'
import { computed, ref } from 'vue'
import { ContractPersonRole } from '@/entities/contract'

interface PersonEditContext {
  person: ContractPerson
  isInsert: boolean
  isPrimaryBuyer: boolean
  isPrimaryBeneficiary: boolean
  isCoBuyer: boolean
  isAdditionalBeneficiary: boolean
  isGenericPerson: boolean
}

export function usePersonEditDialog(
  people: PeopleHandler,
  isDraft: () => boolean,
  needType: () => number,
) {
  const visible = ref(false)
  const model = ref<Name | null>(null)
  const title = ref('Edit Person')
  const context = ref<PersonEditContext | null>(null)

  // ==========================================================================
  // Field Visibility (based on person type)
  // ==========================================================================

  const hideCompany = computed(() => {
    if (!context.value) return true
    const type = people.getDisplayType(context.value.person)
    return type !== 'Buyer' && type !== 'Co-Buyer'
  })

  const hideSSN = computed(() => {
    if (!context.value) return true
    const type = people.getDisplayType(context.value.person)
    return type !== 'Beneficiary' && type !== 'Additional Beneficiary' && type !== 'Deceased'
  })

  const hideDeceasedInfo = computed(() => {
    if (!context.value) return true
    const type = people.getDisplayType(context.value.person)
    return type !== 'Beneficiary' && type !== 'Deceased'
  })

  const canEditNameParts = computed(() => {
    if (!context.value) return false
    if (context.value.isInsert) return true
    if (context.value.isGenericPerson) return true
    if (isDraft()) return true
    const { first, last } = context.value.person.name
    if (!first && !last) return true
    return false
  })

  const isNameRequired = computed(() => {
    if (!context.value) return false
    return context.value.isPrimaryBeneficiary || context.value.isAdditionalBeneficiary
  })

  const showOptOutMarketing = computed(() => {
    if (!context.value) return true
    const isFuneralAN = needType() === 1
    if (isFuneralAN && context.value.isPrimaryBeneficiary) return false
    return true
  })

  // ==========================================================================
  // Actions
  // ==========================================================================

  function open(person: ContractPerson, beneficiaryLabel: string) {
    if (!person.name) return

    const isPrimaryBuyerRole = people.hasRole(person, ContractPersonRole.PRIMARY_BUYER)
    const isPrimaryBeneficiaryRole = people.hasRole(person, ContractPersonRole.PRIMARY_BENEFICIARY)
    const isCoBuyerRole = people.hasRole(person, ContractPersonRole.CO_BUYER)
    const isAdditionalBeneficiaryRole = people.hasRole(
      person,
      ContractPersonRole.ADDITIONAL_BENEFICIARY,
    )
    const isGenericPersonRole = person.roles === ContractPersonRole.PERSON

    model.value = person.name
    context.value = {
      person,
      isInsert: false,
      isPrimaryBuyer: isPrimaryBuyerRole,
      isPrimaryBeneficiary: isPrimaryBeneficiaryRole,
      isCoBuyer: isCoBuyerRole,
      isAdditionalBeneficiary: isAdditionalBeneficiaryRole,
      isGenericPerson: isGenericPersonRole,
    }

    // Set title based on role
    if (isPrimaryBuyerRole) {
      title.value = 'Edit Buyer'
    } else if (isCoBuyerRole) {
      title.value = 'Edit Co-Buyer'
    } else if (isPrimaryBeneficiaryRole) {
      title.value = `Edit ${beneficiaryLabel}`
    } else if (isAdditionalBeneficiaryRole) {
      title.value = 'Edit Additional Beneficiary'
    } else {
      title.value = 'Edit Person'
    }

    visible.value = true
  }

  function close() {
    visible.value = false
    context.value = null
  }

  function save(updatedName: Name, onSaved?: (person: ContractPerson) => void) {
    if (!context.value) return

    const { person } = context.value
    const updatedPerson: ContractPerson = {
      ...person,
      name: updatedName,
    }
    people.applyPersonUpdate(updatedPerson)

    if (onSaved) {
      onSaved(person)
    }

    close()
  }

  return {
    // State
    visible,
    model,
    title,
    context,

    // Computed for dialog props
    hideCompany,
    hideSSN,
    hideDeceasedInfo,
    canEditNameParts,
    isNameRequired,
    showOptOutMarketing,

    // Actions
    open,
    close,
    save,
  }
}

export type PersonEditDialog = ReturnType<typeof usePersonEditDialog>
