/**
 * Contract Save Model Builder
 *
 * Builds the complete ContractSessionSaveModel payload for BFF save endpoint.
 * Ported from legacy Facts app ContractSaveModelBuilder pattern.
 *
 * Key responsibilities:
 * - Gather data from all handlers into nested structure
 * - Apply EntityState tracking to payments
 * - Gather/distribute nameRoles for backend persistence
 *
 * @see Facts/src/Facts.App/facts-app/src/models/contracts/ContractSaveModelBuilder.ts
 */

import type { ContractSession } from './useContractSession'
import { EntityState } from '@/shared/lib/entity'
import {
  type ContractPersonWithRoles,
  type ContractSaveModel,
  type ContractSessionSaveModel,
  type PaymentSaveModel,
  SaleStatus,
  SaleType,
} from './contract'

export class ContractSaveModelBuilder {
  /**
   * Build the complete save model from contract session state
   * Matches legacy buildSaveModel() pattern
   */
  static buildSaveModel(session: ContractSession): ContractSessionSaveModel {
    const result: ContractSessionSaveModel = {
      executeContract: session.status.value === SaleStatus.EXECUTED,
      finalizeContract: session.status.value === SaleStatus.FINALIZED,
      voidContract: session.status.value === SaleStatus.VOID,
      contract: this.buildContractModel(session),
      payments: this.buildPayments(session),
    }

    // Gather nameRoles from people into contract.nameRoles for backend
    this.gatherRoles(result.contract)

    return result
  }

  /**
   * Gather nameRoles from people into contract.nameRoles for backend
   * Matches legacy gatherRoles() pattern
   *
   * The backend expects nameRoles to be centralized at the contract level,
   * but the UI works with them attached to individual people.
   * This method collects all nameRoles from people into contract.nameRoles.
   */
  static gatherRoles(contract: ContractSaveModel): void {
    contract.nameRoles = []

    for (const person of contract.people) {
      if (person.nameRoles?.length) {
        // Add each role to contract.nameRoles, ensuring contractId is set
        for (const role of person.nameRoles) {
          contract.nameRoles.push({
            ...role,
            contractId: contract.id ?? '',
          })
        }
      }
    }
  }

  /**
   * Distribute nameRoles from contract back to people after load
   * Matches legacy distributeRoles() pattern
   *
   * The backend stores nameRoles at the contract level,
   * but the UI needs them attached to individual people.
   * This method distributes contract.nameRoles back to each person.
   */
  static distributeRoles(model: ContractSessionSaveModel): void {
    if (!model.contract?.nameRoles) return

    for (const person of model.contract.people) {
      // Filter nameRoles that belong to this person
      person.nameRoles = model.contract.nameRoles.filter((role) => role.nameId === person.nameId)
    }
  }

  /**
   * Build the contract portion of the save model
   */
  private static buildContractModel(session: ContractSession): ContractSaveModel {
    const people = session.people.getFormValues()

    // Build people array (filter out empty entries)
    const peopleArray: ContractPersonWithRoles[] = [
      people.purchaser,
      people.beneficiary,
      ...people.coBuyers,
    ]
      .filter((p) => p.name?.first && p.name?.last)
      .map((p) => p as ContractPersonWithRoles)

    // Build primary sale with items
    const subtotal = session.items.subtotal.value
    const taxTotal = session.items.taxTotal.value
    const discountTotal = session.items.discountTotal.value
    const grandTotal = subtotal + taxTotal - discountTotal

    const primarySale = {
      id:
        session.items.items.value.length > 0 && session.items.items.value[0]?.saleId
          ? session.items.items.value[0].saleId
          : '',
      contractId: session.contractId.value || '',
      saleNumber: '',
      saleDate: session.saleDate.value || undefined,
      saleType: SaleType.CONTRACT,
      saleStatus: session.status.value,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      items: session.items.getItems(),
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
    }

    return {
      id: session.contractId.value || undefined,
      locationId: session.locationId.value,
      needType: session.needType.value,
      dateSigned: session.contractDate.value || undefined,
      contractNumber: session.contractNumber.value || undefined,
      people: peopleArray,
      sales: [primarySale],
      nameRoles: [],
      // Include other fields that might exist on the session
      prePrintedContractNumber: '',
      isConditionalSale: false,
      isCancelled: false,
    }
  }

  /**
   * Build payments array with EntityState tracking
   * In the future, we could track actual state (New, Modified, Deleted)
   * For now, mark all as Modified since BFF handles create vs update
   */
  private static buildPayments(session: ContractSession): PaymentSaveModel[] {
    return session.payments.getPayments().map((payment) => ({
      state: EntityState.Modified,
      payment,
    }))
  }
}
