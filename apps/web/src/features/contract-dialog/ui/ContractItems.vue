<template>
  <div class="contract-items">
    <FCard title="Contract Items">
      <template #append>
        <FButton
          v-if="contractId"
          intent="primary"
          prepend-icon="mdi-plus"
          size="small"
          @click="showAddDialog = true"
        >
          Add Item
        </FButton>
      </template>

      <FDataTable
        v-if="items.length > 0"
        :columns="columns"
        :items="items"
      >
        <template #item.category="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            label
            size="small"
            variant="tonal"
          >
            {{ getCategoryLabel(item.category) }}
          </v-chip>
        </template>

        <template #item.unitPrice="{ item }">
          {{ formatCurrency(item.unitPrice) }}
        </template>

        <template #item.discount="{ item }">
          <span
            v-if="item.discount > 0"
            class="text-success"
          >
            -{{ formatCurrency(item.discount) }}
          </span>
          <span
            v-else
            class="text-medium-emphasis"
            >—</span
          >
        </template>

        <template #item.total="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.total) }}</span>
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
          icon="mdi-package-variant"
          size="48"
        />
        <p class="text-body-1 text-medium-emphasis mt-2">No items added yet</p>
        <FButton
          v-if="contractId"
          class="mt-4"
          intent="primary"
          prepend-icon="mdi-plus"
          @click="showAddDialog = true"
        >
          Add First Item
        </FButton>
        <p
          v-else
          class="text-body-2 text-medium-emphasis mt-2"
        >
          Save the contract first to add items
        </p>
      </div>
    </FCard>

    <!-- Add Item Dialog -->
    <FFormDialog
      v-model="showAddDialog"
      :busy="isAdding"
      title="Add Item"
      width="md"
      @cancel="resetForm"
      @save="handleAdd"
    >
      <v-row dense>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="newItem.itemNumber"
            label="Item Number"
          />
        </v-col>
        <v-col
          cols="12"
          md="8"
        >
          <FTextField
            v-model="newItem.description"
            label="Description"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FSelect
            v-model="newItem.category"
            label="Category"
            :options="categoryOptions"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model.number="newItem.quantity"
            label="Quantity"
            min="1"
            type="number"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model.number="newItem.unitPrice"
            label="Unit Price"
            min="0"
            prepend-inner-icon="mdi-currency-usd"
            step="0.01"
            type="number"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FTextField
            v-model.number="newItem.discount"
            label="Discount"
            min="0"
            prepend-inner-icon="mdi-currency-usd"
            step="0.01"
            type="number"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FTextField
            v-model.number="newItem.tax"
            label="Tax"
            min="0"
            prepend-inner-icon="mdi-currency-usd"
            step="0.01"
            type="number"
          />
        </v-col>
        <v-col cols="12">
          <FTextarea
            v-model="newItem.notes"
            label="Notes"
            :rows="2"
          />
        </v-col>
      </v-row>
    </FFormDialog>
  </div>
</template>

<script lang="ts" setup>
  import type { ContractItem, ContractItemFormValues } from '@/entities/contract'
  import { ref } from 'vue'
  import { formatCurrency } from '@/shared/lib'
  import {
    FButton,
    FCard,
    type FColumn,
    FDataTable,
    FFormDialog,
    FSelect,
    FTextarea,
    FTextField,
  } from '@/shared/ui'

  interface Props {
    contractId?: string | null
    items: ContractItem[]
  }

  defineProps<Props>()

  const emit = defineEmits<{
    add: [data: ContractItemFormValues]
    remove: [itemId: string]
  }>()

  const showAddDialog = ref(false)
  const isAdding = ref(false)

  const columns: FColumn[] = [
    { key: 'itemNumber', headerName: 'Item #', width: 100 },
    { key: 'description', headerName: 'Description' },
    { key: 'category', headerName: 'Category', width: 120 },
    { key: 'quantity', headerName: 'Qty', width: 60, cellStyle: { textAlign: 'center' } },
    { key: 'unitPrice', headerName: 'Price', width: 100, cellStyle: { textAlign: 'right' } },
    { key: 'discount', headerName: 'Discount', width: 100, cellStyle: { textAlign: 'right' } },
    { key: 'total', headerName: 'Total', width: 100, cellStyle: { textAlign: 'right' } },
    { key: 'actions', headerName: '', width: 60, sortable: false },
  ]

  const categoryOptions = [
    { title: 'Service', value: 'service' },
    { title: 'Merchandise', value: 'merchandise' },
    { title: 'Cash Advance', value: 'cash_advance' },
  ]

  const defaultItem: ContractItemFormValues = {
    itemNumber: '',
    description: '',
    category: 'service',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    tax: 0,
    notes: '',
  }

  const newItem = ref<ContractItemFormValues>({ ...defaultItem })

  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      service: 'Service',
      merchandise: 'Merchandise',
      cash_advance: 'Cash Advance',
    }
    return labels[category] || category
  }

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      service: 'primary',
      merchandise: 'info',
      cash_advance: 'warning',
    }
    return colors[category] || 'grey'
  }

  function resetForm() {
    newItem.value = { ...defaultItem }
    showAddDialog.value = false
  }

  async function handleAdd() {
    isAdding.value = true
    try {
      emit('add', { ...newItem.value })
      resetForm()
    } finally {
      isAdding.value = false
    }
  }

  function handleRemove(itemId: string) {
    emit('remove', itemId)
  }
</script>

<style scoped>
  .contract-items {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
