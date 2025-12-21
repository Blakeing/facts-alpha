<template>
  <!-- Case Edit View -->
  <div v-if="caseItem">
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
  <div
    v-else
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
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { type CaseFormValues, formValuesToCase, useCaseStore } from '@/entities/case'
  import { CaseForm } from '@/features/case-form'
  import { FButton, PageHeader, useToast } from '@/shared/ui'

  const route = useRoute()
  const router = useRouter()
  const caseStore = useCaseStore()
  const toast = useToast()

  const isSubmitting = ref(false)

  const caseItem = computed(() => {
    const id = (route.params as { id?: string }).id
    return caseStore.cases.find((c) => c?.id === id) || null
  })

  async function handleSubmit(values: CaseFormValues) {
    if (!caseItem.value) return

    isSubmitting.value = true

    try {
      // Convert form values to Case entity, preserving existing case metadata
      const updatedCase = formValuesToCase(values, caseItem.value)

      caseStore.updateCase(caseItem.value.id, updatedCase)
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

  function handleBack() {
    handleCancel()
  }
</script>
