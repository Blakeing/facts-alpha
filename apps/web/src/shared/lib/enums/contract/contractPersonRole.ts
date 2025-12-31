import { ContractPersonRole } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

/**
 * Contract Person Role Controller
 *
 * NOTE: This is a FLAGS enum (bitwise). Multiple roles can be combined.
 * Uses numeric enum values matching backend: 0=Person, 1=PrimaryBuyer, 2=CoBuyer, 4=PrimaryBeneficiary, 8=AdditionalBeneficiary
 */
class ContractPersonRoleController extends EnumController<number> {
  choices = [
    { id: ContractPersonRole.PERSON, name: 'Person' },
    { id: ContractPersonRole.PRIMARY_BUYER, name: 'Primary Buyer' },
    { id: ContractPersonRole.CO_BUYER, name: 'Co-Buyer' },
    { id: ContractPersonRole.PRIMARY_BENEFICIARY, name: 'Primary Beneficiary' },
    { id: ContractPersonRole.ADDITIONAL_BENEFICIARY, name: 'Additional Beneficiary' },
  ] as const
}

export const contractPersonRoleController = new ContractPersonRoleController()

// Auto-register on module load
enumRegistry.register('contractPersonRole', contractPersonRoleController)
