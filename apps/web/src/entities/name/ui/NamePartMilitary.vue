<template>
  <div>
    <v-row dense>
      <v-col cols="6">
        <v-checkbox
          v-model="isVeteran"
          color="primary"
          density="compact"
          :disabled="readonly"
          hide-details
          label="Veteran"
        />
      </v-col>
      <v-col
        v-if="isVeteran"
        cols="6"
      >
        <FSelect
          v-model="branchOfService"
          clearable
          field="branchOfService"
          label="Branch Of Service"
          :options="branchOfServiceOptions"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { branchOfServiceController } from '../lib/controllers/branchOfService.controller'
  import { computed } from 'vue'
  import { FSelect } from '@/shared/ui'
  import { BranchOfService } from '../model/name'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  const isVeteran = computed({
    get: () => props.model.isVeteran,
    set: (val: boolean) => {
      props.model.branchOfService = val ? props.model.branchOfService : BranchOfService.NONE
      props.model.isVeteran = val
    },
  })

  const branchOfService = computed({
    get: () => props.model.branchOfService,
    set: (value: BranchOfService) => {
      props.model.branchOfService = value
    },
  })

  const branchOfServiceOptions = branchOfServiceController.selectItems
</script>
