<template>
    <div>
        <Modal size="xs" :title="$t('citizens.calendar.viewSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <FormButton type="button" buttonStyle="danger" @click="openDeleteConfirmation">
                            {{ $t('citizens.calendar.delete') }}
                        </FormButton>
                    </div>
                    <!-- Done / not done, as in the calendar's event menu: here too because a
                         narrow event in the day/week grid has no room for that menu. -->
                    <ModulesUserMyCalendarCancelPanel v-if="props.statusActions" :event="props.selectedSchedule"
                        @cancelled="onCancelled" />
                    <div v-if="props.statusActions && canMarkStatus(props.selectedSchedule)"
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
                        <!-- Visit, transport or admin time on this booking, as Indsatstimer.
                             Not tied to the booking: "not done" leaves it. -->
                        <FormButton v-if="canRegisterTime" type="button" buttonStyle="action"
                            @click="state.modal.isRegisterTimeOpen = true">
                            <Icon name="ph:clock" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('events.registerTime') }}
                        </FormButton>
                    </div>
                    <div class="mt-4 relative flex space-x-6 pb-6 xl:static">
                        <img :src="avatarUrl(`${props.selectedSchedule?.user?.firstname + ' ' + props.selectedSchedule?.user?.lastname}`)"
                            alt="Image" class="h-14 w-14 flex-none rounded-full" />
                        <div class="flex-auto">
                            <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">
                                {{ props.selectedSchedule?.user?.firstname }}
                                {{ props.selectedSchedule?.user?.lastname }}
                            </h3>
                            <div class="flex items-center gap-x-2 flex-wrap">
                                <dt class="flex items-center">
                                    <span class="sr-only">Title</span>
                                    <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd class="font-semibold text-gray-900 xl:pr-0">
                                    {{ props.selectedSchedule?.title }}
                                </dd>
                                <ModulesUserMyCalendarLinkedNote :journal="props.selectedSchedule?.journal"
                                    :citizenUuid="props.selectedSchedule?.citizen_uuid" />
                            </div>
                            <div class="flex gap-x-2">
                                <dt class="flex mt-1">
                                    <span class="sr-only">Description</span>
                                    <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                        aria-hidden="true" />
                                </dt>
                                <dd class="text-gray-900 xl:pr-0">
                                    {{ props.selectedSchedule?.description }}
                                </dd>
                            </div>
                            <div class="flex gap-x-2 text-xs text-gray-500">
                                <p>
                                    {{ $t('units.unit') }}:
                                </p>
                                <p>
                                    {{ props.selectedSchedule?.unit?.name }}
                                </p>
                            </div>
                            <dl class="text-gray-500">
                                <div class="flex items-center space-x-3 text-xs">
                                    <dt class="flex items-center">
                                        <span class="sr-only">Date</span>
                                        <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    </dt>
                                    <dd>
                                        <span>
                                            {{ formatDateTimeToReadable(props.selectedSchedule.start) }}
                                            -
                                            {{ formatDateTimeToReadable(props.selectedSchedule.end) }}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </LoadingSpinner>
                <ModulesUserCitizenInterventionHoursModalNew v-if="canRegisterTime"
                    :isModalOpen="state.modal.isRegisterTimeOpen" :citizenUuid="props.selectedSchedule?.citizen_uuid"
                    :presetStart="props.selectedSchedule?.start" :presetEnd="props.selectedSchedule?.end"
                    @close="state.modal.isRegisterTimeOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
                    :message="$t('citizens.calendar.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteMyCalendarEvent">
                    <template #extra>
                        <div class="py-4" v-if="props.selectedSchedule.is_recurring">
                            <ModulesUserMyCalendarRecurringScope v-model="state.deleteScope"
                                :label="$t('events.recurringScope.deleteLabel')" />
                        </div>
                    </template>
                </DialogConfirmation>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { canMarkStatus } from '@/composables/calendarCancel'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { isCareHourTypesOn } from '@/composables/careHourTypes'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const { formatDateTimeToReadable } = useDatetimeFormatter()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedSchedule: {
        type: Object,
        required: true,
    },
    // Offer "mark as completed / not completed" (emits markEventAsStatus(status)).
    // Only for a page that handles it (the child calendar doesn't).
    statusActions: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(['close', 'refreshSchedules', 'deleteMyCalendarEvent', 'markEventAsStatus'])

// Cancelled (and maybe moved): the calendar reloads to show both events.
function onCancelled() {
    emit('refreshSchedules')
    emit('close')
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isDeleteScheduleOpen: false,
        isRegisterTimeOpen: false,
    },
    deleteScope: 'this' as 'this' | 'this_and_following' | 'all',
})

// Only where the company switched hour types on (Settings -> Company), and on
// a page that offers done / not done (not the child calendar).
const userStore = useUserStore() as any
const canRegisterTime = computed(() => props.statusActions
    && !!props.selectedSchedule?.uuid
    && !!props.selectedSchedule?.citizen_uuid
    && isCareHourTypesOn(userStore.getUser?.company))

function closeModal() {
    state.modal.isDeleteScheduleOpen = false
    state.modal.isRegisterTimeOpen = false
    emit('close')
}

function openDeleteConfirmation() {
    state.deleteScope = 'this'
    state.modal.isDeleteScheduleOpen = true
}

function deleteMyCalendarEvent() {
    state.modal.isDeleteScheduleOpen = false
    emit('deleteMyCalendarEvent', props.selectedSchedule, state.deleteScope)
}
</script>