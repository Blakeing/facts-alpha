<template>
  <div class="contract-payments">
    <v-row>
      <!-- Payment Summary -->
      <v-col
        cols="12"
        md="4"
      >
        <FCard title="Payment Summary">
          <v-list
            class="bg-transparent"
            density="compact"
          >
            <v-list-item>
              <v-list-item-title>Grand Total</v-list-item-title>
              <template #append>
                <span class="text-body-1 font-weight-medium">
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
            <v-divider class="my-2" />
            <v-list-item>
              <v-list-item-title class="font-weight-bold">Balance Due</v-list-item-title>
              <template #append>
                <span
                  class="text-h6 font-weight-bold"
                  :class="financials.balanceDue > 0 ? 'text-error' : 'text-success'"
                >
                  {{ formatCurrency(financials.balanceDue) }}
                </span>
              </template>
            </v-list-item>
          </v-list>

          <FButton
            v-if="financials.balanceDue > 0 && !isReadOnly"
            block
            class="mt-4"
            intent="primary"
            prepend-icon="mdi-plus"
            @click="showAddDialog = true"
          >
            Add Payment
          </FButton>
        </FCard>
      </v-col>

      <!-- Payments List -->
      <v-col
        cols="12"
        md="8"
      >
        <FCard title="Payment History">
          <template #append>
            <FButton
              v-if="!isReadOnly"
              intent="ghost"
              prepend-icon="mdi-plus"
              size="small"
              @click="showAddDialog = true"
            >
              Add
            </FButton>
          </template>

          <FDataTable
            v-if="payments.length > 0"
            :columns="columns"
            :items="payments"
          >
            <template #item.actions="{ item: rawItem }">
              <v-btn
                v-if="!isReadOnly"
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click.stop="handleRemove((rawItem as ContractPayment).id)"
              />
            </template>
          </FDataTable>

          <div
            v-else
            class="text-center py-8"
          >
            <v-icon
              color="grey"
              icon="mdi-cash-multiple"
              size="48"
            />
            <p class="text-body-1 text-medium-emphasis mt-2">No payments recorded</p>
            <FButton
              v-if="!isReadOnly"
              class="mt-4"
              intent="primary"
              prepend-icon="mdi-plus"
              @click="showAddDialog = true"
            >
              Record First Payment
            </FButton>
            <p
              v-else
              class="text-body-2 text-medium-emphasis mt-2"
            >
              Contract is not editable
            </p>
          </div>
        </FCard>
      </v-col>
    </v-row>

    <!-- Add Payment Dialog -->
    <FFormDialog
      v-model="showAddDialog"
      :busy="isAdding"
      title="Add Payment"
      width="sm"
      @cancel="resetForm"
      @save="handleAdd"
    >
      <v-row dense>
        <v-col cols="12">
          <FDatePicker
            v-model="newPayment.date"
            label="Payment Date"
          />
        </v-col>
        <v-col cols="12">
          <FSelect
            v-model="newPayment.method"
            label="Payment Method"
            :options="paymentMethodController.selectItems"
          />
        </v-col>
        <v-col cols="12">
          <FTextField
            v-model.number="newPayment.amount"
            label="Amount"
            min="0.01"
            prepend-inner-icon="mdi-currency-usd"
            step="0.01"
            type="number"
          />
        </v-col>
        <v-col cols="12">
          <FTextField
            v-model="newPayment.reference"
            label="Reference / Check #"
            placeholder="Optional"
          />
        </v-col>
        <v-col cols="12">
          <FTextarea
            v-model="newPayment.notes"
            label="Notes"
            :rows="2"
          />
        </v-col>
      </v-row>
    </FFormDialog>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { runEffect } from '@facts/effect'
  import {
    type ContractPayment,
    type ContractPaymentFormValues,
    PaymentMethod as PaymentMethodEnum,
    type PaymentMethod,
    SaleStatus,
  } from '@/entities/contract'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { nextId } from '@/shared/api'
  import { formatCurrency, formatDate } from '@/shared/lib'
  import { paymentMethodController } from '@/entities/contract'
  import {
    FButton,
    FCard,
    type FColumn,
    FDataTable,
    FDatePicker,
    FFormDialog,
    FSelect,
    FTextarea,
    FTextField,
  } from '@/shared/ui'

  // Inject editor context
  const editor = useContractEditorContext()
  const draft = computed(() => editor.draft.value)

  // Payments from draft
  const payments = computed(() => draft.value?.payments ?? [])

  // Read-only if executed or voided
  const isReadOnly = computed(() => {
    const status = draft.value?.meta.status
    return status === SaleStatus.EXECUTED || status === SaleStatus.VOID
  })

  // Calculate financials from draft
  const financials = computed(() => {
    if (!draft.value) {
      return {
        grandTotal: 0,
        amountPaid: 0,
        balanceDue: 0,
      }
    }

    // Calculate from items
    const items = draft.value.sale.items
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

    // TODO: Calculate tax and discounts properly
    const taxTotal = 0
    const discountTotal = 0
    const grandTotal = subtotal + taxTotal - discountTotal

    // Calculate from payments
    const amountPaid = payments.value.reduce((sum, payment) => sum + payment.amount, 0)
    const balanceDue = grandTotal - amountPaid

    return {
      grandTotal,
      amountPaid,
      balanceDue,
    }
  })

  const showAddDialog = ref(false)
  const isAdding = ref(false)

  const columns: FColumn[] = [
    { key: 'date', title: 'Date', valueFormatter: (p) => formatDate(p.value as string) },
    {
      key: 'method',
      title: 'Method',
      valueFormatter: (p) => paymentMethodController.getDescription(p.value as PaymentMethod),
    },
    {
      key: 'amount',
      title: 'Amount',
      align: 'end',
      valueFormatter: (p) => formatCurrency(p.value as number),
    },
    { key: 'reference', title: 'Reference' },
    { key: 'actions', title: '', width: 60, sortable: false },
  ]

  const defaultPayment: ContractPaymentFormValues = {
    date: new Date().toISOString().split('T')[0] ?? '',
    method: PaymentMethodEnum.CASH,
    amount: 0,
    reference: '',
    checkNumber: '',
    notes: '',
  }

  const newPayment = ref<ContractPaymentFormValues>({ ...defaultPayment })

  function resetForm() {
    newPayment.value = { ...defaultPayment }
    showAddDialog.value = false
  }

  async function handleAdd() {
    isAdding.value = true
    try {
      // Get real ID from server (like legacy)
      const paymentId = await runEffect(nextId())

      // Create new payment
      const payment: Partial<ContractPayment> = {
        id: paymentId,
        contractId: draft.value?.id ?? '',
        date: newPayment.value.date,
        method: newPayment.value.method,
        amount: newPayment.value.amount,
        reference: newPayment.value.reference ?? '',
        checkNumber: newPayment.value.checkNumber ?? '',
        notes: newPayment.value.notes ?? '',
        dateCreated: new Date().toISOString(),
        dateLastModified: new Date().toISOString(),
      }

      // Add to draft
      editor.setField('payments', [...payments.value, payment as ContractPayment])
      resetForm()
    } finally {
      isAdding.value = false
    }
  }

  function handleRemove(paymentId: string) {
    const newPayments = payments.value.filter((payment) => payment.id !== paymentId)
    editor.setField('payments', newPayments)
  }
</script>

<style scoped>
  .contract-payments {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
