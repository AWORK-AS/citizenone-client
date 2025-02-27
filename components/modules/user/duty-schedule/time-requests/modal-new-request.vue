<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.scheduleRequests.newRequest')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleTimeRequestsForm formType="create"
                        :selectedSchedule="state.formScheduleSlot" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveScheduleRequest" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { scheduleRequestService } from '@/components/api/ScheduleRequestService'
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
    selectedSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'closeModal'])

const state = reactive({
    error: {} as Error,
    formScheduleSlot: {
        time_in: '',
        time_out: '',
        note: '',
    },
    isPageLoading: false,
})

watch(() => props.selectedSchedule, (selectedSchedule: any) => {
    if (selectedSchedule) {
        state.formScheduleSlot.time_in = selectedSchedule?.time_in
        state.formScheduleSlot.time_out = selectedSchedule?.time_out
        state.formScheduleSlot.note = selectedSchedule?.note
    }
})

function closeModal() {
    emit('close')
}

async function saveScheduleRequest(scheduleRequestDetails: any) {
    try {
        const selectedScheduleUuid = props.selectedSchedule?.schedule_uuid
        const params = {
            schedule_uuid: selectedScheduleUuid,
            time_in: scheduleRequestDetails.time_in,
            time_out: scheduleRequestDetails.time_out,
            note: scheduleRequestDetails.note,
        }
        const response = await scheduleRequestService.saveScheduleRequest(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleRequests.form.alert.requestSuccessfullySent')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>