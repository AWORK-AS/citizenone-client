<template>
    <!-- The booking this note is written from: the case, who is responsible
         and the booking's status. Read-only; from GET .../note-context. -->
    <dl v-if="props.context" :aria-label="$t('events.noteHeader.label')"
        class="grid gap-x-4 gap-y-3 rounded-lg bg-gray-50 px-4 py-3 text-sm ring-1 ring-gray-200 sm:grid-cols-3">
        <div class="min-w-0">
            <dt class="text-xs font-medium text-gray-500">{{ $t('events.noteHeader.case') }}</dt>
            <dd class="mt-0.5 text-gray-900">
                <span class="font-medium">{{ props.context.citizen?.name }}</span>
                <span v-if="props.context.citizen?.case_number" class="block text-xs text-gray-500">
                    {{ $t('events.noteHeader.caseNumber', { number: props.context.citizen.case_number }) }}
                </span>
            </dd>
        </div>
        <div class="min-w-0">
            <dt class="text-xs font-medium text-gray-500">{{ $t('events.noteHeader.responsible') }}</dt>
            <dd class="mt-0.5 text-gray-900">
                <span class="font-medium">{{ props.context.responsible?.name }}</span>
                <span v-if="props.context.responsible?.source" class="block text-xs text-gray-500">
                    {{ props.context.responsible.source === 'primary_coordinator'
                        ? $t('events.noteHeader.primaryCoordinator')
                        : $t('events.noteHeader.bookingOwner') }}
                </span>
            </dd>
        </div>
        <div class="min-w-0">
            <dt class="text-xs font-medium text-gray-500">{{ $t('events.noteHeader.statusLabel') }}</dt>
            <dd class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span class="inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium" :class="{
                    'bg-gray-200 text-gray-700': statusKey === 'planned',
                    'bg-green-100 text-green-800': statusKey === 'completed',
                    'bg-red-100 text-red-800': statusKey === 'notCompleted',
                }">
                    {{ statusKey === 'planned' ? $t('events.noteHeader.planned') : $t(`events.status.${statusKey}`) }}
                </span>
                <span class="text-xs text-gray-600 tabular-nums">{{ when }}</span>
            </dd>
        </div>
    </dl>
</template>

<script setup lang="ts">
import moment from 'moment'
import { bookingStatusKey } from '@/composables/calendarNoteRequired'

const props = defineProps({
    context: {
        type: Object,
        default: null,
    },
})

const statusKey = computed(() => bookingStatusKey(props.context?.booking?.status))

// "19.10.2026 09:00–10:30", or both dates when the booking ends on another day.
const when = computed(() => {
    const start = props.context?.booking?.date_time_start
    const end = props.context?.booking?.date_time_end

    if (!start) return ''

    const from = moment(start)
    if (!end) return from.format('DD.MM.YYYY HH:mm')

    const to = moment(end)

    return from.isSame(to, 'day')
        ? `${from.format('DD.MM.YYYY HH:mm')}–${to.format('HH:mm')}`
        : `${from.format('DD.MM.YYYY HH:mm')}–${to.format('DD.MM.YYYY HH:mm')}`
})
</script>
