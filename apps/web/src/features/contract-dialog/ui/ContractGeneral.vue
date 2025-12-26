<template>
  <div class="contract-general">
    <v-row>
      <!-- Contract Info -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Contract Information">
          <v-row dense>
            <v-col cols="12">
              <FSelect
                v-model="model.needType"
                field="needType"
                label="Need Type"
                :options="needTypeOptions"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col cols="12">
              <FDatePicker
                v-model="model.dateSigned"
                field="dateSigned"
                label="Date Signed"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.prePrintedContractNumber"
                field="prePrintedContractNumber"
                label="Pre-Printed Contract #"
                placeholder="Optional"
                :readonly="!isEditable"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>

      <!-- Financials (read-only summary) -->
      <v-col
        v-if="contract"
        cols="12"
        md="6"
      >
        <FCard title="Financial Summary">
          <v-list
            class="bg-transparent"
            density="compact"
          >
            <v-list-item>
              <v-list-item-title>Subtotal</v-list-item-title>
              <template #append>
                <span class="text-body-1">{{ formatCurrency(contract.subtotal) }}</span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Discounts</v-list-item-title>
              <template #append>
                <span class="text-body-1 text-success">
                  -{{ formatCurrency(contract.discountTotal) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tax</v-list-item-title>
              <template #append>
                <span class="text-body-1">{{ formatCurrency(contract.taxTotal) }}</span>
              </template>
            </v-list-item>
            <v-divider class="my-2" />
            <v-list-item>
              <v-list-item-title class="font-weight-bold">Grand Total</v-list-item-title>
              <template #append>
                <span class="text-body-1 font-weight-bold">
                  {{ formatCurrency(contract.grandTotal) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Amount Paid</v-list-item-title>
              <template #append>
                <span class="text-body-1 text-success">
                  {{ formatCurrency(contract.amountPaid) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title class="font-weight-bold">Balance Due</v-list-item-title>
              <template #append>
                <span
                  class="text-body-1 font-weight-bold"
                  :class="{ 'text-error': contract.balanceDue > 0 }"
                >
                  {{ formatCurrency(contract.balanceDue) }}
                </span>
              </template>
            </v-list-item>
          </v-list>
        </FCard>
      </v-col>
    </v-row>

    <v-row>
      <!-- Primary Buyer -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Primary Buyer">
          <v-row dense>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.primaryBuyer.firstName"
                field="primaryBuyer.firstName"
                label="First Name"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.primaryBuyer.lastName"
                field="primaryBuyer.lastName"
                label="Last Name"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.primaryBuyer.phone"
                field="primaryBuyer.phone"
                label="Phone"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.primaryBuyer.email"
                field="primaryBuyer.email"
                label="Email"
                :readonly="!isEditable"
                type="email"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>

      <!-- Primary Beneficiary -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Primary Beneficiary (Decedent)">
          <v-row dense>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                v-model="model.primaryBeneficiary.firstName"
                field="primaryBeneficiary.firstName"
                label="First Name"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                v-model="model.primaryBeneficiary.middleName"
                field="primaryBeneficiary.middleName"
                label="Middle Name"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                v-model="model.primaryBeneficiary.lastName"
                field="primaryBeneficiary.lastName"
                label="Last Name"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                v-model="model.primaryBeneficiary.dateOfBirth"
                field="primaryBeneficiary.dateOfBirth"
                label="Date of Birth"
                :readonly="!isEditable"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                v-model="model.primaryBeneficiary.dateOfDeath"
                field="primaryBeneficiary.dateOfDeath"
                label="Date of Death"
                :readonly="!isEditable"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>
    </v-row>

    <!-- Notes -->
    <v-row>
      <v-col cols="12">
        <FCard title="Notes">
          <FTextarea
            v-model="model.notes"
            field="notes"
            placeholder="Add any notes about this contract..."
            :readonly="!isEditable"
            :rows="4"
          />
        </FCard>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import { type ContractFormValues, needTypeOptions } from '@/entities/contract'
  import { formatCurrency } from '@/shared/lib'
  import { FCard, FDatePicker, FSelect, FTextarea, FTextField } from '@/shared/ui'

  /**
   * Contract display data for financial summary
   */
  interface ContractDisplayData {
    subtotal: number
    taxTotal: number
    discountTotal: number
    grandTotal: number
    amountPaid: number
    balanceDue: number
  }

  /**
   * Uses Vue 3.4+ defineModel for proper two-way binding.
   * Parent uses: <ContractGeneral v-model="model" />
   */
  const model = defineModel<ContractFormValues>({ required: true })

  defineProps<{
    /** Contract data for financial summary (read-only) */
    contract?: ContractDisplayData | null
    /** Whether the contract is editable (draft status) */
    isEditable?: boolean
  }>()
</script>

<style scoped>
  .contract-general {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
