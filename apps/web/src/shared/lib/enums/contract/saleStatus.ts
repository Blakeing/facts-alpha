import { SaleStatus } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class SaleStatusController extends EnumController<SaleStatus> {
  choices = [
    { id: SaleStatus.DRAFT, name: 'Draft' },
    { id: SaleStatus.EXECUTED, name: 'Executed' },
    { id: SaleStatus.FINALIZED, name: 'Finalized' },
    { id: SaleStatus.VOID, name: 'Void' },
  ] as const
}

export const saleStatusController = new SaleStatusController()

// Auto-register on module load
enumRegistry.register('saleStatus', saleStatusController)
