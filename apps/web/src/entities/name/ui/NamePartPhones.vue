<template>
  <div>
    <v-list
      v-if="phones.length > 0"
      density="compact"
      class="pa-0"
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
          dense
          class="align-center"
        >
          <v-col cols="12" sm="4">
            <FTextField
              v-model="phone.number"
              field="number"
              :readonly="readonly"
              placeholder="###-###-####"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <FSelect
              v-model="phone.type"
              field="type"
              :options="phoneTypeOptions"
              :readonly="readonly"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            sm="3"
            class="d-flex align-center"
          >
            <v-checkbox
              v-model="phone.preferred"
              label="Preferred"
              density="compact"
              :disabled="readonly"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            sm="2"
            class="d-flex justify-end"
          >
            <v-tooltip text="Remove phone number">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  :disabled="readonly"
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
      type="info"
      variant="tonal"
      density="compact"
      class="mt-2"
    >
      No phone numbers added yet
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
import type { Name, NamePhone } from '../model/name'
import { computed } from 'vue'
import { PhoneType } from '../model/name'
import { FSelect, FTextField } from '@/shared/ui'

const props = defineProps<{
  model: Name
  readonly?: boolean
}>()

// Safe accessor for phones array
const phones = computed(() => props.model?.phones ?? [])

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
  const idx = props.model.phones.indexOf(phone)
  if (idx !== -1) {
    props.model.phones.splice(idx, 1)
  }
}
</script>

