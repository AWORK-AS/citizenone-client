<template>
    <!-- A colleague's event while the company keeps those read-only (AW-2026-9924):
         what it is and whose it is, without the form that would change it. -->
    <div class="space-y-4">
        <div class="flex items-start gap-x-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            <Icon name="ph:lock-simple" class="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
            <p v-if="ownersLabel">{{ $t('events.readOnly.notice', { owner: ownersLabel }) }}</p>
            <p v-else>{{ $t('events.readOnly.noticeNoOwner') }}</p>
        </div>
        <dl class="space-y-3 text-sm">
            <div>
                <dt class="font-medium text-gray-900">{{ $t('events.form.title') }}</dt>
                <dd class="mt-0.5 text-gray-700">{{ props.event?.title }}</dd>
            </div>
            <div>
                <dt class="font-medium text-gray-900">{{ $t('events.readOnly.when') }}</dt>
                <dd class="mt-0.5 text-gray-700">{{ formatDateTimeToReadable(props.event?.date_time_start) }} – {{ formatDateTimeToReadable(props.event?.date_time_end) }}</dd>
            </div>
            <div v-if="props.event?.description">
                <dt class="font-medium text-gray-900">{{ $t('events.form.description') }}</dt>
                <dd class="mt-0.5 whitespace-pre-line text-gray-700">{{ props.event?.description }}</dd>
            </div>
            <div v-if="ownersLabel">
                <dt class="font-medium text-gray-900">{{ $t('events.eventOwner') }}</dt>
                <dd class="mt-0.5 text-gray-700">{{ ownersLabel }}</dd>
            </div>
            <div v-if="creatorLabel">
                <dt class="font-medium text-gray-900">{{ $t('events.createdBy') }}</dt>
                <dd class="mt-0.5 text-gray-700">{{ creatorLabel }}</dd>
            </div>
        </dl>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const { formatDateTimeToReadable } = useDatetimeFormatter()

const props = defineProps({
    event: {
        type: Object,
        default: null,
    },
})

const fullName = (person: any) => `${person?.firstname ?? ''} ${person?.lastname ?? ''}`.trim()

// The staff the event belongs to (citizens on a booking are not its owner).
const ownersLabel = computed(() => (props.event?.calendar_owners ?? [])
    .filter((o: any) => o?.owner_type === 'App\\Models\\User')
    .map((o: any) => fullName(o?.owner))
    .filter(Boolean)
    .join(', '))

const creatorLabel = computed(() => fullName(props.event?.creator))
</script>
