import { PreNeedFundingType } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class PreNeedFundingTypeController extends EnumController<PreNeedFundingType> {
  choices = [
    { id: PreNeedFundingType.TRUST, name: 'Trust' },
    { id: PreNeedFundingType.INSURANCE, name: 'Insurance' },
  ] as const
}

export const preNeedFundingTypeController = new PreNeedFundingTypeController()

// Auto-register on module load
enumRegistry.register('preNeedFundingType', preNeedFundingTypeController)
