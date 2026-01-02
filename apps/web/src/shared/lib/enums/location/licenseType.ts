import { LocationLicenseType } from '@/entities/location/model/location'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class LocationLicenseTypeController extends EnumController<LocationLicenseType> {
  choices = [
    { id: LocationLicenseType.ESTABLISHMENT, name: 'Establishment' },
    { id: LocationLicenseType.TRUST, name: 'Trust' },
    { id: LocationLicenseType.INSURANCE, name: 'Insurance' },
    { id: LocationLicenseType.COUPON_BOOK_ID, name: 'Coupon Book ID' },
  ]
}

export const locationLicenseTypeController = new LocationLicenseTypeController()

// Auto-register on module load
enumRegistry.register('locationLicenseType', locationLicenseTypeController)
