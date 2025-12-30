<template>
  <v-card
    v-if="visible"
    class="mb-2"
    elevation="0"
    variant="outlined"
  >
    <v-card-text class="pa-3">
      <v-row
        class="align-center"
        dense
      >
        <v-col
          cols="12"
          sm="4"
        >
          <FSelect
            v-model="selectedRelationId"
            clearable
            density="compact"
            field="relation"
            :label="label"
            :options="sortedRelations"
            :readonly="readonly"
            @update:model-value="setRelation"
          />
        </v-col>
        <v-col
          class="d-flex align-center justify-center"
          cols="12"
          sm="1"
        >
          <span class="text-body-2 text-medium-emphasis">of</span>
        </v-col>
        <v-col
          cols="12"
          sm="7"
        >
          <FTextField
            density="compact"
            field="person"
            hide-details
            label=""
            :model-value="personLabel"
            readonly
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { computed, ref, watch } from 'vue'
  import { FSelect, FTextField } from '@/shared/ui'
  import { getFormattedName } from '../model/nameHelpers'

  interface PersonRelation {
    id: string
    description: string
  }

  const props = defineProps<{
    model: Name
    person: Name
    relations?: PersonRelation[]
    inverseRelations?: any[]
    readonly?: boolean
  }>()

  const emit = defineEmits<{
    'relation-selected': [currentPersonId: string, relationId: string, relatedNameId: string]
  }>()

  const selectedRelationId = ref<string>('')

  const visible = computed(() => {
    const { first, last, nickname, maidenName, middle } = props.person
    return !!(first || last || nickname || maidenName || middle)
  })

  const personLabel = computed(() => {
    return getFormattedName(props.person) || 'Name Not Specified'
  })

  const label = computed(() => {
    if (props.model.first) {
      return `${props.model.first} is the`
    }
    return 'Relation'
  })

  const sortedRelations = computed(() => {
    if (!props.relations) return []
    return [...props.relations]
      .toSorted((a, b) => a.description.localeCompare(b.description))
      .map((rel) => ({
        title: rel.description,
        value: rel.id,
      }))
  })

  function setRelation(value: string | number | (string | number)[] | null) {
    if (!value || Array.isArray(value)) {
      selectedRelationId.value = ''
      return
    }
    const relationId = String(value)
    selectedRelationId.value = relationId
    // Emit to parent
    emit('relation-selected', props.model.id, relationId, props.person.id)
  }

  function setPreSelectedRelation() {
    if (!props.model.relations || props.model.relations.length === 0) {
      selectedRelationId.value = ''
      return
    }

    const foundRel = props.model.relations.find(
      (rel) =>
        props.model.id === rel.nameId &&
        props.person.id === rel.relatedNameId &&
        rel.active !== false,
    )

    // Convert relationshipType (number) to string ID for the select
    selectedRelationId.value = foundRel ? String(foundRel.relationshipType) || '' : ''
  }

  watch(
    () => props.model,
    () => {
      setPreSelectedRelation()
    },
    { immediate: true, deep: true },
  )
</script>
