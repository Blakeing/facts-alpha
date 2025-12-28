import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'
import { ContractPersonRole } from '@/entities/contract/model/contract'

/**
 * Contract Person Role Controller
 * 
 * NOTE: This is a FLAGS enum (bitwise). Multiple roles can be combined.
 * Frontend uses string literals, but for display only.
 * Backend uses bitwise flags for storage.
 */
class ContractPersonRoleController extends EnumController<ContractPersonRole> {
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

