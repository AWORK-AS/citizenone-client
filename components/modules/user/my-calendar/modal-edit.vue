<template>
    <div>
        <Modal size="xs" :title="$t('events.editEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <FormButton type="button" buttonStyle="danger" class="rounded-md"
                            @click="state.modal.isDeleteScheduleOpen = true">
                            {{ $t('events.delete') }}
                        </FormButton>
                    </div>
                    <div class="mt-4">
                        <ModulesUserMyCalendarForm formType="update" :selectedSchedule="props.selectedSchedule"
                            :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                            @closeModal="closeModal" @submitForm="updateSchedule" />
                    </div>
                    <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
                        :message="$t('events.confirmation.deleteConfirmation') + '?'"
                        @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteMyCalendarEvent" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { myCalendarService } from '@/components/api/user/MyCalendarService'
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
    }
})
const emit = defineEmits(['close', 'refreshSchedules', 'deleteMyCalendarEvent'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isDeleteScheduleOpen: false,
    },
})

function closeModal() {
    emit('close')
}

function deleteMyCalendarEvent() {
    emit('deleteMyCalendarEvent', props.selectedSchedule)
}

function refreshSchedules() {
    emit('refreshSchedules')
}

async function updateSchedule(scheduleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const scheduleUuid = scheduleDetails.uuid
        const params = {
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            unit_uuid: scheduleDetails.unit_uuid,
            is_private: scheduleDetails.is_private,
        }
        const response = await myCalendarService.updateSchedule(scheduleUuid, params)
        if (response?.data) {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>