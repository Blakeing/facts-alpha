import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'
import { FinancingStatus } from '@/entities/contract/model/contract'

class FinancingStatusController extends EnumController<FinancingStatus> {
  choices = [
    { id: FinancingStatus.PENDING, name: 'Pending' },
    { id: FinancingStatus.CALCULATED, name: 'Calculated' },
  ] as const
}

export const financingStatusController = new FinancingStatusController()

// Auto-register on module load
enumRegistry.register('financingStatus', financingStatusController)

