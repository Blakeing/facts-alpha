import { PaymentMethod } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class PaymentMethodController extends EnumController<PaymentMethod> {
  choices = [
    { id: PaymentMethod.CASH, name: 'Cash' },
    { id: PaymentMethod.CHECK, name: 'Check' },
    { id: PaymentMethod.CREDIT_CARD, name: 'Credit Card' },
    { id: PaymentMethod.ACH, name: 'ACH' },
    { id: PaymentMethod.INSURANCE, name: 'Insurance' },
    { id: PaymentMethod.FINANCING, name: 'Financing' },
    { id: PaymentMethod.OTHER, name: 'Other' },
  ] as const
}

export const paymentMethodController = new PaymentMethodController()

// Auto-register on module load
enumRegistry.register('paymentMethod', paymentMethodController)
