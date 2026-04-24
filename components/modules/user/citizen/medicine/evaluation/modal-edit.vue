<template>
    <div>
        <Modal size="sm" :title="$t('citizens.medicineJournals.historyModal.editEffectEvaluation')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineEvaluationForm formType="update"
                        :selectedMedicineEvaluation="state.formEvaluation" :error="state.error" @error="setError"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateEvaluation" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { effectEvaluationService } from '@/components/api/user/EffectEvaluationService'
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
    selectedMedicineEvaluation: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshEvaluations'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formEvaluation: {
        medicine_name: '',
        history_uuid: '',
        evaluation: '',
        time: '',
    },
})

watch(() => props.selectedMedicineEvaluation, (selectedMedicineEvaluation: any) => {
    if (selectedMedicineEvaluation) {
        state.formEvaluation = {
            medicine_name: props.selectedMedicineEvaluation?.medicine_name,
            history_uuid: props.selectedMedicineEvaluation?.entry?.uuid,
            evaluation: selectedMedicineEvaluation?.entry?.evaluation,
            time: props.selectedMedicineEvaluation?.time,
        }
    }
})

function closeModal() {
    emit('close')
}

function setError(error: any) {
    state.error = error
}

function refreshEvaluations() {
    emit('refreshEvaluations')
}

async function updateEvaluation(evaluation: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const evaluationUuid = props.selectedMedicineEvaluation?.entry?.uuid
        const params = {
            evaluation: evaluation.evaluation,
        }
        const response = await effectEvaluationService.updateEffectEvaluation(evaluationUuid, params)
        if (response?.data) {
            refreshEvaluations()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.historyModal.evaluationUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>