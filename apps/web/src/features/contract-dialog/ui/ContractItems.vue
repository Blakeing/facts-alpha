<template>
  <div class="contract-items">
    <FCard title="Contract Items">
      <template #append>
        <FButton
          v-if="!isReadOnly"
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
        <template #item.discounts="{ item: rawItem }">
          <span
            v-if="getItemDiscountTotal(rawItem as SaleItem) > 0"
            class="text-success"
          >
            -{{ formatCurrency(getItemDiscountTotal(rawItem as SaleItem)) }}
          </span>
          <span
            v-else
            class="text-medium-emphasis"
          >
            —
          </span>
        </template>

        <template #item.actions="{ item: rawItem }">
          <v-btn
            v-if="!isReadOnly"
            color="error"
            icon="mdi-delete"
            size="small"
            variant="text"
            @click.stop="handleRemove((rawItem as SaleItem).id)"
          />
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
          v-if="!isReadOnly"
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
          Contract is not editable
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
            v-model="newItem.sku"
            label="SKU"
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
            v-model="newItem.itemType"
            label="Item Type"
            :options="itemTypeController.selectItems"
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
      </v-row>
    </FFormDialog>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { ItemType, type SaleItem, SaleStatus } from '@/entities/contract'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { formatCurrency } from '@/shared/lib'
  import { itemTypeController } from '@/entities/contract'
  import {
    FButton,
    FCard,
    type FColumn,
    FDataTable,
    FFormDialog,
    FSelect,
    FTextField,
  } from '@/shared/ui'

  interface ItemFormData {
    sku: string
    description: string
    itemType: ItemType
    quantity: number
    unitPrice: number
  }

  // Inject editor context
  const editor = useContractEditorContext()
  const draft = computed(() => editor.draft.value)

  // Items from draft
  const items = computed(() => draft.value?.sale.items ?? [])

  // Read-only if executed or voided
  const isReadOnly = computed(() => {
    const status = draft.value?.meta.status
    return status === SaleStatus.EXECUTED || status === SaleStatus.VOID
  })

  const showAddDialog = ref(false)
  const isAdding = ref(false)

  const columns: FColumn<SaleItem>[] = [
    { key: 'sku', title: 'SKU', width: 120 },
    { key: 'description', title: 'Description' },
    {
      key: 'itemType',
      title: 'Type',
      valueFormatter: (p) => itemTypeController.getDescription(p.value as number),
    },
    { key: 'quantity', title: 'Qty', align: 'center', width: 80 },
    {
      key: 'unitPrice',
      title: 'Price',
      align: 'end',
      valueFormatter: (p) => formatCurrency(p.value as number),
    },
    { key: 'discounts', title: 'Discount', align: 'end', width: 100 },
    {
      key: 'total',
      title: 'Total',
      align: 'end',
      valueGetter: (params) => params.data.quantity * params.data.unitPrice,
      valueFormatter: (p) => formatCurrency(p.value as number),
    },
    { key: 'actions', title: '', width: 60, sortable: false },
  ]

  const defaultItem: ItemFormData = {
    sku: '',
    description: '',
    itemType: ItemType.SERVICE,
    quantity: 1,
    unitPrice: 0,
  }

  const newItem = ref<ItemFormData>({ ...defaultItem })

  function getItemDiscountTotal(item: SaleItem): number {
    return item.discounts?.reduce((sum, d) => sum + d.amount, 0) ?? 0
  }

  function resetForm() {
    newItem.value = { ...defaultItem }
    showAddDialog.value = false
  }

  async function handleAdd() {
    isAdding.value = true
    try {
      // Create new item
      const item: Partial<SaleItem> = {
        id: crypto.randomUUID(),
        saleId: draft.value?.sale.id ?? '',
        itemId: '', // TODO: Link to catalog item if needed
        sku: newItem.value.sku,
        description: newItem.value.description,
        itemType: newItem.value.itemType,
        needType: draft.value?.needType,
        quantity: newItem.value.quantity,
        unitPrice: newItem.value.unitPrice,
        bookPrice: newItem.value.unitPrice,
        cost: 0,
        bookCost: 0,
        salesTaxEnabled: true,
        isCancelled: false,
        ordinal: items.value.length,
        salesTax: [],
        discounts: [],
        trust: [],
        dateCreated: new Date().toISOString(),
        dateLastModified: new Date().toISOString(),
      }

      // Add to draft
      editor.setField('sale.items', [...items.value, item as SaleItem])
      resetForm()
    } finally {
      isAdding.value = false
    }
  }

  function handleRemove(itemId: string) {
    const newItems = items.value.filter((item) => item.id !== itemId)
    editor.setField('sale.items', newItems)
  }
</script>

<style scoped>
  .contract-items {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
