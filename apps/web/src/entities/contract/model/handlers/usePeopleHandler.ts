/**
 * People Handler - Manages contract people (purchaser, beneficiary, co-buyers) within a session
 *
 * Provides reactive state for people associated with a contract.
 * Part of the contract session - receives shared context via parameter.
 *
 * @see docs/data-models.md for ContractPerson structure
 */

import type { ContractPerson } from '../contract'
import type { ContractSessionContext } from '../contractSessionContext'
import type { Name, NameAddress, NameEmail, NamePhone } from '@/entities/name'
import { computed, ref } from 'vue'
import { AddressType, PhoneType } from '@/entities/name'

export interface PersonFormData {
  firstName: string
  middleName?: string
  lastName: string
  phone?: string
  email?: string
  address?: NameAddress
  dateOfBirth?: string
  dateOfDeath?: string
}

function createEmptyName(): Name {
  return {
    id: '0',
    first: '',
    last: '',
    middle: '',
    prefix: '',
    suffix: '',
    nickname: '',
    companyName: '',
    maidenName: '',
    birthDate: null,
    deathDate: null,
    timeOfDeath: null,
    age: null,
    deceased: false,
    weight: null,
    condition: null,
    nationalIdentifier: '',
    driversLicense: '',
    driversLicenseState: '',
    gender: null,
    maritalStatus: 0,
    ethnicity: null,
    race: null,
    isVeteran: false,
    branchOfService: 0,
    mailingAddressSameAsPhysical: true,
    optOutMarketing: false,
    conversion: null,
    conversionId: null,
    conversionSource: null,
    phones: [],
    addresses: [],
    emailAddresses: [],
    relations: [],
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

function createEmptyPerson(roleFlags: number): ContractPerson {
  return {
    id: '0',
    contractId: '',
    nameId: '0',
    roles: roleFlags,
    addedAfterContractExecution: false,
    conversion: null,
    conversionId: null,
    conversionSource: null,
    name: createEmptyName(),
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

function createEmptyAddress(): NameAddress {
  return {
    id: '0',
    nameId: '0',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    county: '',
    country: 'USA',
    primary: true,
    active: true,
    addressType: AddressType.PHYSICAL,
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

function createEmptyPhone(): NamePhone {
  return {
    id: '0',
    nameId: '0',
    number: '',
    type: PhoneType.HOME,
    preferred: true,
    active: true,
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

function createEmptyEmail(): NameEmail {
  return {
    id: '0',
    nameId: '0',
    address: '',
    preferred: true,
    active: true,
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

export function usePeopleHandler(context: ContractSessionContext) {
  // ==========================================================================
  // State
  // ==========================================================================

  const purchaser = ref<ContractPerson>(createEmptyPerson(1)) // PrimaryBuyer = 1
  const beneficiary = ref<ContractPerson>(createEmptyPerson(4)) // PrimaryBeneficiary = 4
  const coBuyers = ref<ContractPerson[]>([])
  const additionalBeneficiaries = ref<ContractPerson[]>([])
  const genericPeople = ref<ContractPerson[]>([])
  const isDirty = ref(false)

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
  // Purchaser Actions
  // ==========================================================================

  /**
   * Update purchaser data
   */
  function updatePurchaser(data: Partial<PersonFormData>): void {
    if (!context.isEditable.value) return

    if (data.firstName !== undefined) purchaser.value.name.first = data.firstName
    if (data.middleName !== undefined) purchaser.value.name.middle = data.middleName
    if (data.lastName !== undefined) purchaser.value.name.last = data.lastName
    if (data.dateOfBirth !== undefined) purchaser.value.name.birthDate = data.dateOfBirth ?? null
    if (data.dateOfDeath !== undefined) purchaser.value.name.deathDate = data.dateOfDeath ?? null

    // Update phone
    if (data.phone !== undefined) {
      const phone = purchaser.value.name.phones[0] ?? createEmptyPhone()
      phone.number = data.phone
      if (!purchaser.value.name.phones[0]) {
        purchaser.value.name.phones.push(phone)
      }
    }

    // Update email
    if (data.email !== undefined) {
      const email = purchaser.value.name.emailAddresses[0] ?? createEmptyEmail()
      email.address = data.email
      if (!purchaser.value.name.emailAddresses[0]) {
        purchaser.value.name.emailAddresses.push(email)
      }
    }

    purchaser.value.name.dateLastModified = new Date().toISOString()
    purchaser.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Update purchaser address
   */
  function updatePurchaserAddress(data: Partial<NameAddress>): void {
    if (!context.isEditable.value) return

    const address = purchaser.value.name.addresses[0] ?? createEmptyAddress()
    Object.assign(address, data)
    if (!purchaser.value.name.addresses[0]) {
      purchaser.value.name.addresses.push(address)
    }

    purchaser.value.name.dateLastModified = new Date().toISOString()
    purchaser.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Clear purchaser data
   */
  function clearPurchaser(): void {
    if (!context.isEditable.value) return

    purchaser.value = createEmptyPerson(1) // PrimaryBuyer = 1
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

    if (data.firstName !== undefined) beneficiary.value.name.first = data.firstName
    if (data.middleName !== undefined) beneficiary.value.name.middle = data.middleName
    if (data.lastName !== undefined) beneficiary.value.name.last = data.lastName
    if (data.dateOfBirth !== undefined) beneficiary.value.name.birthDate = data.dateOfBirth ?? null
    if (data.dateOfDeath !== undefined) beneficiary.value.name.deathDate = data.dateOfDeath ?? null

    // Update phone
    if (data.phone !== undefined) {
      const phone = beneficiary.value.name.phones[0] ?? createEmptyPhone()
      phone.number = data.phone
      if (!beneficiary.value.name.phones[0]) {
        beneficiary.value.name.phones.push(phone)
      }
    }

    // Update email
    if (data.email !== undefined) {
      const email = beneficiary.value.name.emailAddresses[0] ?? createEmptyEmail()
      email.address = data.email
      if (!beneficiary.value.name.emailAddresses[0]) {
        beneficiary.value.name.emailAddresses.push(email)
      }
    }

    beneficiary.value.name.dateLastModified = new Date().toISOString()
    beneficiary.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Update beneficiary address
   */
  function updateBeneficiaryAddress(data: Partial<NameAddress>): void {
    if (!context.isEditable.value) return

    const address = beneficiary.value.name.addresses[0] ?? createEmptyAddress()
    Object.assign(address, data)
    if (!beneficiary.value.name.addresses[0]) {
      beneficiary.value.name.addresses.push(address)
    }

    beneficiary.value.name.dateLastModified = new Date().toISOString()
    beneficiary.value.dateLastModified = new Date().toISOString()
    isDirty.value = true
  }

  /**
   * Clear beneficiary data
   */
  function clearBeneficiary(): void {
    if (!context.isEditable.value) return

    beneficiary.value = createEmptyPerson(4) // PrimaryBeneficiary = 4
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
      roles: 4, // PrimaryBeneficiary
      name: { ...purchaser.value.name },
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
    const newCoBuyer = createEmptyPerson(2) // CoBuyer = 2
    newCoBuyer.contractId = context.contractId.value

    if (data) {
      if (data.firstName) newCoBuyer.name.first = data.firstName
      if (data.middleName) newCoBuyer.name.middle = data.middleName
      if (data.lastName) newCoBuyer.name.last = data.lastName
      if (data.dateOfBirth) newCoBuyer.name.birthDate = data.dateOfBirth
      if (data.dateOfDeath) newCoBuyer.name.deathDate = data.dateOfDeath

      if (data.phone) {
        const phone = createEmptyPhone()
        phone.number = data.phone
        newCoBuyer.name.phones.push(phone)
      }

      if (data.email) {
        const email = createEmptyEmail()
        email.address = data.email
        newCoBuyer.name.emailAddresses.push(email)
      }

      if (data.address) {
        newCoBuyer.name.addresses.push(data.address)
      }
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

    if (data.firstName !== undefined) coBuyer.name.first = data.firstName
    if (data.middleName !== undefined) coBuyer.name.middle = data.middleName
    if (data.lastName !== undefined) coBuyer.name.last = data.lastName
    if (data.dateOfBirth !== undefined) coBuyer.name.birthDate = data.dateOfBirth ?? null
    if (data.dateOfDeath !== undefined) coBuyer.name.deathDate = data.dateOfDeath ?? null

    // Update phone
    if (data.phone !== undefined) {
      const phone = coBuyer.name.phones[0] ?? createEmptyPhone()
      phone.number = data.phone
      if (!coBuyer.name.phones[0]) {
        coBuyer.name.phones.push(phone)
      }
    }

    // Update email
    if (data.email !== undefined) {
      const email = coBuyer.name.emailAddresses[0] ?? createEmptyEmail()
      email.address = data.email
      if (!coBuyer.name.emailAddresses[0]) {
        coBuyer.name.emailAddresses.push(email)
      }
    }

    coBuyer.name.dateLastModified = new Date().toISOString()
    coBuyer.dateLastModified = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Update a co-buyer's address
   */
  function updateCoBuyerAddress(coBuyerId: string, data: Partial<NameAddress>): boolean {
    if (!context.isEditable.value) return false

    const coBuyer = coBuyers.value.find((c) => c.id === coBuyerId)
    if (!coBuyer) return false

    const address = coBuyer.name.addresses[0] ?? createEmptyAddress()
    Object.assign(address, data)
    if (!coBuyer.name.addresses[0]) {
      coBuyer.name.addresses.push(address)
    }

    coBuyer.name.dateLastModified = new Date().toISOString()
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
  // Additional Beneficiary Actions
  // ==========================================================================

  /**
   * Add an additional beneficiary
   */
  function addAdditionalBeneficiary(data?: PersonFormData): ContractPerson {
    const newBeneficiary = createEmptyPerson(8) // AdditionalBeneficiary = 8
    newBeneficiary.contractId = context.contractId.value

    if (data) {
      if (data.firstName) newBeneficiary.name.first = data.firstName
      if (data.middleName) newBeneficiary.name.middle = data.middleName
      if (data.lastName) newBeneficiary.name.last = data.lastName
      if (data.dateOfBirth) newBeneficiary.name.birthDate = data.dateOfBirth
      if (data.dateOfDeath) newBeneficiary.name.deathDate = data.dateOfDeath

      if (data.phone) {
        const phone = createEmptyPhone()
        phone.number = data.phone
        newBeneficiary.name.phones.push(phone)
      }

      if (data.email) {
        const email = createEmptyEmail()
        email.address = data.email
        newBeneficiary.name.emailAddresses.push(email)
      }

      if (data.address) {
        newBeneficiary.name.addresses.push(data.address)
      }
    }

    additionalBeneficiaries.value.push(newBeneficiary)
    isDirty.value = true
    return newBeneficiary
  }

  /**
   * Remove an additional beneficiary by ID
   */
  function removeAdditionalBeneficiary(beneficiaryId: string): boolean {
    if (!context.isEditable.value) return false

    const index = additionalBeneficiaries.value.findIndex((b) => b.id === beneficiaryId)
    if (index === -1) return false

    additionalBeneficiaries.value.splice(index, 1)
    isDirty.value = true
    return true
  }

  /**
   * Update an additional beneficiary
   */
  function updateAdditionalBeneficiary(
    beneficiaryId: string,
    data: Partial<PersonFormData>,
  ): boolean {
    if (!context.isEditable.value) return false

    const beneficiary = additionalBeneficiaries.value.find((b) => b.id === beneficiaryId)
    if (!beneficiary) return false

    if (data.firstName !== undefined) beneficiary.name.first = data.firstName
    if (data.middleName !== undefined) beneficiary.name.middle = data.middleName
    if (data.lastName !== undefined) beneficiary.name.last = data.lastName
    if (data.dateOfBirth !== undefined) beneficiary.name.birthDate = data.dateOfBirth ?? null
    if (data.dateOfDeath !== undefined) beneficiary.name.deathDate = data.dateOfDeath ?? null

    // Update phone
    if (data.phone !== undefined) {
      const phone = beneficiary.name.phones[0] ?? createEmptyPhone()
      phone.number = data.phone
      if (!beneficiary.name.phones[0]) {
        beneficiary.name.phones.push(phone)
      }
    }

    // Update email
    if (data.email !== undefined) {
      const email = beneficiary.name.emailAddresses[0] ?? createEmptyEmail()
      email.address = data.email
      if (!beneficiary.name.emailAddresses[0]) {
        beneficiary.name.emailAddresses.push(email)
      }
    }

    beneficiary.name.dateLastModified = new Date().toISOString()
    beneficiary.dateLastModified = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Get an additional beneficiary by ID
   */
  function getAdditionalBeneficiary(beneficiaryId: string): ContractPerson | undefined {
    return additionalBeneficiaries.value.find((b) => b.id === beneficiaryId)
  }

  // ==========================================================================
  // Generic Person Actions
  // ==========================================================================

  /**
   * Add a generic person (no specific role)
   */
  function addGenericPerson(data?: PersonFormData): ContractPerson {
    const newPerson = createEmptyPerson(0) // None = 0
    newPerson.contractId = context.contractId.value

    if (data) {
      if (data.firstName) newPerson.name.first = data.firstName
      if (data.middleName) newPerson.name.middle = data.middleName
      if (data.lastName) newPerson.name.last = data.lastName
      if (data.dateOfBirth) newPerson.name.birthDate = data.dateOfBirth
      if (data.dateOfDeath) newPerson.name.deathDate = data.dateOfDeath

      if (data.phone) {
        const phone = createEmptyPhone()
        phone.number = data.phone
        newPerson.name.phones.push(phone)
      }

      if (data.email) {
        const email = createEmptyEmail()
        email.address = data.email
        newPerson.name.emailAddresses.push(email)
      }

      if (data.address) {
        newPerson.name.addresses.push(data.address)
      }
    }

    genericPeople.value.push(newPerson)
    isDirty.value = true
    return newPerson
  }

  /**
   * Remove a generic person by ID
   */
  function removeGenericPerson(personId: string): boolean {
    const index = genericPeople.value.findIndex((p) => p.id === personId)
    if (index === -1) return false

    genericPeople.value.splice(index, 1)
    isDirty.value = true
    return true
  }

  /**
   * Update a generic person
   */
  function updateGenericPerson(personId: string, data: Partial<PersonFormData>): boolean {
    const person = genericPeople.value.find((p) => p.id === personId)
    if (!person) return false

    if (data.firstName !== undefined) person.name.first = data.firstName
    if (data.middleName !== undefined) person.name.middle = data.middleName
    if (data.lastName !== undefined) person.name.last = data.lastName
    if (data.dateOfBirth !== undefined) person.name.birthDate = data.dateOfBirth ?? null
    if (data.dateOfDeath !== undefined) person.name.deathDate = data.dateOfDeath ?? null

    // Update phone
    if (data.phone !== undefined) {
      const phone = person.name.phones[0] ?? createEmptyPhone()
      phone.number = data.phone
      if (!person.name.phones[0]) {
        person.name.phones.push(phone)
      }
    }

    // Update email
    if (data.email !== undefined) {
      const email = person.name.emailAddresses[0] ?? createEmptyEmail()
      email.address = data.email
      if (!person.name.emailAddresses[0]) {
        person.name.emailAddresses.push(email)
      }
    }

    person.name.dateLastModified = new Date().toISOString()
    person.dateLastModified = new Date().toISOString()
    isDirty.value = true
    return true
  }

  /**
   * Get a generic person by ID
   */
  function getGenericPerson(personId: string): ContractPerson | undefined {
    return genericPeople.value.find((p) => p.id === personId)
  }

  // ==========================================================================
  // Role Management
  // ==========================================================================

  /**
   * Check if a person has a specific role (using flags enum)
   */
  function hasRole(person: ContractPerson, roleFlag: number): boolean {
    return (person.roles & roleFlag) === roleFlag
  }

  /**
   * Change a person's role
   * Only works for co-buyers, additional beneficiaries, and generic people
   */
  function changePersonRole(person: ContractPerson, newRoleFlag: number): boolean {
    if (!context.isEditable.value) return false

    // Cannot change primary buyer (1) or primary beneficiary (4)
    if (hasRole(person, 1) || hasRole(person, 4)) return false

    // Remove from current collection
    const coBuyerIdx = coBuyers.value.findIndex((c) => c.id === person.id)
    const addBenIdx = additionalBeneficiaries.value.findIndex((b) => b.id === person.id)
    const genericIdx = genericPeople.value.findIndex((p) => p.id === person.id)

    if (coBuyerIdx !== -1) {
      coBuyers.value.splice(coBuyerIdx, 1)
    } else if (addBenIdx !== -1) {
      additionalBeneficiaries.value.splice(addBenIdx, 1)
    } else if (genericIdx !== -1) {
      genericPeople.value.splice(genericIdx, 1)
    }

    // Update role and add to appropriate collection
    person.roles = newRoleFlag
    person.dateLastModified = new Date().toISOString()

    if (newRoleFlag === 2) {
      // CoBuyer
      coBuyers.value.push(person)
    } else if (newRoleFlag === 8) {
      // AdditionalBeneficiary
      additionalBeneficiaries.value.push(person)
    } else {
      // Generic (0)
      genericPeople.value.push(person)
    }

    isDirty.value = true
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
   */
  function getDisplayType(person: ContractPerson): string {
    if (hasRole(person, 1)) return 'Buyer'
    if (hasRole(person, 2)) return 'Co-Buyer'
    if (hasRole(person, 4)) return 'Beneficiary'
    if (hasRole(person, 8)) return 'Additional Beneficiary'
    return 'Person'
  }

  // ==========================================================================
  // Session Lifecycle
  // ==========================================================================

  /**
   * Apply people data from server
   * NOTE: Server data comes with nested Name object - store as-is!
   */
  function applyFromServer(
    serverPurchaser: ContractPerson | null | undefined,
    serverBeneficiary: ContractPerson | null | undefined,
    serverCoBuyers: ContractPerson[] | null | undefined,
    serverAdditionalBeneficiaries?: ContractPerson[] | null | undefined,
    serverGenericPeople?: ContractPerson[] | null | undefined,
  ): void {
    purchaser.value = serverPurchaser ? { ...serverPurchaser } : createEmptyPerson(1)
    beneficiary.value = serverBeneficiary ? { ...serverBeneficiary } : createEmptyPerson(4)
    coBuyers.value = (serverCoBuyers ?? []).map((c) => ({ ...c }))
    additionalBeneficiaries.value = (serverAdditionalBeneficiaries ?? []).map((b) => ({ ...b }))
    genericPeople.value = (serverGenericPeople ?? []).map((p) => ({ ...p }))

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
    purchaser.value = createEmptyPerson(1)
    beneficiary.value = createEmptyPerson(4)
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

    // Additional beneficiary actions
    addAdditionalBeneficiary,
    removeAdditionalBeneficiary,
    updateAdditionalBeneficiary,
    getAdditionalBeneficiary,

    // Generic person actions
    addGenericPerson,
    removeGenericPerson,
    updateGenericPerson,
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
