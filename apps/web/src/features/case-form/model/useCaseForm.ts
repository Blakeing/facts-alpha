/**
 * features/case-form/model/useCaseForm.ts
 *
 * Composable for case form state and validation
 */

import type { Case, CaseStatus, ServiceType } from '@/entities/case'
import { computed, ref } from 'vue'

export interface CaseFormData {
  // Decedent
  decedent: {
    firstName: string
    lastName: string
    middleName: string
    dateOfBirth: string
    dateOfDeath: string
    placeOfDeath: string
    ssn: string
    veteranStatus: boolean
  }
  // Next of Kin
  nextOfKin: {
    firstName: string
    lastName: string
    relationship: string
    phone: string
    email: string
    address: {
      street: string
      city: string
      state: string
      zip: string
    }
  }
  // Services & Status
  services: ServiceType[]
  notes: string
  status: CaseStatus
}

export function useCaseForm(existingCase?: Case) {
  const formData = ref<CaseFormData>(
    existingCase
      ? caseToFormData(existingCase)
      : getEmptyFormData()
  )

  const isEditing = computed(() => !!existingCase)

  const isValid = computed(() => {
    const d = formData.value.decedent
    const n = formData.value.nextOfKin

    return (
      d.firstName.trim() !== '' &&
      d.lastName.trim() !== '' &&
      d.dateOfDeath !== '' &&
      n.firstName.trim() !== '' &&
      n.lastName.trim() !== '' &&
      n.relationship.trim() !== '' &&
      n.phone.trim() !== ''
    )
  })

  function reset() {
    formData.value = existingCase
      ? caseToFormData(existingCase)
      : getEmptyFormData()
  }

  function toCase(tenantId: string, caseId?: string): Omit<Case, 'createdAt' | 'updatedAt'> {
    const d = formData.value.decedent
    const n = formData.value.nextOfKin

    return {
      id: caseId || generateId(),
      caseNumber: caseId ? existingCase!.caseNumber : generateCaseNumber(),
      tenantId,
      status: formData.value.status,
      decedent: {
        firstName: d.firstName,
        lastName: d.lastName,
        middleName: d.middleName || undefined,
        dateOfBirth: d.dateOfBirth || undefined,
        dateOfDeath: d.dateOfDeath,
        placeOfDeath: d.placeOfDeath || undefined,
        ssn: d.ssn || undefined,
        veteranStatus: d.veteranStatus || undefined,
      },
      nextOfKin: {
        firstName: n.firstName,
        lastName: n.lastName,
        relationship: n.relationship,
        phone: n.phone,
        email: n.email || undefined,
        address: n.address.street
          ? {
              street: n.address.street,
              city: n.address.city,
              state: n.address.state,
              zip: n.address.zip,
            }
          : undefined,
      },
      services: formData.value.services.map((type) => ({
        id: generateId(),
        type,
      })),
      notes: formData.value.notes || undefined,
    }
  }

  return {
    formData,
    isEditing,
    isValid,
    reset,
    toCase,
  }
}

function getEmptyFormData(): CaseFormData {
  return {
    decedent: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      dateOfDeath: '',
      placeOfDeath: '',
      ssn: '',
      veteranStatus: false,
    },
    nextOfKin: {
      firstName: '',
      lastName: '',
      relationship: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
    services: [],
    notes: '',
    status: 'pending',
  }
}

function caseToFormData(c: Case): CaseFormData {
  return {
    decedent: {
      firstName: c.decedent.firstName,
      lastName: c.decedent.lastName,
      middleName: c.decedent.middleName || '',
      dateOfBirth: c.decedent.dateOfBirth || '',
      dateOfDeath: c.decedent.dateOfDeath,
      placeOfDeath: c.decedent.placeOfDeath || '',
      ssn: c.decedent.ssn || '',
      veteranStatus: c.decedent.veteranStatus || false,
    },
    nextOfKin: {
      firstName: c.nextOfKin.firstName,
      lastName: c.nextOfKin.lastName,
      relationship: c.nextOfKin.relationship,
      phone: c.nextOfKin.phone,
      email: c.nextOfKin.email || '',
      address: c.nextOfKin.address
        ? {
            street: c.nextOfKin.address.street,
            city: c.nextOfKin.address.city,
            state: c.nextOfKin.address.state,
            zip: c.nextOfKin.address.zip,
          }
        : { street: '', city: '', state: '', zip: '' },
    },
    services: c.services.map((s) => s.type),
    notes: c.notes || '',
    status: c.status,
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 15)
}

function generateCaseNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10_000).toString().padStart(4, '0')
  return `${year}-${random}`
}

