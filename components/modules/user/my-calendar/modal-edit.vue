<template>
    <div>
        <Modal size="xs" :title="$t('events.editEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex items-center justify-end gap-x-2">
                        <div class="mr-auto min-w-0">
                            <ModulesUserMyCalendarLinkedNote :journal="props.selectedSchedule?.journal"
                                :citizenUuid="props.selectedSchedule?.citizen?.uuid" />
                        </div>
                        <Tooltip :text="$t('calendar.duplicate.help')" position="bottom">
                            <FormButton type="button" buttonStyle="action" @click="emit('duplicateEvent', props.selectedSchedule)">
                                <Icon name="ph:copy" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('calendar.duplicate.label') }}
                            </FormButton>
                        </Tooltip>
                        <FormButton type="button" buttonStyle="danger" @click="state.modal.isDeleteScheduleOpen = true">
                            {{ $t('events.delete') }}
                        </FormButton>
                    </div>
                    <!-- Done / not done, as in the calendar's event menu: here too because a
                         narrow event in the day/week grid has no room for that menu. -->
                    <ModulesUserMyCalendarCancelPanel :event="props.selectedSchedule" @cancelled="onCancelled" />
                    <div v-if="canMarkStatus(props.selectedSchedule)"
                        class="mt-2 flex flex-wrap items-center justify-end gap-2">
                        <FormButton v-if="props.selectedSchedule?.completion_status !== 'completed'" type="button"
                            buttonStyle="action" @click="emit('markEventAsStatus', 'completed')">
                            <Icon name="ph:check-circle" class="h-4 w-4 text-green-700" aria-hidden="true" />
                            {{ $t('events.markAsCompleted') }}
                        </FormButton>
                        <FormButton v-if="props.selectedSchedule?.completion_status !== 'not_completed'" type="button"
                            buttonStyle="action" @click="emit('markEventAsStatus', 'not_completed')">
                            <Icon name="ph:x-circle" class="h-4 w-4 text-red-700" aria-hidden="true" />
                            {{ $t('events.markAsNotCompleted') }}
                        </FormButton>
                        <!-- Visit, transport or admin time on this booking's citizen, as
                             Indsatstimer. Not tied to the booking: "not done" leaves it. -->
                        <FormButton v-if="canRegisterTime" type="button" buttonStyle="action"
                            @click="state.modal.isRegisterTimeOpen = true">
                            <Icon name="ph:clock" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('events.registerTime') }}
                        </FormButton>
                    </div>
                    <div class="mt-4">
                        <ModulesUserMyCalendarForm formType="update" :selectedSchedule="props.selectedSchedule"
                            :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                            @closeModal="closeModal" @submitForm="updateSchedule" />
                    </div>
                    <ModulesUserCitizenInterventionHoursModalNew v-if="canRegisterTime"
                        :isModalOpen="state.modal.isRegisterTimeOpen" :citizenUuid="props.selectedSchedule?.citizen?.uuid"
                        :presetStart="props.selectedSchedule?.date_time_start" :presetEnd="props.selectedSchedule?.date_time_end"
                        @close="state.modal.isRegisterTimeOpen = false" />
                    <ModulesUserMyCalendarModalDelete :isModalOpen="state.modal.isDeleteScheduleOpen"
                        :selectedSchedule="props.selectedSchedule" @deleteMyCalendarEvent="deleteMyCalendarEvent"
                        @close="state.modal.isDeleteScheduleOpen = false" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { canMarkStatus } from '@/composables/calendarCancel'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useAlert } from '@/composables/alert'
import { isCareHourTypesOn } from '@/composables/careHourTypes'
import { useUserStore } from '@/store/user'
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
// markEventAsStatus(status): the page marks its selected event, as for the menu.
const emit = defineEmits(['close', 'refreshSchedules', 'deleteMyCalendarEvent', 'duplicateEvent', 'markEventAsStatus'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isDeleteScheduleOpen: false,
        isRegisterTimeOpen: false,
    },
})

// A booking on a citizen, where the company switched hour types on
// (Settings -> Company). The first citizen, as item 7's done hours.
const userStore = useUserStore() as any
const canRegisterTime = computed(() => !!props.selectedSchedule?.uuid
    && !props.selectedSchedule?.is_shift
    && !!props.selectedSchedule?.citizen?.uuid
    && isCareHourTypesOn(userStore.getUser?.company))

function closeModal() {
    state.modal.isRegisterTimeOpen = false
    emit('close')
}

function deleteMyCalendarEvent(isDeleteFuture: boolean) {
    state.modal.isDeleteScheduleOpen = false
    emit('deleteMyCalendarEvent', props.selectedSchedule, isDeleteFuture)
}

// Cancelled (and maybe moved): the calendar reloads to show both events.
function onCancelled() {
    emit('refreshSchedules')
    closeModal()
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
            reminder_minutes: scheduleDetails.reminder_minutes ?? null,
            is_online_meeting: scheduleDetails.is_online_meeting,
            meeting_url: scheduleDetails.meeting_url,
            is_video_consultation: scheduleDetails.is_video_consultation ?? false,
            apply_to: scheduleDetails.apply_to ?? 'this',
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