<template>
    <div>
        <div class="relative">
            <div class="absolute inset-px rounded-lg bg-white"></div>
            <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                <img class="h-80 object-cover" :src="props.courseEventDetails?.image_url || '/img/icons/asset-02.svg'"
                    alt="" />
                <div class="px-5 pb-6 pt-10 space-y-2">
                    <div class="flex gap-x-5">
                        <div class="flex gap-x-3">
                            <div>
                                <h3 class="text-lg font-semibold text-primary">
                                    {{
                                        moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('DD')
                                    }}
                                </h3>
                                <h3 class="text-xs font-semibold text-primary">
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '01'">
                                        {{ $t('calendar.month.January') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '02'">
                                        {{ $t('calendar.month.February') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '03'">
                                        {{ $t('calendar.month.March') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '04'">
                                        {{ $t('calendar.month.April') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '05'">
                                        {{ $t('calendar.month.May') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '06'">
                                        {{ $t('calendar.month.June') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '07'">
                                        {{ $t('calendar.month.July') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '08'">
                                        {{ $t('calendar.month.August') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '09'">
                                        {{ $t('calendar.month.September') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '10'">
                                        {{ $t('calendar.month.October') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '11'">
                                        {{ $t('calendar.month.November') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '12'">
                                        {{ $t('calendar.month.December') }}
                                    </span>
                                </h3>
                            </div>
                            <div v-if="props.courseEventDetails?.type === 'course'">
                                -
                            </div>
                            <div v-if="props.courseEventDetails?.type === 'course'">
                                <h3 class="text-lg font-semibold text-primary">
                                    {{
                                        moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length
                                            - 1]?.date_time_end)?.format('DD') }}
                                </h3>
                                <h3 class="text-xs font-semibold text-primary">
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '01'">
                                        {{ $t('calendar.month.January') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '02'">
                                        {{ $t('calendar.month.February') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '03'">
                                        {{ $t('calendar.month.March') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '04'">
                                        {{ $t('calendar.month.April') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '05'">
                                        {{ $t('calendar.month.May') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '06'">
                                        {{ $t('calendar.month.June') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '07'">
                                        {{ $t('calendar.month.July') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '08'">
                                        {{ $t('calendar.month.August') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '09'">
                                        {{ $t('calendar.month.September') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '10'">
                                        {{ $t('calendar.month.October') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '11'">
                                        {{ $t('calendar.month.November') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '12'">
                                        {{ $t('calendar.month.December') }}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div class="mt-1 text-sm">
                            <div v-if="props.courseEventDetails?.type === 'event'">
                                <p>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Monday'">
                                        {{ $t('calendar.days.Monday') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Tuesday'">
                                        {{ $t('calendar.days.Tuesday') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Wednesday'">
                                        {{ $t('calendar.days.Wednesday') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Thursday'">
                                        {{ $t('calendar.days.Thursday') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Friday'">
                                        {{ $t('calendar.days.Friday') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Saturday'">
                                        {{ $t('calendar.days.Saturday') }}
                                    </span>
                                    <span
                                        v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Sunday'">
                                        {{ $t('calendar.days.Sunday') }}
                                    </span>
                                </p>
                                <p>
                                    {{
                                        moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('HH:mm')
                                    }}
                                    -
                                    {{
                                        moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_end)?.format('HH:mm')
                                    }}
                                </p>
                            </div>
                            <div v-else>
                                <div class="flex items-center gap-x-2">
                                    <p>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Monday'">
                                            {{ $t('calendar.days.Monday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Tuesday'">
                                            {{ $t('calendar.days.Tuesday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Wednesday'">
                                            {{ $t('calendar.days.Wednesday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Thursday'">
                                            {{ $t('calendar.days.Thursday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Friday'">
                                            {{ $t('calendar.days.Friday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Saturday'">
                                            {{ $t('calendar.days.Saturday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Sunday'">
                                            {{ $t('calendar.days.Sunday') }}
                                        </span>
                                    </p>
                                    <p>
                                        {{
                                            moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_start)?.format('HH:mm')
                                        }}
                                        -
                                        {{
                                            moment(props.courseEventDetails?.event_course_sessions?.[0]?.date_time_end)?.format('HH:mm')
                                        }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-2">
                                    <p>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Monday'">
                                            {{ $t('calendar.days.Monday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Tuesday'">
                                            {{ $t('calendar.days.Tuesday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Wednesday'">
                                            {{ $t('calendar.days.Wednesday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Thursday'">
                                            {{ $t('calendar.days.Thursday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Friday'">
                                            {{ $t('calendar.days.Friday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Saturday'">
                                            {{ $t('calendar.days.Saturday') }}
                                        </span>
                                        <span
                                            v-if="moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Sunday'">
                                            {{ $t('calendar.days.Sunday') }}
                                        </span>
                                    </p>
                                    <p>
                                        {{
                                            moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length
                                                - 1]?.date_time_end)?.format('HH:mm')
                                        }}
                                        -
                                        {{
                                            moment(props.courseEventDetails?.event_course_sessions?.[props.courseEventDetails?.event_course_sessions?.length
                                                - 1]?.date_time_end)?.format('HH:mm')
                                        }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p class="text-lg font-medium tracking-tight">
                            {{ props.courseEventDetails?.name }}
                        </p>
                        <p class="max-w-lg text-xs text-gray-600">
                            <span v-if="props.courseEventDetails?.type === 'course'">
                                {{ $t('bookings.course.course') }} -
                                {{ props.courseEventDetails?.event_course_sessions?.length }}
                                {{ $t('bookings.course.sessions') }}
                            </span>
                        </p>
                    </div>
                    <p class="text-sm text-muted-400">
                        <div v-html="props.courseEventDetails?.description" class="content line-clamp-1" />
                    </p>
                    <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        <div v-for="(tag, tagIndex) in props.courseEventDetails?.booking_setting?.tags" :key="tagIndex"
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            {{ tag?.tag }}
                        </div>
                    </div>
                    <div class="text-sm flex justify-between">
                        <div>
                            {{ formatAmount(props.courseEventDetails?.booking_setting?.price) }}
                        </div>
                        <div>
                            {{ props.courseEventDetails?.slots_available ?? 0 }}
                            <span v-if="props.courseEventDetails?.slots_available > 1">
                                {{ $t('bookings.booking.spotsLeft') }}
                            </span>
                            <span v-else>
                                {{ $t('bookings.booking.spotLeft') }}
                            </span>
                        </div>
                    </div>
                    <div class="text-sm">
                        {{ props.courseEventDetails?.address }}
                    </div>
                </div>
            </div>
            <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
            </div>
        </div>
        <div class="mt-5 relative">
            <div class="absolute inset-px rounded-lg bg-white"></div>
            <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                <div class="px-5 py-6 space-y-3">
                    <h3 class="text-sm font-semibold text-primary">
                        {{ $t('bookings.course.sessions') }}
                    </h3>
                    <ol class="list-decimal list-inside space-y-2">
                        <li v-for="(session, sessionIndex) in props.courseEventDetails?.event_course_sessions"
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
            <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
            </div>
        </div>
        <div class="mt-6">
            <FormButton buttonStyle="primary" class="w-full rounded-md" @click="$emit('continue')">
                {{ $t('bookings.booking.continue') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const props = defineProps({
    courseEventDetails: {
        type: Object,
        required: true,
    },
})
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
</script>