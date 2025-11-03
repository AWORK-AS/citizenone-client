<template>
    <div>
        <Modal size="xl" :title="$t('bookings.newEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCalendarBookingSingleEventForm formType="create" :selectedEvent="state.formEvent"
                        :eventData="state.eventData" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @closeModalSelection="$emit('closeModalSelection')" @submitForm="saveEvent" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { coursesEventsService } from '@/components/api/user/CoursesEventsService'
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
const emit = defineEmits(['close', 'closeModalSelection', 'refreshCoursesEvents'])

const state = reactive({
    error: {} as Error,
    eventData: {},
    formEvent: {
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        is_recurring: false,
        recurring: '',
        recurring_until: '',
        name: '',
        description: '',
        address: '',
        post_code: '',
        city: '',
        image: '',
        spots: '1',
        slots: [],
        tags: [],
        price: '',
        is_tax_included: false,
        show_spots_left: false,
        close_registration: false,
        is_online_booking: false,
        is_reminder_enabled: false,
    },
    isPageLoading: false,
    isSuccessfullyCreated: false,
})

function closeModal() {
    emit('close')
}

function refreshCoursesEvents() {
    emit('refreshCoursesEvents')
}

async function saveEvent(eventDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = new FormData()
        params.append('type', 'event')
        params.append('date_time_start', eventDetails.date_time_start)
        params.append('date_time_end', eventDetails.date_time_end)
        params.append('is_recurring', eventDetails.is_recurring)
        params.append('recurring', eventDetails.recurring)
        params.append('recurring_until', eventDetails.recurring_until),
        params.append('exclude_weekend', eventDetails.exclude_weekend)
        params.append('name', eventDetails.name)
        params.append('description', eventDetails.description)
        params.append('address', eventDetails.address)
        params.append('post_code', eventDetails.post_code)
        params.append('city', eventDetails.city)
        params.append('image', eventDetails.image)
        params.append('spots', eventDetails.spots)
        params.append('tag_uuid', JSON.stringify(eventDetails.tags))
        params.append('price', eventDetails.price)
        params.append('is_tax_included', eventDetails.is_tax_included)
        params.append('show_spots_left', eventDetails.show_spots_left)
        params.append('close_registration', eventDetails.close_registration)
        params.append('is_online_booking', eventDetails.is_online_booking)
        params.append('is_reminder_enabled', eventDetails.is_reminder_enabled)

        eventDetails.slots.forEach((slot: any, i: number) => {
            params.append(`slots[${i}][start_time]`, slot.start_time)
            params.append(`slots[${i}][end_time]`, slot.end_time)
            params.append(`slots[${i}][capacity]`, slot.capacity)
        })

        const response = await coursesEventsService.saveEventCourse(params)
        if (response.data) {
            refreshCoursesEvents()
            state.eventData = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>