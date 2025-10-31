<template>
    <div>
        <Modal size="xl" :title="$t('bookings.singleEvent.editEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCalendarBookingSingleEventForm formType="update" :selectedEvent="state.formEvent"
                        :eventData="state.eventData" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveEvent" />
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
    selectedEvent: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshCoursesEvents'])

const state = reactive({
    error: {} as Error,
    eventData: {},
    formEvent: {
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        is_recurring: false,
        recurring: '',
        recurring_until: '',
        exclude_weekend: false,
        name: '',
        description: '',
        address: '',
        post_code: '',
        city: '',
        image: '',
        spots: '1',
        slots: [] as any,
        tags: [] as any,
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

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchEvent()
        state.eventData = {}
    }
})

async function fetchEvent() {
    state.error = {}
    state.isPageLoading = true
    try {
        const bookingUuid = props.selectedEvent.uuid
        const response = await coursesEventsService.getEventCourse(bookingUuid)
        if (response.data) {
            const eventData = response.data
            const eventSession = response.data?.event_course_sessions?.[0]
            const bookingSetting = response.data?.booking_setting
            console.log(bookingSetting)
            state.formEvent = {
                date_time_start: moment(eventSession?.date_time_start).format('YYYY-MM-DD H:mm'),
                date_time_end: moment(eventSession?.date_time_end).format('YYYY-MM-DD H:mm'),
                is_recurring: eventSession?.is_recurring ? true : false,
                recurring: eventSession?.recurring_type ?? 'everyday',
                exclude_weekend: bookingSetting?.exclude_weekend ?? false,
                recurring_until: eventSession?.recurring_end_date ?? '',
                name: eventData?.name ?? '',
                description: eventData?.description ?? '',
                address: eventData?.address ?? '',
                post_code: eventData?.post_code ?? '',
                city: eventData?.city ?? '',
                image: eventData?.image,
                spots: eventData?.slots_available?.toString() ?? '1',
                slots: bookingSetting?.time_slots || [],
                tags: [],
                price: bookingSetting?.price ?? '',
                is_tax_included: bookingSetting?.is_tax_included ?? false,
                show_spots_left: bookingSetting?.show_spots_left ?? false,
                close_registration: bookingSetting?.close_registration ?? false,
                is_online_booking: bookingSetting?.is_online_booking ?? false,
                is_reminder_enabled: bookingSetting?.is_reminder_enabled ?? false,
            }
            bookingSetting?.tags?.forEach((tag: any) => {
                state.formEvent.tags.push(tag.uuid)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function saveEvent(eventDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const eventUuid = props.selectedEvent.uuid
        const params = new FormData()
        params.append('type', 'event')
        params.append('date_time_start', eventDetails.date_time_start)
        params.append('date_time_end', eventDetails.date_time_end)
        params.append('is_recurring', eventDetails.is_recurring)
        params.append('recurring', eventDetails.recurring)
        params.append('recurring_until', eventDetails.recurring_until)
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
        
        const response = await coursesEventsService.updateEventCourse(eventUuid, params)
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