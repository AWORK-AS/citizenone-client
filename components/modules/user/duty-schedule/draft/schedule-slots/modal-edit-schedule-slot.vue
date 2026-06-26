<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.scheduleSlots.editOfferedShift')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleScheduleSlotsForm formType="update"
                        :selectedScheduleSlot="props.selectedScheduleSlot" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateScheduleSlot" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { draftScheduleSlotService } from '@/components/api/user/DraftScheduleSlotService'
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
    selectedScheduleSlot: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshScheduleSlot', 'refreshDutySchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshScheduleSlot() {
    emit('refreshScheduleSlot')
}

async function updateScheduleSlot(scheduleSlotDetails: any) {
    try {
        const scheduleSlotUuid = props.selectedScheduleSlot?.uuid
        const params = {
            date_time_start: scheduleSlotDetails.date_time_start,
            date_time_end: scheduleSlotDetails.date_time_end,
            department_uuid: scheduleSlotDetails.department_uuid,
            job_title_uuid: scheduleSlotDetails.job_title_uuid,
            job_specialty_uuid: scheduleSlotDetails.job_specialty_uuid,
            available_slots: scheduleSlotDetails.available_slots,
            shift_type_uuid: scheduleSlotDetails.shift_type,
            citizen_uuid: scheduleSlotDetails.citizen_uuid,
            schedule_tag_uuid: scheduleSlotDetails.schedule_tag_uuid,
            note: scheduleSlotDetails.note,
        }
        const response = await draftScheduleSlotService.updateScheduleSlot(scheduleSlotUuid, params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleSlots.form.alert.scheduleSlotSuccessfullyUpdated')}.`)
            refreshScheduleSlot()
            emit('refreshDutySchedules')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>
