<template>
    <div>
        <Modal size="md" :title="$t('citizens.treatments.editTreatment')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenTreatmentForm formType="update" :selectedTreatment="props.selectedTreatment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateTreatment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { treatmentService } from '@/components/api/TreatmentService'
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
    selectedTreatment: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshTreatments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshTreatments() {
    emit('refreshTreatments')
}

async function updateTreatment(treatmentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const treatmentUuid = treatmentDetails.uuid
        const params = {
            area_type: treatmentDetails.area_type,
            name: treatmentDetails.name,
            description: treatmentDetails.description,
            score: treatmentDetails.score,
            completion_date: treatmentDetails.completion_date,
            is_completed: treatmentDetails.is_completed,
            date_completed: treatmentDetails.date_completed,
        }
        const response = await treatmentService.updateTreatment(treatmentUuid, params)
        if (response?.data) {
            refreshTreatments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.treatments.alert.treatmentSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>