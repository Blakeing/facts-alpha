/**
 * People Handler - Manages contract people (purchaser, beneficiary, co-buyers) within a session
 *
 * Provides reactive state for people associated with a contract.
 * Part of the contract session - receives shared context via parameter.
 *
 * @see docs/data-models.md for ContractPerson structure
 */

import type { ContractPerson } from '../contract'
import type { ContractSession } from '../useContractSession'
import { computed, ref } from 'vue'
import { createEmptyName } from '@/entities/name'
import { deepCopy } from '@/shared/lib/utilities/clone'
import { ContractPersonRole } from '../contract'
import { contractPersonRoleController } from '../ContractPersonRoleController'

// ==========================================================================
// Person Factory
// ==========================================================================

function createEmptyPerson(role: ContractPersonRole): ContractPerson {
  return {
    id: '0',
    contractId: '',
    nameId: '0',
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

// ==========================================================================
// Generic Collection Handler (DRY helper for co-buyers, add. beneficiaries, generic)
// ==========================================================================

function createCollectionHandler<T extends { id: string }>(
  collection: { value: T[] },
  factory: () => T,
  getContractId: () => string,
  markDirty: () => void,
  isEditable: () => boolean,
) {
  return {
    add(): T {
      const item = factory()
      ;(item as T & { contractId: string }).contractId = getContractId()
      collection.value.push(item)
      markDirty()
      return item
    },
    remove(id: string): boolean {
      if (!isEditable()) return false
      const index = collection.value.findIndex((item) => item.id === id)
      if (index === -1) return false
      collection.value.splice(index, 1)
      markDirty()
      return true
    },
    get(id: string): T | undefined {
      return collection.value.find((item) => item.id === id)
    },
  }
}

export function usePeopleHandler(session: ContractSession) {
  // ==========================================================================
  // State
  // ==========================================================================

  const purchaser = ref<ContractPerson>(createEmptyPerson(ContractPersonRole.PRIMARY_BUYER))
  const beneficiary = ref<ContractPerson>(createEmptyPerson(ContractPersonRole.PRIMARY_BENEFICIARY))
  const coBuyers = ref<ContractPerson[]>([])
  const additionalBeneficiaries = ref<ContractPerson[]>([])
  const genericPeople = ref<ContractPerson[]>([])
  const isDirty = ref(false)

  // Helper to mark dirty
  const markDirty = () => {
    isDirty.value = true
  }

  // Collection handlers for DRY CRUD operations
  const coBuyerOps = createCollectionHandler(
    coBuyers,
    () => createEmptyPerson(ContractPersonRole.CO_BUYER),
    () => session.contractId.value,
    markDirty,
    () => session.isEditable.value,
  )
  const additionalBeneficiaryOps = createCollectionHandler(
    additionalBeneficiaries,
    () => createEmptyPerson(ContractPersonRole.ADDITIONAL_BENEFICIARY),
    () => session.contractId.value,
    markDirty,
    () => session.isEditable.value,
  )
  const genericPersonOps = createCollectionHandler(
    genericPeople,
    () => createEmptyPerson(ContractPersonRole.PERSON),
    () => session.contractId.value,
    markDirty,
    () => true, // Generic people can always be removed
  )

  // ==========================================================================
  // Computed
  // ==========================================================================

  const purchaserFullName = computed(() => {
    const p = purchaser.value.name
    return [p.first, p.middle, p.last].filter(Boolean).join(' ').trim()
  })

  const beneficiaryFullName = computed(() => {
    const b = beneficiary.value.name
    return [b.first, b.middle, b.last].filter(Boolean).join(' ').trim()
  })

  const coBuyerCount = computed(() => coBuyers.value.length)

  const hasPurchaser = computed(() => !!purchaser.value.name.first && !!purchaser.value.name.last)

  const hasBeneficiary = computed(
    () => !!beneficiary.value.name.first && !!beneficiary.value.name.last,
  )

  // ==========================================================================
  // Person Update Methods
  // ==========================================================================

  /**
   * Apply an updated person to canonical state
   * Finds the person by ID and replaces it in the appropriate collection
   */
  function applyPersonUpdate(person: ContractPerson): boolean {
    if (!session.isEditable.value) return false

    const now = new Date().toISOString()
    person.name.dateLastModified = now
    person.dateLastModified = now

    // Check if it's the purchaser
    if (person.id === purchaser.value.id || hasRole(person, ContractPersonRole.PRIMARY_BUYER)) {
      purchaser.value = person
      markDirty()
      return true
    }

    // Check if it's the beneficiary
    if (
      person.id === beneficiary.value.id ||
      hasRole(person, ContractPersonRole.PRIMARY_BENEFICIARY)
    ) {
      beneficiary.value = person
      markDirty()
      return true
    }

    // Check secondary collections
    const collections = [coBuyers, additionalBeneficiaries, genericPeople]
    for (const collection of collections) {
      const index = collection.value.findIndex((p) => p.id === person.id)
      if (index !== -1) {
        collection.value[index] = person
        markDirty()
        return true
      }
    }

    return false
  }

  // ==========================================================================
  // Purchaser Actions
  // ==========================================================================

  function clearPurchaser(): void {
    if (!session.isEditable.value) return
    purchaser.value = createEmptyPerson(ContractPersonRole.PRIMARY_BUYER)
    markDirty()
  }

  // ==========================================================================
  // Beneficiary Actions
  // ==========================================================================

  function clearBeneficiary(): void {
    if (!session.isEditable.value) return
    beneficiary.value = createEmptyPerson(ContractPersonRole.PRIMARY_BENEFICIARY)
    markDirty()
  }

  function copyPurchaserToBeneficiary(): void {
    if (!session.isEditable.value) return
    beneficiary.value = {
      ...purchaser.value,
      id: beneficiary.value.id,
      nameId: beneficiary.value.nameId,
      roles: ContractPersonRole.PRIMARY_BENEFICIARY,
      name: { ...purchaser.value.name },
      dateLastModified: new Date().toISOString(),
    }
    markDirty()
  }

  // ==========================================================================
  // Co-Buyer Actions (delegated to collection handler)
  // ==========================================================================

  const addCoBuyer = () => coBuyerOps.add()
  const removeCoBuyer = (id: string) => coBuyerOps.remove(id)
  const getCoBuyer = (id: string) => coBuyerOps.get(id)

  // ==========================================================================
  // Additional Beneficiary Actions (delegated to collection handler)
  // ==========================================================================

  const addAdditionalBeneficiary = () => additionalBeneficiaryOps.add()
  const removeAdditionalBeneficiary = (id: string) => additionalBeneficiaryOps.remove(id)
  const getAdditionalBeneficiary = (id: string) => additionalBeneficiaryOps.get(id)

  // ==========================================================================
  // Generic Person Actions (delegated to collection handler)
  // ==========================================================================

  const addGenericPerson = () => genericPersonOps.add()
  const removeGenericPerson = (id: string) => genericPersonOps.remove(id)
  const getGenericPerson = (id: string) => genericPersonOps.get(id)

  // ==========================================================================
  // Role Management
  // ==========================================================================

  function hasRole(person: ContractPerson, roleFlag: ContractPersonRole): boolean {
    return (person.roles & roleFlag) === roleFlag
  }

  /**
   * Change a person's role (only for secondary roles: co-buyer, additional beneficiary, generic)
   */
  function changePersonRole(person: ContractPerson, newRole: ContractPersonRole): boolean {
    if (!session.isEditable.value) return false

    // Cannot change primary roles
    if (hasRole(person, ContractPersonRole.PRIMARY_BUYER)) return false
    if (hasRole(person, ContractPersonRole.PRIMARY_BENEFICIARY)) return false

    // Remove from current collection
    const collections = [coBuyers, additionalBeneficiaries, genericPeople]
    for (const collection of collections) {
      const idx = collection.value.findIndex((p) => p.id === person.id)
      if (idx !== -1) {
        collection.value.splice(idx, 1)
        break
      }
    }

    // Update role and add to appropriate collection
    person.roles = newRole
    person.dateLastModified = new Date().toISOString()

    const targetCollection =
      newRole === ContractPersonRole.CO_BUYER
        ? coBuyers
        : newRole === ContractPersonRole.ADDITIONAL_BENEFICIARY
          ? additionalBeneficiaries
          : genericPeople

    targetCollection.value.push(person)
    markDirty()
    return true
  }

  /**
   * Get all people in a unified list (for UI display)
   */
  const allPeople = computed(() => {
    const people: ContractPerson[] = []

    // Add primary buyer
    if (purchaser.value) {
      people.push(purchaser.value)
    }

    // Add co-buyers, primary beneficiary, additional beneficiaries, and generic people
    people.push(
      ...coBuyers.value,
      ...(beneficiary.value ? [beneficiary.value] : []),
      ...additionalBeneficiaries.value,
      ...genericPeople.value,
    )

    return people
  })

  /**
   * Get display type for a person (for UI labels)
   * Uses controller to get descriptions from numeric flags (no magic numbers)
   */
  function getDisplayType(person: ContractPerson): string {
    return contractPersonRoleController.getPrimaryRoleDescription(person.roles)
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply people data from server
   * NOTE: Server data comes with nested Name object - store as-is!
   *
   * IMPORTANT: Deep clone server data to create mutable copies.
   * Vue Query returns readonly reactive proxies that cannot be mutated directly.
   */

  function applyFromServer(
    serverPurchaser: ContractPerson | null | undefined,
    serverBeneficiary: ContractPerson | null | undefined,
    serverCoBuyers: ContractPerson[] | null | undefined,
    serverAdditionalBeneficiaries?: ContractPerson[] | null | undefined,
    serverGenericPeople?: ContractPerson[] | null | undefined,
  ): void {
    // Deep clone server data to create mutable copies (Vue Query proxies are readonly)
    purchaser.value = serverPurchaser ? deepCopy(serverPurchaser) : createEmptyPerson(1)
    beneficiary.value = serverBeneficiary ? deepCopy(serverBeneficiary) : createEmptyPerson(4)
    coBuyers.value = serverCoBuyers ? deepCopy(serverCoBuyers) : []
    additionalBeneficiaries.value = serverAdditionalBeneficiaries
      ? deepCopy(serverAdditionalBeneficiaries)
      : []
    genericPeople.value = serverGenericPeople ? deepCopy(serverGenericPeople) : []

    isDirty.value = false
  }

  /**
   * Get form values for saving
   */
  function getFormValues() {
    return {
      purchaser: { ...purchaser.value },
      beneficiary: { ...beneficiary.value },
      coBuyers: coBuyers.value.map((c) => ({ ...c })),
      additionalBeneficiaries: additionalBeneficiaries.value.map((b) => ({
        ...b,
      })),
      genericPeople: genericPeople.value.map((p) => ({ ...p })),
    }
  }

  /**
   * Mark people as clean (after save)
   */
  function markClean(): void {
    isDirty.value = false
  }

  /**
   * Reset to empty state
   */
  function reset(): void {
    purchaser.value = createEmptyPerson(ContractPersonRole.PRIMARY_BUYER)
    beneficiary.value = createEmptyPerson(ContractPersonRole.PRIMARY_BENEFICIARY)
    coBuyers.value = []
    additionalBeneficiaries.value = []
    genericPeople.value = []
    isDirty.value = false
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (as computed for reactivity)
    purchaser: computed(() => purchaser.value),
    beneficiary: computed(() => beneficiary.value),
    coBuyers: computed(() => coBuyers.value),
    additionalBeneficiaries: computed(() => additionalBeneficiaries.value),
    genericPeople: computed(() => genericPeople.value),
    allPeople,
    isDirty: computed(() => isDirty.value),

    // Computed
    purchaserFullName,
    beneficiaryFullName,
    coBuyerCount,
    hasPurchaser,
    hasBeneficiary,

    // Person update
    applyPersonUpdate,

    // Purchaser actions
    clearPurchaser,

    // Beneficiary actions
    clearBeneficiary,
    copyPurchaserToBeneficiary,

    // Co-buyer actions
    addCoBuyer,
    removeCoBuyer,
    getCoBuyer,

    // Additional beneficiary actions
    addAdditionalBeneficiary,
    removeAdditionalBeneficiary,
    getAdditionalBeneficiary,

    // Generic person actions
    addGenericPerson,
    removeGenericPerson,
    getGenericPerson,

    // Role management
    hasRole,
    changePersonRole,
    getDisplayType,

    // Session lifecycle
    applyFromServer,
    getFormValues,
    markClean,
    reset,
  }
}

export type PeopleHandler = ReturnType<typeof usePeopleHandler>
