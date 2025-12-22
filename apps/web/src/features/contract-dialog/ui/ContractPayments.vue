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
            v-if="contractId && financials.balanceDue > 0"
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
              v-if="contractId"
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
            <template #item.date="{ item }">
              {{ formatDate(item.date) }}
            </template>

            <template #item.method="{ item }">
              <v-chip
                :color="getMethodColor(item.method)"
                label
                size="small"
                variant="tonal"
              >
                {{ getMethodLabel(item.method) }}
              </v-chip>
            </template>

            <template #item.amount="{ item }">
              <span class="font-weight-medium text-success">
                {{ formatCurrency(item.amount) }}
              </span>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                color="error"
                icon
                size="small"
                variant="text"
                @click="handleRemove(item.id)"
              >
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
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
              v-if="contractId"
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
              Save the contract first to record payments
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
            :options="methodOptions"
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
  import type { ContractPayment, ContractPaymentFormValues } from '@/entities/contract'
  import { ref } from 'vue'
  import { formatCurrency, formatDate } from '@/shared/lib'
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

  interface Props {
    contractId?: string | null
    payments: ContractPayment[]
    financials: {
      grandTotal: number
      amountPaid: number
      balanceDue: number
    }
  }

  defineProps<Props>()

  const emit = defineEmits<{
    add: [data: ContractPaymentFormValues]
    remove: [paymentId: string]
  }>()

  const showAddDialog = ref(false)
  const isAdding = ref(false)

  const columns: FColumn[] = [
    { key: 'date', title: 'Date', width: 120 },
    { key: 'method', title: 'Method', width: 140 },
    { key: 'amount', title: 'Amount', width: 120, align: 'end' },
    { key: 'reference', title: 'Reference' },
    { key: 'actions', title: '', width: 60, sortable: false },
  ]

  const methodOptions = [
    { title: 'Cash', value: 'cash' },
    { title: 'Check', value: 'check' },
    { title: 'Credit Card', value: 'credit_card' },
    { title: 'Insurance', value: 'insurance' },
    { title: 'Financing', value: 'financing' },
    { title: 'Other', value: 'other' },
  ]

  const defaultPayment: ContractPaymentFormValues = {
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    amount: 0,
    reference: '',
    notes: '',
  }

  const newPayment = ref<ContractPaymentFormValues>({ ...defaultPayment })

  function getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Cash',
      check: 'Check',
      credit_card: 'Credit Card',
      insurance: 'Insurance',
      financing: 'Financing',
      other: 'Other',
    }
    return labels[method] || method
  }

  function getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      cash: 'success',
      check: 'info',
      credit_card: 'primary',
      insurance: 'warning',
      financing: 'secondary',
      other: 'grey',
    }
    return colors[method] || 'grey'
  }

  function resetForm() {
    newPayment.value = { ...defaultPayment }
    showAddDialog.value = false
  }

  async function handleAdd() {
    isAdding.value = true
    try {
      emit('add', { ...newPayment.value })
      resetForm()
    } finally {
      isAdding.value = false
    }
  }

  function handleRemove(paymentId: string) {
    emit('remove', paymentId)
  }
</script>

<style scoped>
  .contract-payments {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
