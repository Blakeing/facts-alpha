import { FinancingStatus } from '@/entities/contract/model/contract'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

class FinancingStatusController extends EnumController<number> {
  choices = [
    { id: FinancingStatus.PENDING, name: 'Pending' },
    { id: FinancingStatus.CALCULATED, name: 'Calculated' },
  ]
}

export const financingStatusController = new FinancingStatusController()

// Auto-register on module load
enumRegistry.register('financingStatus', financingStatusController)

