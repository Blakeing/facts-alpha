<template>
  <FLoader v-model="isLoadingInitial" />

  <!-- Case Edit View -->
  <div v-if="initialValues">
    <div class="mb-4">
      <FButton
        intent="ghost"
        prepend-icon="mdi-arrow-left"
        size="small"
        @click="handleBack"
      >
        Back to Case
      </FButton>
    </div>

    <PageHeader
      :subtitle="`Editing case`"
      title="Edit Case"
    />

    <CaseForm
      :case="caseData"
      :loading="isSaving"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </div>

  <!-- Not Found (only show after loading completes) -->
  <div
    v-else-if="!isLoadingInitial"
    class="text-center py-12"
  >
    <v-icon
      color="grey"
      icon="mdi-folder-question-outline"
      size="64"
    />
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
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { type CaseFormValues, useCase, useCaseForm } from '@/entities/case'
  import { CaseForm } from '@/features/case-form'
  import { FButton, FLoader, PageHeader, useToast } from '@/shared/ui'

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const caseId = computed(() => (route.params as { id?: string }).id ?? '')

  // Get the case data for passing to the form
  const { case: caseData } = useCase(caseId)

  // Setup form with mutation
  const { save, isSaving, isLoadingInitial, initialValues } = useCaseForm(caseId.value, {
    onSuccess: () => {
      toast.success('Case updated successfully')
      router.push(`/cases/${caseId.value}`)
    },
    onError: () => {
      toast.error('Failed to update case')
    },
  })

  async function handleSubmit(values: CaseFormValues) {
    await save(values)
  }

  function handleCancel() {
    if (caseId.value) {
      router.push(`/cases/${caseId.value}`)
    } else {
      router.push('/cases')
    }
  }

  function handleBack() {
    handleCancel()
  }
</script>
