<template>
    <div>
        <Modal size="sm" :title="$t('citizens.treatments.newTreatment')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenTreatmentForm formType="create" :selectedTreatment="state.formTreatment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveTreatment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { nursingAreaGoalService } from '@/components/api/NursingAreaGoalService'
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
const emit = defineEmits(['close', 'refreshTreatments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTreatment: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        score: '',
        date_completed: '',
        is_completed: false,
    },
})

function closeModal() {
    emit('close')
}

function refreshTreatments() {
    emit('refreshTreatments')
}

async function saveTreatment(planDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: planDetails.name,
            completion_date: planDetails.completion_date,
            score: planDetails.score,
            description: planDetails.description,
        }
        const response = await planService.saveTreatment(params)
        if (response?.data) {
            refreshTreatments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.treatments.alert.treatmentSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>