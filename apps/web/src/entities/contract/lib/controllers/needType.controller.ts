import { NeedType } from '@/entities/contract/model/contract'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

class NeedTypeController extends EnumController<NeedType> {
  choices = [
    { id: NeedType.AT_NEED, name: 'At Need' },
    { id: NeedType.PRE_NEED, name: 'Pre Need' },
  ]
}

export const needTypeController = new NeedTypeController()

// Auto-register on module load
enumRegistry.register('needType', needTypeController)

