<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.leaveRequests.editLeaveRequest')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleLeaveRequestsForm formType="update"
                        :selectedLeaveRequest="props.selectedLeaveRequest" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateLeaveRequest" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
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
    selectedLeaveRequest: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshLeaveRequests'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshLeaveRequests() {
    emit('refreshLeaveRequests')
}

async function updateLeaveRequest(leaveRequestDetails: any) {
    state.isPageLoading = true
    try {
        const leaveRequestUuid = props.selectedLeaveRequest?.uuid
        const params = {
            date_time_start: leaveRequestDetails.date_time_start,
            date_time_end: leaveRequestDetails.date_time_end,
            type: leaveRequestDetails.type,
            note: leaveRequestDetails.note,
        }
        const response = await leaveRequestService.updateLeaveRequest(leaveRequestUuid, params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.leaveRequests.form.alert.leaveRequestSuccessfullyUpdated')}.`)
            refreshLeaveRequests()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>