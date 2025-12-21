<template>
  <div v-if="caseItem">
    <PageHeader
      :subtitle="`Editing ${caseItem.caseNumber}`"
      title="Edit Case"
    />

    <CaseForm
      :case="caseItem"
      :loading="isSubmitting"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </div>

  <!-- Not Found -->
  <div v-else class="text-center py-12">
    <v-icon color="grey" icon="mdi-folder-question-outline" size="64" />
    <h2 class="text-h5 mt-4">Case Not Found</h2>
    <p class="text-body-1 text-medium-emphasis mt-2">
      The case you're trying to edit doesn't exist or has been removed.
    </p>
    <FButton
      class="mt-4"
      intent="primary"
      @click="router.push('/cases')"
    >
      Back to Cases
    </FButton>
  </div>
</template>

<script lang="ts" setup>
import { FButton, PageHeader } from '@facts/ui'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type Case, useCaseStore } from '@/entities/case'
import { CaseForm } from '@/features/case-form'
import { useToast } from '@/shared/ui'

const route = useRoute()
const router = useRouter()
const caseStore = useCaseStore()
const toast = useToast()

const isSubmitting = ref(false)

const caseItem = computed(() => {
  const id = (route.params as { id?: string }).id
  return caseStore.cases.find((c) => c?.id === id) || null
})

async function handleSubmit(caseData: Omit<Case, 'createdAt' | 'updatedAt'>) {
  if (!caseItem.value) return

  isSubmitting.value = true

  try {
    const updates: Partial<Case> = {
      ...caseData,
      updatedAt: new Date().toISOString(),
    }

    caseStore.updateCase(caseItem.value.id, updates)
    toast.success('Case updated successfully')
    router.push(`/cases/${caseItem.value.id}`)
  } catch {
    toast.error('Failed to update case')
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  const id = (route.params as { id?: string }).id
  if (id) {
    router.push(`/cases/${id}`)
  } else {
    router.push('/cases')
  }
}
</script>

