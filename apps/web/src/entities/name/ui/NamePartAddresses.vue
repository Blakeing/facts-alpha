<!-- eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable -->
<template>
  <div>
    <NamePartGroup label="Physical Address">
      <NamePartAddress
        v-if="physicalAddress"
        :field-prefix="physicalAddressFieldPrefix"
        :model="physicalAddress"
        :readonly="readonly"
      />
      <div
        v-else-if="readonly"
        class="text-medium-emphasis text-body-2"
      >
        No physical address
      </div>
      <v-row
        class="mt-4"
        dense
      >
        <v-col cols="12">
          <v-checkbox
            v-model="model.mailingAddressSameAsPhysical"
            color="primary"
            density="compact"
            :disabled="readonly"
            hide-details
            label="Mailing address same as physical"
            @update:model-value="handleMailingToggle"
          />
        </v-col>
      </v-row>
    </NamePartGroup>
    <template v-if="!model.mailingAddressSameAsPhysical">
      <NamePartGroup label="Mailing Address">
        <NamePartAddress
          v-if="mailingAddress"
          :field-prefix="mailingAddressFieldPrefix"
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
  /* eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable */
  import type { Name, NameAddress } from '../model/name'
  import { computed, onMounted } from 'vue'
  import { AddressType } from '../model/name'
  import NamePartAddress from './NamePartAddress.vue'
  import NamePartGroup from './NamePartGroup.vue'

  /**
   * NamePartAddresses - Manages physical and mailing addresses
   *
   * WORKING COPY PATTERN:
   * This component receives a mutable Name object from NamePanel.
   * Direct v-model binding and array mutation is intentional.
   * Address initialization happens once on mount.
   */

  const props = defineProps<{
    model: Name // Mutable working copy
    readonly?: boolean
  }>()

  // Simple computed to find addresses
  const physicalAddress = computed(() =>
    props.model.addresses.find((a) => a.addressType === AddressType.PHYSICAL),
  )

  const mailingAddress = computed(() =>
    props.model.addresses.find((a) => a.addressType === AddressType.MAILING),
  )

  // Field prefixes for validation (addresses are indexed in the array)
  const physicalAddressFieldPrefix = computed(() => {
    const idx = props.model.addresses.findIndex((a) => a.addressType === AddressType.PHYSICAL)
    return idx === -1 ? undefined : `addresses.${idx}`
  })

  const mailingAddressFieldPrefix = computed(() => {
    const idx = props.model.addresses.findIndex((a) => a.addressType === AddressType.MAILING)
    return idx === -1 ? undefined : `addresses.${idx}`
  })

  // Initialize addresses on mount (one-time, simple, no watchers!)
  onMounted(() => {
    if (props.readonly) return

    // Ensure physical address exists
    if (!props.model.addresses.some((a) => a.addressType === AddressType.PHYSICAL)) {
      props.model.addresses.push(createAddress(AddressType.PHYSICAL))
    }

    // Ensure mailing address exists if needed
    if (
      !props.model.mailingAddressSameAsPhysical &&
      !props.model.addresses.some((a) => a.addressType === AddressType.MAILING)
    ) {
      props.model.addresses.push(createAddress(AddressType.MAILING))
    }
  })

  function handleMailingToggle(sameAsPhysical: boolean | null = false) {
    if (sameAsPhysical) {
      // Remove mailing address
      const idx = props.model.addresses.findIndex((a) => a.addressType === AddressType.MAILING)
      if (idx !== -1) props.model.addresses.splice(idx, 1)
    } else {
      // Add mailing address if needed
      if (!props.model.addresses.some((a) => a.addressType === AddressType.MAILING)) {
        props.model.addresses.push(createAddress(AddressType.MAILING))
      }
    }
  }

  function createAddress(type: AddressType): NameAddress {
    return {
      id: '0',
      nameId: props.model.id || '0',
      addressType: type,
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      county: '',
      country: 'USA',
      primary: true,
      active: true,
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
    }
  }
</script>
