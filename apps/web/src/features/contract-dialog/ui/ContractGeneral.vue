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
                v-model="model.type"
                field="type"
                label="Contract Type"
                :options="contractTypeOptions"
              />
            </v-col>
            <v-col cols="12">
              <FSelect
                v-model="model.status"
                field="status"
                label="Status"
                :options="statusOptions"
              />
            </v-col>
            <v-col cols="12">
              <FDatePicker
                v-model="model.date"
                field="date"
                label="Contract Date"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.prePrintedContractNumber"
                field="prePrintedContractNumber"
                label="Pre-Printed Contract #"
                placeholder="Optional"
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
      <!-- Purchaser -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Purchaser">
          <v-row dense>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.purchaser.firstName"
                field="purchaser.firstName"
                label="First Name"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.purchaser.lastName"
                field="purchaser.lastName"
                label="Last Name"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.purchaser.phone"
                field="purchaser.phone"
                label="Phone"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="model.purchaser.email"
                field="purchaser.email"
                label="Email"
                type="email"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.purchaser.relationship"
                field="purchaser.relationship"
                label="Relationship to Beneficiary"
                placeholder="e.g., Spouse, Child, Sibling"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>

      <!-- Beneficiary -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Beneficiary (Decedent)">
          <v-row dense>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                v-model="model.beneficiary.firstName"
                field="beneficiary.firstName"
                label="First Name"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                v-model="model.beneficiary.middleName"
                field="beneficiary.middleName"
                label="Middle Name"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                v-model="model.beneficiary.lastName"
                field="beneficiary.lastName"
                label="Last Name"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                v-model="model.beneficiary.dateOfBirth"
                field="beneficiary.dateOfBirth"
                label="Date of Birth"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                v-model="model.beneficiary.dateOfDeath"
                field="beneficiary.dateOfDeath"
                label="Date of Death"
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
            :rows="4"
          />
        </FCard>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { Contract, ContractFormValues } from '@/entities/contract'
  import { formatCurrency } from '@/shared/lib'
  import { FCard, FDatePicker, FSelect, FTextarea, FTextField } from '@/shared/ui'

  /**
   * Uses Vue 3.4+ defineModel for proper two-way binding.
   * Parent uses: <ContractGeneral v-model="model" />
   */
  const model = defineModel<ContractFormValues>({ required: true })

  defineProps<{
    /** Contract data for financial summary (read-only) */
    contract?: Contract | null
  }>()

  const contractTypeOptions = [
    { title: 'At-Need Funeral', value: 'at_need_funeral' },
    { title: 'Pre-Need Funeral', value: 'pre_need_funeral' },
    { title: 'Cemetery', value: 'cemetery' },
  ]

  const statusOptions = [
    { title: 'Draft', value: 'draft' },
    { title: 'Finalized', value: 'finalized' },
    { title: 'Executed', value: 'executed' },
    { title: 'Void', value: 'void' },
    { title: 'Cancelled', value: 'cancelled' },
  ]
</script>

<style scoped>
  .contract-general {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
