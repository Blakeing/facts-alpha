# Data Models

This document maps backend C# models to frontend TypeScript types to ensure mock data aligns with production APIs.

## Design Principles

1. **Mock Data = Production Shape**: Mock data should have the same structure as backend responses
2. **BFF Handles Conversion**: The BFF automatically converts:
   - `long` IDs → `string` (via `LongToStringConverter`)
   - `PascalCase` → `camelCase` (via `CamelCaseNamingStrategy`)
   - Field names: `DateCreated` → `dateCreated`, `DateLastModified` → `dateLastModified`
3. **Frontend Matches BFF**: Facts Alpha uses the exact format the BFF sends:
   - String IDs (BFF converts from backend `long`)
   - camelCase field names (BFF converts from backend `PascalCase`)
   - Numeric enums (BFF sends C# enum values directly)
   - ISO 8601 date strings (BFF converts from `DateTime`)
4. **No Mapping Layer**: Since BFF format = Frontend format, no conversion is needed

## Location Entity

### Backend Models

**`Facts.Entities.Location`** (C#):

```csharp
public class Location : Entity {
    public string Identifier { get; set; }           // Location code (e.g., "001")
    public string Name { get; set; }
    public string Address1 { get; set; }
    public string Address2 { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string PostalCode { get; set; }
    public string County { get; set; }               // ⚠️ Missing in frontend
    public string Country { get; set; }
    public double? Latitude { get; set; }            // ⚠️ Missing in frontend
    public double? Longitude { get; set; }           // ⚠️ Missing in frontend
    public string Mailing_Address1 { get; set; }     // Note: underscore naming
    public string Mailing_Address2 { get; set; }
    public string Mailing_City { get; set; }
    public string Mailing_State { get; set; }
    public string Mailing_PostalCode { get; set; }
    public string Mailing_County { get; set; }
    public string Mailing_Country { get; set; }
    public bool MailingSameAsPhysical { get; set; }
    public string Phone { get; set; }
    public string Website { get; set; }
    public string Email { get; set; }
    public LocationType Type { get; set; }           // Enum: 0=Funeral, 1=Cemetery, 2=Corporate
    public bool Active { get; set; }
    public long? IntercompanyGLAccountId { get; set; }  // ⚠️ Missing in frontend
    public DateTime AccountingPeriod { get; set; }      // ⚠️ Missing in frontend
    public long GLGroupId { get; set; }                 // ⚠️ Missing in frontend
    public List<LocationGLAccountMapAssignment> GLMaps { get; set; }  // ⚠️ Missing
    public List<LocationLicense> Licenses { get; set; }
    public string TaxId { get; set; }
    public string Timezone { get; set; }             // ⚠️ Missing in frontend
    public string LicenseNumber { get; set; }        // ⚠️ Missing (deprecated?)
    public string ContractDisplayName { get; set; }  // ⚠️ Missing in frontend
}
```

**`LocationType` Enum**:

```csharp
public enum LocationType {
    Funeral = 0,
    Cemetery = 1,
    Corporate = 2
}
```

### Frontend Type Mapping

| Backend (C#)              | Frontend (TS)                                                  | Notes                                         |
| ------------------------- | -------------------------------------------------------------- | --------------------------------------------- |
| `Id` (long)               | `id` (string)                                                  | Convert numeric to string                     |
| `Identifier`              | `identifier`                                                   | Location code like "001"                      |
| `Name`                    | `name`                                                         |                                               |
| `Address1`                | `address1`                                                     |                                               |
| `Address2`                | `address2`                                                     |                                               |
| `City`                    | `city`                                                         |                                               |
| `State`                   | `state`                                                        | 2-letter code                                 |
| `PostalCode`              | `postalCode`                                                   |                                               |
| `County`                  | `county`                                                       | **Add to frontend**                           |
| `Country`                 | `country`                                                      |                                               |
| `Latitude`                | `latitude`                                                     | **Add to frontend**                           |
| `Longitude`               | `longitude`                                                    | **Add to frontend**                           |
| `Mailing_Address1`        | `mailingAddress1`                                              | Convert underscore to camelCase               |
| `Mailing_Address2`        | `mailingAddress2`                                              |                                               |
| `Mailing_City`            | `mailingCity`                                                  |                                               |
| `Mailing_State`           | `mailingState`                                                 |                                               |
| `Mailing_PostalCode`      | `mailingPostalCode`                                            |                                               |
| `Mailing_County`          | `mailingCounty`                                                | **Add to frontend**                           |
| `Mailing_Country`         | `mailingCountry`                                               |                                               |
| `MailingSameAsPhysical`   | `mailingSameAsPhysical`                                        |                                               |
| `Phone`                   | `phone`                                                        |                                               |
| `Website`                 | `website`                                                      |                                               |
| `Email`                   | `email`                                                        |                                               |
| `Type` (enum 0,1,2)       | `type` (LocationType enum: FUNERAL=0, CEMETERY=1, CORPORATE=2) | BFF sends numeric, frontend uses numeric enum |
| `Active`                  | `active`                                                       |                                               |
| `IntercompanyGLAccountId` | `intercompanyGlAccountId`                                      | **Add to frontend**                           |
| `AccountingPeriod`        | `accountingPeriod`                                             | **Add to frontend** (ISO string)              |
| `GLGroupId`               | `glGroupId`                                                    | **Add to frontend**                           |
| `GLMaps`                  | `glMaps`                                                       | **Add to frontend** (empty array for now)     |
| `Licenses`                | `licenses`                                                     |                                               |
| `TaxId`                   | `taxId`                                                        |                                               |
| `Timezone`                | `timezone`                                                     | **Add to frontend**                           |
| `ContractDisplayName`     | `contractDisplayName`                                          | **Add to frontend**                           |

### Updated Frontend Type

```typescript
// entities/location/model/location.ts

export type LocationType = 'funeral' | 'cemetery' | 'corporate'
export type LocationLicenseType = 'establishment' | 'trust' | 'insurance' | 'coupon_book_id'

export interface LocationLicense {
  id: string
  locationId?: string // Reference to parent
  licenseNumber: string
  licenseType: LocationLicenseType
}

export interface LocationGLAccountMapAssignment {
  id: string
  locationId: string
  glAccountId: string
  // Additional fields TBD when GL features are implemented
}

export interface Location {
  id: string
  identifier: string
  name: string
  type: LocationType
  active: boolean

  // Physical address
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  county: string // NEW
  country: string
  latitude: number | null // NEW
  longitude: number | null // NEW

  // Contact
  phone: string
  email: string
  website: string

  // Mailing address
  mailingSameAsPhysical: boolean
  mailingAddress1: string
  mailingAddress2: string
  mailingCity: string
  mailingState: string
  mailingPostalCode: string
  mailingCounty: string // NEW
  mailingCountry: string

  // Accounting
  accountingPeriod: string // NEW - ISO date string
  glGroupId: string // NEW
  intercompanyGlAccountId: string | null // NEW
  glMaps: LocationGLAccountMapAssignment[] // NEW

  // Licenses
  licenses: LocationLicense[]
  taxId: string

  // Display
  timezone: string | null // NEW
  contractDisplayName: string // NEW

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Listing model for list views (minimal fields for performance)
export interface LocationListing {
  id: string
  identifier: string
  name: string
  city: string
  state: string
  type: LocationType
  active: boolean
  glGroupId: string // NEW - needed for filtering
}
```

## LocationType Enum Mapping

| Backend Value | Backend Name | Frontend Value |
| ------------- | ------------ | -------------- |
| 0             | `Funeral`    | `'funeral'`    |
| 1             | `Cemetery`   | `'cemetery'`   |
| 2             | `Corporate`  | `'corporate'`  |

**Conversion helper** (for API integration):

```typescript
const locationTypeFromBackend = (value: number): LocationType => {
  const map: Record<number, LocationType> = {
    0: 'funeral',
    1: 'cemetery',
    2: 'corporate',
  }
  return map[value] ?? 'funeral'
}

const locationTypeToBackend = (value: LocationType): number => {
  const map: Record<LocationType, number> = {
    funeral: 0,
    cemetery: 1,
    corporate: 2,
  }
  return map[value]
}
```

## LocationLicenseType Enum Mapping

| Backend Value | Backend Name    | Frontend Value     |
| ------------- | --------------- | ------------------ |
| 1             | `Establishment` | `'establishment'`  |
| 2             | `Trust`         | `'trust'`          |
| 3             | `Insurance`     | `'insurance'`      |
| 4             | `CouponBookId`  | `'coupon_book_id'` |

## Contract Entity

The Contract entity is the core of the ERP system. It has a complex structure with multiple related entities.

### Entity Relationship

```
Contract
├── Sales[] (line items live here)
│   └── SaleItems[]
│       ├── Discounts[]
│       ├── SalesTax[]
│       └── Trust[]
├── People[] (buyers, beneficiaries)
│   └── Name (linked entity)
├── Financing (payment terms)
├── Services[] (funeral services)
├── Obituaries[]
└── CommissionSplits[]
```

### Backend Models

**`Facts.Entities.Contract`** (C#):

```csharp
public class Contract : Entity {
    public string ContractNumber { get; set; }
    public string PrePrintedContractNumber { get; set; }
    public long LocationId { get; set; }
    public NeedType? NeedType { get; set; }              // AN=1, PN=2
    public long? ContractTypeId { get; set; }            // Links to ContractType lookup
    public long? LeadSourceId { get; set; }
    public long? ContractSaleTypeId { get; set; }
    public long? ContractReferenceId { get; set; }
    public long? SalesPersonId { get; set; }
    public long? MarketingAgentId { get; set; }
    public JobFunctionSystemType? SalesPersonRole { get; set; }
    public DateTime? DateExecuted { get; set; }
    public DateTime? DateSigned { get; set; }
    public bool IsCancelled { get; set; }
    public bool IsConditionalSale { get; set; }
    public DateTime? DateApproved { get; set; }
    public AtNeedType? AtNeedType { get; set; }          // WalkIn=0, PN_Maturity=1
    public PreNeedFundingType? PreNeedFundingType { get; set; }  // Trust=0, Insurance=1
    public SystemKeyType? SystemKey { get; set; }
    public long? FirstCallId { get; set; }
    public long? CommentFeedOwnerId { get; set; }

    // Related entities
    public List<Sale> Sales { get; set; }
    public List<ContractPerson> People { get; set; }
    public ContractFinancing Financing { get; set; }
    public List<ContractFundingDetail> FundingDetails { get; set; }
    public List<Service> Services { get; set; }
    public List<Obituary> Obituaries { get; set; }
    public List<ContractCommissionSplit> CommissionSplits { get; set; }
    public List<ContractNameRole> NameRoles { get; set; }
}
```

**`Facts.Entities.Sale`** (C#):

```csharp
public class Sale : Entity {
    public long? ContractId { get; set; }
    public DateTime? SaleDate { get; set; }
    public string SaleNumber { get; set; }
    public SaleType SaleType { get; set; }               // Contract=0, ContractAdjustment=1, MiscCash=2
    public SaleStatus SaleStatus { get; set; }           // Draft=0, Executed=1, Finalized=2, Void=3
    public SaleTransactionStatus SaleTransactionStatus { get; set; }
    public SaleAdjustmentType? SaleAdjustmentType { get; set; }
    public long? CancellationTypeId { get; set; }
    public string Memo { get; set; }
    public DateTime? AccountingPeriod { get; set; }
    public List<SaleTaxSummary> SalesTax { get; set; }
    public List<SaleItem> Items { get; set; }
}
```

**`Facts.Entities.SaleItem`** (C#):

```csharp
public class SaleItem : Entity {
    public long SaleId { get; set; }
    public Guid SaleItemGuid { get; set; }
    public long ItemId { get; set; }
    public string Description { get; set; }
    public NeedType NeedType { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal BookPrice { get; set; }
    public decimal Cost { get; set; }
    public decimal BookCost { get; set; }
    public long? PropertyInventoryId { get; set; }
    public bool SalesTaxEnabled { get; set; }
    public string SerialNumber { get; set; }
    public bool IsCancelled { get; set; }
    public long? CancellationOfSaleItemId { get; set; }
    public long? ReplacementOfSaleItemId { get; set; }
    public int Ordinal { get; set; }

    // Child collections
    public List<SaleItemTrustFund> Trust { get; set; }
    public List<SaleItemDiscount> Discounts { get; set; }
    public List<SaleCommissionItem> Commissions { get; set; }
    public List<SaleItemSalesTax> SalesTax { get; set; }
}
```

**`Facts.Entities.ContractFinancing`** (C#):

```csharp
public class ContractFinancing : Entity {
    public long ContractId { get; set; }
    public bool IsFinanced { get; set; }
    public decimal DownPayment { get; set; }
    public decimal OtherCredits { get; set; }
    public decimal? InterestRate { get; set; }
    public decimal? Term { get; set; }
    public int PaymentsPerYear { get; set; }
    public DateTime? FirstPaymentDate { get; set; }
    public decimal? PaymentAmount { get; set; }
    public bool UseManualPaymentAmount { get; set; }
    public decimal? TotalFinanceCharges { get; set; }
    public decimal? CalculatedPaymentAmount { get; set; }
    public ContractFinancingStatus Status { get; set; }
    public bool ReceivesCouponBook { get; set; }
    public bool ReceivesStatement { get; set; }
    public LateFeeType LateFeeType { get; set; }
    public decimal? LateFeeAmount { get; set; }
    public int? LateFeeGracePeriod { get; set; }
}
```

**`Facts.Entities.ContractPerson`** (C#):

```csharp
public class ContractPerson : Entity {
    public long NameId { get; set; }                     // Links to Name entity
    public long ContractId { get; set; }
    public ContractPersonRole Roles { get; set; }        // Flags enum (numeric)
    public bool AddedAfterContractExecution { get; set; }
    public Name Name { get; set; }                       // Navigation property (nested in BFF response)
}
```

**`Facts.Entities.Name`** (C#):

The BFF returns ContractPerson with a nested `Name` object that includes:

- Name fields: `first`, `last`, `middle`, `prefix`, `suffix`, `nickname`, `companyName`
- Dates: `birthDate`, `deathDate`, `timeOfDeath`
- Demographics: `gender`, `maritalStatus`, `ethnicity`, `race`, `isVeteran`
- Nested collections:
  - `phones[]` - Array of phone numbers with `number`, `type`, `preferred`, `active`
  - `addresses[]` - Array of addresses with `address1`, `city`, `state`, `postalCode`, `primary`, `active`
  - `emailAddresses[]` - Array of emails with `address`, `preferred`, `active`
  - `relations[]` - Array of name relationships

**Important:** The BFF returns the full nested structure. Facts Alpha types match this exactly - no flattening/transformation needed!

### Contract Enums

**NeedType:**

| Backend | Name | Frontend     |
| ------- | ---- | ------------ |
| 1       | `AN` | `'at_need'`  |
| 2       | `PN` | `'pre_need'` |

**SaleType:**

| Backend | Name                 | Frontend                |
| ------- | -------------------- | ----------------------- |
| 0       | `Contract`           | `'contract'`            |
| 1       | `ContractAdjustment` | `'contract_adjustment'` |
| 2       | `MiscCash`           | `'misc_cash'`           |

**SaleStatus:**

| Backend | Name        | Frontend      |
| ------- | ----------- | ------------- |
| 0       | `Draft`     | `'draft'`     |
| 1       | `Executed`  | `'executed'`  |
| 2       | `Finalized` | `'finalized'` |
| 3       | `Void`      | `'void'`      |

**SaleAdjustmentType:**

| Backend | Name               | Frontend              |
| ------- | ------------------ | --------------------- |
| 0       | `SalesTax`         | `'sales_tax'`         |
| 1       | `Discount`         | `'discount'`          |
| 2       | `Cancellation`     | `'cancellation'`      |
| 3       | `Exchange`         | `'exchange'`          |
| 4       | `Transfer`         | `'transfer'`          |
| 5       | `Addendum`         | `'addendum'`          |
| 6       | `NeedTypeSwap`     | `'need_type_swap'`    |
| 7       | `LateFee`          | `'late_fee'`          |
| 8       | `PropertyExchange` | `'property_exchange'` |
| 9       | `ItemCredit`       | `'item_credit'`       |

**ContractPersonRole** (Flags Enum - numeric):

| Backend | Name                    | Frontend | Notes                                 |
| ------- | ----------------------- | -------- | ------------------------------------- |
| 0       | `Person`                | `0`      | Base role                             |
| 1       | `PrimaryBuyer`          | `1`      | Flags enum - use bitwise AND to check |
| 2       | `CoBuyer`               | `2`      | Flags enum - use bitwise AND to check |
| 4       | `PrimaryBeneficiary`    | `4`      | Flags enum - use bitwise AND to check |
| 8       | `AdditionalBeneficiary` | `8`      | Flags enum - use bitwise AND to check |

**Note:** BFF returns `roles` as a **number** (flags enum), not an array. Use bitwise operations: `(person.roles & 1) !== 0` to check for PrimaryBuyer.

**AtNeedType:**

| Backend | Name          | Frontend        |
| ------- | ------------- | --------------- |
| 0       | `WalkIn`      | `'walk_in'`     |
| 1       | `PN_Maturity` | `'pn_maturity'` |

**PreNeedFundingType:**

| Backend | Name        | Frontend      |
| ------- | ----------- | ------------- |
| 0       | `Trust`     | `'trust'`     |
| 1       | `Insurance` | `'insurance'` |

### Frontend Type Mapping

**Contract:**

| Backend (C#)               | Frontend (TS)              | Notes                |
| -------------------------- | -------------------------- | -------------------- |
| `Id`                       | `id`                       | string               |
| `ContractNumber`           | `contractNumber`           |                      |
| `PrePrintedContractNumber` | `prePrintedContractNumber` |                      |
| `LocationId`               | `locationId`               | string               |
| `NeedType`                 | `needType`                 | Map to string enum   |
| `ContractTypeId`           | `contractTypeId`           | string, nullable     |
| `LeadSourceId`             | `leadSourceId`             | string, nullable     |
| `ContractSaleTypeId`       | `contractSaleTypeId`       | string, nullable     |
| `SalesPersonId`            | `salesPersonId`            | string, nullable     |
| `MarketingAgentId`         | `marketingAgentId`         | string, nullable     |
| `DateExecuted`             | `dateExecuted`             | ISO string           |
| `DateSigned`               | `dateSigned`               | ISO string           |
| `IsCancelled`              | `isCancelled`              |                      |
| `IsConditionalSale`        | `isConditionalSale`        |                      |
| `DateApproved`             | `dateApproved`             | ISO string, nullable |
| `AtNeedType`               | `atNeedType`               | Map to string enum   |
| `PreNeedFundingType`       | `preNeedFundingType`       | Map to string enum   |
| `FirstCallId`              | `firstCallId`              | string, nullable     |
| `CommentFeedOwnerId`       | `commentFeedOwnerId`       | string, nullable     |
| `Sales`                    | `sales`                    | Loaded separately    |
| `People`                   | `people`                   | Loaded separately    |
| `Financing`                | `financing`                | Embedded             |

**Sale:**

| Backend (C#)         | Frontend (TS)        | Notes                        |
| -------------------- | -------------------- | ---------------------------- |
| `Id`                 | `id`                 | string                       |
| `ContractId`         | `contractId`         | string                       |
| `SaleDate`           | `saleDate`           | ISO string                   |
| `SaleNumber`         | `saleNumber`         |                              |
| `SaleType`           | `saleType`           | Map to string enum           |
| `SaleStatus`         | `saleStatus`         | Map to string enum           |
| `SaleAdjustmentType` | `saleAdjustmentType` | Map to string enum, nullable |
| `AccountingPeriod`   | `accountingPeriod`   | ISO string                   |
| `Memo`               | `memo`               |                              |
| `Items`              | `items`              | Nested array                 |

**SaleItem:**

| Backend (C#)  | Frontend (TS) | Notes              |
| ------------- | ------------- | ------------------ |
| `Id`          | `id`          | string             |
| `SaleId`      | `saleId`      | string             |
| `ItemId`      | `itemId`      | string             |
| `Description` | `description` |                    |
| `NeedType`    | `needType`    | Map to string enum |
| `Quantity`    | `quantity`    | number             |
| `UnitPrice`   | `unitPrice`   | number             |
| `BookPrice`   | `bookPrice`   | number             |
| `Cost`        | `cost`        | number             |
| `IsCancelled` | `isCancelled` |                    |
| `Ordinal`     | `ordinal`     | Sort order         |
| `SalesTax`    | `salesTax`    | Nested array       |
| `Discounts`   | `discounts`   | Nested array       |

### Updated Frontend Types

```typescript
// entities/contract/model/contract.ts

// =============================================================================
// Enums (aligned with backend)
// =============================================================================

export const NeedType = {
  AT_NEED: 'at_need',
  PRE_NEED: 'pre_need',
} as const
export type NeedType = (typeof NeedType)[keyof typeof NeedType]

export const SaleType = {
  CONTRACT: 'contract',
  CONTRACT_ADJUSTMENT: 'contract_adjustment',
  MISC_CASH: 'misc_cash',
} as const
export type SaleType = (typeof SaleType)[keyof typeof SaleType]

export const SaleStatus = {
  DRAFT: 'draft',
  EXECUTED: 'executed',
  FINALIZED: 'finalized',
  VOID: 'void',
} as const
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus]

export const SaleAdjustmentType = {
  SALES_TAX: 'sales_tax',
  DISCOUNT: 'discount',
  CANCELLATION: 'cancellation',
  EXCHANGE: 'exchange',
  TRANSFER: 'transfer',
  ADDENDUM: 'addendum',
  NEED_TYPE_SWAP: 'need_type_swap',
  LATE_FEE: 'late_fee',
  PROPERTY_EXCHANGE: 'property_exchange',
  ITEM_CREDIT: 'item_credit',
} as const
export type SaleAdjustmentType = (typeof SaleAdjustmentType)[keyof typeof SaleAdjustmentType]

export const ContractPersonRole = {
  PERSON: 'person',
  PRIMARY_BUYER: 'primary_buyer',
  CO_BUYER: 'co_buyer',
  PRIMARY_BENEFICIARY: 'primary_beneficiary',
  ADDITIONAL_BENEFICIARY: 'additional_beneficiary',
} as const
export type ContractPersonRole = (typeof ContractPersonRole)[keyof typeof ContractPersonRole]

// =============================================================================
// Entities
// =============================================================================

interface Contract {
  id: string
  contractNumber: string
  prePrintedContractNumber?: string
  locationId: string
  needType: NeedType
  contractTypeId?: string
  leadSourceId?: string
  contractSaleTypeId?: string
  salesPersonId?: string
  marketingAgentId?: string
  dateExecuted?: string
  dateSigned?: string
  isCancelled: boolean
  isConditionalSale: boolean
  dateApproved?: string
  atNeedType?: AtNeedType
  preNeedFundingType?: PreNeedFundingType
  firstCallId?: string
  commentFeedOwnerId?: string

  // Related entities
  sales?: Sale[]
  people?: ContractPerson[]
  financing?: ContractFinancing

  // Timestamps
  createdAt: string
  updatedAt: string
}

interface Sale {
  id: string
  contractId: string
  saleNumber: string
  saleDate?: string
  saleType: SaleType
  saleStatus: SaleStatus
  saleAdjustmentType?: SaleAdjustmentType
  accountingPeriod?: string
  memo?: string
  items: SaleItem[]
}

interface SaleItem {
  id: string
  saleId: string
  itemId: string
  description: string
  needType: NeedType
  quantity: number
  unitPrice: number
  bookPrice: number
  cost: number
  isCancelled: boolean
  ordinal: number
  salesTax: SaleItemSalesTax[]
  discounts: SaleItemDiscount[]
}

interface ContractFinancing {
  id: string
  contractId: string
  isFinanced: boolean
  downPayment: number
  otherCredits: number
  interestRate?: number
  term?: number
  paymentsPerYear: number
  firstPaymentDate?: string
  paymentAmount?: number
  totalFinanceCharges?: number
  receivesCouponBook: boolean
  receivesStatement: boolean
}

interface ContractPerson {
  id: string
  contractId: string
  nameId: string
  roles: number // Flags enum: 1=PrimaryBuyer, 2=CoBuyer, 4=PrimaryBeneficiary, 8=AdditionalBeneficiary
  addedAfterContractExecution: boolean
  // Nested Name object from BFF (includes phones[], addresses[], emailAddresses[])
  name: Name
}

interface Name {
  id: string
  first: string
  last: string
  middle: string
  prefix: string
  suffix: string
  nickname: string
  companyName: string
  maidenName: string
  birthDate: string | null
  deathDate: string | null
  deceased: boolean
  isVeteran: boolean
  // Nested collections
  phones: NamePhone[]
  addresses: NameAddress[]
  emailAddresses: NameEmail[]
  relations: NameRelation[]
  // ... additional fields
}
```

### Enum Conversion Helpers

```typescript
// Backend numeric to frontend string
const needTypeFromBackend = (value: number): NeedType => {
  const map: Record<number, NeedType> = { 1: 'at_need', 2: 'pre_need' }
  return map[value] ?? 'at_need'
}

const saleStatusFromBackend = (value: number): SaleStatus => {
  const map: Record<number, SaleStatus> = {
    0: 'draft',
    1: 'executed',
    2: 'finalized',
    3: 'void',
  }
  return map[value] ?? 'draft'
}

const saleTypeFromBackend = (value: number): SaleType => {
  const map: Record<number, SaleType> = {
    0: 'contract',
    1: 'contract_adjustment',
    2: 'misc_cash',
  }
  return map[value] ?? 'contract'
}

// Frontend string to backend numeric
const needTypeToBackend = (value: NeedType): number => {
  const map: Record<NeedType, number> = { at_need: 1, pre_need: 2 }
  return map[value]
}
```

## Common Entity Fields

All entities inherit from `Entity` base class:

| Backend            | Frontend          | Notes                  |
| ------------------ | ----------------- | ---------------------- |
| `Id` (long)        | `id` (string)     |                        |
| `DateCreated`      | `createdAt`       | ISO string             |
| `DateLastModified` | `updatedAt`       | ISO string             |
| `CreatedByUserId`  | `createdByUserId` | Optional               |
| `Version`          | `version`         | Optimistic concurrency |

## API Response Wrapper

Backend responses are wrapped in `Response<T>`:

```csharp
public class Response<T> : ResponseBase {
    public T Value { get; set; }
}

public class ResponseBase {
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string ErrorMessage { get; set; }
}
```

**Frontend equivalent**:

```typescript
interface ApiResponse<T> {
  success: boolean
  statusCode: number
  errorMessage?: string
  value?: T
}
```

## Migration Strategy

When connecting to real APIs:

1. **Keep mock data layer**: Can be used for development/testing
2. **Add API adapter**: Transform backend responses to frontend types
3. **Handle enum conversion**: Backend numeric → frontend string
4. **Handle date conversion**: Backend DateTime → frontend ISO string
5. **Handle ID conversion**: Backend long → frontend string

Example adapter pattern:

```typescript
// adapters/locationAdapter.ts
export function adaptLocation(backend: BackendLocation): Location {
  return {
    id: String(backend.id),
    identifier: backend.identifier,
    name: backend.name,
    type: locationTypeFromBackend(backend.type),
    // ... map all fields
    accountingPeriod: backend.accountingPeriod, // Already ISO from JSON
    createdAt: backend.dateCreated,
    updatedAt: backend.dateLastModified,
  }
}
```
