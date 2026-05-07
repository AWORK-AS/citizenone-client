<template>
    <div class="space-y-5">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="flex h-full flex-col">
                <header class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-3 py-3">
                    <div class="space-y-2">
                        <div class="flex items-center">
                            <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                                <button @click="previousWeek()" type="button"
                                    class="flex h-11 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                                    <span class="sr-only">Previous week</span>
                                    <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                                </button>
                                <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                    dateType="duty-schedule" v-model="state.selectedDate" />
                                <span class="relative -mx-px h-5 w-px bg-gray-300 md: hidden" />
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
                    <div />
                    <div>
                        <TableSearch @search="handleSearch" />
                    </div>
                </header>
                <div class="space-y-2 mt-3 mb-3">
                    <div class="flex flex-col justify-between gap-3 md:flex-row">
                        <div class="bg-white border border-gray-200 rounded-md px-4 py-1.5">
                            <h3 class="text-base font-semibold leading-6 text-gray-900 text-center">
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
                        </div>
                        <div class="flex items-center gap-x-2">
                            <Tooltip
                                :text="state.sortData.sortOrder === 'ascend' ? $t('dutySchedules.sort.sortNamesInDescendingOrder') : $t('dutySchedules.sort.sortNamesInAscendingOrder')"
                                position="left">
                                <button
                                    class="flex items-center justify-center gap-x-2 outline-none rounded-md text-xs truncate font-semibold bg-tertiary border border-tertiary text-white hover:bg-tertiary-800 px-2 py-2"
                                    @click="sortDutySchedule">
                                    <Icon name="heroicons:arrow-down" class="h-5 w-5" aria-hidden="true"
                                        v-show="state.sortData?.sortOrder === 'ascend'" />
                                    <Icon name="heroicons:arrow-up" class="h-5 w-5" aria-hidden="true"
                                        v-show="state.sortData?.sortOrder === 'descend'" />
                                </button>
                            </Tooltip>
                            <div class="bg-white border border-gray-200 rounded-md px-3 py-2">
                                <div class="flex items-center gap-x-1 text-sm">
                                    <span>{{ $t('entriesPerPage') }}:</span>
                                    <select class="focus:outline-none bg-transparent" @change="changePageLength"
                                        id="citizensPageLength">
                                        <option value="10"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '10'">
                                            10
                                        </option>
                                        <option value="20"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '20'">
                                            20
                                        </option>
                                        <option value="30"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '30'">
                                            30
                                        </option>
                                        <option value="40"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '40'">
                                            40
                                        </option>
                                        <option value="50"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '50'">
                                            50
                                        </option>
                                        <option value="100"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '100'">
                                            100
                                        </option>
                                        <option value="200"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '200'">
                                            200
                                        </option>
                                        <option value="300"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '300'">
                                            300
                                        </option>
                                        <option value="400"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '400'">
                                            400
                                        </option>
                                        <option value="500"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === '500'">
                                            500
                                        </option>
                                        <option value="all"
                                            :selected="draftDutyScheduleStore.getCurrentPageLength === 'all'">
                                            {{ $t('all') }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-primary h-3 rounded-full transition-all ease-in-out duration-500 mb-1.5"
                    :style="{ width: `${state.progress.percentage}%` }" v-if="state.progress.showProgressBar" />
                <div class="isolate flex flex-auto flex-col bg-white">
                    <div class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                        <div>
                            <div>
                                <div class="grid grid-cols-9" id="fixed-header-week-view">
                                    <div class="col-span-2 border-0.5">
                                        <div class="flex items-center gap-x-3 px-3 pt-3">
                                            <p class="text-sm font-medium">
                                                {{ $t('dutySchedules.week') }} {{ weekNumber }}
                                            </p>
                                        </div>
                                        <div class="px-3 pb-2">
                                            <button @click="toggleShowHideAllShifts()"
                                                class="text-primary text-xs hover:text-primary-700">
                                                {{ state.showAllShifts ?
                                                    $t('hideAll') :
                                                    $t('showAll') }}
                                            </button>
                                        </div>
                                    </div>
                                    <div v-for="day in weekDays" :key="day.date"
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
                                            <span class="items-center justify-center font-semibold text-gray-900">
                                                {{ day.date }}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div class="relative mt-0.5">
                                    <div v-for="(employee, employeeIndex) in state.weeklySchedules?.data"
                                        :key="employeeIndex" class="grid grid-cols-9">
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
                                                    <div class="-mt-1 ml-10">
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

                                                        <div class="flex items-center gap-1 cursor-pointer"
                                                            @click="state.modal.isAnnualNormHoursInfoOpen = true">
                                                            <p class="text-xxs">
                                                                {{ $t('dutySchedules.annualNormHours') }}:
                                                                {{ employee?.annual_norm_hours ?? 0 }}
                                                            </p>
                                                            <Icon name="ph:question" class="h-3.5 w-3.5"
                                                                aria-hidden="true" />
                                                        </div>

                                                        <p class="text-xxs">
                                                            {{ $t('dutySchedules.totalHours') }}:
                                                            {{ employee?.total_hours ?? 0 }}
                                                        </p>
                                                        <div class="p-0 m-0 text-xxs text-primary cursor-pointer hover:text-primary-700"
                                                            @click="navigateTo(`/calendar? employee_uuid=${employee?.uuid}`)">
                                                            {{ $t('dutySchedules.viewCalendar') }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div :class="[
                                                    expandedRecords[employeeIndex as number] && 'hidden'
                                                ]">
                                                    <div class="text-xs grid grid-cols-7"
                                                        v-if="isAtLeast('Admin') || (!isAtLeast('Admin') && userStore.getUser?.show_working_hours)">
                                                        <div class="col-span-3 space-y-2" />
                                                        <div class="col-span-2 flex gap-2 flex-col items-end">
                                                            <p class="text-xxs py-2 pr-2">
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
                                                            class="col-span-2 flex gap-2 flex-col items-end border-l-0.5 border-gray-200">
                                                            <p class="text-xxs py-2 pr-2">
                                                                {{ $t('dutySchedules.yearToDate') }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div class="text-xs grid grid-cols-7">
                                                        <div class="col-span-3">
                                                            <div v-for="(time, timeIndex) in employee?.hours"
                                                                :key="timeIndex" :class="[
                                                                    timeIndex as number % 2 ? 'bg-white' : 'bg-gray-100',
                                                                    'py-1'
                                                                ]">
                                                                <div class="pl-3">
                                                                    <Tooltip
                                                                        :text="language.locale.value === 'en' ? time?.shift?.en_name : time?.shift?.dk_name">
                                                                        <div class="flex items-center gap-x-1">
                                                                            <div>
                                                                                <div :class="`w-2 h-2 rounded-sm`"
                                                                                    :style="{ background: time?.shift?.color }" />
                                                                            </div>
                                                                            <div class="truncate w-36">
                                                                                {{ language.locale.value === 'en' ?
                                                                                    time?.shift?.en_name :
                                                                                    time?.shift?.dk_name
                                                                                }}
                                                                            </div>
                                                                        </div>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-span-2">
                                                            <div v-for="(time, timeIndex) in employee?.hours"
                                                                :key="timeIndex" :class="[
                                                                    timeIndex as number % 2 ? 'bg-white' : 'bg-gray-100',
                                                                ]">
                                                                <div class="text-right py-1 pr-2">
                                                                    {{ time?.weekly_hours }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-span-2 border-l-0.5 border-gray-200">
                                                            <div v-for="(time, timeIndex) in employee?.hours"
                                                                :key="timeIndex" :class="[
                                                                    timeIndex as number % 2 ? 'bg-white' : 'bg-gray-100',
                                                                ]">
                                                                <div class="text-right py-1 pr-2">
                                                                    {{ time?.yearly_hours }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="text-xs grid grid-cols-7">
                                                        <div
                                                            class="px-3 col-span-7 space-y-2 mt-4 border-t-0.5 border-gray-200 pt-3">
                                                            <div :class="[
                                                                employee?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                                'flex items-center gap-1 w-fit cursor-pointer'
                                                            ]" @click="viewCompensatoryHours(employee)">
                                                                <Icon name="ph:clock" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                                {{
                                                                    $t('dutySchedules.normHours.compensatoryHoursThisYear')
                                                                }}:
                                                                {{
                                                                    formatNumber(language.locale.value,
                                                                        employee?.total_norm_hours?.compensatory_hours)
                                                                    ??
                                                                    0
                                                                }}
                                                            </div>
                                                        </div>
                                                        <div class="px-3 col-span-7 space-y-2 mt-1">
                                                            <div :class="[
                                                                employee?.total_norm_hours?.available_vacation_days > 0 ? 'text-green-700' : 'text-red-700',
                                                                'flex items-center gap-1 w-fit cursor-pointer'
                                                            ]" @click="viewAvailableVacationHours(employee)">
                                                                <Icon name="ph:clock" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                                {{
                                                                    $t('dutySchedules.normHours.availableVacationDays')
                                                                }}:
                                                                {{
                                                                    formatNumber(language.locale.value,
                                                                        employee?.total_norm_hours?.available_vacation_days ||
                                                                        0)
                                                                }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="px-3 pb-3">
                                                    <button @click="toggleExpanded(employeeIndex as number)"
                                                        class="text-primary text-xs hover:text-primary-700">
                                                        {{ !expandedRecords[employeeIndex as number] ?
                                                            $t('showLess') :
                                                            $t('showMore') }}
                                                    </button>
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
                                                                marginTop: `${calculateMarginTop(employee?.weeks, weekIndex.toString(), shiftIndex)}rem`
                                                            }">
                                                            <div class="absolute -left-1 -top-1 z-10 w-4 h-4 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center text-xxs"
                                                                v-if="shift?.type?.system_name === 'sick-leave'">
                                                                S
                                                            </div>
                                                            <div class="flex justify-between text-white">
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
                <div class="mt-5">
                    <Pagination :data="state.weeklySchedules" @previous="previous" @next="next" />
                </div>
            </div>
            <ModulesUserDutyScheduleNormHoursModalCompensatoryHours :isModalOpen="state.modal.isCompensatoryHoursOpen"
                :selectedEmployee="state.normHours.selectedEmployeeSchedule"
                @close="state.modal.isCompensatoryHoursOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalInfo :isModalOpen="state.modal.isAnnualNormHoursInfoOpen"
                @close="state.modal.isAnnualNormHoursInfoOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalVacationHours :isModalOpen="state.modal.isVacationHoursOpen"
                :selectedEmployee="state.normHours.selectedEmployeeSchedule"
                @close="state.modal.isVacationHoursOpen = false" />
            <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isDepartmentSickLeaveDateRangeOpen"
                :dateRange="state.shiftDateRange" @close="state.modal.isDepartmentSickLeaveDateRangeOpen = false"
                @filterDate="filterDutyScheduleDate" />
        </LoadingSpinner>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { useDepartmentStore } from '@/store/department'
import { useDraftDutyScheduleStore } from '@/store/draft-duty-schedule'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { publishedVersionsService } from '~/components/api/user/PublishedVersionsService'

const language = useI18n()
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
const departmentStore = useDepartmentStore()
const draftDutyScheduleStore = useDraftDutyScheduleStore() as any
const { formatNumber } = useNumberFormatter()
const currentDate = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))
const expandedRecords = reactive([] as boolean[])

const router = useRouter()
const draftTemplateUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    customWeekLabel: 'week',
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isCompensatoryHoursOpen: false,
        isDepartmentSickLeaveDateRangeOpen: false,
        isVacationHoursOpen: false,
        isAnnualNormHoursInfoOpen: false,
    } as any,
    normHours: {
        selectedEmployeeSchedule: {}
    },
    progress: {
        percentage: 100,
        pendingRequests: 0,
        showProgressBar: false,
        totalRequests: 0,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    showAllShifts: false,
    shiftDateRange: {
        formDateRange: {
            start_date: moment().startOf('week').add(1, 'day'),
            end_date: moment().startOf('week').add(7, 'day'),
        },
    } as any,
    sortData: {
        sortField: 'firstname',
        sortOrder: 'ascend',
    },
    weeklySchedules: [] as any,
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

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchDraftDutySchedule()
    }
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        currentDate.value = moment(newSelectedDate)
        fetchDraftDutySchedule()
    }
})

onMounted(() => {
    fetchDraftDutySchedule()
    window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})


function filterDutyScheduleDate(formDateRange: any) {
    state.shiftDateRange.formDateRange.start_date = formDateRange?.[0]
    state.shiftDateRange.formDateRange.end_date = formDateRange?.[1]
    fetchDraftDutySchedule()
    setCustomWeekLabel(formDateRange?.[0], formDateRange?.[1])
}

function setCustomWeekLabel(startDate: any, endDate: any) {
    const start = new Date(startDate) as any
    const end = new Date(endDate) as any

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    const isWeek =
        (start.getDay() === 0 || start.getDay() === 1) && diffDays === 7

    const isFirstDayOfMonth = start.getDate() === 1
    const isLastDayOfMonth =
        end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()
    const isSameMonth =
        start.getMonth() === end.getMonth() &&
        start.getFullYear() === end.getFullYear()

    const isMonth = isFirstDayOfMonth && isLastDayOfMonth && isSameMonth

    if (isWeek) {
        state.customWeekLabel = 'week'
    }
    else if (isMonth) {
        state.customWeekLabel = 'month'
    } else {
        state.customWeekLabel = 'custom'
    }
}

function sortMultiDayShiftsFirst(shifts: any) {
    if (!shifts || !Array.isArray(shifts)) {
        return []
    }

    const sortedShifts = shifts.sort((a: any, b: any) => {
        const aMultiDay = moment(a.date_time_end).startOf('day').diff(moment(a.date_time_start).startOf('day'), 'days') >= 1
        const bMultiDay = moment(b.date_time_end).startOf('day').diff(moment(b.date_time_start).startOf('day'), 'days') >= 1

        if (aMultiDay && !bMultiDay) return -1
        if (!aMultiDay && bMultiDay) return 1
        return 0
    })
    return sortedShifts
}

function calculateShiftWidth(shift: any, weekIndex: string) {
    const shiftStart = moment(shift.date_time_start).startOf('day')
    const shiftEnd = moment(shift.date_time_end).startOf('day')

    const weekStart = moment(currentDate.value).startOf('isoWeek')
    const weekEnd = moment(currentDate.value).endOf('isoWeek')

    const visibleStart = shiftStart.isBefore(weekStart) ? weekStart : shiftStart
    const visibleEnd = shiftEnd.isAfter(weekEnd) ? weekEnd : shiftEnd

    let dayDifference = visibleEnd.diff(visibleStart, 'days')

    const endsAtMidnight = moment(shift.date_time_end).format('HH:mm: ss') === '00:00:00'
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

    if (weekIndex === 'monday' || shiftIndex > 0) return 0

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
    if (!shifts || !Array.isArray(shifts)) {
        return undefined
    }

    return shifts.find((shift: any) => {
        const startDay = moment(shift.date_time_start).startOf('day')
        const endDay = moment(shift.date_time_end).startOf('day')
        const isMultiDay = endDay.diff(startDay, 'days') >= 1
        const isExcluded = endDay.diff(startDay, 'days') === 1 && moment(shift.date_time_end).format('HH:mm:ss') === '00:00:00'

        return isMultiDay && !isExcluded
    })
}

async function fetchDraftDutySchedule() {
    state.error = {}
    state.progress.totalRequests = state.progress.totalRequests + 1
    state.progress.pendingRequests = state.progress.pendingRequests + 1
    state.isPageLoading = true
    identifyTheProgressPercentage()
    try {
        const dateMoment = moment(currentDate.value)
        const startOfWeek = dateMoment.clone().startOf('isoWeek')
        const endOfWeek = dateMoment.clone().endOf('isoWeek')
        const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
        const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
        const params = {
            page: draftDutyScheduleStore.getCurrentPageNumber,
            page_length: draftDutyScheduleStore.getCurrentPageLength,
            date_start: startOfWeekFormatted,
            date_end: endOfWeekFormatted,
            filter_date_start: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            filter_date_end: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await publishedVersionsService.getPublishedVersionDetails(draftTemplateUuid as string, params)
        if (response) {
            state.weeklySchedules = response
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
    state.isPageLoading = false
}

watch(() => state.weeklySchedules, (newSchedules) => {
    if (newSchedules && newSchedules.data.length !== expandedRecords.length) {
        expandedRecords.splice(0, expandedRecords.length, ...newSchedules.data.map(() => true))
    }
})

function sortDutySchedule() {
    if (state.sortData.sortOrder === 'ascend') {
        state.sortData.sortOrder = 'descend'
    } else {
        state.sortData.sortOrder = 'ascend'
    }
    fetchDraftDutySchedule()
}

function handleSearch(value: any) {
    draftDutyScheduleStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDraftDutySchedule()
}

function previous() {
    const currentTablePage = draftDutyScheduleStore.getCurrentPageNumber - 1
    draftDutyScheduleStore.setCurrentPageNumber(currentTablePage)
    fetchDraftDutySchedule()
}

function next() {
    const currentTablePage = draftDutyScheduleStore.getCurrentPageNumber + 1
    draftDutyScheduleStore.setCurrentPageNumber(currentTablePage)
    fetchDraftDutySchedule()
}

function changePageLength(event: any) {
    draftDutyScheduleStore.setCurrentPageNumber(1)
    draftDutyScheduleStore.setCurrentPageLength(event.target.value)
    fetchDraftDutySchedule()
}

function toggleShowHideAllShifts() {
    state.showAllShifts = !state.showAllShifts
    expandedRecords.forEach((_, index) => {
        expandedRecords[index] = !state.showAllShifts
    })
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}

function previousWeek() {
    state.customWeekLabel = 'week'
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDraftDutySchedule()
}

function setToday() {
    state.customWeekLabel = 'week'
    currentDate.value = moment()
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDraftDutySchedule()
}

function nextWeek() {
    state.customWeekLabel = 'week'
    currentDate.value = moment(currentDate.value).add(1, 'week')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDraftDutySchedule()
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

function hasConflict(week: any) {
    const hasConflict = week?.shifts?.some((shift: any) => shift.is_conflict === true)
    return hasConflict
}

function viewCompensatoryHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isCompensatoryHoursOpen = true
}

function viewAvailableVacationHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isVacationHoursOpen = true
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

let lastScrollTop = 0
const headerHeight = 305

function handleScroll() {
    const header = document.getElementById('fixed-header-week-view')
    if (!header) return

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop

    if (currentScroll > headerHeight) {
        header.classList.add('fixed-header-week-view-top')
    } else {
        header.classList.remove('fixed-header-week-view-top')
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll
}
</script>