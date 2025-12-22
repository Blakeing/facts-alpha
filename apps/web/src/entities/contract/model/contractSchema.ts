/**
 * Contract Zod schemas for form validation
 */

import { z } from 'zod'

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})

// Contract person schema
export const contractPersonSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: addressSchema.optional(),
  relationship: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dateOfDeath: z.string().optional(),
})

// Contract item schema
export const contractItemSchema = z.object({
  id: z.string().optional(),
  itemNumber: z.string().min(1, 'Item number is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['service', 'merchandise', 'cash_advance']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price cannot be negative'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().optional(),
})

// Contract payment schema
export const contractPaymentSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  method: z.enum(['cash', 'check', 'credit_card', 'insurance', 'financing', 'other']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

// Main contract form schema
export const contractFormSchema = z.object({
  type: z.enum(['at_need_funeral', 'pre_need_funeral', 'cemetery']),
  status: z.enum(['draft', 'finalized', 'executed', 'void', 'cancelled']),
  caseId: z.string().optional(),
  date: z.string().min(1, 'Contract date is required'),
  signDate: z.string().optional(),
  prePrintedContractNumber: z.string().optional(),

  // People
  purchaser: contractPersonSchema,
  coBuyers: z.array(contractPersonSchema).default([]),
  beneficiary: contractPersonSchema,

  // Sales
  salesPersonId: z.string().optional(),

  // Notes
  notes: z.string().optional(),
})

// Types inferred from schemas
export type AddressFormValues = z.infer<typeof addressSchema>
export type ContractPersonFormValues = z.infer<typeof contractPersonSchema>
export type ContractItemFormValues = z.infer<typeof contractItemSchema>
export type ContractPaymentFormValues = z.infer<typeof contractPaymentSchema>
export type ContractFormValues = z.infer<typeof contractFormSchema>

// Default values for new contracts
export function getDefaultContractFormValues(): ContractFormValues {
  return {
    type: 'at_need_funeral',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    purchaser: {
      firstName: '',
      lastName: '',
    },
    coBuyers: [],
    beneficiary: {
      firstName: '',
      lastName: '',
    },
  }
}
