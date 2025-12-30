import { AtNeedType } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class AtNeedTypeController extends EnumController<AtNeedType> {
  choices = [
    { id: AtNeedType.WALK_IN, name: 'Walk In' },
    { id: AtNeedType.PN_MATURITY, name: 'PN Maturity' },
  ] as const
}

export const atNeedTypeController = new AtNeedTypeController()

// Auto-register on module load
enumRegistry.register('atNeedType', atNeedTypeController)
