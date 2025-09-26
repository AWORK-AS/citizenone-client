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
        date: '',
        department_uuid: '',
        job_title_uuid: '',
        job_specialty_uuid: '',
        available_slots: '',
        time_in: '',
        time_out: '',
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
            date: moment(props.selectedDay?.fullDate).format('YYYY-MM-DD'),
            department_uuid: scheduleSlotDetails.department_uuid,
            job_title_uuid: scheduleSlotDetails.job_title_uuid,
            job_specialty_uuid: scheduleSlotDetails.job_specialty_uuid,
            available_slots: scheduleSlotDetails.available_slots,
            time_in: scheduleSlotDetails.time_in,
            time_out: scheduleSlotDetails.time_out,
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