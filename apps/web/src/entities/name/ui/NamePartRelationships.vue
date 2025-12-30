<template>
  <div>
    <template v-if="!peopleList || peopleList.length === 0">
      <v-alert
        class="mt-2"
        density="compact"
        type="info"
        variant="tonal"
      >
        <template #prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        No relationships to assign. Please add people and then assign relationships.
      </v-alert>
    </template>
    <template v-else>
      <NamePartRelationship
        v-for="person in filteredPeopleList"
        :key="person.id"
        :inverse-relations="inverseRelations"
        :model="model"
        :person="person"
        :readonly="readonly"
        :relations="relations"
        @relation-selected="handleRelationSelected"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { computed } from 'vue'
  import NamePartRelationship from './NamePartRelationship.vue'

  interface PersonRelation {
    id: string
    description: string
  }

  interface PersonInverseRelation {
    id: string
    description: string
  }

  const props = defineProps<{
    model: Name
    peopleList?: Name[]
    relations?: PersonRelation[]
    inverseRelations?: PersonInverseRelation[]
    readonly?: boolean
  }>()

  const emit = defineEmits<{
    'relation-selected': [currentPersonId: string, relationId: string, relatedNameId: string]
  }>()

  const filteredPeopleList = computed(
    () => props.peopleList?.filter((person) => person.id !== props.model.id) ?? [],
  )

  function handleRelationSelected(
    currentPersonId: string,
    relationId: string,
    relatedNameId: string,
  ) {
    emit('relation-selected', currentPersonId, relationId, relatedNameId)
  }
</script>
