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
              v-maska="'(###) ###-####'"
              density="compact"
              :field="`phones.${index}.number`"
              hide-details
              placeholder="(###) ###-####"
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
              :field="`phones.${index}.type`"
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
