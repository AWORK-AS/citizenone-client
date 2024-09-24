<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.scheduleSlots.editScheduleSlot')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDutyScheduleScheduleSlotsForm formType="update"
                        :selectedScheduleSlot="props.selectedScheduleSlot" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateScheduleSlot" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { scheduleSlotService } from '@/components/api/ScheduleSlotService'
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
const emit = defineEmits(['close', 'refreshScheduleSlot'])

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
            date: scheduleSlotDetails.date,
            job_id: scheduleSlotDetails.job_id,
            available_slots: scheduleSlotDetails.available_slots,
            time_in: scheduleSlotDetails.time_in,
            time_out: scheduleSlotDetails.time_out,
            shift_type: scheduleSlotDetails.shift_type,
        }
        const response = await scheduleSlotService.updateScheduleSlot(scheduleSlotUuid, params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleSlots.form.alert.scheduleSlotSuccessfullyUpdated')}.`)
            refreshScheduleSlot()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>