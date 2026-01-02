/**
 * Branch of Service Controller
 *
 * Provides display labels for BranchOfService enum.
 *
 * @see Facts/src/Facts.App/facts-app/src/controllers/base/EnumController.ts
 */

import type { EnumChoice } from '@/shared/lib/enums/EnumController'
import { BranchOfService } from '@/entities/name/model/name'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

export class BranchOfServiceController extends EnumController<BranchOfService> {
  public choices: EnumChoice<BranchOfService>[] = [
    { id: BranchOfService.NONE, name: 'None' },
    { id: BranchOfService.ARMY, name: 'Army' },
    { id: BranchOfService.NAVY, name: 'Navy' },
    { id: BranchOfService.AIR_FORCE, name: 'Air Force' },
    { id: BranchOfService.MARINES, name: 'Marines' },
    { id: BranchOfService.COAST_GUARD, name: 'Coast Guard' },
    { id: BranchOfService.SPACE_FORCE, name: 'Space Force' },
  ]
}

export const branchOfServiceController = new BranchOfServiceController()

// Auto-register on module load
enumRegistry.register('branchOfService', branchOfServiceController)
