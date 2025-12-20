/**
 * entities/case/model/case.ts
 *
 * Case type definitions for funeral home case management
 */

export type CaseStatus = 'pending' | 'active' | 'in_progress' | 'completed' | 'archived'

export interface Case {
  id: string
  caseNumber: string
  tenantId: string
  status: CaseStatus
  decedent: Decedent
  nextOfKin: NextOfKin
  services: CaseService[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Decedent {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth?: string
  dateOfDeath: string
  placeOfDeath?: string
  ssn?: string
  veteranStatus?: boolean
}

export interface NextOfKin {
  firstName: string
  lastName: string
  relationship: string
  phone: string
  email?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}

export interface CaseService {
  id: string
  type: ServiceType
  scheduledAt?: string
  location?: string
  notes?: string
}

export type ServiceType =
  | 'visitation'
  | 'funeral'
  | 'graveside'
  | 'cremation'
  | 'memorial'
  | 'transport'

export function getStatusColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    pending: 'warning',
    active: 'primary',
    in_progress: 'info',
    completed: 'success',
    archived: 'grey',
  }
  return colors[status]
}

export function getStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    pending: 'Pending',
    active: 'Active',
    in_progress: 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
  }
  return labels[status]
}
