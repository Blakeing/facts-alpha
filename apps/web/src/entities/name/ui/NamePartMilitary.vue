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
          v-model="model.branchOfService"
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
      props.model.isVeteran = val
      if (!val) {
        props.model.branchOfService = BranchOfService.NONE
      }
    },
  })

  const branchOfServiceOptions = [
    { value: BranchOfService.NONE, label: 'None' },
    { value: BranchOfService.ARMY, label: 'Army' },
    { value: BranchOfService.NAVY, label: 'Navy' },
    { value: BranchOfService.AIR_FORCE, label: 'Air Force' },
    { value: BranchOfService.MARINES, label: 'Marines' },
    { value: BranchOfService.COAST_GUARD, label: 'Coast Guard' },
    { value: BranchOfService.SPACE_FORCE, label: 'Space Force' },
  ]
</script>
