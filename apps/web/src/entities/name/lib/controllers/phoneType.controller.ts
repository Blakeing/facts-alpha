/**
 * Phone Type Controller
 *
 * Provides display labels for PhoneType enum.
 *
 * @see Facts/src/Facts.App/facts-app/src/controllers/base/EnumController.ts
 */

import type { EnumChoice } from '@/shared/lib/enums/EnumController'
import { PhoneType } from '@/entities/name/model/name'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

export class PhoneTypeController extends EnumController<PhoneType> {
  public choices: EnumChoice<PhoneType>[] = [
    { id: PhoneType.HOME, name: 'Home' },
    { id: PhoneType.WORK, name: 'Work' },
    { id: PhoneType.MOBILE, name: 'Mobile' },
    { id: PhoneType.FAX, name: 'Fax' },
  ]
}

export const phoneTypeController = new PhoneTypeController()

// Auto-register on module load
enumRegistry.register('phoneType', phoneTypeController)
