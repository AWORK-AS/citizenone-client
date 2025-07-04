<template>
    <div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
                class="md:col-span-3 bg-white shadow-md rounded-md border-l-4 border-secondary mt-2 text-sm pr-5 pt-5 pb-5 pl-6">
                <div class="space-y-1">
                    <div>
                        <h3 class="font-semibold text-lg">
                            {{ props.selectedCourseEvent?.name }}
                        </h3>
                        <p class="text-sm text-muted-400">
                            <div v-html="props.selectedCourseEvent?.description" class="content" />
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        <div v-for="(tag, tagIndex) in props.selectedCourseEvent?.booking_setting?.tags" :key="tagIndex"
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            {{ tag?.tag }}
                        </div>
                    </div>
                    <div class="text-sm flex justify-between">
                        <div>
                            {{ formatAmount(props.selectedCourseEvent?.booking_setting?.price) }}
                        </div>
                    </div>
                    <div class="text-sm">
                        {{ props.selectedCourseEvent?.address }}
                    </div>
                </div>
                <div class="mt-4 flex items-center gap-x-2">
                    <FormButton buttonStyle="primary"
                        @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/booking/${props.bookingSettings?.link}/event/${props.selectedCourseEvent?.uuid}`)"
                        class="w-full rounded-md">
                        {{ $t('bookings.view.viewSignUpForm') }}
                    </FormButton>
                    <FormButton buttonStyle="primary"
                        @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/booking/${props.bookingSettings?.link}/overview`)"
                        class="w-full rounded-md">
                        {{ $t('bookings.view.viewFutureEvents') }}
                    </FormButton>
                </div>
            </div>
            <div class="bg-white shadow-md rounded-md border-l-4 border-secondary mt-2 text-sm pr-5 pt-5 pb-5 pl-6">
                <div class="space-y-1">
                    <p class="text-sm text-center">
                        {{ $t('bookings.view.overview.confirmedParticipants') }}
                    </p>
                    <p class="text-xl text-center font-semibold">
                        {{ props?.selectedCourseEvent?.participants?.length ?? 0 }}
                    </p>
                </div>
            </div>
            <div class="bg-white shadow-md rounded-md border-l-4 border-secondary mt-2 text-sm pr-5 pt-5 pb-5 pl-6">
                <div class="space-y-1">
                    <p class="text-sm text-center">
                        {{ $t('bookings.view.overview.slotsAvailable') }}
                    </p>
                    <p class="text-xl text-center font-semibold">
                        {{ props.selectedCourseEvent?.slots_available }}
                    </p>
                </div>
            </div>
            <div class="bg-white shadow-md rounded-md border-l-4 border-secondary mt-2 text-sm pr-5 pt-5 pb-5 pl-6">
                <div class="space-y-1">
                    <p class="text-sm text-center">
                        {{ $t('bookings.view.overview.eventSignUpIs') }}
                    </p>
                    <p class="text-xl text-center font-semibold">
                        <span class="text-red-500"
                            v-if="props.selectedCourseEvent?.booking_setting?.close_registration">
                            {{ $t('bookings.view.overview.closed') }}
                        </span>
                        <span class="text-green-700" v-else>
                            {{ $t('bookings.view.overview.open') }}
                        </span>
                    </p>
                </div>
            </div>
        </div>
        <div
            class="md:col-span-3 bg-white shadow-md rounded-md border-l-4 border-secondary mt-2 text-sm pr-5 pt-5 pb-5 pl-6">
            <div class="px-5 py-6 space-y-3">
                <h3 class="text-sm font-semibold text-primary">
                    {{ $t('bookings.course.sessions') }}
                </h3>
                <ol class="list-decimal list-inside">
                    <li v-for="(session, sessionIndex) in props.selectedCourseEvent?.event_course_sessions"
                        :key="sessionIndex">
                        {{ session?.name }}
                        <div class="text-sm text-gray-700 ml-5">
                            {{ formatDateTimeToReadable(session?.date_time_start) }} -
                            {{ formatDateTimeToReadable(session?.date_time_end) }}
                        </div>
                        <div v-html="session?.description" class="content ml-5" />
                    </li>
                </ol>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { coursesEventsService } from '@/components/api/user/CoursesEventsService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const props = defineProps({
    bookingSettings: {
        type: Object,
        required: true,
    },
    selectedCourseEvent: {
        type: Object,
        required: true,
    },
})
const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>