import { ItemType } from '@/entities/contract/model/contract'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

class ItemTypeController extends EnumController<number> {
  choices = [
    { id: ItemType.SERVICE, name: 'Service' },
    { id: ItemType.MERCHANDISE, name: 'Merchandise' },
    { id: ItemType.CASH_ADVANCE, name: 'Cash Advance' },
    { id: ItemType.PROPERTY, name: 'Property' },
    { id: ItemType.OTHER, name: 'Other' },
  ]
}

export const itemTypeController = new ItemTypeController()

// Auto-register on module load
enumRegistry.register('itemType', itemTypeController)

