<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.scheduleRequests.swapSchedule.swapShift')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleSwapScheduleForm formType="create" :error="state.error"
                        :selectedSchedule="props.selectedSchedule"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveScheduleRequest" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { shiftSwapRequestService } from '@/components/api/user/ShiftSwapRequestService'
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
    selectedSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'closeModal'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

async function saveScheduleRequest(scheduleRequestDetails: any) {
    try {
        const selectedScheduleUuid = props.selectedSchedule?.schedule_uuid
        const params = {
            schedule_uuid: selectedScheduleUuid,
            recipient_uuid: scheduleRequestDetails.recipient,
            note: scheduleRequestDetails.note,
        }
        const response = await shiftSwapRequestService.saveScheduleSwapRequest(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleRequests.swapSchedule.form.alert.requestSuccessfullySent')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>