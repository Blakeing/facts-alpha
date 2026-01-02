/**
 * Contract Person Role Controller
 *
 * Provides display labels for ContractPersonRole numeric flags.
 * Backend uses numeric flags: 1=PrimaryBuyer, 2=CoBuyer, 4=PrimaryBeneficiary, 8=AdditionalBeneficiary
 *
 * @see Facts/src/Facts.App/facts-app/src/controllers/base/EnumController.ts
 */

import type { EnumChoice } from '@/shared/lib/enums/EnumController'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'
import { ContractPersonRole } from '@/entities/contract/model/contract'

export class ContractPersonRoleController extends EnumController<number> {
  public choices: EnumChoice<number>[] = [
    { id: ContractPersonRole.PERSON, name: 'Person' },
    { id: ContractPersonRole.PRIMARY_BUYER, name: 'Primary Buyer' },
    { id: ContractPersonRole.CO_BUYER, name: 'Co-Buyer' },
    { id: ContractPersonRole.PRIMARY_BENEFICIARY, name: 'Primary Beneficiary' },
    { id: ContractPersonRole.ADDITIONAL_BENEFICIARY, name: 'Additional Beneficiary' },
  ]

  /**
   * Priority order for roles (lower number = higher priority)
   * PrimaryBuyer > CoBuyer > PrimaryBeneficiary > AdditionalBeneficiary > Person
   */
  private readonly priorityFlags = [
    ContractPersonRole.PRIMARY_BUYER,
    ContractPersonRole.CO_BUYER,
    ContractPersonRole.PRIMARY_BENEFICIARY,
    ContractPersonRole.ADDITIONAL_BENEFICIARY,
    ContractPersonRole.PERSON,
  ] as const

  /**
   * Get the priority number for a role (lower = higher priority)
   * Used for sorting people by role
   * @param roles - Numeric flags value (can have multiple flags combined)
   * @returns Priority number (1-5, where 1 is highest priority)
   */
  getRolePriority(roles: number): number {
    for (let i = 0; i < this.priorityFlags.length; i++) {
      if ((roles & this.priorityFlags[i]) === this.priorityFlags[i]) {
        return i + 1 // 1-based priority
      }
    }
    return this.priorityFlags.length + 1 // Default to lowest priority
  }

  /**
   * Get the primary role description for a person with multiple roles
   * Checks roles in priority order: PrimaryBuyer > CoBuyer > PrimaryBeneficiary > AdditionalBeneficiary > Person
   * @param roles - Numeric flags value (can have multiple flags combined)
   * @returns Display description for the highest priority role
   */
  getPrimaryRoleDescription(roles: number): string {
    // Check in priority order (most specific first)
    for (const flag of this.priorityFlags) {
      if ((roles & flag) === flag) {
        return this.getDescription(flag)
      }
    }
    return 'Unknown'
  }
}

export const contractPersonRoleController = new ContractPersonRoleController()

// Auto-register on module load
enumRegistry.register('contractPersonRole', contractPersonRoleController)

