<template>
    <div>
        <Modal size="lg" :title="$t('bookings.newEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCalendarBookingSingleEventForm formType="create" :selectedEvent="state.formEvent"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveUnit" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { onlineBookingService } from '@/components/api/user/OnlineBookingService'
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
})
const emit = defineEmits(['close', 'refreshBookings'])

const state = reactive({
    error: {} as Error,
    formEvent: {
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        recurring: '',
        recurring_until: '',
        name: '',
        description: '',
        address: '',
        post_code: '',
        city: '',
        image: '',
        spots: '',
        tags: [],
        price: '',
        tax: false,
        show_spots_left: false,
        close_registration: false,
        is_online_booking: false,
        is_reminder_enabled: false,
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshBookings() {
    emit('refreshBookings')
}

async function saveUnit(eventDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = new FormData()
        params.append('date_time_start', eventDetails.date_time_start)
        params.append('date_time_end', eventDetails.date_time_end)
        params.append('recurring', eventDetails.recurring)
        params.append('recurring_until', eventDetails.recurring_until)
        params.append('name', eventDetails.name)
        params.append('description', eventDetails.description)
        params.append('address', eventDetails.address)
        params.append('post_code', eventDetails.post_code)
        params.append('city', eventDetails.city)
        params.append('image', eventDetails.image)
        params.append('spots', eventDetails.spots)
        params.append('tags', JSON.stringify(eventDetails.tags))
        params.append('price', eventDetails.price)
        params.append('tax', eventDetails.tax)
        params.append('show_spots_left', eventDetails.show_spots_left)
        params.append('close_registration', eventDetails.close_registration)
        params.append('is_online_booking', eventDetails.is_online_booking)
        params.append('is_reminder_enabled', eventDetails.is_reminder_enabled)
        const response = await onlineBookingService.saveOnlineBooking(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('bookings.alert.bookingSuccessfullyAdded')}.`)
            refreshBookings()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>