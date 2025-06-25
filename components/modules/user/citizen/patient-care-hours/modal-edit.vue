<template>
    <div>
        <Modal size="xs" :title="$t('citizens.patientCareHours.editPatientCareHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPatientCareHoursForm formType="update"
                        :selectedPatientCareHours="props.selectedPatientCareHours" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updatePatientCareHours" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { patientCareHoursService } from '@/components/api/user/PatientCareHoursService'
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
    selectedPatientCareHours: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshPatientCareHours'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshPatientCareHours() {
    emit('refreshPatientCareHours')
}

async function updatePatientCareHours(patientCareHoursDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const patientCareHoursUuid = props?.selectedPatientCareHours.uuid
        const params = {
            date_time_start: patientCareHoursDetails.date_time_start,
            date_time_end: patientCareHoursDetails.date_time_end,
            note: patientCareHoursDetails.note,
        }
        const response = await patientCareHoursService.updatePatientCareHours(patientCareHoursUuid, params)
        if (response?.data) {
            refreshPatientCareHours()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.patientCareHours.form.alert.patientCareHoursSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>