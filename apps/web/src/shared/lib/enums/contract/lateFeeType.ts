import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'
import { LateFeeType } from '@/entities/contract/model/contract'

class LateFeeTypeController extends EnumController<LateFeeType> {
  choices = [
    { id: LateFeeType.NONE, name: 'None' },
    { id: LateFeeType.FIXED_AMOUNT, name: 'Fixed Amount' },
    { id: LateFeeType.PERCENTAGE_OF_PAYMENT, name: 'Percentage of Payment' },
  ] as const
}

export const lateFeeTypeController = new LateFeeTypeController()

// Auto-register on module load
enumRegistry.register('lateFeeType', lateFeeTypeController)

