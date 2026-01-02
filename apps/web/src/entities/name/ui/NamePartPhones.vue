<template>
  <div>
    <v-table v-if="phones.length > 0">
      <thead>
        <tr>
          <th>Number</th>
          <th class="col-type">Type</th>
          <th class="col-preferred">Preferred</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(phone, index) in phones"
          :key="index"
        >
          <td>
            <FTextField
              v-model="phone.number"
              v-maska="'(###) ###-####'"
              :field="`phones.${index}.number`"
              hide-details
              placeholder="(###) ###-####"
              :readonly="readonly"
            />
          </td>
          <td class="col-type">
            <FSelect
              v-model="phone.type"
              :field="`phones.${index}.type`"
              hide-details
              :options="phoneTypeOptions"
              :readonly="readonly"
            />
          </td>
          <td class="col-preferred">
            <v-checkbox
              v-model="phone.preferred"
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
              @click="removePhone(phone)"
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
      No phone numbers added yet
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
  /* eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable */
  import type { Name, NamePhone } from '../model/name'
  import { computed } from 'vue'
  import { FSelect, FTextField } from '@/shared/ui'
  import { phoneTypeController } from '../lib/controllers/phoneType.controller'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  // Phones array (guaranteed to exist by schema)
  const phones = computed(() => props.model.phones)

  const phoneTypeOptions = phoneTypeController.selectItems

  function removePhone(phone: NamePhone) {
    if (!props.model?.phones) return
    const phoneIndex = props.model.phones.indexOf(phone)
    if (phoneIndex !== -1) {
      props.model.phones.splice(phoneIndex, 1)
    }
  }
</script>

<style scoped>
  .col-type {
    width: 150px;
  }

  .col-preferred {
    width: 100px;
  }

  .col-actions {
    width: 60px;
  }
</style>
