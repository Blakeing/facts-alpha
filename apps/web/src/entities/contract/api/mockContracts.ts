/**
 * Mock contract data for development
 */

import {
  type Contract,
  type ContractItem,
  type ContractListing,
  type ContractPayment,
  ContractStatus,
  ContractType,
} from '../model/contract'

// Helper to generate IDs
let idCounter = 100
function generateId(): string {
  return `contract-${++idCounter}`
}

// Mock items for contracts
const mockItems: Record<string, ContractItem[]> = {
  'contract-1': [
    {
      id: 'item-1',
      contractId: 'contract-1',
      itemNumber: 'SRV-001',
      description: 'Professional Services',
      category: 'service',
      quantity: 1,
      unitPrice: 2500,
      discount: 0,
      tax: 0,
      total: 2500,
    },
    {
      id: 'item-2',
      contractId: 'contract-1',
      itemNumber: 'MER-001',
      description: 'Casket - Oak Heritage',
      category: 'merchandise',
      quantity: 1,
      unitPrice: 3500,
      discount: 200,
      tax: 231,
      total: 3531,
    },
    {
      id: 'item-3',
      contractId: 'contract-1',
      itemNumber: 'CA-001',
      description: 'Death Certificates (5)',
      category: 'cash_advance',
      quantity: 5,
      unitPrice: 25,
      discount: 0,
      tax: 0,
      total: 125,
    },
  ],
  'contract-2': [
    {
      id: 'item-4',
      contractId: 'contract-2',
      itemNumber: 'SRV-001',
      description: 'Professional Services',
      category: 'service',
      quantity: 1,
      unitPrice: 2500,
      discount: 0,
      tax: 0,
      total: 2500,
    },
    {
      id: 'item-5',
      contractId: 'contract-2',
      itemNumber: 'SRV-002',
      description: 'Cremation Service',
      category: 'service',
      quantity: 1,
      unitPrice: 1200,
      discount: 0,
      tax: 0,
      total: 1200,
    },
  ],
}

// Mock payments for contracts
const mockPayments: Record<string, ContractPayment[]> = {
  'contract-1': [
    {
      id: 'pay-1',
      contractId: 'contract-1',
      date: '2024-12-15',
      method: 'credit_card',
      amount: 3000,
      reference: 'CC-4532',
      notes: 'Initial deposit',
    },
    {
      id: 'pay-2',
      contractId: 'contract-1',
      date: '2024-12-20',
      method: 'check',
      amount: 2000,
      reference: 'Check #1234',
    },
  ],
  'contract-2': [
    {
      id: 'pay-3',
      contractId: 'contract-2',
      date: '2024-12-18',
      method: 'insurance',
      amount: 3700,
      reference: 'Policy #ABC123',
    },
  ],
}

// Full contract data
export const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    contractNumber: 'AN-2024-0001',
    prePrintedContractNumber: 'PP-12345',
    type: ContractType.AT_NEED_FUNERAL,
    status: ContractStatus.EXECUTED,
    caseId: '1', // Links to case
    date: '2024-12-10',
    signDate: '2024-12-10',
    purchaser: {
      id: 'person-1',
      firstName: 'Mary',
      lastName: 'Johnson',
      phone: '555-123-4567',
      email: 'mary.johnson@email.com',
      relationship: 'Daughter',
      address: {
        street: '123 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      },
    },
    coBuyers: [],
    beneficiary: {
      id: 'person-2',
      firstName: 'Robert',
      middleName: 'James',
      lastName: 'Johnson',
      dateOfBirth: '1945-03-15',
      dateOfDeath: '2024-12-08',
    },
    salesPersonId: 'user-1',
    salesPersonName: 'John Smith',
    subtotal: 5825,
    taxTotal: 231,
    discountTotal: 200,
    grandTotal: 6156,
    amountPaid: 5000,
    balanceDue: 1156,
    items: mockItems['contract-1'],
    payments: mockPayments['contract-1'],
    notes: 'Family requested oak casket. Visitation on Dec 12.',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'contract-2',
    contractNumber: 'AN-2024-0002',
    type: ContractType.AT_NEED_FUNERAL,
    status: ContractStatus.FINALIZED,
    caseId: '2',
    date: '2024-12-15',
    purchaser: {
      id: 'person-3',
      firstName: 'Thomas',
      lastName: 'Williams',
      phone: '555-987-6543',
      email: 'thomas.w@email.com',
      relationship: 'Son',
    },
    coBuyers: [
      {
        id: 'person-4',
        firstName: 'Susan',
        lastName: 'Williams',
        relationship: 'Daughter',
      },
    ],
    beneficiary: {
      id: 'person-5',
      firstName: 'Margaret',
      lastName: 'Williams',
      dateOfBirth: '1938-07-22',
      dateOfDeath: '2024-12-14',
    },
    salesPersonId: 'user-2',
    salesPersonName: 'Jane Doe',
    subtotal: 3700,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 3700,
    amountPaid: 3700,
    balanceDue: 0,
    items: mockItems['contract-2'],
    payments: mockPayments['contract-2'],
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-18T11:00:00Z',
  },
  {
    id: 'contract-3',
    contractNumber: 'AN-2024-0003',
    type: ContractType.AT_NEED_FUNERAL,
    status: ContractStatus.DRAFT,
    date: '2024-12-20',
    purchaser: {
      id: 'person-6',
      firstName: 'David',
      lastName: 'Brown',
      phone: '555-456-7890',
    },
    coBuyers: [],
    beneficiary: {
      id: 'person-7',
      firstName: 'Eleanor',
      lastName: 'Brown',
      dateOfDeath: '2024-12-19',
    },
    salesPersonName: 'John Smith',
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 0,
    amountPaid: 0,
    balanceDue: 0,
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T08:00:00Z',
  },
  {
    id: 'contract-4',
    contractNumber: 'PN-2024-0001',
    type: ContractType.PRE_NEED_FUNERAL,
    status: ContractStatus.EXECUTED,
    date: '2024-11-01',
    signDate: '2024-11-01',
    purchaser: {
      id: 'person-8',
      firstName: 'Richard',
      lastName: 'Davis',
      phone: '555-111-2222',
      email: 'r.davis@email.com',
    },
    coBuyers: [],
    beneficiary: {
      id: 'person-8',
      firstName: 'Richard',
      lastName: 'Davis',
      dateOfBirth: '1955-09-10',
    },
    salesPersonName: 'Jane Doe',
    subtotal: 8500,
    taxTotal: 425,
    discountTotal: 500,
    grandTotal: 8425,
    amountPaid: 8425,
    balanceDue: 0,
    notes: 'Pre-planned funeral. Full payment received.',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T15:00:00Z',
  },
]

// Convert to listing format
export function contractToListing(contract: Contract): ContractListing {
  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    prePrintedContractNumber: contract.prePrintedContractNumber,
    type: contract.type,
    status: contract.status,
    date: contract.date,
    purchaserName: `${contract.purchaser.lastName}, ${contract.purchaser.firstName}`,
    beneficiaryName: `${contract.beneficiary.lastName}, ${contract.beneficiary.firstName}`,
    salesPersonName: contract.salesPersonName,
    grandTotal: contract.grandTotal,
    balanceDue: contract.balanceDue,
  }
}

export { generateId, mockItems, mockPayments }
