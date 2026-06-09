<template>
    <div>
        <Modal size="md" :title="$t('employment.cases.editCase')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentCaseModalForm formType="update" :selectedCase="state.formCase"
                        :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateCase" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedCaseUuid: { type: String, required: false },
})
const emit = defineEmits(['close', 'refreshCases'])

const state = reactive({
    error: {} as Error,
    formCase: {} as any,
    isPageLoading: false,
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen && props.selectedCaseUuid) {
        fetchCase()
    }
})

function closeModal() {
    state.error = {}
    emit('close')
}

async function fetchCase() {
    state.isPageLoading = true
    try {
        const response = await employmentService.getCase(props.selectedCaseUuid)
        if (response?.data) {
            state.formCase = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCase(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentService.updateCase(props.selectedCaseUuid, details)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.cases.form.alert.caseSuccessfullyUpdated')}.`)
            emit('refreshCases')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
