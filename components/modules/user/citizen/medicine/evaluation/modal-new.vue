<template>
    <div>
        <Modal size="sm" :title="$t('citizens.medicineJournals.historyModal.registerEffectEvaluation')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineEvaluationForm formType="create"
                        :selectedMedicineEvaluation="state.formEvaluation" :error="state.error" @error="setError"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveEvaluation" />
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
const emit = defineEmits(['close', 'refreshEvaluations', 'refreshMedicineHistories'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formEvaluation: {
        medicine_name: '',
        citizen_medicine_uuid: '',
        evaluation: '',
        time: '',
    },
})

watch(() => props.selectedMedicineEvaluation, (selectedMedicineEvaluation: any) => {
    if (selectedMedicineEvaluation) {
        state.formEvaluation = {
            medicine_name: props.selectedMedicineEvaluation?.medicine_name,
            citizen_medicine_uuid: props.selectedMedicineEvaluation?.entry?.citizen_medicine?.uuid,
            evaluation: '',
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

function refreshMedicineHistories() {
    emit('refreshMedicineHistories')
}

async function saveEvaluation(evaluation: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_medicine_uuid: props.selectedMedicineEvaluation?.entry?.citizen_medicine?.uuid,
            evaluation: evaluation.evaluation,
            time: props.selectedMedicineEvaluation?.time
        }
        const response = await effectEvaluationService.saveEffectEvaluation(params)
        if (response?.data) {
            refreshMedicineHistories()
            refreshEvaluations()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.historyModal.evaluationRegistered')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>