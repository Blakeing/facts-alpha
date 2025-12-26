/**
 * Mock contract data for development
 *
 * Aligned with backend Facts.Entities structure:
 * - Contract has Sales (not direct items)
 * - Sales have SaleItems
 * - ContractPerson with roles instead of embedded purchaser/beneficiary
 *
 * @see docs/data-models.md for field mapping details
 */

import {
  AtNeedType,
  type Contract,
  type ContractFinancing,
  type ContractListing,
  type ContractPayment,
  type ContractPerson,
  ContractPersonRole,
  FinancingStatus,
  getContractPersonDisplayName,
  getPrimaryBeneficiary,
  getPrimaryBuyer,
  ItemType,
  LateFeeType,
  NeedType,
  PaymentMethod,
  PreNeedFundingType,
  type Sale,
  type SaleItem,
  SaleStatus,
  SaleType,
} from '../model/contract'

// =============================================================================
// ID Generation
// =============================================================================

let idCounter = 100
export function generateId(): string {
  return `id-${++idCounter}`
}

// =============================================================================
// Mock Sale Items
// =============================================================================

function createSaleItem(
  overrides: Partial<SaleItem> & { id: string; saleId: string; description: string },
): SaleItem {
  return {
    itemId: overrides.itemId ?? generateId(),
    needType: NeedType.AT_NEED,
    quantity: 1,
    unitPrice: 0,
    bookPrice: 0,
    cost: 0,
    bookCost: 0,
    salesTaxEnabled: true,
    isCancelled: false,
    ordinal: 0,
    salesTax: [],
    discounts: [],
    trust: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// =============================================================================
// Mock Sales
// =============================================================================

const mockSales: Record<string, Sale[]> = {
  'contract-1': [
    {
      id: 'sale-1',
      contractId: 'contract-1',
      saleNumber: 'S-2024-0001',
      saleDate: '2024-12-10',
      saleType: SaleType.CONTRACT,
      saleStatus: SaleStatus.EXECUTED,
      accountingPeriod: '2024-12-01',
      memo: '',
      subtotal: 6125,
      taxTotal: 231,
      discountTotal: 200,
      grandTotal: 6156,
      items: [
        createSaleItem({
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'cat-srv-001',
          description: 'Professional Services',
          itemType: ItemType.SERVICE,
          sku: 'SRV-001',
          quantity: 1,
          unitPrice: 2500,
          needType: NeedType.AT_NEED,
        }),
        createSaleItem({
          id: 'item-2',
          saleId: 'sale-1',
          itemId: 'cat-mer-001',
          description: 'Casket - Oak Heritage',
          itemType: ItemType.MERCHANDISE,
          sku: 'MER-001',
          quantity: 1,
          unitPrice: 3500,
          bookPrice: 3500,
          cost: 1200,
          needType: NeedType.AT_NEED,
          salesTax: [
            {
              id: 'tax-1',
              saleItemId: 'item-2',
              taxProfileItemId: 'tax-profile-1',
              taxRate: 7,
              taxAmount: 231,
            },
          ],
          discounts: [
            {
              id: 'disc-1',
              saleItemId: 'item-2',
              description: 'Senior discount',
              amount: 200,
              percentage: 5.71,
            },
          ],
        }),
        createSaleItem({
          id: 'item-3',
          saleId: 'sale-1',
          itemId: 'cat-ca-001',
          description: 'Death Certificates (5)',
          itemType: ItemType.CASH_ADVANCE,
          sku: 'CA-001',
          quantity: 5,
          unitPrice: 25,
          needType: NeedType.AT_NEED,
          salesTaxEnabled: false,
        }),
      ],
      createdAt: '2024-12-10T10:00:00Z',
      updatedAt: '2024-12-10T10:30:00Z',
    },
  ],
  'contract-2': [
    {
      id: 'sale-2',
      contractId: 'contract-2',
      saleNumber: 'S-2024-0002',
      saleDate: '2024-12-15',
      saleType: SaleType.CONTRACT,
      saleStatus: SaleStatus.FINALIZED,
      accountingPeriod: '2024-12-01',
      memo: 'Cremation service requested',
      subtotal: 3700,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 3700,
      items: [
        createSaleItem({
          id: 'item-4',
          saleId: 'sale-2',
          itemId: 'cat-srv-001',
          description: 'Professional Services',
          itemType: ItemType.SERVICE,
          sku: 'SRV-001',
          quantity: 1,
          unitPrice: 2500,
          needType: NeedType.AT_NEED,
        }),
        createSaleItem({
          id: 'item-5',
          saleId: 'sale-2',
          itemId: 'cat-srv-002',
          description: 'Cremation Service',
          itemType: ItemType.SERVICE,
          sku: 'SRV-002',
          quantity: 1,
          unitPrice: 1200,
          needType: NeedType.AT_NEED,
        }),
      ],
      createdAt: '2024-12-15T09:00:00Z',
      updatedAt: '2024-12-15T09:30:00Z',
    },
  ],
  'contract-3': [], // Draft - no sales yet
  'contract-4': [
    {
      id: 'sale-3',
      contractId: 'contract-4',
      saleNumber: 'S-2024-0003',
      saleDate: '2024-11-01',
      saleType: SaleType.CONTRACT,
      saleStatus: SaleStatus.EXECUTED,
      accountingPeriod: '2024-11-01',
      memo: 'Pre-need funeral package',
      subtotal: 8500,
      taxTotal: 425,
      discountTotal: 500,
      grandTotal: 8425,
      items: [
        createSaleItem({
          id: 'item-6',
          saleId: 'sale-3',
          itemId: 'cat-pkg-001',
          description: 'Complete Funeral Package',
          itemType: ItemType.SERVICE,
          sku: 'PKG-001',
          quantity: 1,
          unitPrice: 8500,
          needType: NeedType.PRE_NEED,
          salesTax: [
            {
              id: 'tax-2',
              saleItemId: 'item-6',
              taxProfileItemId: 'tax-profile-1',
              taxRate: 5,
              taxAmount: 425,
            },
          ],
          discounts: [
            {
              id: 'disc-2',
              saleItemId: 'item-6',
              description: 'Pre-need early planning discount',
              amount: 500,
            },
          ],
        }),
      ],
      createdAt: '2024-11-01T10:00:00Z',
      updatedAt: '2024-11-01T10:30:00Z',
    },
  ],
}

// =============================================================================
// Mock People
// =============================================================================

function createPerson(
  overrides: Partial<ContractPerson> & {
    id: string
    contractId: string
    firstName: string
    lastName: string
  },
): ContractPerson {
  return {
    nameId: overrides.nameId ?? generateId(),
    roles: [ContractPersonRole.PERSON],
    addedAfterContractExecution: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

const mockPeople: Record<string, ContractPerson[]> = {
  'contract-1': [
    createPerson({
      id: 'person-1',
      contractId: 'contract-1',
      nameId: 'name-1',
      firstName: 'Mary',
      lastName: 'Johnson',
      phone: '555-123-4567',
      email: 'mary.johnson@email.com',
      roles: [ContractPersonRole.PRIMARY_BUYER],
      address: {
        address1: '123 Oak Street',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
      },
    }),
    createPerson({
      id: 'person-2',
      contractId: 'contract-1',
      nameId: 'name-2',
      firstName: 'Robert',
      middleName: 'James',
      lastName: 'Johnson',
      dateOfBirth: '1945-03-15',
      dateOfDeath: '2024-12-08',
      roles: [ContractPersonRole.PRIMARY_BENEFICIARY],
    }),
  ],
  'contract-2': [
    createPerson({
      id: 'person-3',
      contractId: 'contract-2',
      nameId: 'name-3',
      firstName: 'Thomas',
      lastName: 'Williams',
      phone: '555-987-6543',
      email: 'thomas.w@email.com',
      roles: [ContractPersonRole.PRIMARY_BUYER],
    }),
    createPerson({
      id: 'person-4',
      contractId: 'contract-2',
      nameId: 'name-4',
      firstName: 'Susan',
      lastName: 'Williams',
      roles: [ContractPersonRole.CO_BUYER],
    }),
    createPerson({
      id: 'person-5',
      contractId: 'contract-2',
      nameId: 'name-5',
      firstName: 'Margaret',
      lastName: 'Williams',
      dateOfBirth: '1938-07-22',
      dateOfDeath: '2024-12-14',
      roles: [ContractPersonRole.PRIMARY_BENEFICIARY],
    }),
  ],
  'contract-3': [
    createPerson({
      id: 'person-6',
      contractId: 'contract-3',
      nameId: 'name-6',
      firstName: 'David',
      lastName: 'Brown',
      phone: '555-456-7890',
      roles: [ContractPersonRole.PRIMARY_BUYER],
    }),
    createPerson({
      id: 'person-7',
      contractId: 'contract-3',
      nameId: 'name-7',
      firstName: 'Eleanor',
      lastName: 'Brown',
      dateOfDeath: '2024-12-19',
      roles: [ContractPersonRole.PRIMARY_BENEFICIARY],
    }),
  ],
  'contract-4': [
    createPerson({
      id: 'person-8',
      contractId: 'contract-4',
      nameId: 'name-8',
      firstName: 'Richard',
      lastName: 'Davis',
      phone: '555-111-2222',
      email: 'r.davis@email.com',
      dateOfBirth: '1955-09-10',
      roles: [ContractPersonRole.PRIMARY_BUYER, ContractPersonRole.PRIMARY_BENEFICIARY], // Same person
    }),
  ],
}

// =============================================================================
// Mock Financing
// =============================================================================

const mockFinancing: Record<string, ContractFinancing | undefined> = {
  'contract-1': {
    id: 'fin-1',
    contractId: 'contract-1',
    isFinanced: false,
    downPayment: 5000,
    otherCredits: 0,
    paymentsPerYear: 12,
    useManualPaymentAmount: false,
    useManualFinanceCharges: false,
    status: FinancingStatus.CALCULATED,
    receivesCouponBook: false,
    receivesStatement: true,
    interestRebateDays: 0,
    lateFeeType: LateFeeType.NONE,
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
  },
  'contract-2': undefined, // Paid in full
  'contract-3': undefined, // Draft
  'contract-4': {
    id: 'fin-2',
    contractId: 'contract-4',
    isFinanced: true,
    downPayment: 2000,
    otherCredits: 0,
    interestRate: 5.9,
    term: 36,
    paymentsPerYear: 12,
    firstPaymentDate: '2024-12-01',
    paymentAmount: 195.5,
    useManualPaymentAmount: false,
    calculatedPaymentAmount: 195.5,
    totalFinanceCharges: 618,
    useManualFinanceCharges: false,
    calculatedTotalFinanceCharges: 618,
    status: FinancingStatus.CALCULATED,
    receivesCouponBook: true,
    receivesStatement: true,
    interestRebateDays: 30,
    lateFeeType: LateFeeType.FIXED_AMOUNT,
    lateFeeAmount: 25,
    lateFeeGracePeriod: 10,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
}

// =============================================================================
// Mock Payments
// =============================================================================

const mockPayments: Record<string, ContractPayment[]> = {
  'contract-1': [
    {
      id: 'pay-1',
      contractId: 'contract-1',
      saleId: 'sale-1',
      date: '2024-12-15',
      method: PaymentMethod.CREDIT_CARD,
      amount: 3000,
      reference: 'CC-4532',
      notes: 'Initial deposit',
      createdAt: '2024-12-15T14:00:00Z',
      updatedAt: '2024-12-15T14:00:00Z',
    },
    {
      id: 'pay-2',
      contractId: 'contract-1',
      saleId: 'sale-1',
      date: '2024-12-20',
      method: PaymentMethod.CHECK,
      amount: 2000,
      reference: '',
      checkNumber: '1234',
      notes: '',
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
  ],
  'contract-2': [
    {
      id: 'pay-3',
      contractId: 'contract-2',
      saleId: 'sale-2',
      date: '2024-12-18',
      method: PaymentMethod.INSURANCE,
      amount: 3700,
      reference: 'Policy #ABC123',
      notes: 'Full payment from life insurance',
      createdAt: '2024-12-18T11:00:00Z',
      updatedAt: '2024-12-18T11:00:00Z',
    },
  ],
  'contract-3': [],
  'contract-4': [
    {
      id: 'pay-4',
      contractId: 'contract-4',
      saleId: 'sale-3',
      date: '2024-11-01',
      method: PaymentMethod.CHECK,
      amount: 2000,
      checkNumber: '5678',
      notes: 'Down payment',
      createdAt: '2024-11-01T10:30:00Z',
      updatedAt: '2024-11-01T10:30:00Z',
    },
  ],
}

// =============================================================================
// Mock Contracts
// =============================================================================

export const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    contractNumber: 'AN-2024-0001',
    prePrintedContractNumber: 'PP-12345',
    locationId: 'loc-001', // Evergreen Memorial Funeral Home
    needType: NeedType.AT_NEED,
    atNeedType: AtNeedType.WALK_IN,
    salesPersonId: 'user-1',
    salesPersonName: 'John Smith',
    dateExecuted: '2024-12-10',
    dateSigned: '2024-12-10',
    isCancelled: false,
    isConditionalSale: false,
    subtotal: 6125,
    taxTotal: 231,
    discountTotal: 200,
    grandTotal: 6156,
    amountPaid: 5000,
    balanceDue: 1156,
    sales: mockSales['contract-1'],
    people: mockPeople['contract-1'],
    financing: mockFinancing['contract-1'],
    payments: mockPayments['contract-1'],
    notes: 'Family requested oak casket. Visitation on Dec 12.',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'contract-2',
    contractNumber: 'AN-2024-0002',
    locationId: 'loc-001', // Evergreen Memorial Funeral Home
    needType: NeedType.AT_NEED,
    atNeedType: AtNeedType.WALK_IN,
    salesPersonId: 'user-2',
    salesPersonName: 'Jane Doe',
    dateExecuted: '2024-12-15',
    dateSigned: '2024-12-15',
    isCancelled: false,
    isConditionalSale: false,
    subtotal: 3700,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 3700,
    amountPaid: 3700,
    balanceDue: 0,
    sales: mockSales['contract-2'],
    people: mockPeople['contract-2'],
    payments: mockPayments['contract-2'],
    notes: '',
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-18T11:00:00Z',
  },
  {
    id: 'contract-3',
    contractNumber: 'AN-2024-0003',
    locationId: 'loc-003', // Sunrise Chapel & Crematory
    needType: NeedType.AT_NEED,
    atNeedType: AtNeedType.WALK_IN,
    salesPersonName: 'John Smith',
    isCancelled: false,
    isConditionalSale: false,
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 0,
    amountPaid: 0,
    balanceDue: 0,
    sales: mockSales['contract-3'],
    people: mockPeople['contract-3'],
    payments: mockPayments['contract-3'],
    notes: '',
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T08:00:00Z',
  },
  {
    id: 'contract-4',
    contractNumber: 'PN-2024-0001',
    locationId: 'loc-003', // Sunrise Chapel & Crematory
    needType: NeedType.PRE_NEED,
    preNeedFundingType: PreNeedFundingType.TRUST,
    salesPersonId: 'user-2',
    salesPersonName: 'Jane Doe',
    dateExecuted: '2024-11-01',
    dateSigned: '2024-11-01',
    isCancelled: false,
    isConditionalSale: false,
    subtotal: 8500,
    taxTotal: 425,
    discountTotal: 500,
    grandTotal: 8425,
    amountPaid: 2000,
    balanceDue: 6425,
    sales: mockSales['contract-4'],
    people: mockPeople['contract-4'],
    financing: mockFinancing['contract-4'],
    payments: mockPayments['contract-4'],
    notes: 'Pre-planned funeral. Financing over 36 months.',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T15:00:00Z',
  },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get primary sale status for a contract (status of first non-adjustment sale)
 */
function getPrimarySaleStatus(sales: Sale[] | undefined): SaleStatus {
  if (!sales || sales.length === 0) return SaleStatus.DRAFT
  const primarySale = sales.find((s) => s.saleType === SaleType.CONTRACT)
  return primarySale?.saleStatus ?? SaleStatus.DRAFT
}

/**
 * Convert full contract to listing format
 */
export function contractToListing(contract: Contract): ContractListing {
  const buyer = contract.people ? getPrimaryBuyer(contract.people) : undefined
  const beneficiary = contract.people ? getPrimaryBeneficiary(contract.people) : undefined

  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    prePrintedContractNumber: contract.prePrintedContractNumber,
    locationId: contract.locationId,
    needType: contract.needType,
    saleStatus: getPrimarySaleStatus(contract.sales || []),
    isCancelled: contract.isCancelled,
    dateExecuted: contract.dateExecuted,
    dateSigned: contract.dateSigned,
    primaryBuyerName: buyer ? getContractPersonDisplayName(buyer) : '',
    primaryBeneficiaryName: beneficiary ? getContractPersonDisplayName(beneficiary) : '',
    salesPersonName: contract.salesPersonName,
    grandTotal: contract.grandTotal,
    amountPaid: contract.amountPaid,
    balanceDue: contract.balanceDue,
  }
}

// =============================================================================
// Exports for API
// =============================================================================

export { mockFinancing, mockPayments, mockPeople, mockSales }
