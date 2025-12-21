<template>
  <div>
    <PageHeader
      title="New Case"
      subtitle="Create a new funeral case"
    />

    <CaseForm
      :loading="isSubmitting"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PageHeader } from '@facts/ui'
import { useCaseStore, type Case } from '@/entities/case'
import { CaseForm } from '@/features/case-form'

const router = useRouter()
const caseStore = useCaseStore()

const isSubmitting = ref(false)

async function handleSubmit(caseData: Omit<Case, 'createdAt' | 'updatedAt'>) {
  isSubmitting.value = true

  try {
    const now = new Date().toISOString()
    const newCase: Case = {
      ...caseData,
      createdAt: now,
      updatedAt: now,
    }

    caseStore.addCase(newCase)
    router.push(`/cases/${newCase.id}`)
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.push('/cases')
}
</script>

