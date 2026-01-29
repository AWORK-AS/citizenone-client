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
        let params = {
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            unit_uuid: scheduleDetails.unit_uuid,
            calendar_tag_uuid: scheduleDetails.calendar_tag_uuid,
            is_private: scheduleDetails.is_private,
            apply_changes_to_future_events: scheduleDetails.apply_changes_to_future_events,
        } as any

        if (scheduleDetails.recurring.recurring) {
            params.recurring = scheduleDetails.recurring.recurring
            params.recurring_until = scheduleDetails.recurring.recurring_until
        }

        if (scheduleDetails.recurring.recurring === 'custom') {
            params.frequency = scheduleDetails.recurring.frequency
            params.every = scheduleDetails.recurring.every
            if (scheduleDetails.recurring.frequency === 'weekly') {
                params.weekly_on = scheduleDetails.recurring.weekly_on
            } else if (scheduleDetails.recurring.frequency === 'monthly') {
                params.monthly_on_the_enabled = scheduleDetails.recurring.monthly_on_the_enabled
                if (!scheduleDetails.recurring.monthly_on_the_enabled) {
                    params.monthly_each = scheduleDetails.recurring.monthly_each
                } else {
                    params.monthly_on_the_sequence = scheduleDetails.recurring.monthly_on_the_sequence
                    params.monthly_on_the_day = scheduleDetails.recurring.monthly_on_the_day
                }
            } else if (scheduleDetails.recurring.frequency === 'yearly') {
                params.yearly_in_months = scheduleDetails.recurring.yearly_in_months
                if (scheduleDetails.recurring.yearly_on_the_enabled) {
                    params.yearly_on_the_sequence = scheduleDetails.recurring.yearly_on_the_sequence
                    params.yearly_on_the_day = scheduleDetails.recurring.yearly_on_the_day
                }
            }
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