<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.shiftRequests.newShiftRequest')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleShiftRequestsForm :error="state.error"
                        :isModalLoading="state.isPageLoading"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveShiftRequest" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { shiftRequestService } from '@/components/api/user/ShiftRequestService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDutySchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    if (state.isPageLoading) return
    emit('close')
}

async function saveShiftRequest(shiftRequestDetails: any) {
    state.isPageLoading = true
    state.error = {} as any
    try {
        const params = {
            employee_uuid: userStore.getUser?.uuid,
            shift_type_uuid: shiftRequestDetails.shift_type_uuid,
            department_uuids: shiftRequestDetails.department_uuids,
            date_time_start: moment(`${shiftRequestDetails.date} ${shiftRequestDetails.time_in}`).format('YYYY-MM-DD HH:mm:ss'),
            date_time_end: moment(`${shiftRequestDetails.date} ${shiftRequestDetails.time_out}`).format('YYYY-MM-DD HH:mm:ss'),
            note: shiftRequestDetails.note,
        }
        const response = await shiftRequestService.saveShiftRequest(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.shiftRequests.form.alert.requestSuccessfullySent')}.`)
            state.isPageLoading = false
            emit('refreshDutySchedules')
            closeModal()
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
