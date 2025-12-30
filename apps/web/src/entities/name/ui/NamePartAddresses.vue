<template>
  <div>
    <NamePartGroup label="Physical Address">
      <NamePartAddress
        v-if="physicalAddress"
        :model="physicalAddress"
        :readonly="readonly"
      />
      <div
        v-else-if="readonly"
        class="text-medium-emphasis text-body-2"
      >
        No physical address
      </div>
    </NamePartGroup>
    <v-row dense>
      <v-col cols="12">
        <v-switch
          v-model="mailingAddressSameAsPhysicalLocal"
          color="primary"
          density="compact"
          :disabled="readonly"
          hide-details
          label="Mailing address same as physical"
        />
      </v-col>
    </v-row>
    <template v-if="!mailingAddressSameAsPhysicalLocal">
      <NamePartGroup label="Mailing Address">
        <NamePartAddress
          v-if="mailingAddress"
          :model="mailingAddress"
          :readonly="readonly"
        />
        <div
          v-else-if="readonly"
          class="text-medium-emphasis text-body-2"
        >
          No mailing address
        </div>
      </NamePartGroup>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { Name, NameAddress } from '../model/name'
  import { computed, ref, watch } from 'vue'
  import { AddressType } from '../model/name'
  import NamePartAddress from './NamePartAddress.vue'
  import NamePartGroup from './NamePartGroup.vue'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

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

  // Local ref for switch - synced with model when editable
  const mailingAddressSameAsPhysicalLocal = ref(props.model?.mailingAddressSameAsPhysical ?? false)

  // Sync from model
  watch(
    () => props.model?.mailingAddressSameAsPhysical,
    (val) => {
      mailingAddressSameAsPhysicalLocal.value = val ?? false
    },
    { immediate: true },
  )

  // Sync to model (only when not readonly)
  watch(mailingAddressSameAsPhysicalLocal, (same) => {
    if (props.readonly || !props.model) return
    props.model.mailingAddressSameAsPhysical = same

    // Manage mailing address based on toggle
    if (same) {
      // Remove mailing address
      const idx =
        props.model.addresses?.findIndex((a) => a.addressType === AddressType.MAILING) ?? -1
      if (idx !== -1) {
        props.model.addresses.splice(idx, 1)
      }
    } else if (!mailingAddress.value) {
      // Create mailing address if needed
      if (!props.model.addresses) props.model.addresses = []
      props.model.addresses.push(createEmptyAddress(AddressType.MAILING))
    }
  })

  // Physical address - just find, create only when editing
  const physicalAddress = computed(() => {
    const addresses = props.model?.addresses ?? []
    let addr = addresses.find((a) => a.addressType === AddressType.PHYSICAL)

    // Only create if not readonly and doesn't exist
    if (!addr && !props.readonly && props.model) {
      addr = createEmptyAddress(AddressType.PHYSICAL)
      if (!props.model.addresses) props.model.addresses = []
      props.model.addresses.push(addr)
    }

    return addr || null
  })

  // Mailing address - just find, create only when editing and needed
  const mailingAddress = computed(() => {
    if (mailingAddressSameAsPhysicalLocal.value) return null

    const addresses = props.model?.addresses ?? []
    let addr = addresses.find((a) => a.addressType === AddressType.MAILING)

    // Only create if not readonly and doesn't exist
    if (!addr && !props.readonly && props.model) {
      addr = createEmptyAddress(AddressType.MAILING)
      if (!props.model.addresses) props.model.addresses = []
      props.model.addresses.push(addr)
    }

    return addr || null
  })
</script>
