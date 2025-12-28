<template>
  <div>
    <v-list
      v-if="emails.length > 0"
      density="compact"
      class="pa-0"
    >
      <v-list-item
        v-for="(email, index) in emails"
        :key="index"
        class="px-0"
      >
        <template #prepend>
          <v-icon
            class="mr-3"
            color="primary"
          >
            mdi-email
          </v-icon>
        </template>
        <v-row
          dense
          class="align-center"
        >
          <v-col cols="12" sm="7">
            <FTextField
              v-model="email.address"
              field="address"
              type="email"
              :readonly="readonly"
              placeholder="email@example.com"
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
              v-model="email.preferred"
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
            <v-tooltip text="Remove email address">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  :disabled="readonly"
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="removeEmail(email)"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <template #append>
          <v-divider
            v-if="index < emails.length - 1"
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
      No email addresses added yet
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
import type { Name, NameEmail } from '../model/name'
import { computed } from 'vue'
import { FTextField } from '@/shared/ui'

const props = defineProps<{
  model: Name
  readonly?: boolean
}>()

// Safe accessor for emailAddresses array
const emails = computed(() => props.model?.emailAddresses ?? [])

const headers = [
  { title: 'Email Address', key: 'address', align: 'start' },
  { title: 'Preferred', key: 'preferred', align: 'center' },
  { title: '', key: 'actions', width: '58px', sortable: false },
]

function removeEmail(email: NameEmail) {
  if (!props.model?.emailAddresses) return
  const idx = props.model.emailAddresses.indexOf(email)
  if (idx !== -1) {
    props.model.emailAddresses.splice(idx, 1)
  }
}
</script>

