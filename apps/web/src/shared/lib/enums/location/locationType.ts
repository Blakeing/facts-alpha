import { LocationType } from '@/entities/location/model/location'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class LocationTypeController extends EnumController<LocationType> {
  choices = [
    { id: LocationType.FUNERAL, name: 'Funeral' },
    { id: LocationType.CEMETERY, name: 'Cemetery' },
    { id: LocationType.CORPORATE, name: 'Corporate' },
  ] as const
}

export const locationTypeController = new LocationTypeController()

// Auto-register on module load
enumRegistry.register('locationType', locationTypeController)
