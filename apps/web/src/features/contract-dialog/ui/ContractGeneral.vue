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
                label="Contract Type"
                name="type"
                :options="contractTypeOptions"
              />
            </v-col>
            <v-col cols="12">
              <FSelect
                label="Status"
                name="status"
                :options="statusOptions"
              />
            </v-col>
            <v-col cols="12">
              <FDatePicker
                label="Contract Date"
                name="date"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                label="Pre-Printed Contract #"
                name="prePrintedContractNumber"
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
                label="First Name"
                name="purchaser.firstName"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Last Name"
                name="purchaser.lastName"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Phone"
                name="purchaser.phone"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Email"
                name="purchaser.email"
                type="email"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                label="Relationship to Beneficiary"
                name="purchaser.relationship"
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
                label="First Name"
                name="beneficiary.firstName"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                label="Middle Name"
                name="beneficiary.middleName"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <FTextField
                label="Last Name"
                name="beneficiary.lastName"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                label="Date of Birth"
                name="beneficiary.dateOfBirth"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                label="Date of Death"
                name="beneficiary.dateOfDeath"
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
            name="notes"
            placeholder="Add any notes about this contract..."
            :rows="4"
          />
        </FCard>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { Contract } from '@/entities/contract'
  import { formatCurrency } from '@/shared/lib'
  import { FCard, FDatePicker, FSelect, FTextarea, FTextField } from '@/shared/ui'

  defineProps<{
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
