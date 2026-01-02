<!-- eslint-disable vue/no-mutating-props -- Model is a working copy from useFormModel, meant to be mutated -->
<template>
  <div>
    <NamePartGroup label="Name">
      <template v-if="!hideCompany">
        <FTextField
          v-model="model.companyName"
          field="companyName"
          label="Company Name"
          maxlength="255"
          :readonly="namePartReadonly"
        />
      </template>
      <NamePartName
        :is-name-required="isNameRequired"
        :model="model"
        :name-part-readonly="namePartReadonly"
      />
      <v-row dense>
        <v-col cols="4">
          <FTextField
            v-model="model.nickname"
            field="nickname"
            label="Nickname"
            :readonly="namePartReadonly"
          />
        </v-col>
        <v-col cols="4">
          <FTextField
            v-model="model.maidenName"
            field="maidenName"
            label="Maiden"
            :readonly="namePartReadonly"
          />
        </v-col>
      </v-row>
    </NamePartGroup>

    <NamePartAddresses
      :model="model"
      :readonly="namePartReadonly"
    />

    <NamePartGroup label="Identification">
      <NamePartIdentification
        :hide-s-s-n="hideSSN"
        :model="model"
        :readonly="namePartReadonly"
      />
    </NamePartGroup>

    <NamePartGroup
      v-if="(model.deceased || model.deathDate) && !hideDeceasedInfo"
      label="Deceased"
    >
      <NamePartDeceased
        :model="model"
        :readonly="namePartReadonly"
      />
    </NamePartGroup>

    <NamePartGroup
      v-if="!hideDates"
      label="Dates"
    >
      <NamePartDates
        :model="model"
        :readonly="namePartReadonly"
      />
      <NamePartMarketing
        v-if="showOptOutMarketing"
        :model="model"
        :readonly="namePartReadonly"
      />
    </NamePartGroup>

    <NamePartGroup
      v-if="!hideDemo"
      label="Demographic"
    >
      <NamePartDemographic
        :model="model"
        :readonly="namePartReadonly"
      />
    </NamePartGroup>

    <NamePartGroup
      v-if="!hideMilitary"
      label="Military"
    >
      <NamePartMilitary
        :model="model"
        :readonly="namePartReadonly"
      />
    </NamePartGroup>

    <NamePartGroup
      v-if="!hidePhone"
      label="Phone"
    >
      <template #actions>
        <v-tooltip text="Add phone number">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="primary"
              :disabled="namePartReadonly"
              icon
              size="small"
              variant="text"
              @click="addPhone"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
      <NamePartPhones
        :model="model"
        :readonly="namePartReadonly"
      />
    </NamePartGroup>

    <NamePartGroup
      v-if="!hideEmail"
      label="Email"
    >
      <template #actions>
        <v-tooltip text="Add email address">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="primary"
              :disabled="namePartReadonly"
              icon
              size="small"
              variant="text"
              @click="addEmail"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
      <NamePartEmails
        :model="model"
        :readonly="namePartReadonly"
      />
    </NamePartGroup>

    <NamePartGroup
      v-if="!hideRelationships && relations && peopleList && inverseRelations"
      :label="relationCardTitle"
    >
      <NamePartRelationships
        :inverse-relations="inverseRelations"
        :model="model"
        :people-list="peopleList"
        :readonly="namePartReadonly"
        :relations="relations"
        @relation-selected="handleRelationSelected"
      />
    </NamePartGroup>
  </div>
</template>
<!-- eslint-enable vue/no-mutating-props -->

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { computed } from 'vue'
  import { FTextField } from '@/shared/ui'
  import { PhoneType } from '../model/name'
  import { getFormattedName } from '../model/name.helpers'
  import NamePartAddresses from './NamePartAddresses.vue'
  import NamePartDates from './NamePartDates.vue'
  import NamePartDeceased from './NamePartDeceased.vue'
  import NamePartDemographic from './NamePartDemographic.vue'
  import NamePartEmails from './NamePartEmails.vue'
  import NamePartGroup from './NamePartGroup.vue'
  import NamePartIdentification from './NamePartIdentification.vue'
  import NamePartMarketing from './NamePartMarketing.vue'
  import NamePartMilitary from './NamePartMilitary.vue'
  import NamePartName from './NamePartName.vue'
  import NamePartPhones from './NamePartPhones.vue'
  import NamePartRelationships from './NamePartRelationships.vue'

  /**
   * NamePanel - Main form for editing Name entity
   *
   * WORKING COPY PATTERN:
   * This component receives a mutable Name object from NameEditorDialog.
   * All child components (NamePart*) use direct v-model binding to mutate the model.
   * No event chains or computed properties needed - just direct mutation.
   */

  interface PersonRelation {
    id: string
    description: string
  }

  interface PersonInverseRelation {
    id: string
    description: string
  }

  const props = defineProps<{
    model: Name // Mutable working copy
    hideCompany?: boolean
    hideSSN?: boolean
    hideEmail?: boolean
    hidePhone?: boolean
    hideDates?: boolean
    hideDeceasedInfo?: boolean
    hideDemo?: boolean
    hideMilitary?: boolean
    hideRelationships?: boolean
    namePartReadonly?: boolean
    peopleList?: Name[]
    relations?: PersonRelation[]
    inverseRelations?: PersonInverseRelation[]
    showOptOutMarketing?: boolean
    isNameRequired?: boolean
  }>()

  const emit = defineEmits<{
    'set-relation': [currentPersonId: string, relation: string, relatedNameId: string]
  }>()

  const relationCardTitle = computed(() => {
    const display = getFormattedName(props.model)
    const title = display === 'Not Specified' ? '' : display
    return `${title} Relationships`.trim()
  })

  /**
   * Add a new phone number to the model
   * Direct mutation of the working copy
   */
  function addPhone() {
    /* eslint-disable-next-line vue/no-mutating-props */
    props.model.phones.push({
      id: '0',
      nameId: props.model.id || '0',
      number: '',
      type: PhoneType.MOBILE,
      preferred: false,
      active: true,
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
    })
  }

  /**
   * Add a new email address to the model
   * Direct mutation of the working copy
   */
  function addEmail() {
    /* eslint-disable-next-line vue/no-mutating-props */
    props.model.emailAddresses.push({
      id: '0',
      nameId: props.model.id || '0',
      address: '',
      preferred: false,
      active: true,
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
    })
  }

  function handleRelationSelected(
    currentPersonId: string,
    relationId: string,
    relatedNameId: string,
  ) {
    emit('set-relation', currentPersonId, relationId, relatedNameId)
  }
</script>
