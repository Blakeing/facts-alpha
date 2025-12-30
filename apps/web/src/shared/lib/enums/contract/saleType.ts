import { SaleType } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class SaleTypeController extends EnumController<SaleType> {
  choices = [
    { id: SaleType.CONTRACT, name: 'Contract' },
    { id: SaleType.CONTRACT_ADJUSTMENT, name: 'Contract Adjustment' },
    { id: SaleType.MISC_CASH, name: 'Misc Cash' },
  ] as const
}

export const saleTypeController = new SaleTypeController()

// Auto-register on module load
enumRegistry.register('saleType', saleTypeController)
