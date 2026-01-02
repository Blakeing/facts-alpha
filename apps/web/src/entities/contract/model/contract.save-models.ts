/**
 * Contract save model types
 *
 * Types used for saving contracts to the BFF API
 * Includes entity state tracking for batch operations
 */

import type { AtNeedType, NeedType, PreNeedFundingType } from './contract.enums'
import type { ContractFinancing, ContractPayment, ContractPerson, Sale } from './contract.types'
import type { EntityState } from '@/shared/lib'

// =============================================================================
// Save Model Types (for BFF API)
// =============================================================================

/**
 * Contract Name Role - Role assignments at contract level
 * Used for tracking relationships between people and contracts
 */
export interface ContractNameRole {
  id?: string
  contractId: string
  nameId: string
  roleType?: string
  // Additional fields as needed
}

/**
 * Contract Person with nameRoles - Used in save models
 * Extends ContractPerson to include nameRoles for save/load operations
 */
export interface ContractPersonWithRoles extends ContractPerson {
  nameRoles?: ContractNameRole[]
}

/**
 * Comment Feed - For contract comments/notes
 */
export interface CommentFeed {
  id: string
  feedType: string
  ownerId: string
  entries: CommentFeedEntry[]
}

/**
 * Comment Feed Entry - Individual comment in a feed
 */
export interface CommentFeedEntry {
  id: string
  commentFeedId: string
  userId: number
  replyToCommentFeedEntryId?: string
  timestamp: string
  message: string
}

/**
 * Contract Session Data - Additional session-specific data
 */
export interface ContractSessionDataSaveModel {
  forms?: unknown[]
  attributeValues?: unknown
  nonMappedFormValues?: unknown
  commissionLog?: unknown
  trustLog?: unknown
}

/**
 * Payment Save Model - Wrapper with entity state tracking
 * Used to indicate whether payment is new, modified, deleted, or moved
 */
export interface PaymentSaveModel {
  state: EntityState
  payment: ContractPayment
}

/**
 * Contract Save Model - Nested structure for saving contract
 * Includes all related entities (people, sales, items, payments)
 */
export interface ContractSaveModel {
  id?: string
  locationId: string
  needType: NeedType
  dateSigned?: string
  dateExecuted?: string
  contractNumber?: string
  prePrintedContractNumber?: string
  isConditionalSale?: boolean
  isCancelled?: boolean
  notes?: string

  // Related entities (nested)
  people: ContractPersonWithRoles[]
  sales: Sale[]
  financing?: ContractFinancing

  // Name roles (gathered from people on save)
  nameRoles?: ContractNameRole[]

  // Optional fields from Contract entity
  contractTypeId?: string
  contractSaleTypeId?: string
  leadSourceId?: string
  atNeedType?: AtNeedType
  preNeedFundingType?: PreNeedFundingType
  salesPersonId?: string
  marketingAgentId?: string
  contractReferenceId?: string
  firstCallId?: string
  commentFeedOwnerId?: string
  dateApproved?: string
}

/**
 * Contract Session Save Model - Complete payload for BFF save endpoint
 * Matches legacy ContractSessionSaveModel structure
 * POST /api/v1/contracts/save/draft
 */
export interface ContractSessionSaveModel {
  executeContract: boolean
  finalizeContract: boolean
  voidContract: boolean
  contract: ContractSaveModel
  payments: PaymentSaveModel[]
  commentFeed?: CommentFeed
  temporaryAttachmentOwnerId?: string
  data?: ContractSessionDataSaveModel
}
