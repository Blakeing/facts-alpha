import { AtNeedType } from '@/entities/contract/model/contract'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

class AtNeedTypeController extends EnumController<AtNeedType> {
  choices = [
    { id: AtNeedType.WALK_IN, name: 'Walk In' },
    { id: AtNeedType.PN_MATURITY, name: 'PN Maturity' },
  ]
}

export const atNeedTypeController = new AtNeedTypeController()

// Auto-register on module load
enumRegistry.register('atNeedType', atNeedTypeController)

