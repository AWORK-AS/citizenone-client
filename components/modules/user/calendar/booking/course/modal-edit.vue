<template>
    <div>
        <Modal size="xl" :title="$t('bookings.course.editCourse')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCalendarBookingCourseForm formType="update" :selectedCourse="state.formCourse"
                        :courseData="state.courseData" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveCourse" />
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
    selectedCourse: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshCoursesEvents'])

const state = reactive({
    courseData: {},
    error: {} as Error,
    formCourse: {
        name: '',
        description: '',
        address: '',
        post_code: '',
        city: '',
        image: '',
        sessions: [
            {
                name: '',
                date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
                date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
                description: '',
                is_recurring: false,
                recurring: '',
                recurring_until: moment().format('YYYY-MM-DD'),
            },
            {
                name: '',
                date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
                date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
                description: '',
                is_recurring: false,
                recurring: '',
                recurring_until: moment().format('YYYY-MM-DD'),
            },
        ],
        spots: '1',
        tags: [] as any,
        price: '',
        is_tax_included: false,
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

function refreshCoursesEvents() {
    emit('refreshCoursesEvents')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchCourse()
        state.courseData = {}
    }
})

async function fetchCourse() {
    state.error = {}
    state.isPageLoading = true
    try {
        const courseUuid = props.selectedCourse.uuid
        const response = await coursesEventsService.getEventCourse(courseUuid)
        if (response.data) {
            const courseData = response.data
            const sessions = response.data?.event_course_sessions
            const bookingSetting = response.data?.booking_setting
            state.formCourse = {
                name: courseData?.name ?? '',
                description: courseData?.description ?? '',
                address: courseData?.address ?? '',
                post_code: courseData?.post_code ?? '',
                city: courseData?.city ?? '',
                image: courseData?.image,
                sessions: [],
                spots: courseData?.slots_available?.toString() ?? '1',
                tags: [],
                price: bookingSetting?.price ?? '',
                is_tax_included: bookingSetting?.is_tax_included ?? false,
                show_spots_left: bookingSetting?.show_spots_left ?? false,
                close_registration: bookingSetting?.close_registration ?? false,
                is_online_booking: bookingSetting?.is_online_booking ?? false,
                is_reminder_enabled: bookingSetting?.is_reminder_enabled ?? false,
            }
            bookingSetting?.tags?.forEach((tag: any) => {
                state.formCourse.tags.push(tag.uuid)
            })
            courseData?.event_course_sessions?.forEach((session: any) => {
                state.formCourse.sessions.push({
                    name: session.name,
                    date_time_start: moment(session.date_time_start).format('YYYY-MM-DD H:mm'),
                    date_time_end: moment(session.date_time_end).format('YYYY-MM-DD H:mm'),
                    description: session.description ?? '',
                    is_recurring: session.is_recurring ? true : false,
                    recurring: session.recurring_type ?? 'everyday',
                    recurring_until: session.recurring_end_date ? moment(session.recurring_end_date).format('YYYY-MM-DD') : moment(session.date_time_end).format('YYYY-MM-DD'),
                })
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function saveCourse(courseDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const courseUuid = props.selectedCourse.uuid
        const params = new FormData()
        params.append('type', 'course')
        params.append('name', courseDetails.name)
        params.append('description', courseDetails.description)
        params.append('address', courseDetails.address)
        params.append('post_code', courseDetails.post_code)
        params.append('city', courseDetails.city)
        params.append('image', courseDetails.image)
        params.append('sessions', JSON.stringify(courseDetails.sessions))
        params.append('spots', courseDetails.spots)
        params.append('tag_uuid', JSON.stringify(courseDetails.tags))
        params.append('price', courseDetails.price)
        params.append('is_tax_included', courseDetails.is_tax_included)
        params.append('show_spots_left', courseDetails.show_spots_left)
        params.append('close_registration', courseDetails.close_registration)
        params.append('is_online_booking', courseDetails.is_online_booking)
        params.append('is_reminder_enabled', courseDetails.is_reminder_enabled)
        const response = await coursesEventsService.updateEventCourse(courseUuid, params)
        if (response.data) {
            refreshCoursesEvents()
            state.courseData = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>