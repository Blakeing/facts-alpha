<template>
  <div>
    <v-list
      v-if="phones.length > 0"
      class="pa-0"
      density="compact"
    >
      <v-list-item
        v-for="(phone, index) in phones"
        :key="index"
        class="px-0"
      >
        <template #prepend>
          <v-icon
            class="mr-3"
            color="primary"
          >
            mdi-phone
          </v-icon>
        </template>
        <v-row
          class="align-center"
          dense
        >
          <v-col
            cols="12"
            sm="4"
          >
            <FTextField
              v-model="phone.number"
              density="compact"
              field="number"
              hide-details
              placeholder="###-###-####"
              :readonly="readonly"
            />
          </v-col>
          <v-col
            cols="12"
            sm="3"
          >
            <FSelect
              v-model="phone.type"
              density="compact"
              field="type"
              hide-details
              :options="phoneTypeOptions"
              :readonly="readonly"
            />
          </v-col>
          <v-col
            class="d-flex align-center"
            cols="12"
            sm="3"
          >
            <v-checkbox
              v-model="phone.preferred"
              density="compact"
              :disabled="readonly"
              hide-details
              label="Preferred"
            />
          </v-col>
          <v-col
            class="d-flex justify-end"
            cols="12"
            sm="2"
          >
            <v-tooltip text="Remove phone number">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  color="error"
                  :disabled="readonly"
                  icon
                  size="small"
                  variant="text"
                  @click="removePhone(phone)"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <template #append>
          <v-divider
            v-if="index < phones.length - 1"
            class="mt-2"
          />
        </template>
      </v-list-item>
    </v-list>
    <v-alert
      v-else
      class="mt-2"
      density="compact"
      type="info"
      variant="tonal"
    >
      No phone numbers added yet
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
  import type { Name, NamePhone } from '../model/name'
  import { computed } from 'vue'
  import { FSelect, FTextField } from '@/shared/ui'
  import { PhoneType } from '../model/name'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  // Phones array (guaranteed to exist by schema)
  const phones = computed(() => props.model.phones)

  const phoneTypeOptions = [
    { value: PhoneType.HOME, label: 'Home' },
    { value: PhoneType.WORK, label: 'Work' },
    { value: PhoneType.MOBILE, label: 'Mobile' },
    { value: PhoneType.FAX, label: 'Fax' },
  ]

  const headers = [
    { title: 'Number', key: 'number', align: 'start' },
    { title: 'Type', key: 'type', align: 'start' },
    { title: 'Preferred', key: 'preferred', align: 'center' },
    { title: '', key: 'actions', width: '58px', sortable: false },
  ]

  function removePhone(phone: NamePhone) {
    if (!props.model?.phones) return
    const phoneIndex = props.model.phones.indexOf(phone)
    if (phoneIndex !== -1) {
      props.model.phones.splice(phoneIndex, 1)
    }
  }
</script>
