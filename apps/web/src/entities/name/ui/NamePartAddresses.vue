<template>
  <div>
    <NamePartGroup label="Physical Address">
      <NamePartAddress
        v-if="physicalAddress"
        :model="physicalAddress"
        :readonly="readonly"
      />
    </NamePartGroup>
    <v-row dense>
      <v-col cols="12">
        <v-switch
          v-model="model.mailingAddressSameAsPhysical"
          label="Mailing address same as physical"
          :disabled="readonly"
          color="primary"
          density="compact"
          hide-details
        />
      </v-col>
    </v-row>
    <template v-if="!model.mailingAddressSameAsPhysical && mailingAddress">
      <NamePartGroup label="Mailing Address">
        <NamePartAddress
          :model="mailingAddress"
          :readonly="readonly"
        />
      </NamePartGroup>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Name, NameAddress } from '../model/name'
import { computed, watch } from 'vue'
import { AddressType } from '../model/name'
import NamePartAddress from './NamePartAddress.vue'
import NamePartGroup from './NamePartGroup.vue'

const props = defineProps<{
  model: Name
  readonly?: boolean
}>()

// Safe accessor for addresses array
const addresses = computed(() => props.model?.addresses ?? [])

const physicalAddress = computed(() => {
  if (!props.model?.addresses) return null
  let addr = addresses.value.find((a) => a.addressType === AddressType.PHYSICAL)
  if (!addr) {
    addr = createEmptyAddress(AddressType.PHYSICAL)
    props.model.addresses.push(addr)
  }
  return addr
})

const mailingAddress = computed(() => {
  if (!props.model?.addresses) return null
  if (props.model.mailingAddressSameAsPhysical) return null
  let addr = addresses.value.find((a) => a.addressType === AddressType.MAILING)
  if (!addr) {
    addr = createEmptyAddress(AddressType.MAILING)
    props.model.addresses.push(addr)
  }
  return addr
})

function createEmptyAddress(type: AddressType): NameAddress {
  return {
    id: '0',
    nameId: props.model?.id || '0',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    county: '',
    country: 'USA',
    primary: true,
    active: true,
    addressType: type,
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
  }
}

watch(
  () => props.model?.mailingAddressSameAsPhysical,
  (same) => {
    if (!props.model?.addresses) return
    if (same) {
      // Remove mailing address if same as physical
      const idx = props.model.addresses.findIndex(
        (a) => a.addressType === AddressType.MAILING,
      )
      if (idx !== -1) {
        props.model.addresses.splice(idx, 1)
      }
    } else {
      // Ensure mailing address exists
      if (!mailingAddress.value) {
        props.model.addresses.push(createEmptyAddress(AddressType.MAILING))
      }
    }
  },
)
</script>

