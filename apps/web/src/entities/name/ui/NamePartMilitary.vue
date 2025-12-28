<template>
  <div>
    <v-row dense>
      <v-col cols="6">
        <v-checkbox
          v-model="isVeteran"
          label="Veteran"
          :disabled="readonly"
          color="primary"
          density="compact"
          hide-details
        />
      </v-col>
      <v-col
        v-if="isVeteran"
        cols="6"
      >
        <FSelect
          v-model="model.branchOfService"
          field="branchOfService"
          label="Branch Of Service"
          :options="branchOfServiceOptions"
          :readonly="readonly"
          clearable
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Name } from '../model/name'
import { BranchOfService } from '../model/name'
import { FSelect } from '@/shared/ui'

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

