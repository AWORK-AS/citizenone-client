<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.leaveRequests.newLeaveRequest')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleLeaveRequestsForm formType="create"
                        :selectedLeaveRequest="state.formLeaveRequest" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveLeaveRequest" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { leaveRequestService } from '@/components/api/user/LeaveRequestService'
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
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshLeaveRequests', 'refreshDutySchedules', 'closeModal'])

const state = reactive({
    error: {} as Error,
    formLeaveRequest: {
        date_time_start: moment().hour(8).minute(0).format('YYYY-MM-DD HH:mm'),
        date_time_end: moment().hour(17).minute(0).format('YYYY-MM-DD HH:mm'),
        type: '',
        note: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshLeaveRequests() {
    emit('refreshLeaveRequests')
}

async function saveLeaveRequest(leaveRequestDetails: any) {
    state.isPageLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            date_time_start: leaveRequestDetails.date_time_start,
            date_time_end: leaveRequestDetails.date_time_end,
            type: leaveRequestDetails.type,
            note: leaveRequestDetails.note,
        }
        const response = await leaveRequestService.saveLeaveRequest(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.leaveRequests.form.alert.leaveRequestSuccessfullyAdded')}.`)
            refreshLeaveRequests()
            emit('refreshDutySchedules')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>