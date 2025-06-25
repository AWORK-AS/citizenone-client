<template>
    <div>
        <Modal size="xs" :title="$t('citizens.patientCareHours.newPatientCareHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPatientCareHoursForm formType="create"
                        :selectedPatientCareHours="state.formPatientCareHours" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="savePatientCareHours" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
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
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshPatientCareHours'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formPatientCareHours: {
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        note: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshPatientCareHours() {
    emit('refreshPatientCareHours')
}

async function savePatientCareHours(patientCareHoursDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            date_time_start: patientCareHoursDetails.date_time_start,
            date_time_end: patientCareHoursDetails.date_time_end,
            note: patientCareHoursDetails.note,
        }
        const response = await patientCareHoursService.savePatientCareHours(params)
        if (response?.data) {
            refreshPatientCareHours()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.patientCareHours.form.alert.patientCareHoursSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>