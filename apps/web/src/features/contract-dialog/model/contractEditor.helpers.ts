/**
 * features/contract-dialog/model/contractEditor.helpers.ts
 *
 * Helper functions for contract editor operations
 */

import type { ContractDraft, ContractSessionSaveModel } from '@/entities/contract'
import { runEffect } from '@facts/effect'
import { draftToContract, NeedType as NeedTypeEnum } from '@/entities/contract'
import { nextIds } from '@/shared/api'
import { EntityState } from '@/shared/lib'

/**
 * Check if an entity is new (no ID or empty ID)
 */
function isNewEntity(id: string | undefined | null): boolean {
  return !id || id === '0' || id === ''
}

/**
 * Build a ContractSessionSaveModel from a ContractDraft
 * This matches the structure expected by the backend validate/save endpoints
 *
 * Note: IDs are generated upfront when creating entities (via nextIds API),
 * matching the legacy app pattern. No temp IDs needed.
 */
export async function buildSaveModel(draft: ContractDraft): Promise<ContractSessionSaveModel> {
  const contractData = draftToContract(draft)
  const isNew = !contractData.id || contractData.id === 'new'

  // For new contracts, we need to generate IDs for the comment feed
  let commentFeedId = '0'
  let commentFeedOwnerId = contractData.commentFeedOwnerId || '0'

  if (isNew) {
    // Generate 2 IDs: one for the comment feed, one for its owner
    const ids = await runEffect(nextIds(2))
    commentFeedId = ids[0] || '0'
    commentFeedOwnerId = ids[1] || '0'
  }

  return {
    executeContract: false, // Draft save - no execution
    finalizeContract: false, // Draft save - no finalization
    voidContract: false, // Not voiding
    contract: {
      id: contractData.id,
      locationId: contractData.locationId || '',
      needType: contractData.needType ?? NeedTypeEnum.AT_NEED,
      dateSigned: contractData.dateSigned,
      dateExecuted: contractData.dateExecuted,
      contractNumber: contractData.contractNumber,
      prePrintedContractNumber: contractData.prePrintedContractNumber,
      isConditionalSale: contractData.isConditionalSale,
      isCancelled: contractData.isCancelled,
      notes: contractData.notes,
      people: contractData.people || [],
      sales: contractData.sales || [],
      financing: contractData.financing,
      contractTypeId: contractData.contractTypeId,
      contractSaleTypeId: contractData.contractSaleTypeId,
      leadSourceId: contractData.leadSourceId,
      atNeedType: contractData.atNeedType,
      preNeedFundingType: contractData.preNeedFundingType,
      salesPersonId: contractData.salesPersonId,
      marketingAgentId: contractData.marketingAgentId,
      contractReferenceId: contractData.contractReferenceId,
      firstCallId: contractData.firstCallId,
      commentFeedOwnerId,
    },
    payments: (contractData.payments || []).map((payment) => ({
      state: isNewEntity(payment.id) ? EntityState.New : EntityState.Modified,
      payment,
    })),
    // Required by backend - comment feed for contract notes
    commentFeed: {
      id: commentFeedId,
      feedType: 'Contract',
      ownerId: commentFeedOwnerId,
      entries: [],
    },
    // Required by backend - serialized to contract.contractData
    data: {
      forms: [],
      attributeValues: {},
      nonMappedFormValues: {},
      commissionLog: {},
      trustLog: {},
    },
  }
}

/**
 * Build user-friendly error messages from validation state
 */
export function buildValidationErrorMessage(
  validity: Record<string, boolean>,
  errorsByPath: Record<string, string>,
): string {
  const errorMessages: string[] = []

  if (!validity.general) {
    const generalErrors = Object.entries(errorsByPath)
      .filter(([path]) => path === 'locationId' || path === 'needType')
      .map(([_, message]) => message)
    if (generalErrors.length > 0) {
      errorMessages.push(...generalErrors)
    } else {
      errorMessages.push('General information is incomplete')
    }
  }

  if (!validity.people) {
    const peopleErrors = Object.entries(errorsByPath)
      .filter(([path]) => path.startsWith('people'))
      .map(([_, message]) => message)
    if (peopleErrors.length > 0) {
      errorMessages.push(...peopleErrors)
    } else {
      errorMessages.push('People section is incomplete (requires buyer and beneficiary)')
    }
  }

  if (!validity.items) {
    const itemsErrors = Object.entries(errorsByPath)
      .filter(([path]) => path.startsWith('sale.items'))
      .map(([_, message]) => message)
    if (itemsErrors.length > 0) {
      errorMessages.push(...itemsErrors)
    } else {
      errorMessages.push('At least one item is required')
    }
  }

  return errorMessages.length > 0
    ? `Please fix the following errors:\n${errorMessages.join('\n')}`
    : 'Please complete all required fields before saving'
}
