<template>
    <!-- Cancelling (aflysning) an event: the cancelled state with its reason and
         where it was moved to, or the way to cancel it. Not for shifts. -->
    <div v-if="props.event?.uuid && !props.event?.is_shift" class="mt-2">
        <div v-if="cancelled" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm">
            <p class="flex items-center gap-1.5 font-semibold text-red-700">
                <Icon name="ph:prohibit" class="size-4" aria-hidden="true" />
                {{ $t('calendar.cancel.cancelled') }}
            </p>
            <p v-if="props.event?.cancel_reason" class="mt-0.5 text-gray-700">{{ props.event.cancel_reason }}</p>
            <p v-if="props.event?.rescheduled_to?.date_time_start" class="mt-1 text-gray-700">
                {{ $t('calendar.cancel.movedTo', { time: formatDateTimeToReadable(props.event.rescheduled_to.date_time_start) }) }}
            </p>
        </div>
        <div v-else class="flex flex-wrap items-center justify-end gap-2">
            <p v-if="props.event?.rescheduled_from?.date_time_start" class="mr-auto text-xs text-gray-500">
                {{ $t('calendar.cancel.movedFrom', { time: formatDateTimeToReadable(props.event.rescheduled_from.date_time_start) }) }}
            </p>
            <FormButton type="button" buttonStyle="action" @click="state.isCancelOpen = true">
                <Icon name="ph:prohibit" class="h-4 w-4 text-red-700" aria-hidden="true" />
                {{ $t('calendar.cancel.action') }}
            </FormButton>
        </div>
        <ModulesUserMyCalendarModalCancel :isModalOpen="state.isCancelOpen" :event="props.event"
            @close="state.isCancelOpen = false" @cancelled="(data: any) => emit('cancelled', data)" />
    </div>
</template>

<script setup lang="ts">
import { isCancelled } from '@/composables/calendarCancel'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const props = defineProps({
    event: {
        type: Object,
        default: null,
    },
})
const emit = defineEmits(['cancelled'])
const { formatDateTimeToReadable } = useDatetimeFormatter()

const cancelled = computed(() => isCancelled(props.event))

const state = reactive({
    isCancelOpen: false,
})
</script>
