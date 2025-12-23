/**
 * Contract Zod schemas for form validation
 */

import { z } from 'zod'
import { ContractStatus, ContractType } from './contract'

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
  type: z.enum([
    ContractType.AT_NEED_FUNERAL,
    ContractType.PRE_NEED_FUNERAL,
    ContractType.CEMETERY,
  ]),
  status: z.enum([
    ContractStatus.DRAFT,
    ContractStatus.FINALIZED,
    ContractStatus.EXECUTED,
    ContractStatus.VOID,
    ContractStatus.CANCELLED,
  ]),
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
// Empty strings for optional fields is a convention (matches what forms render).
// Note: Dirty detection uses snapshot comparison (form values → form values),
// so these defaults don't affect dirty tracking - same approach as legacy app.
export function getDefaultContractFormValues(): ContractFormValues {
  return {
    type: ContractType.AT_NEED_FUNERAL,
    status: ContractStatus.DRAFT,
    caseId: '',
    date: new Date().toISOString().split('T')[0],
    signDate: '',
    prePrintedContractNumber: '',
    purchaser: {
      id: '',
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
      address: undefined, // Keep as undefined - this is an object, not string
      relationship: '',
      dateOfBirth: '',
      dateOfDeath: '',
    },
    coBuyers: [],
    beneficiary: {
      id: '',
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
      address: undefined, // Keep as undefined - this is an object, not string
      relationship: '',
      dateOfBirth: '',
      dateOfDeath: '',
    },
    salesPersonId: '',
    notes: '',
  }
}
