<template>
    <Modal size="sm" :show="isModalOpen" :title="$t('patient.appointments.detailTitle', { clinic: clinicName })"
        @close="$emit('close')">
        <template #modal-body>
            <dl class="space-y-3 text-sm" v-if="event">
                <div class="flex gap-4">
                    <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.what') }}</dt>
                    <dd class="font-semibold text-gray-900">
                        {{ event.title ?? $t('patient.appointments.appointment') }}
                    </dd>
                </div>
                <div class="flex gap-4">
                    <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.when') }}</dt>
                    <dd class="text-gray-900">
                        {{ formatDateTime(event.date_time_start) }}
                    </dd>
                </div>
                <div class="flex gap-4" v-if="event.unit?.name">
                    <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.where') }}</dt>
                    <dd class="text-gray-900">{{ event.unit.name }}</dd>
                </div>
                <div class="flex gap-4" v-if="event.user?.firstname">
                    <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.who') }}</dt>
                    <dd class="text-gray-900">{{ event.user.firstname }} {{ event.user.lastname }}</dd>
                </div>
                <div class="flex gap-4" v-if="event.is_online_meeting && event.meeting_url">
                    <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.online') }}</dt>
                    <dd>
                        <a :href="event.meeting_url" target="_blank" rel="noopener" class="text-primary underline">
                            {{ $t('patient.appointments.joinOnline') }}
                        </a>
                    </dd>
                </div>
            </dl>
            <p class="text-sm text-gray-500 mt-4" v-if="event?.description">
                {{ event.description }}
            </p>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useUserStore } from '@/store/user'

const { formatLocalized } = useDatetimeFormatter()

const userStore = useUserStore() as any

defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    event: {
        type: Object as any,
        default: null,
    },
})
defineEmits(['close'])

const clinicName = computed(() => userStore.getUser?.clinic?.name ?? userStore.getUser?.company?.name ?? '')

function formatDateTime(value: any) {
    return value ? formatLocalized(moment(value), 'dddd D. MMMM YYYY, HH:mm') : '-'
}
</script>
