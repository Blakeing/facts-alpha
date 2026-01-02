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
                field="needType"
                label="Need Type"
                :options="needTypeController.selectItems"
                :readonly="isReadOnly"
              />
            </v-col>
            <v-col cols="12">
              <FDatePicker
                field="sale.saleDate"
                :label="saleDateLabel"
                :readonly="isReadOnly"
                required
              />
            </v-col>
            <v-col cols="12">
              <FDatePicker
                field="meta.dateSigned"
                label="Contract/Sign Date"
                :readonly="isReadOnly"
                required
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                field="prePrintedContractNumber"
                label="Pre-Printed Contract #"
                placeholder="Optional"
                :readonly="isReadOnly"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>

      <!-- Financials (calculated summary) -->
      <v-col
        v-if="draft"
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
  import { getValueByPath, NeedType, SaleStatus } from '@/entities/contract'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { formatCurrency } from '@/shared/lib'
  import { useFormSectionProvider } from '@/shared/lib'
  import { needTypeController } from '@/entities/contract'
  import { FCard, FDatePicker, FSelect, FTextField } from '@/shared/ui'

  // Inject editor context
  const editor = useContractEditorContext()
  const draft = computed(() => editor.draft.value)

  // Provide form context to child components (must be in setup, not onMounted)
  useFormSectionProvider(
    editor.errorsByPath,
    (path: string) => {
      if (!draft.value) return undefined
      return getValueByPath(draft.value, path)
    },
    {
      'set-field': (path: string, value: unknown) => editor.setField(path, value),
      'touch-field': (path: string) => editor.touchField(path),
      validate: () => editor.validateSection('general'),
    },
  )

  // Read-only if executed or voided
  const isReadOnly = computed(() => {
    const status = draft.value?.meta.status
    return status === SaleStatus.EXECUTED || status === SaleStatus.VOID
  })

  // Sale date label changes based on need type
  const saleDateLabel = computed(() => {
    return draft.value?.needType === NeedType.PRE_NEED ? 'Sale Date' : 'Service Date'
  })

  // Calculate financials from draft items and payments
  const financials = computed(() => {
    if (!draft.value) {
      return {
        subtotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: 0,
        amountPaid: 0,
        balanceDue: 0,
      }
    }

    // Calculate from items
    const items = draft.value.sale.items
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

    // TODO: Calculate tax and discounts properly from item.salesTax and item.discounts
    const taxTotal = 0
    const discountTotal = 0
    const grandTotal = subtotal + taxTotal - discountTotal

    // Calculate from payments
    const payments = draft.value.payments
    const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const balanceDue = grandTotal - amountPaid

    return {
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      amountPaid,
      balanceDue,
    }
  })
</script>

<style scoped>
  .contract-general {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
