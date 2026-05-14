<template>

    <Head>
        <Title>
            {{ $t('dutySchedules.shareDutySchedule.dutySchedule') }} - {{ runtimeConfig?.public?.appName }}
        </Title>
    </Head>

    <div :class="[
        !state.showDutySchedule && 'justify-center',
        'z-10 bg-[#f5fafe] relative overflow-clip flex min-h-screen flex-1 flex-col py-12 sm:px-6 lg:px-8'
    ]">
        <img src="/img/icons/asset-01.svg" alt="Image failed to load"
            class="w-52 md:w-1/5 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
            id="animatedAsset01">
        <img src="/img/icons/asset-02.svg" alt="Image failed to load"
            class="w-52 md:w-1/4 absolute -bottom-48 -left-44 opacity-0 transition-opacity duration-500"
            id="animatedAsset02">
        <div :class="[
            !state.showDutySchedule && 'sm:mx-auto sm:w-full sm:max-w-3xl',
            'px-4 md:px-0 relative'
        ]">
            <Logo @click="navigateTo('/')" class="mx-auto" />
            <button type="button" class="-m-2.5 rounded-full w-8 absolute right-5 top-1.5" @click="selectLanguage">
                <img :src="identifyFlag()" alt="flag">
            </button>
        </div>

        <LoadingSpinner :isActive="state.isPageLoading" v-if="!state.showDutySchedule">
            <div class="sm:mx-auto sm:w-full sm:max-w-3xl mt-10">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="mt-5 md:bg-white md:shadow-sm sm:rounded-lg">
                    <form class="mt-5 px-6 py-3 sm:px-12 md:py-8" method="POST" @submit.prevent="fetchDutySchedule">
                        <div class="space-y-3">
                            <h3 class="font-medium text-lg md:text-xl">
                                {{ $t('dutySchedules.shareDutySchedule.form.unlockDutySchedule') }}
                            </h3>
                            <div class="space-y-1">
                                <FormLabel for="password"
                                    :label="$t('dutySchedules.shareDutySchedule.form.password')" />
                                <FormTextField id="password" name="password"
                                    :placeholder="$t('dutySchedules.shareDutySchedule.form.password')"
                                    v-model="state.formSecuredDutySchedule.password" />
                                <FormError
                                    :error="v$?.formSecuredDutySchedule?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('dutySchedules.shareDutySchedule.form.unlock') }}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </div>
        </LoadingSpinner>
        <div v-else class="z-20 mt-10">
            <header class="grid grid-cols-1 xl:grid-cols-3 gap-3 py-3">
                <div class="space-y-2">
                    <div class="flex items-center">
                        <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                            <button @click="!isPreviousWeekDisabled() && previousWeek()" type="button" :class="[
                                isPreviousWeekDisabled() && 'cursor-not-allowed',
                                'flex h-11 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50'
                            ]" :disabled="isPreviousWeekDisabled()">
                                <span class="sr-only">Previous week</span>
                                <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                            </button>
                            <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                :disablePreviousWeeks="true" dateType="duty-schedule" v-model="state.selectedDate" />
                            <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                            <button @click="nextWeek()" type="button"
                                class="flex h-11 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                                <span class="sr-only">Next week</span>
                                <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <button @click="setToday()" class="text-primary text-sm hover:text-primary-700">
                        {{ $t('goToToday') }}
                    </button>
                </div>
            </header>
            <div class="space-y-2 mt-3 mb-3">
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-3 py-3">
                    <div class="w-fit bg-white border border-gray-200 rounded-md px-4 py-2">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 text-center">
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'January'">
                                {{ $t('calendar.month.January') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'February'">
                                {{ $t('calendar.month.February') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'March'">
                                {{ $t('calendar.month.March') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'April'">
                                {{ $t('calendar.month.April') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'May'">
                                {{ $t('calendar.month.May') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'June'">
                                {{ $t('calendar.month.June') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'July'">
                                {{ $t('calendar.month.July') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'August'">
                                {{ $t('calendar.month.August') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'September'">
                                {{ $t('calendar.month.September') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'October'">
                                {{ $t('calendar.month.October') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'November'">
                                {{ $t('calendar.month.November') }}
                            </span>
                            <span v-if="moment(state.selectedDate).format('MMMM') === 'December'">
                                {{ $t('calendar.month.December') }}
                            </span>
                            {{ moment(state.selectedDate).format('YYYY') }}
                        </h3>
                    </div>
                </div>
            </div>

            <div class="bg-primary h-3 rounded-full transition-all ease-in-out duration-500 mb-1.5"
                :style="{ width: `${state.progress.percentage}%` }" v-if="state.progress.showProgressBar" />
            <div class="h-3 mb-1.5" v-else />

            <div class="isolate flex flex-auto flex-col bg-white">
                <div class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                    <div>
                        <div>
                            <div class="grid grid-cols-9" id="fixed-header-week-view">
                                <div class="col-span-2 border-0.5">
                                    <div class="flex items-center gap-x-3 px-3 pt-3">
                                        <p class="text-sm font-medium">
                                            {{ $t('dutySchedules.week') }} {{ moment(state.selectedDate).week() }}
                                        </p>
                                    </div>
                                </div>
                                <div :text="$t('dutySchedules.scheduleSlots.scheduleSlots')" v-for="day in weekDays"
                                    :key="day.date" class="flex items-center justify-center py-4 border-0.5">
                                    <span class="flex gap-x-1 text-sm">
                                        <span v-if="day.longName === 'Mon'">
                                            {{ $t('calendar.week.short.Monday') }}
                                        </span>
                                        <span v-if="day.longName === 'Tue'">
                                            {{ $t('calendar.week.short.Tuesday') }}
                                        </span>
                                        <span v-if="day.longName === 'Wed'">
                                            {{ $t('calendar.week.short.Wednesday') }}
                                        </span>
                                        <span v-if="day.longName === 'Thu'">
                                            {{ $t('calendar.week.short.Thursday') }}
                                        </span>
                                        <span v-if="day.longName === 'Fri'">
                                            {{ $t('calendar.week.short.Friday') }}
                                        </span>
                                        <span v-if="day.longName === 'Sat'">
                                            {{ $t('calendar.week.short.Saturday') }}
                                        </span>
                                        <span v-if="day.longName === 'Sun'">
                                            {{ $t('calendar.week.short.Sunday') }}
                                        </span>
                                        <span class="items-center justify-center font-semibold text-gray-900">
                                            {{ day.date }}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div class="shadow grid grid-cols-9">
                                <div class="col-span-2 border-0.5">
                                    <p class="flex items-center justify-end px-4 py-2 text-xs">
                                        {{ $t('dutySchedules.holidays') }}:
                                    </p>
                                </div>
                                <div class="border-0.5 py-2 flex items-center justify-center">
                                    <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                        v-if="state.schedules?.week_data?.monday?.holiday">
                                        {{ state.schedules?.week_data?.monday?.holiday?.name }}
                                    </p>
                                </div>
                                <div class="border-0.5 py-2 flex items-center justify-center">
                                    <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                        v-if="state.schedules?.week_data?.tuesday?.holiday">
                                        {{ state.schedules?.week_data?.tuesday?.holiday?.name }}
                                    </p>
                                </div>
                                <div class="border-0.5 py-2 flex items-center justify-center">
                                    <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                        v-if="state.schedules?.week_data?.wednesday?.holiday">
                                        {{ state.schedules?.week_data?.wednesday?.holiday?.name }}
                                    </p>
                                </div>
                                <div class="border-0.5 py-2 flex items-center justify-center">
                                    <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                        v-if="state.schedules?.week_data?.thursday?.holiday">
                                        {{ state.schedules?.week_data?.thursday?.holiday?.name }}
                                    </p>
                                </div>
                                <div class="border-0.5 py-2 flex items-center justify-center">
                                    <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                        v-if="state.schedules?.week_data?.friday?.holiday">
                                        {{ state.schedules?.week_data?.friday?.holiday?.name }}
                                    </p>
                                </div>
                                <div class="border-0.5 py-2 flex items-center justify-center">
                                    <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                        v-if="state.schedules?.week_data?.saturday?.holiday">
                                        {{ state.schedules?.week_data?.saturday?.holiday?.name }}
                                    </p>
                                </div>
                                <div class="border-0.5 py-2 flex items-center justify-center">
                                    <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                        v-if="state.schedules?.week_data?.sunday?.holiday">
                                        {{ state.schedules?.week_data?.sunday?.holiday?.name }}
                                    </p>
                                </div>
                            </div>

                            <div class="relative mt-0.5">
                                <div v-for="(employee, employeeIndex) in state.schedules?.data" :key="employeeIndex"
                                    class="grid grid-cols-9">
                                    <div class="col-span-9 grid grid-cols-9">
                                        <div class="col-span-2 border-0.5">
                                            <div class="px-3 pt-3 pb-1 relative">
                                                <div class="flex justify-between">
                                                    <div class="flex items-center gap-x-2">
                                                        <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                                                            :class="[
                                                                employee?.shift_threshold === 'high' && 'border-green-700',
                                                                employee?.shift_threshold === 'moderate' && 'border-yellow-500',
                                                                employee?.shift_threshold === 'low' && 'border-red-600',
                                                                'h-10 w-10 rounded-full bg-gray-50 object-cover border-2'
                                                            ]" />
                                                        <p class="text-sm font-medium">
                                                            {{ employee?.firstname }}
                                                            {{ employee?.lastname }}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div :class="[
                                                    expandedRecords[employeeIndex as number] && 'hidden',
                                                    '-mt-1 ml-12'
                                                ]">
                                                    <p class="text-xxs">
                                                        {{ employee?.employee_detail?.job?.title }}
                                                    </p>
                                                    <div class="text-xxs">
                                                        {{ $t('departments.departments') }}:
                                                        <span
                                                            v-for="(department, departmentIndex) in employee?.departments"
                                                            :key="departmentIndex">
                                                            {{ department?.name }}<span
                                                                v-if="departmentIndex as number < employee.departments.length - 1">,
                                                            </span><span v-else>.</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="px-3 pb-3">
                                                <div>
                                                    <button @click="toggleExpanded(employeeIndex as number)"
                                                        class="text-primary text-xs hover:text-primary-700">
                                                        {{ !expandedRecords[employeeIndex as number] ?
                                                            $t('showLess') :
                                                            $t('showMore') }}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="p-3 border-0.5" v-for="(week, weekIndex) in employee?.weeks"
                                            :key="weekIndex" :class="[
                                                hasConflict(week) && 'border-1.5 border-red-500 rounded-md',
                                            ]">
                                            <div class="space-y-2">
                                                <div class="text-xs">
                                                    <div v-for="(shift, shiftIndex) in sortMultiDayShiftsFirst(week?.shifts)"
                                                        :key="shiftIndex" :class="[
                                                            'rounded-md p-1 relative mb-2.5'
                                                        ]" :style="{
                                                            backgroundColor: `${shift?.type?.color}`,
                                                            width: `${calculateShiftWidth(shift, weekIndex.toString())}`,
                                                            marginTop: `${calculateMarginTop(employee?.weeks, weekIndex.toString(), shiftIndex as number)}rem`
                                                        }">
                                                        <div class="absolute -left-1 -top-1 z-10 w-4 h-4 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center text-xxs"
                                                            v-if="shift?.type?.system_name === 'sick-leave'">
                                                            S
                                                        </div>
                                                        <div class="flex justify-between text-white cursor-pointer">
                                                            <div class="relative w-full">
                                                                <div class="bg-white border-0.5 border-gray-300 w-4 h-4 rounded-full absolute -left-2 top-2.5 flex items-center justify-center"
                                                                    v-if="shift?.is_from_lastweek">
                                                                    <Icon name="ph:arrow-left"
                                                                        class="w-3 h-3 text-gray-500" />
                                                                </div>
                                                                <p
                                                                    class="w-full px-2 py-2 flex items-center justify-center border border-white rounded-tl-md rounded-bl-md">
                                                                    {{
                                                                        moment(shift?.date_time_start).format('HH:mm')
                                                                    }}
                                                                </p>
                                                            </div>
                                                            <div class="relative w-full">
                                                                <p
                                                                    class="w-full px-2 py-2 flex items-center justify-center border border-white  rounded-tr-md rounded-br-md">
                                                                    {{
                                                                        moment(shift?.date_time_end).format('HH:mm')
                                                                    }}
                                                                </p>
                                                                <div class="bg-white border-0.5 border-gray-300 w-4 h-4 rounded-full absolute -right-2 top-2.5 flex items-center justify-center"
                                                                    v-if="shift?.is_until_nextweek">
                                                                    <Icon name="ph:arrow-right"
                                                                        class="w-3 h-3 text-gray-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div v-if="shift?.shift_span_position"
                                                            class="px-1 py-0.5 text-xxs text-white">
                                                            <p v-if="shift?.shift_span_position === 'start'">
                                                                {{ $t('dutySchedules.shiftSpan.start') }}
                                                            </p>
                                                            <p v-if="shift?.shift_span_position === 'middle'">
                                                                {{ $t('dutySchedules.shiftSpan.middle') }}
                                                            </p>
                                                            <p v-if="shift?.shift_span_position === 'end'">
                                                                {{ $t('dutySchedules.shiftSpan.end') }}
                                                            </p>
                                                        </div>
                                                        <div :class="[
                                                            shift?.citizen_schedules?.length > 0 && 'mt-1'
                                                        ]" v-if="shift?.citizen_schedules?.length > 0">
                                                            <p v-for="(citizenSchedule, citizenScheduleIndex) in shift?.citizen_schedules"
                                                                :key="citizenScheduleIndex"
                                                                class="text-xxs text-white px-1 py-0.5">
                                                                {{ citizenSchedule?.citizen?.firstname }}
                                                                {{ citizenSchedule?.citizen?.lastname }}
                                                            </p>
                                                        </div>
                                                        <div class="text-xxs text-white px-1 py-0.5"
                                                            v-if="shift?.departments?.length > 0">
                                                            {{ $t('departments.departments') }}:
                                                            <span
                                                                v-for="(department, departmentIndex) in shift?.departments"
                                                                :key="departmentIndex">
                                                                {{ department?.name }}<span
                                                                    v-if="departmentIndex as number < shift?.departments.length - 1">,
                                                                </span><span v-else>.</span>
                                                            </span>
                                                        </div>
                                                        <div class="flex items-center flex-wrap gap-y-0.5 mt-1"
                                                            v-if="shift?.tags?.length > 0">
                                                            <Tooltip :text="tag?.tag"
                                                                v-for="(tag, tagIndex) in shift?.tags" :key="tagIndex">
                                                                <div class="text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center"
                                                                    :style="{ backgroundColor: tag?.color }">
                                                                    <span v-if="tag?.tag">
                                                                        {{ tag?.tag?.charAt(0) }}
                                                                    </span>
                                                                </div>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination :data="state.schedules" @previous="previous" @next="next" />
        </div>
    </div>
    <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
        @close="state.slideOver.isLanguageSwitcherOpen = false" />
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/guest/DutyScheduleService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const router = useRouter()
const sharedDutyScheduleUuid = router?.currentRoute?.value?.params?.duty_schedules_uuid
let currentTablePage = 1
const expandedRecords = reactive([] as boolean[])

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: {} as Error,
    formSecuredDutySchedule: {
        password: '',
    },
    isPageLoading: false,
    progress: {
        percentage: 100,
        pendingRequests: 0,
        showProgressBar: false,
        totalRequests: 0,
    },
    schedules: [] as any,
    selectedDate: moment().format('YYYY-MM-DD'),
    showDutySchedule: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        formSecuredDutySchedule: {
            password: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    animateAssets()
})

function animateAssets() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in')
            } else {
                entry.target.classList.remove('animate-fade-in')
            }
        })
    })

    const animatedAsset01 = document.getElementById('animatedAsset01') as any
    const animatedAsset02 = document.getElementById('animatedAsset02') as any
    observer.observe(animatedAsset01)
    observer.observe(animatedAsset02)
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    const flags: Record<string, string> = {
        en: '/img/icons/flags/united-kingdom.svg',
        dk: '/img/icons/flags/denmark.svg',
        no: '/img/icons/flags/norway.svg',
        sv: '/img/icons/flags/sweden.svg',
    }
    return flags[selectedLanguage] ?? '/img/icons/flags/united-kingdom.svg'
}

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        fetchDutySchedule()
    }
})

watch(() => state.progress.percentage, (newPercentage: any) => {
    if (newPercentage < 100) {
        state.progress.showProgressBar = true
    }
    if (newPercentage === 100) {
        setTimeout(() => {
            state.progress.showProgressBar = false
        }, 2000)
    }
})

watch(() => state.schedules, (newSchedules) => {
    // Update the expanded records only if the number of records changes.
    if (newSchedules && newSchedules.data.length !== expandedRecords.length) {
        expandedRecords.splice(0, expandedRecords.length, ...newSchedules.data.map(() => true))
    }
})

async function fetchDutySchedule() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        try {
            const dateMoment = moment(state.selectedDate)
            const startOfWeek = dateMoment.clone().startOf('isoWeek')
            const endOfWeek = dateMoment.clone().endOf('isoWeek')
            const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
            const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
            const params = {
                page: currentTablePage,
                password: state.formSecuredDutySchedule.password,
                date_start: startOfWeekFormatted,
                date_end: endOfWeekFormatted,
            }
            const response = await dutyScheduleService.unlockDutySchedule(sharedDutyScheduleUuid, params)
            if (response) {
                state.showDutySchedule = true
                state.schedules = response
                state.progress.totalRequests = state.progress.totalRequests - 1
                state.progress.pendingRequests = state.progress.pendingRequests - 1
                identifyTheProgressPercentage()
            }
        } catch (error: any) {
            state.error = error
            identifyTheProgressPercentage()
        }
        state.isPageLoading = false
    }
}

function previous() {
    currentTablePage--
    fetchDutySchedule()
}

function next() {
    currentTablePage++
    fetchDutySchedule()
}

function isPreviousWeekDisabled() {
    const today = moment().startOf('week')
    const selectedDate = moment(state.selectedDate).startOf('week')
    if (selectedDate.isSame(today, 'week')) {
        return true
    }
}

function previousWeek() {
    state.selectedDate = moment(state.selectedDate).subtract(1, 'week').format('YYYY-MM-DD')
    fetchDutySchedule()
}

function setToday() {
    state.selectedDate = moment().format('YYYY-MM-DD')
    fetchDutySchedule()
}

function nextWeek() {
    state.selectedDate = moment(state.selectedDate).add(1, 'week').format('YYYY-MM-DD')
    fetchDutySchedule()
}

function identifyTheProgressPercentage() {
    if (state.progress.totalRequests === 0) {
        state.progress.percentage = 100
    } else {
        state.progress.percentage = (state.progress.pendingRequests / state.progress.totalRequests) * 100
        if (state.progress.percentage == 100) {
            state.progress.percentage = 50
        }
    }
}

const weekDays = computed(() => {
    const startOfWeek = moment(state.selectedDate).startOf('isoWeek')
    return Array.from({ length: 7 }).map((_, i) => {
        const day = moment(startOfWeek).add(i, 'day')
        return {
            shortName: day.format('dd')[0],
            longName: day.format('ddd'),
            date: day.date(),
            fullDate: day
        }
    })
})

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}

function hasConflict(week: any) {
    const hasConflict = week?.shifts?.some((shift: any) => shift.is_conflict === true)
    return hasConflict
}

function sortMultiDayShiftsFirst(shifts: any) {
    const sortedShifts = shifts.sort((a: any, b: any) => {
        const aMultiDay = moment(a.date_time_end).startOf('day').diff(moment(a.date_time_start).startOf('day'), 'days') >= 1
        const bMultiDay = moment(b.date_time_end).startOf('day').diff(moment(b.date_time_start).startOf('day'), 'days') >= 1

        if (aMultiDay && !bMultiDay) return -1 // a comes first
        if (!aMultiDay && bMultiDay) return 1  // b comes first
        return 0 // Keep order for same type
    })
    return sortedShifts
}

function calculateShiftWidth(shift: any, weekIndex: string) {
    const shiftStart = moment(shift.date_time_start).startOf('day')
    const shiftEnd = moment(shift.date_time_end).startOf('day')

    const weekStart = moment(state.selectedDate).startOf('isoWeek')
    const weekEnd = moment(state.selectedDate).endOf('isoWeek')

    // Clamp the shift range to the current week range
    const visibleStart = shiftStart.isBefore(weekStart) ? weekStart : shiftStart
    const visibleEnd = shiftEnd.isAfter(weekEnd) ? weekEnd : shiftEnd

    let dayDifference = visibleEnd.diff(visibleStart, 'days')

    // Special case: if shift ends at exactly 00:00, don't count the last day
    const endsAtMidnight = moment(shift.date_time_end).format('HH:mm:ss') === '00:00:00'
    if (endsAtMidnight) {
        dayDifference--
    }

    if (weekIndex === 'sunday') return 'auto'

    if (dayDifference <= 0) return 'auto'
    if (dayDifference === 1) return '17.5rem'
    if (dayDifference === 2) return '27rem'
    if (dayDifference === 3) return '36.5rem'
    if (dayDifference === 4) return '46rem'
    if (dayDifference === 5) return '55.5rem'
    return '65rem'
}

function calculateMarginTop(schedules: any, weekIndex: string, shiftIndex: number) {
    const weekDaysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayIndex = weekDaysOrder.indexOf(weekIndex)

    if (weekIndex === 'monday' || shiftIndex > 0) return 0 // If the current index is in the future, return 0

    let overlapCount = 0

    for (let i = 0; i <= dayIndex - 1; i++) {
        const multiDayShift = getMultiDayShift(schedules[weekDaysOrder[i]]?.shifts)
        if (multiDayShift) {
            overlapCount += 1
        }
    }

    return overlapCount > 0 ? 3.625 + (overlapCount - 1) * 3.125 : 0
}

function getMultiDayShift(shifts: any) {
    return shifts?.find((shift: any) => {
        const startDay = moment(shift.date_time_start).startOf('day')
        const endDay = moment(shift.date_time_end).startOf('day')
        const isMultiDay = endDay.diff(startDay, 'days') >= 1
        const isExcluded = endDay.diff(startDay, 'days') === 1 && moment(shift.date_time_end).format('HH:mm:ss') === '00:00:00'

        return isMultiDay && !isExcluded
    })
}
</script>