<template>
  <div>
    <v-list
      v-if="emails.length > 0"
      class="pa-0"
      density="compact"
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
          class="align-center"
          dense
        >
          <v-col
            cols="12"
            sm="7"
          >
            <FTextField
              v-model="email.address"
              density="compact"
              field="address"
              hide-details
              placeholder="email@example.com"
              :readonly="readonly"
              type="email"
            />
          </v-col>
          <v-col
            class="d-flex align-center"
            cols="12"
            sm="3"
          >
            <v-checkbox
              v-model="email.preferred"
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
            <v-tooltip text="Remove email address">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  color="error"
                  :disabled="readonly"
                  icon
                  size="small"
                  variant="text"
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
      class="mt-2"
      density="compact"
      type="info"
      variant="tonal"
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

  // Email addresses array (guaranteed to exist by schema)
  const emails = computed(() => props.model.emailAddresses)

  const headers = [
    { title: 'Email Address', key: 'address', align: 'start' },
    { title: 'Preferred', key: 'preferred', align: 'center' },
    { title: '', key: 'actions', width: '58px', sortable: false },
  ]

  function removeEmail(email: NameEmail) {
    if (!props.model?.emailAddresses) return
    const emailIndex = props.model.emailAddresses.indexOf(email)
    if (emailIndex !== -1) {
      props.model.emailAddresses.splice(emailIndex, 1)
    }
  }
</script>
