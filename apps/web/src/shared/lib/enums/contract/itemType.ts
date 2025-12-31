import { ItemType } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class ItemTypeController extends EnumController<number> {
  choices = [
    { id: ItemType.SERVICE, name: 'Service' },
    { id: ItemType.MERCHANDISE, name: 'Merchandise' },
    { id: ItemType.CASH_ADVANCE, name: 'Cash Advance' },
    { id: ItemType.PROPERTY, name: 'Property' },
    { id: ItemType.OTHER, name: 'Other' },
  ] as const
}

export const itemTypeController = new ItemTypeController()

// Auto-register on module load
enumRegistry.register('itemType', itemTypeController)
