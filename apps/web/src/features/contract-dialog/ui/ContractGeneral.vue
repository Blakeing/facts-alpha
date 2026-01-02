<template>
  <div class="contract-general">
    <FCard
      class="general-card"
      title="General"
    >
      <v-row dense>
        <v-col
          cols="12"
          md="6"
        >
          <FDatePicker
            field="sale.saleDate"
            :label="saleDateLabel"
            :readonly="isReadOnly"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FDatePicker
            field="meta.dateSigned"
            label="Contract/Sign Date"
            :readonly="isReadOnly"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FTextField
            field="prePrintedContractNumber"
            label="Pre-Printed Contract #"
            placeholder="Optional"
            :readonly="isReadOnly"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FSelect
            clearable
            field="salesPersonId"
            label="Sales Person"
            :options="salesPersonOptions"
            :readonly="isReadOnly"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FSelect
            clearable
            field="contractTypeId"
            label="Contract Type"
            :options="contractTypeOptions"
            :readonly="isReadOnly"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FSelect
            clearable
            field="leadSourceId"
            label="Lead Source"
            :options="leadSourceOptions"
            :readonly="isReadOnly"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FSelect
            clearable
            field="contractSaleTypeId"
            label="Contract Sale Type*"
            :options="contractSaleTypeOptions"
            :readonly="isReadOnly"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FSelect
            field="needType"
            label="Default Need Type"
            :options="needTypeController.selectItems"
            :readonly="isReadOnly"
          />
        </v-col>
      </v-row>
    </FCard>
  </div>
</template>

<script lang="ts" setup>
  import type { SelectOption } from '@facts/ui'
  import { computed, ref } from 'vue'
  import { getValueByPath, NeedType, needTypeController, SaleStatus } from '@/entities/contract'
  import { useContractEditorContext } from '@/features/contract-dialog'
  import { useFormSectionProvider } from '@/shared/lib'
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

  // TODO: Replace with actual API calls to fetch these options
  // For now, using empty arrays - these should be populated from:
  // - Employees API for salesPersonOptions
  // - Contract Types API for contractTypeOptions
  // - Lead Sources API for leadSourceOptions
  // - Contract Sale Types API for contractSaleTypeOptions
  const salesPersonOptions = ref<SelectOption[]>([])
  const contractTypeOptions = ref<SelectOption[]>([])
  const leadSourceOptions = ref<SelectOption[]>([])
  const contractSaleTypeOptions = ref<SelectOption[]>([])
</script>

<style scoped>
  .contract-general {
    max-width: 900px;
    margin: 0 auto;
  }

  .general-card {
    padding: 16px;
  }
</style>
