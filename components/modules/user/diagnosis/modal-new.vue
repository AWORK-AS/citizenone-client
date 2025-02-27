<template>
    <div>
        <Modal size="xs" :title="$t('diagnoses.newDiagnosis')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDiagnosisModalForm formType="create" :selectedDiagnosis="state.formDiagnosis"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDiagnosis" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { diagnosisService } from '@/components/api/user/DiagnosisService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDiagnoses'])

const state = reactive({
    error: {} as Error,
    formDiagnosis: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshDiagnoses() {
    emit('refreshDiagnoses')
}

async function saveDiagnosis(diagnosisDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: diagnosisDetails.name,
        }
        const response = await diagnosisService.saveDiagnosis(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('diagnoses.form.alert.newDiagnosisSuccessfullySaved')}.`)
            refreshDiagnoses()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>