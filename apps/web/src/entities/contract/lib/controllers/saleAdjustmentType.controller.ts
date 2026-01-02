import { SaleAdjustmentType } from '@/entities/contract/model/contract'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

class SaleAdjustmentTypeController extends EnumController<SaleAdjustmentType> {
  choices: Array<{ id: SaleAdjustmentType; name: string }> = [
    { id: SaleAdjustmentType.SALES_TAX, name: 'Sales Tax' },
    { id: SaleAdjustmentType.DISCOUNT, name: 'Discount' },
    { id: SaleAdjustmentType.CANCELLATION, name: 'Cancellation' },
    { id: SaleAdjustmentType.EXCHANGE, name: 'Exchange' },
    { id: SaleAdjustmentType.TRANSFER, name: 'Transfer' },
    { id: SaleAdjustmentType.ADDENDUM, name: 'Addendum' },
    { id: SaleAdjustmentType.NEED_TYPE_SWAP, name: 'Need Type Swap' },
    { id: SaleAdjustmentType.LATE_FEE, name: 'Late Fee' },
    { id: SaleAdjustmentType.PROPERTY_EXCHANGE, name: 'Property Exchange' },
    { id: SaleAdjustmentType.ITEM_CREDIT, name: 'Item Credit' },
  ]
}

export const saleAdjustmentTypeController = new SaleAdjustmentTypeController()

// Auto-register on module load
enumRegistry.register('saleAdjustmentType', saleAdjustmentTypeController)

