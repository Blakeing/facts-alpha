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
                v-model="session.needType.value"
                field="needType"
                label="Need Type"
                :options="needTypeController.selectItems"
                :readonly="!session.isEditable.value"
              />
            </v-col>
            <v-col cols="12">
              <FDatePicker
                v-model="session.saleDate.value"
                field="saleDate"
                :label="saleDateLabel"
                :readonly="!session.hasDraftStatus.value"
                required
              />
            </v-col>
            <v-col cols="12">
              <FDatePicker
                v-model="session.contractDate.value"
                field="dateSigned"
                label="Contract/Sign Date"
                :readonly="!session.hasDraftStatus.value"
                required
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="session.prePrintedContractNumber.value"
                field="prePrintedContractNumber"
                label="Pre-Printed Contract #"
                placeholder="Optional"
                :readonly="!session.isEditable.value"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>

      <!-- Financials (read-only summary) -->
      <v-col
        v-if="contract || session.financials.value"
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
                <span class="text-body-1">{{ formatCurrency(financials.subtotal) }}</span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Discounts</v-list-item-title>
              <template #append>
                <span class="text-body-1 text-success">
                  -{{ formatCurrency(financials.discountTotal) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tax</v-list-item-title>
              <template #append>
                <span class="text-body-1">{{ formatCurrency(financials.taxTotal) }}</span>
              </template>
            </v-list-item>
            <v-divider class="my-2" />
            <v-list-item>
              <v-list-item-title class="font-weight-bold">Grand Total</v-list-item-title>
              <template #append>
                <span class="text-body-1 font-weight-bold">
                  {{ formatCurrency(financials.grandTotal) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Amount Paid</v-list-item-title>
              <template #append>
                <span class="text-body-1 text-success">
                  {{ formatCurrency(financials.amountPaid) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item>
              <v-list-item-title class="font-weight-bold">Balance Due</v-list-item-title>
              <template #append>
                <span
                  class="text-body-1 font-weight-bold"
                  :class="{ 'text-error': financials.balanceDue > 0 }"
                >
                  {{ formatCurrency(financials.balanceDue) }}
                </span>
              </template>
            </v-list-item>
          </v-list>
        </FCard>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { NeedType, useSession } from '@/entities/contract'
  import { formatCurrency } from '@/shared/lib'
  import { needTypeController } from '@/shared/lib/enums/contract'
  import { FCard, FDatePicker, FSelect, FTextField } from '@/shared/ui'

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

  const props = defineProps<{
    /** Contract data for financial summary (read-only) */
    contract?: ContractDisplayData | null
  }>()

  // Inject session from provide/inject
  const session = useSession()

  // Sale date label changes based on need type (like legacy)
  // Cemetery or Pre-Need = "Sale Date", Funeral At-Need = "Service Date"
  const saleDateLabel = computed(() => {
    return session.needType.value === NeedType.PRE_NEED ? 'Sale Date' : 'Service Date'
  })

  // Use session financials if contract prop not provided
  const financials = computed(() => props.contract ?? session.financials.value)
</script>

<style scoped>
  .contract-general {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
