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
   * Get the primary role description for a person with multiple roles
   * Checks roles in priority order: PrimaryBuyer > CoBuyer > PrimaryBeneficiary > AdditionalBeneficiary > Person
   * @param roles - Numeric flags value (can have multiple flags combined)
   * @returns Display description for the highest priority role
   */
  getPrimaryRoleDescription(roles: number): string {
    // Check in priority order (most specific first)
    const priorityFlags = [
      ContractPersonRole.PRIMARY_BUYER,
      ContractPersonRole.CO_BUYER,
      ContractPersonRole.PRIMARY_BENEFICIARY,
      ContractPersonRole.ADDITIONAL_BENEFICIARY,
      ContractPersonRole.PERSON,
    ] as const
    for (const flag of priorityFlags) {
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

