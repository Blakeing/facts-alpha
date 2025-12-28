/**
 * People Handler - Manages contract people (purchaser, beneficiary, co-buyers) within a session
 *
 * Provides reactive state for people associated with a contract.
 * Part of the contract session - receives shared context via parameter.
 *
 * @see docs/data-models.md for ContractPerson structure
 */

import type { Address, ContractPerson } from '../contract'
import type { ContractSessionContext } from '../contractSessionContext'
import { computed, ref } from 'vue'
import { ContractPersonRole } from '../contract'

export interface PersonFormData {
  firstName: string
  middleName?: string
  lastName: string
  phone?: string
  email?: string
  address?: Address
  dateOfBirth?: string
  dateOfDeath?: string
}

function createEmptyPerson(role: ContractPersonRole = ContractPersonRole.PERSON): ContractPerson {
  return {
    id: crypto.randomUUID(),
    contractId: '',
    nameId: crypto.randomUUID(),
    roles: [role],
    addedAfterContractExecution: false,
    firstName: '',
    lastName: '',
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

function createEmptyAddress(): Address {
  return {
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    county: '',
    country: 'USA',
  }
}

export function usePeopleHandler(context: ContractSessionContext) {
  // ==========================================================================
  // State
  // ==========================================================================

  const purchaser = ref<ContractPerson>(createEmptyPerson(ContractPersonRole.PRIMARY_BUYER))
  const beneficiary = ref<ContractPerson>(createEmptyPerson(ContractPersonRole.PRIMARY_BENEFICIARY))
  const coBuyers = ref<ContractPerson[]>([])
  const isDirty = ref(false)

  // Track original person IDs from server to distinguish new vs modified
  const originalPersonIds = ref<Set<string>>(new Set())

  // ==========================================================================
  // Computed
  // ==========================================================================

  const purchaserFullName = computed(() => {
    const p = purchaser.value
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim()
  })

  const beneficiaryFullName = computed(() => {
    const b = beneficiary.value
    return [b.firstName, b.middleName, b.lastName].filter(Boolean).join(' ').trim()
  })

  const coBuyerCount = computed(() => coBuyers.value.length)

  const hasPurchaser = computed(() => !!purchaser.value.firstName && !!purchaser.value.lastName)

  const hasBeneficiary = computed(
    () => !!beneficiary.value.firstName && !!beneficiary.value.lastName,
  )

  // ==========================================================================
  // Purchaser Actions
  // ==========================================================================

  /**
   * Update purchaser data
   */
  function updatePurchaser(data: Partial<PersonFormData>): void {
    if (!context.isEditable.value) return

    Object.assign(purchaser.value, data)
    purchaser.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Update purchaser address
   */
  function updatePurchaserAddress(data: Partial<Address>): void {
    if (!context.isEditable.value) return

    if (!purchaser.value.address) {
      purchaser.value.address = createEmptyAddress()
    }
    Object.assign(purchaser.value.address, data)
    purchaser.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Clear purchaser data
   */
  function clearPurchaser(): void {
    if (!context.isEditable.value) return

    purchaser.value = createEmptyPerson(ContractPersonRole.PRIMARY_BUYER)
    isDirty.value = true
  }

  // ==========================================================================
  // Beneficiary Actions
  // ==========================================================================

  /**
   * Update beneficiary data
   */
  function updateBeneficiary(data: Partial<PersonFormData>): void {
    if (!context.isEditable.value) return

    Object.assign(beneficiary.value, data)
    beneficiary.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Update beneficiary address
   */
  function updateBeneficiaryAddress(data: Partial<Address>): void {
    if (!context.isEditable.value) return

    if (!beneficiary.value.address) {
      beneficiary.value.address = createEmptyAddress()
    }
    Object.assign(beneficiary.value.address, data)
    beneficiary.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Clear beneficiary data
   */
  function clearBeneficiary(): void {
    if (!context.isEditable.value) return

    beneficiary.value = createEmptyPerson(ContractPersonRole.PRIMARY_BENEFICIARY)
    isDirty.value = true
  }

  /**
   * Copy purchaser to beneficiary
   */
  function copyPurchaserToBeneficiary(): void {
    if (!context.isEditable.value) return

    beneficiary.value = {
      ...purchaser.value,
      id: beneficiary.value.id, // Keep beneficiary ID
      nameId: beneficiary.value.nameId,
      roles: [ContractPersonRole.PRIMARY_BENEFICIARY],
      dateLastModified: new Date().toISOString(),
    }
    isDirty.value = true
  }

  // ==========================================================================
  // Co-Buyer Actions
  // ==========================================================================

  /**
   * Add a co-buyer
   */
  function addCoBuyer(data?: PersonFormData): ContractPerson {
    const now = new Date().toISOString()
    const newCoBuyer: ContractPerson = {
      id: crypto.randomUUID(),
      contractId: context.contractId.value,
      nameId: crypto.randomUUID(),
      roles: [ContractPersonRole.CO_BUYER],
      addedAfterContractExecution: false,
      firstName: data?.firstName ?? '',
      middleName: data?.middleName,
      lastName: data?.lastName ?? '',
      phone: data?.phone,
      email: data?.email,
      address: data?.address,
      dateOfBirth: data?.dateOfBirth,
      dateOfDeath: data?.dateOfDeath,
      dateCreated: now,
      dateLastModified: now,
    }

    coBuyers.value.push(newCoBuyer)
    isDirty.value = true
    return newCoBuyer
  }

  /**
   * Remove a co-buyer by ID
   */
  function removeCoBuyer(coBuyerId: string): boolean {
    if (!context.isEditable.value) return false

    const index = coBuyers.value.findIndex((c) => c.id === coBuyerId)
    if (index === -1) return false

    coBuyers.value.splice(index, 1)
    isDirty.value = true
    return true
  }

  /**
   * Update a co-buyer
   */
  function updateCoBuyer(coBuyerId: string, data: Partial<PersonFormData>): boolean {
    if (!context.isEditable.value) return false

    const coBuyer = coBuyers.value.find((c) => c.id === coBuyerId)
    if (!coBuyer) return false

    Object.assign(coBuyer, data)
    coBuyer.dateLastModified = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Update a co-buyer's address
   */
  function updateCoBuyerAddress(coBuyerId: string, data: Partial<Address>): boolean {
    if (!context.isEditable.value) return false

    const coBuyer = coBuyers.value.find((c) => c.id === coBuyerId)
    if (!coBuyer) return false

    if (!coBuyer.address) {
      coBuyer.address = createEmptyAddress()
    }
    Object.assign(coBuyer.address, data)
    coBuyer.dateLastModified = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Get a co-buyer by ID
   */
  function getCoBuyer(coBuyerId: string): ContractPerson | undefined {
    return coBuyers.value.find((c) => c.id === coBuyerId)
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply people data from server
   */
  function applyFromServer(
    serverPurchaser: ContractPerson | null | undefined,
    serverBeneficiary: ContractPerson | null | undefined,
    serverCoBuyers: ContractPerson[] | null | undefined,
  ): void {
    purchaser.value = serverPurchaser
      ? { ...serverPurchaser }
      : createEmptyPerson(ContractPersonRole.PRIMARY_BUYER)
    beneficiary.value = serverBeneficiary
      ? { ...serverBeneficiary }
      : createEmptyPerson(ContractPersonRole.PRIMARY_BENEFICIARY)
    coBuyers.value = (serverCoBuyers ?? []).map((c) => ({ ...c }))

    // Track original IDs to identify new vs modified people on save
    originalPersonIds.value = new Set()
    if (serverPurchaser?.id) originalPersonIds.value.add(serverPurchaser.id)
    if (serverBeneficiary?.id) originalPersonIds.value.add(serverBeneficiary.id)
    if (serverCoBuyers)
      for (const c of serverCoBuyers) {
        if (c.id) originalPersonIds.value.add(c.id)
      }

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
    }
  }

  /**
   * Check if a person is new (not yet saved to server)
   */
  function isPersonNew(personId: string): boolean {
    return !originalPersonIds.value.has(personId)
  }

  /**
   * Check if a person was modified (existed on server)
   */
  function isPersonModified(personId: string): boolean {
    return originalPersonIds.value.has(personId)
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
    isDirty.value = false
    originalPersonIds.value = new Set()
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State (as computed for reactivity)
    purchaser: computed(() => purchaser.value),
    beneficiary: computed(() => beneficiary.value),
    coBuyers: computed(() => coBuyers.value),
    isDirty: computed(() => isDirty.value),

    // Computed
    purchaserFullName,
    beneficiaryFullName,
    coBuyerCount,
    hasPurchaser,
    hasBeneficiary,

    // Purchaser actions
    updatePurchaser,
    updatePurchaserAddress,
    clearPurchaser,

    // Beneficiary actions
    updateBeneficiary,
    updateBeneficiaryAddress,
    clearBeneficiary,
    copyPurchaserToBeneficiary,

    // Co-buyer actions
    addCoBuyer,
    removeCoBuyer,
    updateCoBuyer,
    updateCoBuyerAddress,
    getCoBuyer,

    // Session lifecycle
    applyFromServer,
    getFormValues,
    isPersonNew,
    isPersonModified,
    markClean,
    reset,
  }
}

export type PeopleHandler = ReturnType<typeof usePeopleHandler>
