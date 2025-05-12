<template>
    <div>
        <Modal size="xs" :title="$t('citizens.calendar.viewSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <FormButton type="button" buttonStyle="danger" class="rounded-md"
                            @click="state.modal.isDeleteScheduleOpen = true">
                            {{ $t('citizens.calendar.delete') }}
                        </FormButton>
                    </div>
                    <div class="mt-4 relative flex space-x-6 pb-6 xl:static">
                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${props.selectedSchedule?.user?.firstname + ' ' + props.selectedSchedule?.user?.lastname}`"
                            alt="Image" class="h-14 w-14 flex-none rounded-full" />
                        <div class="flex-auto">
                            <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">
                                {{ props.selectedSchedule?.user?.firstname }}
                                {{ props.selectedSchedule?.user?.lastname }}
                            </h3>
                            <div class="flex items-center gap-x-2">
                                <dt class="flex items-center">
                                    <span class="sr-only">Title</span>
                                    <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd class="font-semibold text-gray-900 xl:pr-0">
                                    {{ props.selectedSchedule?.title }}
                                </dd>
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
                <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
                    :message="$t('citizens.calendar.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteMyCalendarEvent" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
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
</script>