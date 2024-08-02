<template>
    <div>
        <Modal size="xs" :title="$t('citizens.calendar.viewSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="relative flex space-x-6 pb-6 xl:static">
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
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import type { Error } from '@/types'

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
const emit = defineEmits(['close', 'refreshSchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function formatDateTimeToReadable(datetime: string) {
    return moment(datetime).format('DD. MMM YYYY HH:mm')
}
</script>