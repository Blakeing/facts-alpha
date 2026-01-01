/**
 * ContractPersonRoleController.test.ts
 *
 * Tests for ContractPersonRoleController
 */

import { describe, expect, it } from 'vitest'
import { ContractPersonRole } from './contract'
import {
  ContractPersonRoleController,
  contractPersonRoleController,
} from './ContractPersonRoleController'

describe('ContractPersonRoleController', () => {
  describe('choices', () => {
    it('has all expected role choices', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.choices).toHaveLength(5)
      expect(controller.choices.map((c) => c.id)).toEqual([
        ContractPersonRole.PERSON,
        ContractPersonRole.PRIMARY_BUYER,
        ContractPersonRole.CO_BUYER,
        ContractPersonRole.PRIMARY_BENEFICIARY,
        ContractPersonRole.ADDITIONAL_BENEFICIARY,
      ])
    })

    it('has correct display names', () => {
      const controller = new ContractPersonRoleController()
      const names = controller.choices.map((c) => c.name)
      expect(names).toContain('Person')
      expect(names).toContain('Primary Buyer')
      expect(names).toContain('Co-Buyer')
      expect(names).toContain('Primary Beneficiary')
      expect(names).toContain('Additional Beneficiary')
    })
  })

  describe('getDescription', () => {
    it('returns description for PRIMARY_BUYER', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getDescription(ContractPersonRole.PRIMARY_BUYER)).toBe('Primary Buyer')
    })

    it('returns description for CO_BUYER', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getDescription(ContractPersonRole.CO_BUYER)).toBe('Co-Buyer')
    })

    it('returns description for PRIMARY_BENEFICIARY', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getDescription(ContractPersonRole.PRIMARY_BENEFICIARY)).toBe(
        'Primary Beneficiary',
      )
    })

    it('returns description for ADDITIONAL_BENEFICIARY', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getDescription(ContractPersonRole.ADDITIONAL_BENEFICIARY)).toBe(
        'Additional Beneficiary',
      )
    })

    it('returns description for PERSON', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getDescription(ContractPersonRole.PERSON)).toBe('Person')
    })

    it('returns "Unknown" for unknown role', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getDescription(999)).toBe('Unknown')
    })
  })

  describe('getPrimaryRoleDescription', () => {
    it('returns Primary Buyer when person has PRIMARY_BUYER flag', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getPrimaryRoleDescription(ContractPersonRole.PRIMARY_BUYER)).toBe(
        'Primary Buyer',
      )
    })

    it('returns Primary Buyer when person has multiple roles including PRIMARY_BUYER', () => {
      const controller = new ContractPersonRoleController()
      const combinedRoles =
        ContractPersonRole.PRIMARY_BUYER | ContractPersonRole.CO_BUYER | ContractPersonRole.PERSON
      expect(controller.getPrimaryRoleDescription(combinedRoles)).toBe('Primary Buyer')
    })

    it('returns Co-Buyer when person has CO_BUYER but not PRIMARY_BUYER', () => {
      const controller = new ContractPersonRoleController()
      const combinedRoles = ContractPersonRole.CO_BUYER | ContractPersonRole.PERSON
      expect(controller.getPrimaryRoleDescription(combinedRoles)).toBe('Co-Buyer')
    })

    it('returns Primary Beneficiary when person has PRIMARY_BENEFICIARY but not buyer roles', () => {
      const controller = new ContractPersonRoleController()
      const combinedRoles =
        ContractPersonRole.PRIMARY_BENEFICIARY | ContractPersonRole.ADDITIONAL_BENEFICIARY
      expect(controller.getPrimaryRoleDescription(combinedRoles)).toBe('Primary Beneficiary')
    })

    it('returns Additional Beneficiary when person only has ADDITIONAL_BENEFICIARY', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getPrimaryRoleDescription(ContractPersonRole.ADDITIONAL_BENEFICIARY)).toBe(
        'Additional Beneficiary',
      )
    })

    it('returns Person when person only has PERSON flag', () => {
      const controller = new ContractPersonRoleController()
      expect(controller.getPrimaryRoleDescription(ContractPersonRole.PERSON)).toBe('Person')
    })

    it('returns Person for role 0 (PERSON flag)', () => {
      const controller = new ContractPersonRoleController()
      // PERSON = 0, so 0 matches the PERSON flag
      expect(controller.getPrimaryRoleDescription(0)).toBe('Person')
    })

    it('returns Person for role flags that match no specific flags (PERSON is fallback)', () => {
      const controller = new ContractPersonRoleController()
      // Since PERSON = 0, any number that doesn't match other flags will match PERSON
      // Use 16 (0x10) which has no bits matching flags 1, 2, 4, or 8
      // But (16 & 0) === 0 is true, so it matches PERSON
      expect(controller.getPrimaryRoleDescription(16)).toBe('Person')
      expect(controller.getPrimaryRoleDescription(256)).toBe('Person')
      // Note: 'Unknown' is unreachable because PERSON (0) always matches as fallback
    })

    it('prioritizes roles correctly: PrimaryBuyer > CoBuyer > PrimaryBeneficiary > AdditionalBeneficiary > Person', () => {
      const controller = new ContractPersonRoleController()

      // Test priority order
      const allRoles =
        ContractPersonRole.PRIMARY_BUYER |
        ContractPersonRole.CO_BUYER |
        ContractPersonRole.PRIMARY_BENEFICIARY |
        ContractPersonRole.ADDITIONAL_BENEFICIARY |
        ContractPersonRole.PERSON

      expect(controller.getPrimaryRoleDescription(allRoles)).toBe('Primary Buyer')

      // Without Primary Buyer, should get Co-Buyer
      const withoutPrimaryBuyer =
        ContractPersonRole.CO_BUYER |
        ContractPersonRole.PRIMARY_BENEFICIARY |
        ContractPersonRole.ADDITIONAL_BENEFICIARY |
        ContractPersonRole.PERSON

      expect(controller.getPrimaryRoleDescription(withoutPrimaryBuyer)).toBe('Co-Buyer')
    })
  })

  describe('singleton instance', () => {
    it('exports a singleton instance', () => {
      expect(contractPersonRoleController).toBeInstanceOf(ContractPersonRoleController)
      expect(contractPersonRoleController.getDescription(ContractPersonRole.PRIMARY_BUYER)).toBe(
        'Primary Buyer',
      )
    })
  })
})
