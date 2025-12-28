import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'
import { AtNeedType } from '@/entities/contract/model/contract'

class AtNeedTypeController extends EnumController<AtNeedType> {
  choices = [
    { id: AtNeedType.WALK_IN, name: 'Walk In' },
    { id: AtNeedType.PN_MATURITY, name: 'PN Maturity' },
  ] as const
}

export const atNeedTypeController = new AtNeedTypeController()

// Auto-register on module load
enumRegistry.register('atNeedType', atNeedTypeController)

