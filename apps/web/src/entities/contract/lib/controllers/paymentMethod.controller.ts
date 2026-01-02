import { PaymentMethod } from '@/entities/contract/model/contract'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

class PaymentMethodController extends EnumController<PaymentMethod> {
  choices = [
    { id: PaymentMethod.CASH, name: 'Cash' },
    { id: PaymentMethod.CHECK, name: 'Check' },
    { id: PaymentMethod.CREDIT_CARD, name: 'Credit Card' },
    { id: PaymentMethod.ACH, name: 'ACH' },
    { id: PaymentMethod.INSURANCE, name: 'Insurance' },
    { id: PaymentMethod.FINANCING, name: 'Financing' },
    { id: PaymentMethod.OTHER, name: 'Other' },
  ]
}

export const paymentMethodController = new PaymentMethodController()

// Auto-register on module load
enumRegistry.register('paymentMethod', paymentMethodController)

