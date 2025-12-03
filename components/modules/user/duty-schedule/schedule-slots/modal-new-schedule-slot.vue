<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.scheduleSlots.offerNewTime')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleScheduleSlotsForm formType="create" :selectedDay="props.selectedDay"
                        :selectedScheduleSlot="state.formScheduleSlot" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveScheduleSlot" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { scheduleSlotService } from '@/components/api/user/ScheduleSlotService'
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
    selectedDay: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshScheduleSlot', 'refreshDutySchedules', 'closeModal'])

const state = reactive({
    error: {} as Error,
    formScheduleSlot: {
        date_time_start: moment(props.selectedDay?.fullDate).startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment(props.selectedDay?.fullDate).startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        department_uuid: '',
        job_title_uuid: [],
        job_specialty_uuid: [],
        available_slots: '',
        shift_type: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshScheduleSlot() {
    emit('refreshScheduleSlot')
}

async function saveScheduleSlot(scheduleSlotDetails: any) {
    try {
        const params = {
            date_time_start: scheduleSlotDetails.date_time_start,
            date_time_end: scheduleSlotDetails.date_time_end,
            department_uuid: scheduleSlotDetails.department_uuid,
            job_title_uuid: scheduleSlotDetails.job_title_uuid,
            job_specialty_uuid: scheduleSlotDetails.job_specialty_uuid,
            available_slots: scheduleSlotDetails.available_slots,
            shift_type_uuid: scheduleSlotDetails.shift_type,
        }
        const response = await scheduleSlotService.saveScheduleSlot(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleSlots.form.alert.scheduleSlotSuccessfullyAdded')}.`)
            refreshScheduleSlot()
            emit('refreshDutySchedules')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>