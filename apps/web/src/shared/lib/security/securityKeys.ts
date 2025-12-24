/**
 * Security Option Keys - Aligned with legacy FACTS application
 *
 * These numeric keys map to permissions in the backend.
 * Each key represents a specific feature or action that can be controlled.
 */
export const SecurityOptionKeys = {
  // Special keys
  Admin: -1,
  None: 0,

  // Core permissions
  CanLogin: 1,

  // Accounting
  ManageGLAccounts: 2,
  ManageGLDivisions: 3,
  ManageGLMaps: 4,
  ProcessEndOfMonth: 5,
  ManageGLEntryBatches: 10_000,

  // System
  FactsUtility: 6,
  ManageJobQueue: 7,
  ManageTenants: 8,
  ManageConversions: 73,

  // Commissions
  ManageCommissionRates: 9,
  ProcessCommissionExtracts: 10,
  ProcessCommissionAdjustments: 18,
  ForceCommissionAdvance: 66,
  ManageCommissionBalanceAdjustmentTypes: 10_003,
  ProcessCommissionBalanceAdjustments: 10_004,

  // Contracts
  ExecuteContracts: 11,
  ManageCampaigns: 12,
  ManageCancellationTypes: 13,
  ManageContractTypes: 14,
  ManageLeadTypes: 16,
  ManageServiceTypes: 17,
  ProcessContractCommissions: 19,
  ProcessContractDiscountAdjustments: 20,
  ProcessContractItemCancellations: 21,
  ProcessContractItemExchanges: 22,
  ProcessContractNeedTypeAdjustments: 23,
  ProcessContractPropertyExchanges: 24,
  ProcessContracts: 25,
  ProcessContractSalesTaxAdjustments: 26,
  ProcessDeliveries: 27,
  ProcessLateFeeAdjustments: 28,
  ProcessContractComments: 76,
  ProcessContractAttachments: 77,
  ProcessContractSaleItemCredits: 10_001,
  ProcessContractSaleAddendums: 10_002,

  // Forms
  ManageForms: 15,

  // Payments
  ProcessPayments: 29,
  ManagePaymentAdjustmentTypes: 41,
  ManagePaymentDraftGroups: 42,
  ManagePaymentMethods: 43,
  ProcessPaymentDrafts: 44,
  ProcessDeposits: 74,
  ManageDepositTypes: 75,
  ProcessCouponBookBatches: 20_000,
  ProcessCreditCardRefunds: 202_411_072_207,

  // Employees
  ManageDepartments: 30,
  ManageEmployees: 31,
  ManageSalesRoles: 32,

  // Items
  ManageCategories: 33,
  ManageDiscounts: 34,
  ManageFavoritesAndAliases: 35,
  ManageItemPricing: 36,
  ManageItems: 37,
  ManagePackages: 38,
  ApproveItemPricing: 202_510_151_400,

  // Locations
  ManageLocationGroups: 39,
  ManageLocations: 40,
  SetLocationAccountingPeriod: 202_511_111_235,

  // Property
  ManageProperty: 45,
  ManagePropertyCategories: 46,
  ManagePropertyDescriptors: 47,
  ManagePropertyNotForSaleReasons: 48,
  ManagePropertyPricing: 49,
  ManagePropertyRightTypes: 50,
  ProcessInterments: 51,
  ChangePropertyStatus: 70,

  // Sales Tax
  ManageSalesTax: 52,

  // Users
  ManageUserRoles: 53,
  ManageUsers: 54,
  ManageUsersGlobal: 55,
  ManageCustomPermissions: 67,

  // Data & Reports
  ManageDataExports: 56,
  ManageReports: 57,
  ManageSharedQueries: 69,
  ServiceListing: 72,

  // Trust
  ManageTrustAccounts: 58,
  ManageTrustCompanies: 59,
  ManageTrustEarningCodes: 60,
  ManageTrustFunds: 61,
  ProcessEarningAllocations: 62,
  ProcessTrustDeposits: 63,
  ProcessTrustRecalcs: 64,
  ProcessTrustWithdrawal: 65,
  AdjustTrustCost: 71,
  ManualTrustLiabilityAdjustment: 10_005,

  // Utilities
  RebuildDataUtilities: 68,
  ManageVault: 10_006,

  // Notifications
  JobQueueErrorNotification: 10_007,
  SystemConfigurationErrorNotification: 10_008,

  // Relations
  ManageRelations: 40_000,
  ManagePersonRoles: 78,

  // Dashboards & Widgets
  ManageWidgets: 50_000,
  ManageSharedDashboards: 50_010,

  // Insurance
  ManageInsuranceProviders: 70_008,

  // Workflow
  ManageWorkflow: 70_009,
  WorkflowProcessTemplates: 202_509_242_234,
  WorkflowTasks: 202_509_242_235,

  // Tracking
  ManageTrackables: 70_010,
  ManageLocationAreas: 70_011,
  TrackableScan: 70_012,

  // First Call
  FirstCall: 800_001,

  // Lead Sources & Sales
  ManageLeadSources: 202_404_141_500,
  ManageContractSaleTypes: 202_404_141_515,
  ExecuteLargeSale: 202_504_281_224,
} as const

export type SecurityOptionKey = (typeof SecurityOptionKeys)[keyof typeof SecurityOptionKeys]
