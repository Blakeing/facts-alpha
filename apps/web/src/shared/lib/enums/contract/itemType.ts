import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'
import { ItemType } from '@/entities/contract/model/contract'

class ItemTypeController extends EnumController<ItemType> {
  choices = [
    { id: ItemType.SERVICE, name: 'Service' },
    { id: ItemType.MERCHANDISE, name: 'Merchandise' },
    { id: ItemType.CASH_ADVANCE, name: 'Cash Advance' },
    { id: ItemType.PROPERTY, name: 'Property' },
  ] as const
}

export const itemTypeController = new ItemTypeController()

// Auto-register on module load
enumRegistry.register('itemType', itemTypeController)

