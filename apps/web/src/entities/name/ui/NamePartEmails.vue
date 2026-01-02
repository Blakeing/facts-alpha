<template>
  <div>
    <v-table v-if="emails.length > 0">
      <thead>
        <tr>
          <th>Address</th>
          <th class="col-preferred">Preferred</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(email, index) in emails"
          :key="index"
        >
          <td>
            <FTextField
              v-model="email.address"
              :field="`emailAddresses.${index}.address`"
              hide-details
              placeholder="email@example.com"
              :readonly="readonly"
              type="email"
            />
          </td>
          <td class="col-preferred">
            <v-checkbox
              v-model="email.preferred"
              :disabled="readonly"
              hide-details
            />
          </td>
          <td class="col-actions">
            <v-btn
              color="error"
              :disabled="readonly"
              icon
              variant="text"
              @click="removeEmail(email)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-alert
      v-else
      type="info"
      variant="tonal"
    >
      No email addresses added yet
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
  /* eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable */
  import type { Name, NameEmail } from '../model/name'
  import { computed } from 'vue'
  import { FTextField } from '@/shared/ui'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  // Email addresses array (guaranteed to exist by schema)
  const emails = computed(() => props.model.emailAddresses)

  function removeEmail(email: NameEmail) {
    if (!props.model?.emailAddresses) return
    const emailIndex = props.model.emailAddresses.indexOf(email)
    if (emailIndex !== -1) {
      props.model.emailAddresses.splice(emailIndex, 1)
    }
  }
</script>

<style scoped>
  .col-preferred {
    width: 100px;
  }

  .col-actions {
    width: 60px;
  }
</style>
