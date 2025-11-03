<template>
    <div class="min-h-screen flex flex-col">
        <header class="bg-primary">
            <div class="mx-auto max-w-6xl px-4 py-8 flex justify-between gap-x-5">
                <div>
                    <div class="flex items-center gap-x-4 cursor-pointer"
                        @click="navigateTo(`/booking/${state.bookingSettings?.link}/overview`)"
                        v-if="Object.keys(state.bookingSettings).length > 0">
                        <p class="text-xl text-white font-semibold">
                            {{ state.bookingSettings?.header }}
                        </p>
                        <div class="bg-white px-3 py-2 text-xs font-semibold rounded-lg">
                            {{ $t('bookings.events') }}
                        </div>
                    </div>
                </div>
                <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                    <img :src="identifyFlag()" alt="flag">
                </button>
            </div>
        </header>
        <div class="flex-grow">
            <div class="mx-auto max-w-6xl text-center px-4 py-40 space-y-5" v-if="state.isPageLoading">
                <div class="flex justify-center items-center">
                    <img src="/img/undraw/warning.svg" class="w-48 cursor-pointer" />
                </div>
                <div>
                    <h2 class="text-balance text-2xl font-semibold tracking-tight text-gray-900">
                        {{ $t('bookings.loading.fetchingUpcomingEvents') }}.
                    </h2>
                    <p class="text-pretty text-lg text-gray-600">
                        {{ $t('bookings.loading.wereGatheringAllTheExcitingEvents') }}
                        <span class="dot1">.</span>
                        <span class="dot2">.</span>
                        <span class="dot3">.</span>
                        <span class="dot4">.</span>
                        <span class="dot5">.</span>
                    </p>
                </div>
            </div>
            <div v-else>
                <div class="mx-auto max-w-6xl px-4 py-8" v-if="Object.keys(state.bookingSettings).length > 0">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div v-for="(courseEvent, index) in state.coursesEvents?.data" :key="index">
                            <div class="relative">
                                <div class="absolute inset-px rounded-lg bg-white"></div>
                                <div
                                    class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                                    <img class="h-80 object-cover"
                                        :src="courseEvent?.image_url || '/img/icons/asset-02.svg'" alt="" />
                                    <div class="px-5 pb-6 pt-10 space-y-2">
                                        <div class="flex gap-x-5">
                                            <div class="flex gap-x-3">
                                                <div>
                                                    <h3 class="text-lg font-semibold text-primary">
                                                        {{
                                                            moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('DD')
                                                        }}
                                                    </h3>
                                                    <h3 class="text-xs font-semibold text-primary">
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '01'">
                                                            {{ $t('calendar.month.January') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '02'">
                                                            {{ $t('calendar.month.February') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '03'">
                                                            {{ $t('calendar.month.March') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '04'">
                                                            {{ $t('calendar.month.April') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '05'">
                                                            {{ $t('calendar.month.May') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '06'">
                                                            {{ $t('calendar.month.June') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '07'">
                                                            {{ $t('calendar.month.July') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '08'">
                                                            {{ $t('calendar.month.August') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '09'">
                                                            {{ $t('calendar.month.September') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '10'">
                                                            {{ $t('calendar.month.October') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '11'">
                                                            {{ $t('calendar.month.November') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('MM') === '12'">
                                                            {{ $t('calendar.month.December') }}
                                                        </span>
                                                    </h3>
                                                </div>
                                                <div v-if="courseEvent?.type === 'course'">
                                                    -
                                                </div>
                                                <div v-if="courseEvent?.type === 'course'">
                                                    <h3 class="text-lg font-semibold text-primary">
                                                        {{
                                                            moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length
                                                                - 1]?.date_time_end)?.format('DD') }}
                                                    </h3>
                                                    <h3 class="text-xs font-semibold text-primary">
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '01'">
                                                            {{ $t('calendar.month.January') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '02'">
                                                            {{ $t('calendar.month.February') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '03'">
                                                            {{ $t('calendar.month.March') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '04'">
                                                            {{ $t('calendar.month.April') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '05'">
                                                            {{ $t('calendar.month.May') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '06'">
                                                            {{ $t('calendar.month.June') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '07'">
                                                            {{ $t('calendar.month.July') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '08'">
                                                            {{ $t('calendar.month.August') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '09'">
                                                            {{ $t('calendar.month.September') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '10'">
                                                            {{ $t('calendar.month.October') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '11'">
                                                            {{ $t('calendar.month.November') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_end)?.format('MM') === '12'">
                                                            {{ $t('calendar.month.December') }}
                                                        </span>
                                                    </h3>
                                                </div>
                                            </div>
                                            <div class="mt-1 text-sm">
                                                <div v-if="courseEvent?.type === 'event'">
                                                    <p>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Monday'">
                                                            {{ $t('calendar.days.Monday') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Tuesday'">
                                                            {{ $t('calendar.days.Tuesday') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Wednesday'">
                                                            {{ $t('calendar.days.Wednesday') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Thursday'">
                                                            {{ $t('calendar.days.Thursday') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Friday'">
                                                            {{ $t('calendar.days.Friday') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Saturday'">
                                                            {{ $t('calendar.days.Saturday') }}
                                                        </span>
                                                        <span
                                                            v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Sunday'">
                                                            {{ $t('calendar.days.Sunday') }}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {{
                                                            moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('HH:mm')
                                                        }}
                                                        -
                                                        {{
                                                            moment(courseEvent?.event_course_sessions?.[0]?.date_time_end)?.format('HH:mm')
                                                        }}
                                                    </p>
                                                </div>
                                                <div v-else>
                                                    <div class="flex items-center gap-x-2">
                                                        <p>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Monday'">
                                                                {{ $t('calendar.days.Monday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Tuesday'">
                                                                {{ $t('calendar.days.Tuesday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Wednesday'">
                                                                {{ $t('calendar.days.Wednesday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Thursday'">
                                                                {{ $t('calendar.days.Thursday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Friday'">
                                                                {{ $t('calendar.days.Friday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Saturday'">
                                                                {{ $t('calendar.days.Saturday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('dddd') === 'Sunday'">
                                                                {{ $t('calendar.days.Sunday') }}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            {{
                                                                moment(courseEvent?.event_course_sessions?.[0]?.date_time_start)?.format('HH:mm')
                                                            }}
                                                            -
                                                            {{
                                                                moment(courseEvent?.event_course_sessions?.[0]?.date_time_end)?.format('HH:mm')
                                                            }}
                                                        </p>
                                                    </div>
                                                    <div class="flex items-center gap-x-2">
                                                        <p>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Monday'">
                                                                {{ $t('calendar.days.Monday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Tuesday'">
                                                                {{ $t('calendar.days.Tuesday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Wednesday'">
                                                                {{ $t('calendar.days.Wednesday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Thursday'">
                                                                {{ $t('calendar.days.Thursday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Friday'">
                                                                {{ $t('calendar.days.Friday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Saturday'">
                                                                {{ $t('calendar.days.Saturday') }}
                                                            </span>
                                                            <span
                                                                v-if="moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length - 1]?.date_time_start)?.format('dddd') === 'Sunday'">
                                                                {{ $t('calendar.days.Sunday') }}
                                                            </span>
                                                        </p>
                                                        <p>
                                                            {{
                                                                moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length
                                                                    - 1]?.date_time_start)?.format('HH:mm')
                                                            }}
                                                            -
                                                            {{
                                                                moment(courseEvent?.event_course_sessions?.[courseEvent?.event_course_sessions?.length
                                                                    - 1]?.date_time_end)?.format('HH:mm')
                                                            }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p class="text-lg font-medium tracking-tight">
                                                {{ courseEvent?.name }}
                                            </p>
                                            <p class="max-w-lg text-xs text-gray-600 h-3">
                                                <span v-if="courseEvent?.type === 'course'">
                                                    {{ $t('bookings.course.course') }} -
                                                    {{ courseEvent?.event_course_sessions?.length }}
                                                    {{ $t('bookings.course.sessions') }}
                                                </span>
                                            </p>
                                        </div>
                                        <p class="text-sm text-muted-400 h-7">
                                            <div v-html="courseEvent?.description" class="content line-clamp-1" />
                                        </p>
                                        <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1 h-5 line-clamp-1">
                                            <div v-for="(tag, tagIndex) in courseEvent?.booking_setting?.tags"
                                                :key="tagIndex"
                                                class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                                {{ tag?.tag }}
                                            </div>
                                        </div>
                                        <div>
                                            <FormButton buttonStyle="primary"
                                                @click="navigateTo(`/booking/${companyLink}/event/${courseEvent?.uuid}`)"
                                                class="w-full rounded-md">
                                                {{ $t('bookings.booking.signUp') }}
                                            </FormButton>
                                        </div>
                                        <div class="text-sm flex justify-between">
                                            <div>
                                                {{ formatAmount(courseEvent?.booking_setting?.price) }}
                                            </div>
                                            <div>
                                                {{ courseEvent?.slots_available ?? 0 }}
                                                <span v-if="courseEvent?.slots_available > 1">
                                                    {{ $t('bookings.booking.spotsLeft') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('bookings.booking.spotLeft') }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="text-sm h-3">
                                            {{ courseEvent?.address }}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mx-auto max-w-6xl text-center px-4 py-40 space-y-5" v-else>
                    <div class="flex justify-center items-center">
                        <img src="/img/undraw/warning.svg" class="w-48 cursor-pointer" />
                    </div>
                    <div>
                        <h2 class="text-balance text-2xl font-semibold tracking-tight text-gray-900">
                            Opppps! {{ $t('somethingWentWrong') }}.
                        </h2>
                        <p class="text-pretty text-lg text-gray-600">
                            {{ $t('pageNotFound') }}.
                        </p>
                    </div>
                    <div class="mx-auto max-w-xs">
                        <FormButton buttonStyle="primary" class="w-full" @click="navigateTo('/')">
                            {{ $t('home') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </div>
        <footer class="bg-gray-50">
            <div class="mx-auto max-w-6xl px-4 py-6">
                <p class="text-gray-600">
                    &copy; {{ new Date().getFullYear() }} {{ runtimeConfig?.public?.appName }}
                </p>
            </div>
        </footer>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { onlineBookingService } from '@/components/api/user/OnlineBookingService'
import { useUserStore } from '@/store/user'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const router = useRouter()
const companyLink = router?.currentRoute?.value?.params?.company_link
const { formatAmount } = useAmountFormatter()

const state = reactive({
    bookingSettings: {} as any,
    coursesEvents: [] as any,
    error: {} as Error,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchBookingSettings()
    fetchEventsCourses()
})

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    if (selectedLanguage === 'en') {
        return '/img/icons/flags/united-kingdom.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

async function fetchBookingSettings() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await onlineBookingSettingsService.getOnlineBookingSettingsPerLink(companyLink)
        if (response?.data) {
            state.bookingSettings = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchEventsCourses() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await onlineBookingService.getCoursesEvents(companyLink, params)
        if (response) {
            state.coursesEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
@keyframes blink {
    0% {
        opacity: 0;
    }

    33% {
        opacity: 1;
    }

    66% {
        opacity: 0;
    }

    100% {
        opacity: 0;
    }
}

.dot1 {
    animation: blink 1.4s infinite both;
}

.dot2 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.2s;
}

.dot3 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.4s;
}

.dot4 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.6s;
}

.dot5 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.8s;
}
</style>
