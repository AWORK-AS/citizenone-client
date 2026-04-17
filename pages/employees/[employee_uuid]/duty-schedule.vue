<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.viewEmployee') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.viewEmployee') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserEmployeeTabs />

                <div class="mt-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex h-full flex-col">
                        <header class="grid grid-cols-1 md:grid-cols-2 md:items-center justify-between py-4 gap-3">
                            <h3 class="text-base font-semibold leading-6 text-gray-900">
                                <span v-if="month === 'January'">{{ $t('calendar.month.January') }}</span>
                                <span v-if="month === 'February'">{{ $t('calendar.month.February') }}</span>
                                <span v-if="month === 'March'">{{ $t('calendar.month.March') }}</span>
                                <span v-if="month === 'April'">{{ $t('calendar.month.April') }}</span>
                                <span v-if="month === 'May'">{{ $t('calendar.month.May') }}</span>
                                <span v-if="month === 'June'">{{ $t('calendar.month.June') }}</span>
                                <span v-if="month === 'July'">{{ $t('calendar.month.July') }}</span>
                                <span v-if="month === 'August'">{{ $t('calendar.month.August') }}</span>
                                <span v-if="month === 'September'">{{ $t('calendar.month.September') }}</span>
                                <span v-if="month === 'October'">{{ $t('calendar.month.October') }}</span>
                                <span v-if="month === 'November'">{{ $t('calendar.month.November') }}</span>
                                <span v-if="month === 'December'">{{ $t('calendar.month.December') }}</span>
                                {{ year }}
                            </h3>
                            <div class="flex items-center justify-start md:justify-end">
                                <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                                    <button @click="previousWeek" type="button"
                                        class="flex h-11 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                                        <span class="sr-only">Previous week</span>
                                        <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                        dateType="duty-schedule" v-model="state.selectedDate" />
                                    <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                                    <button @click="nextWeek" type="button"
                                        class="flex h-11 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                                        <span class="sr-only">Next week</span>
                                        <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </header>
                        <div class="isolate flex flex-auto flex-col bg-white">
                            <div class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                                <div>
                                    <div>
                                        <div class="shadow grid grid-cols-9">
                                            <div class="col-span-2 border-0.5 flex items-center">
                                                <div class="px-3">
                                                    <p class="text-sm font-medium">
                                                        {{ $t('dutySchedules.week') }} {{ weekNumber }}
                                                    </p>
                                                </div>
                                            </div>
                                            <div :text="$t('dutySchedules.scheduleSlots.scheduleSlots')"
                                                v-for="day in weekDays" :key="day.date"
                                                class="flex items-center justify-center py-4 border-0.5">
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
                                                    <span
                                                        class="items-center justify-center font-semibold text-gray-900">
                                                        {{ day.date }}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div class="relative mt-0.5">
                                            <div v-for="(employee, employeeIndex) in state.weeklySchedules?.data"
                                                :key="employeeIndex" class="grid grid-cols-9">
                                                <div class="col-span-9 grid grid-cols-9">
                                                    <div class="p-3 col-span-2 border-0.5">
                                                        <div class="relative">
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
                                                            <div class="-mt-2 ml-12">
                                                                <p class="text-xxs">
                                                                    {{
                                                                        employee?.employee_detail?.job?.title
                                                                    }}
                                                                </p>
                                                                <div class="text-xxs">
                                                                    {{ $t('departments.departments') }}:
                                                                    <span
                                                                        v-for="(department, departmentIndex) in employee?.departments"
                                                                        :key="departmentIndex">
                                                                        {{ department?.name }}<span
                                                                            v-if="departmentIndex < employee.departments.length - 1">,
                                                                        </span><span v-else>.</span>
                                                                    </span>
                                                                </div>
                                                                <p class="text-xxs">
                                                                    {{ $t('dutySchedules.annualNormHours') }}:
                                                                    {{
                                                                        employee?.annual_norm_hours ?? 0
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs">
                                                                    {{ $t('dutySchedules.totalHours') }}:
                                                                    {{ employee?.total_hours ?? 0 }}
                                                                </p>
                                                                <p :class="[
                                                                    parseFloat(employee?.log_data.total_time_account_earned_hours.replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700',
                                                                    'text-xxs'
                                                                ]">
                                                                    {{ $t('dutySchedules.earnedWorkHours') }}:
                                                                    {{
                                                                        employee?.log_data.total_time_account_earned_hours
                                                                    }}
                                                                </p>
                                                                <p :class="[
                                                                    parseFloat(employee?.extra_hours.replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700',
                                                                    'text-xxs'
                                                                ]">
                                                                    {{ $t('dutySchedules.extraHours.extraHours') }}:
                                                                    {{ employee?.extra_hours }}
                                                                </p>

                                                                <div class="p-0 m-0 text-xxs text-primary cursor-pointer hover:text-primary-700"
                                                                    @click="navigateTo(`/calendar?employee_uuid=${employee?.uuid}`)">
                                                                    {{ $t('dutySchedules.viewCalendar') }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div :class="[
                                                            expandedRecords[employeeIndex] && 'hidden',
                                                            'text-xs grid grid-cols-7'
                                                        ]">
                                                            <div class="col-span-3 space-y-2" />
                                                            <div class="col-span-2 flex gap-2 flex-col items-end">
                                                                <p class="text-xxs py-2">
                                                                    <span v-if="state.customWeekLabel === 'week'">
                                                                        {{ $t('dutySchedules.week') }}
                                                                    </span>
                                                                    <span v-if="state.customWeekLabel === 'month'">
                                                                        {{ $t('dutySchedules.month') }}
                                                                    </span>
                                                                    <span v-if="state.customWeekLabel === 'custom'">
                                                                        {{ $t('dutySchedules.custom') }}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div
                                                                class="col-span-2 flex gap-2 flex-col items-end border-l-0.5 border-gray-200 ml-3">
                                                                <p class="text-xxs py-2">
                                                                    {{ $t('dutySchedules.yearToDate') }}
                                                                </p>
                                                            </div>
                                                            <div class="col-span-3 space-y-2">
                                                                <p v-for="(time, timeIndex) in employee?.hours"
                                                                    :key="timeIndex">
                                                                    {{ language.locale.value === 'en' ?
                                                                        time?.shift?.en_name :
                                                                        time?.shift?.dk_name }}
                                                                </p>
                                                            </div>
                                                            <div class="col-span-2 flex gap-2 flex-col items-end">
                                                                <p v-for="(time, timeIndex) in employee?.hours"
                                                                    :key="timeIndex">
                                                                    {{ time?.weekly_hours }}
                                                                </p>
                                                            </div>
                                                            <div
                                                                class="col-span-2 flex gap-2 flex-col items-end border-l-0.5 border-gray-200 ml-3">
                                                                <p v-for="(time, timeIndex) in employee?.hours"
                                                                    :key="timeIndex">
                                                                    {{ time?.yearly_hours }}
                                                                </p>
                                                            </div>
                                                            <div
                                                                class="col-span-7 space-y-2 mt-4 border-t-0.5 border-gray-200 pt-3">
                                                                <div :class="[
                                                                    employee?.compensatory_hours?.total_in_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                                    'flex items-center gap-1 w-fit cursor-pointer'
                                                                ]" @click="viewCompensatoryHours(employee)">
                                                                    <Icon name="ph:clock" class="h-3 w-3"
                                                                        aria-hidden="true" />
                                                                    {{
                                                                        $t('dutySchedules.normHours.compensatoryHoursThisYear')
                                                                    }}:
                                                                    {{
                                                                        formatNumber(language.locale.value,
                                                                            employee?.compensatory_hours?.total_in_hours) ?? 0
                                                                    }}
                                                                </div>
                                                            </div>
                                                            <div class="col-span-7 space-y-2 mt-1">
                                                                <div :class="[
                                                                    employee?.available_vacation_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                                    'flex items-center gap-1 w-fit cursor-pointer'
                                                                ]" @click="viewAvailableVacationHours(employee)">
                                                                    <Icon name="ph:clock" class="h-3 w-3"
                                                                        aria-hidden="true" />
                                                                    {{
                                                                        $t('dutySchedules.normHours.availableVacationHours')
                                                                    }}:
                                                                    {{
                                                                        formatNumber(language.locale.value,
                                                                            employee?.available_vacation_hours) ?? 0
                                                                    }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <button @click="toggleExpanded(employeeIndex)"
                                                                class="text-primary text-xs hover:text-primary-700">
                                                                {{ !expandedRecords[employeeIndex] ?
                                                                    $t('showLess') :
                                                                    $t('showMore') }}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div class="p-3 border-0.5"
                                                        v-for="(week, weekIndex) in employee?.weeks" :key="weekIndex">
                                                        <div class="space-y-2">
                                                            <div class="text-xs">
                                                                <div v-for="(shift, shiftIndex) in sortMultiDayShiftsFirst(week?.shifts)"
                                                                    :key="shiftIndex"
                                                                    class="rounded-md p-1 relative mb-2.5" :style="{
                                                                        backgroundColor: `${shift?.type?.color}`,
                                                                        width: `${calculateShiftWidth(shift, weekIndex.toString())}`,
                                                                        marginTop: `${calculateMarginTop(employee?.weeks, weekIndex.toString(), shiftIndex)}rem`
                                                                    }">
                                                                    <div class="flex justify-between text-white">
                                                                        <p
                                                                            class="w-full px-2 py-2 flex items-center justify-center border border-white rounded-tl-md rounded-bl-md">
                                                                            {{
                                                                                moment(shift?.date_time_start).format('HH:mm')
                                                                            }}
                                                                        </p>
                                                                        <p
                                                                            class="w-full px-2 py-2 flex items-center justify-center border border-white  rounded-tr-md rounded-br-md">
                                                                            {{
                                                                                moment(shift?.date_time_end).format('HH:mm')
                                                                            }}
                                                                        </p>
                                                                    </div>
                                                                    <div v-if="shift?.shift_span_position"
                                                                        class="px-1 py-0.5 text-xxs text-white">
                                                                        <p
                                                                            v-if="shift?.shift_span_position === 'start'">
                                                                            {{
                                                                                $t('dutySchedules.shiftSpan.start') }}</p>
                                                                        <p
                                                                            v-if="shift?.shift_span_position === 'middle'">
                                                                            {{
                                                                                $t('dutySchedules.shiftSpan.middle') }}</p>
                                                                        <p v-if="shift?.shift_span_position === 'end'">
                                                                            {{
                                                                                $t('dutySchedules.shiftSpan.end') }}</p>
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
                                                                                v-if="departmentIndex < shift?.departments.length - 1">,
                                                                            </span><span v-else>.</span>
                                                                        </span>
                                                                    </div>
                                                                    <div class="flex items-center flex-wrap gap-y-0.5 mt-1"
                                                                        v-if="shift?.tags?.length > 0">
                                                                        <Tooltip :text="tag?.tag"
                                                                            v-for="(tag, tagIndex) in shift?.tags"
                                                                            :key="tagIndex">
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
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesUserDutyScheduleNormHoursModalCompensatoryHours :isModalOpen="state.modal.isCompensatoryHoursOpen"
                :selectedEmployee="state.normHours.selectedEmployeeSchedule"
                @close="state.modal.isCompensatoryHoursOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalVacationHours :isModalOpen="state.modal.isVacationHoursOpen"
                :selectedEmployee="state.normHours.selectedEmployeeSchedule"
                @close="state.modal.isVacationHoursOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useDepartmentStore } from '@/store/department'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const language = useI18n()
const departmentStore = useDepartmentStore()
const { formatNumber } = useNumberFormatter()
const currentDate = ref(moment())
const selectedDay = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))
const expandedRecords = reactive([] as boolean[])

const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'employees.tabs.dutySchedule',
        translate: true,
        href: `/employees/${employeeUuid}/duty-schedule`,
    },
]

const state = reactive({
    customWeekLabel: 'week',
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isCompensatoryHoursOpen: false,
        isVacationHoursOpen: false,
    },
    normHours: {
        selectedEmployeeSchedule: {}
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    shiftDateRange: {
        formDateRange: {
            start_date: moment().startOf('week').add(1, 'day'),
            end_date: moment().startOf('week').add(7, 'day'),
        },
    } as any,
    isFirstLoad: true,
    weeklySchedules: [] as any,
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchDutySchedule()
    }
})

onMounted(() => {
    fetchDutySchedule()
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        currentDate.value = moment(newSelectedDate)
        fetchDutySchedule()
    }
})

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
    const startDay = moment(shift?.date_time_start).startOf('day')
    const endDay = moment(shift?.date_time_end).startOf('day')
    const dayDifference = endDay.diff(startDay, 'days')

    if (weekIndex === 'sunday') {
        return 'auto'
    }

    if (dayDifference === 1) {
        if (moment(shift?.date_time_end).format('HH:mm:ss') === '00:00:00') {
            return 'auto'

        } else {
            return '17.5rem' // Width for shifts spanning 2 days
        }
    } else if (dayDifference === 2) {
        return '27rem' // Width for shifts spanning 3 days
    } else if (dayDifference === 3) {
        return '36.5rem' // Width for shifts spanning 4 days
    } else if (dayDifference === 4) {
        return '46rem' // Width for shifts spanning 5 days
    } else if (dayDifference === 5) {
        return '55.5rem' // Width for shifts spanning 6 days
    } else if (dayDifference >= 6) {
        return '65rem' // Width for shifts spanning 7 days
    }
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
    return shifts
        .find((shift: any) => {
            const startDay = moment(shift.date_time_start).startOf('day')
            const endDay = moment(shift.date_time_end).startOf('day')
            const isMultiDay = endDay.diff(startDay, 'days') >= 1
            const isExcluded = endDay.diff(startDay, 'days') === 1 && moment(shift.date_time_end).format('HH:mm:ss') === '00:00:00'

            return isMultiDay && !isExcluded
        })
}

async function fetchDutySchedule() {
    state.error = {}
    state.weeklySchedules = []
    state.isPageLoading = true
    try {
        const dateMoment = moment(currentDate.value)
        const startOfWeek = dateMoment.clone().startOf('isoWeek')
        const endOfWeek = dateMoment.clone().endOf('isoWeek')
        const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
        const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
        const params = {
            date_start: startOfWeekFormatted,
            date_end: endOfWeekFormatted,
            filter_date_start: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            filter_date_end: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
            employee_uuid: employeeUuid,
        }
        const response = await dutyScheduleService.getDutySchedules(params)
        if (response) {
            state.weeklySchedules = response
            if (state.isFirstLoad) {
                expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => true))
            }
            state.isFirstLoad = false
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}

function viewCompensatoryHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isCompensatoryHoursOpen = true
}

function viewAvailableVacationHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isVacationHoursOpen = true
}

function previousWeek() {
    state.customWeekLabel = 'week'
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDutySchedule()
}

function setToday() {
    state.customWeekLabel = 'week'
    currentDate.value = moment()
    fetchDutySchedule()
}

function nextWeek() {
    state.customWeekLabel = 'week'
    currentDate.value = moment(currentDate.value).add(1, 'week')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDutySchedule()
}

const weekNumber = computed(() => {
    return moment(currentDate.value).week()
})

const weekDays = computed(() => {
    const startOfWeek = moment(currentDate.value).startOf('isoWeek')
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
</script>