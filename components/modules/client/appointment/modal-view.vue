<template>
    <div>
        <Modal size="xl"
            :title="$t('client.viewAppointment')"
            :show="props.isModalOpen" @close="closeModal">
            
            <template #modal-body>
                <div class="mt-6 space-y-3">
                    <div class="space-y-1">
                        <p class="text-sm text-gray-600">{{ $t('client.appointmentsTable.eventName') }}</p>
                        <p class="font-medium">{{ props.appointment?.appointment?.booking_setting?.appointment?.name }}</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">{{ $t('client.appointmentsTable.date') }}</p>
                            <p class="font-medium">{{ formatDateToReadable(props.appointment?.appointment?.date) }}</p></div><div class="space-y-1">
                            <p class="text-sm text-gray-600">{{ $t('client.appointmentsTable.time') }}</p>
                            <p class="font-medium">{{ props.appointment?.appointment?.start_time }} - {{ props.appointment?.appointment?.end_time }}</p>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <p class="text-sm text-gray-600">{{ $t('client.appointmentsTable.address') }}</p>
                        <p class="font-medium">{{ appointment?.appointment?.booking_setting?.appointment?.address || '--' }}</p>
                    </div>

                    <div class="space-y-1">
                        <p class="text-sm text-gray-600">{{ $t('client.appointmentsTable.description') }}</p>
                        <p class="font-medium">{{ appointment?.appointment?.booking_setting?.appointment?.description || '--' }}</p>
                    </div>
                </div>
            </template>

        </Modal>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    appointment: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    tabs: [
        {
            name: 'bookings.view.overview.overview',
            isTranslateName: true,
            isActive: true,
        },
        {
            name: 'bookings.view.participants.participants',
            isTranslateName: true,
            isActive: false,
        },
    ] as any
})

function closeModal() {
    emit('close')
}
</script>