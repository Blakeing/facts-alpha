import { PreNeedFundingType } from '@/entities/contract/model/contract'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

class PreNeedFundingTypeController extends EnumController<PreNeedFundingType> {
  choices = [
    { id: PreNeedFundingType.TRUST, name: 'Trust' },
    { id: PreNeedFundingType.INSURANCE, name: 'Insurance' },
  ]
}

export const preNeedFundingTypeController = new PreNeedFundingTypeController()

// Auto-register on module load
enumRegistry.register('preNeedFundingType', preNeedFundingTypeController)

