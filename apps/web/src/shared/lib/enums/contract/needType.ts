import { NeedType } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class NeedTypeController extends EnumController<NeedType> {
  choices = [
    { id: NeedType.AT_NEED, name: 'At Need' },
    { id: NeedType.PRE_NEED, name: 'Pre Need' },
  ] as const
}

export const needTypeController = new NeedTypeController()

// Auto-register on module load
enumRegistry.register('needType', needTypeController)
