<template>
    <div class="space-y-5">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="state?.copyShiftError?.message"
            v-if="state.copyShiftError?.message && state.copyShiftError.message.length > 0" />

        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="flex h-full flex-col">
                <header class="grid grid-cols-1 xl:grid-cols-3 gap-3 py-3">
                    <div class="space-y-2">
                        <div class="flex items-center">
                            <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                                <button @click="!isPreviousMonthDisabled() && previousMonth()" type="button" :class="[
                                    isPreviousMonthDisabled() && 'cursor-not-allowed',
                                    'flex h-11 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50',
                                ]" :disabled="isPreviousMonthDisabled()">
                                    <span class="sr-only">Previous month</span>
                                    <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                                </button>

                                <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                    dateType="duty-schedule" v-model="state.selectedDate" />

                                <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />

                                <button @click="nextMonth()" type="button"
                                    class="flex h-11 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                                    <span class="sr-only">Next month</span>
                                    <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        <button @click="setToday()" class="text-primary text-sm hover:text-primary-700">
                            {{ $t('goToToday') }}
                        </button>
                    </div>

                    <div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="dutyScheduleStore.getShowEmployeesWorkingToday" @toggleSwitch="
                                dutyScheduleStore.setShowEmployeesWorkingToday(
                                    !dutyScheduleStore.getShowEmployeesWorkingToday
                                )
                                " />
                            <p>
                                {{ $t('dutySchedules.showEmployeesWorkingToday') }}
                            </p>
                        </div>
                    </div>

                    <div>
                        <TableSearch @search="handleSearch" />
                    </div>
                </header>

                <div class="space-y-2 mt-3 mb-3">
                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-3 py-3">
                        <div class="w-fit bg-white border border-gray-200 rounded-md px-4 py-2">
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

                        <div>
                            <div class="space-y-1 flex items-center gap-x-2">
                                <FormSwitch :value="userStore.getUser?.is_schedule_pinned ? true : false"
                                    @toggleSwitch="pinSelfToTopOfSchedule()" />
                                <p>
                                    {{ $t('dutySchedules.pinSelfToTopOfSchedule') }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center justify-end gap-x-2">
                            <button class="flex items-center gap-x-1 text-sm text-primary group"
                                @click="state.modal.isFilterDutyScheduleOpen = true">
                                <Icon name="ic:outline-filter-list"
                                    class="text-primary w-6 h-6 group-hover:text-primary-700" />
                                <span class="group-hover:text-primary-700">
                                    {{ $t('filter') }}
                                </span>
                            </button>

                            <Tooltip :text="state.sortData.sortOrder === 'ascend'
                                ? $t('dutySchedules.sort.sortNamesInDescendingOrder')
                                : $t('dutySchedules.sort.sortNamesInAscendingOrder')
                                " position="left">
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
                                <div class="flex items-center gap-x-1">
                                    <span>{{ $t('entriesPerPage') }}:</span>
                                    <select class="focus:outline-none bg-transparent" @change="changePageLength"
                                        id="citizensPageLength">
                                        <option value="10" :selected="dutyScheduleStore.getCurrentPageLength === '10'">
                                            10
                                        </option>
                                        <option value="20" :selected="dutyScheduleStore.getCurrentPageLength === '20'">
                                            20
                                        </option>
                                        <option value="30" :selected="dutyScheduleStore.getCurrentPageLength === '30'">
                                            30
                                        </option>
                                        <option value="40" :selected="dutyScheduleStore.getCurrentPageLength === '40'">
                                            40
                                        </option>
                                        <option value="50" :selected="dutyScheduleStore.getCurrentPageLength === '50'">
                                            50
                                        </option>
                                        <option value="100"
                                            :selected="dutyScheduleStore.getCurrentPageLength === '100'">
                                            100
                                        </option>
                                        <option value="200"
                                            :selected="dutyScheduleStore.getCurrentPageLength === '200'">
                                            200
                                        </option>
                                        <option value="300"
                                            :selected="dutyScheduleStore.getCurrentPageLength === '300'">
                                            300
                                        </option>
                                        <option value="400"
                                            :selected="dutyScheduleStore.getCurrentPageLength === '400'">
                                            400
                                        </option>
                                        <option value="500"
                                            :selected="dutyScheduleStore.getCurrentPageLength === '500'">
                                            500
                                        </option>
                                        <option value="all"
                                            :selected="dutyScheduleStore.getCurrentPageLength === 'all'">
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
                <div class="h-3 mb-1.5" v-else />

                <div class="isolate flex flex-auto flex-col bg-white">
                    <div class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                        <div class="bg-white border border-gray-200 overflow-hidden">
                            <div class="overflow-x-auto" id="month-view-scroll-container">
                                <div class="min-w-max">
                                    <div id="fixed-header-month-view-wrapper">
                                        <div class="grid"
                                            :style="{ gridTemplateColumns: `305px repeat(${monthDays.length}, 153px)` }"
                                            id="fixed-header-month-view">
                                            <div id="fixed-header-sticky-cell"
                                                class="sticky left-0 z-40 bg-white border-0.5 border-gray-200">
                                                <div class="gap-x-2 px-3 pt-3" v-if="isAdmin(userStore.getUser?.role)">
                                                    <Tooltip :text="$t('dutySchedules.copy.copyMultipleWeeksSchedule')"
                                                        position="right">
                                                        <button
                                                            class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                            @click="state.modal.isCopyMultipleWeeklyScheduleOpen = true">
                                                            <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                                <div class="px-3 pb-2" v-if="isAdmin(userStore.getUser?.role)">
                                                    <button @click="toggleShowHideAllShifts()"
                                                        class="text-primary text-xs hover:text-primary-700">
                                                        {{ state.showAllShifts ?
                                                            $t('hideAll') :
                                                            $t('showAll') }}
                                                    </button>
                                                </div>
                                            </div>

                                            <Tooltip :text="$t('dutySchedules.scheduleSlots.scheduleSlots')"
                                                v-for="day in monthDays" :key="day.format('YYYY-MM-DD')"
                                                class="relative cursor-pointer hover:bg-gray-200 flex items-center justify-center py-6 border-0.5"
                                                @click="openManageScheduleSlotModal(day)"
                                                v-if="isAdmin(userStore.getUser?.role)">
                                                <span class="flex gap-x-1 text-sm">
                                                    <span v-if="day.format('ddd') === 'Mon'">
                                                        {{ $t('calendar.week.short.Monday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Tue'">
                                                        {{ $t('calendar.week.short.Tuesday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Wed'">
                                                        {{ $t('calendar.week.short.Wednesday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Thu'">
                                                        {{ $t('calendar.week.short.Thursday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Fri'">
                                                        {{ $t('calendar.week.short.Friday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Sat'">
                                                        {{ $t('calendar.week.short.Saturday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Sun'">
                                                        {{ $t('calendar.week.short.Sunday') }}
                                                    </span>
                                                    <span
                                                        class="items-center justify-center font-semibold text-gray-900">
                                                        {{ day.date() }}
                                                    </span>
                                                </span>
                                                <div v-if="getSlotCount(day.format('YYYY-MM-DD')) > 0"
                                                    class="absolute top-2 left-24 text-xxs flex items-center justify-center w-5 h-5 bg-red-400 text-white rounded-full">
                                                    {{
                                                        getSlotCount(day.format('YYYY-MM-DD')) > 99 ? '99+' :
                                                            getSlotCount(day.format('YYYY-MM-DD'))
                                                    }}
                                                </div>
                                            </Tooltip>
                                            <div :text="$t('dutySchedules.scheduleSlots.scheduleSlots')"
                                                v-for="day in monthDays" :key="day.format('YYYY-MM-DD')"
                                                class="flex items-center justify-center py-6 border-0.5"
                                                v-if="!isAdmin(userStore.getUser?.role)">
                                                <span class="flex gap-x-1 text-sm">
                                                    <span v-if="day.format('ddd') === 'Mon'">
                                                        {{ $t('calendar.week.short.Monday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Tue'">
                                                        {{ $t('calendar.week.short.Tuesday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Wed'">
                                                        {{ $t('calendar.week.short.Wednesday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Thu'">
                                                        {{ $t('calendar.week.short.Thursday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Fri'">
                                                        {{ $t('calendar.week.short.Friday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Sat'">
                                                        {{ $t('calendar.week.short.Saturday') }}
                                                    </span>
                                                    <span v-if="day.format('ddd') === 'Sun'">
                                                        {{ $t('calendar.week.short.Sunday') }}
                                                    </span>
                                                    <span
                                                        class="items-center justify-center font-semibold text-gray-900">
                                                        {{ day.date() }}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="grid border-b border-gray-100"
                                        :style="{ gridTemplateColumns: `305px repeat(${monthDays.length}, 153px)` }">
                                        <p
                                            class="sticky left-0 bg-white flex items-center justify-end px-4 py-2 text-xs border-0.5">
                                            {{ $t('dutySchedules.holidays') }}:
                                        </p>
                                        <div v-for="day in monthDays" class="p-3 border-0.5">
                                            <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                                v-if="state.monthlySchedules?.month_data?.[moment(day).format('YYYY-MM-DD')]?.holiday">
                                                {{
                                                    state.monthlySchedules?.month_data?.[moment(day).format('YYYY-MM-DD')]?.holiday?.name
                                                }}
                                            </p>
                                        </div>
                                    </div>

                                    <div v-for="(employee, employeeIndex) in state.monthlySchedules?.data"
                                        :key="employeeIndex" class="grid border-b border-gray-100"
                                        :style="{ gridTemplateColumns: `305px repeat(${monthDays.length}, 153px)` }">
                                        <div class="sticky left-0 z-10 bg-white border-r border-gray-200">
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
                                                    <div class="flex items-center gap-x-1">
                                                        <Tooltip position="right"
                                                            :text="$t('dutySchedules.extraHours.extraHours')"
                                                            v-if="isAdmin(userStore.getUser?.role) || userStore.getUser?.uuid === employee?.uuid">
                                                            <button
                                                                class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                                @click="viewExtraHours(employee)">
                                                                <Icon name="mdi:clock-outline" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="right"
                                                            :text="$t('dutySchedules.leaveRequests.leaveRequests')"
                                                            v-if="isAdmin(userStore.getUser?.role) || (!isAdmin(userStore.getUser?.role) && userStore.getUser?.uuid === employee?.uuid)">
                                                            <button
                                                                class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                                @click="viewLeaveRequests(employee)">
                                                                <Icon name="mdi:wallet-travel" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <div :class="[
                                                    expandedRecords[employeeIndex] && 'hidden',
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
                                                                v-if="departmentIndex < employee.departments.length - 1">,
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

                                                    <div class="flex items-center gap-1 cursor-pointer"
                                                        @click="state.modal.isAnnualNormHoursInfoOpen = true">
                                                        <p class="text-xxs">
                                                            {{ $t('dutySchedules.weeklyNormHours') }}:
                                                            {{ (Math.round(Number(employee?.annual_norm_hours) /
                                                                52)) ?? 0 }}
                                                        </p>
                                                        <Icon name="ph:question" class="h-3.5 w-3.5"
                                                            aria-hidden="true" />
                                                    </div>

                                                    <p class="text-xxs">
                                                        {{ $t('dutySchedules.totalHours') }}:
                                                        {{ employee?.total_hours ?? 0 }}
                                                    </p>
                                                    <p :class="[
                                                        employee?.average_weekly_work_time?.severity === 'info' ? 'text-green-700' :
                                                            employee?.average_weekly_work_time?.severity === 'warning' ? 'text-amber-700' :
                                                                'text-red-700',
                                                        'text-xxs'
                                                    ]">
                                                        {{ $t('dutySchedules.averageWeeklyHours.averageWeeklyHours')
                                                        }}:
                                                        {{ employee?.average_weekly_work_time?.average_weekly_hours
                                                        }}
                                                    </p>
                                                    <p :class="[
                                                        parseFloat(employee?.log_data.total_time_account_earned_hours?.replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700',
                                                        'text-xxs'
                                                    ]">
                                                        {{ $t('dutySchedules.earnedWorkHours') }}:
                                                        {{ employee?.log_data.total_time_account_earned_hours }}
                                                    </p>
                                                    <p :class="[
                                                        parseFloat(employee?.extra_hours?.replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700',
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
                                                expandedRecords[employeeIndex] && 'hidden'
                                            ]">
                                                <div class="text-xs grid grid-cols-7"
                                                    v-if="isAdmin(userStore.getUser?.role) || (!isAdmin(userStore.getUser?.role) && userStore.getUser?.show_working_hours)">
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
                                                                timeIndex % 2 ? 'bg-white' : 'bg-gray-100',
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
                                                                timeIndex % 2 ? 'bg-white' : 'bg-gray-100',
                                                            ]">
                                                            <div class="text-right py-1 pr-2">
                                                                {{ time?.weekly_hours }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2 border-l-0.5 border-gray-200">
                                                        <div v-for="(time, timeIndex) in employee?.hours"
                                                            :key="timeIndex" :class="[
                                                                timeIndex % 2 ? 'bg-white' : 'bg-gray-100',
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
                                                            'text-primary',
                                                            'flex items-center gap-1 w-fit cursor-pointer'
                                                        ]" @click="openGraphModal(employee)">
                                                            <Icon name="ph:chart-bar-bold" class="h-3 w-3"
                                                                aria-hidden="true" />
                                                            {{
                                                                $t('dutySchedules.normHours.compensatoryHoursGraph')
                                                            }}
                                                        </div>
                                                    </div>
                                                    <div class="px-3 col-span-7 space-y-2 mt-1">
                                                        <div :class="[
                                                            employee?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                            'flex items-center gap-1 w-fit cursor-pointer'
                                                        ]" @click="viewCompensatoryHours(employee)">
                                                            <Icon name="ph:clock" class="h-3 w-3" aria-hidden="true" />
                                                            {{
                                                                $t('dutySchedules.normHours.compensatoryHours')
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
                                                            employee?.total_norm_hours?.available_vacation_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                            'flex items-center gap-1 w-fit cursor-pointer'
                                                        ]" @click="viewAvailableVacationHours(employee)">
                                                            <Icon name="ph:clock" class="h-3 w-3" aria-hidden="true" />
                                                            {{
                                                                $t('dutySchedules.normHours.availableVacationHours')
                                                            }}:
                                                            {{
                                                                formatNumber(language.locale.value,
                                                                    employee?.total_norm_hours?.available_vacation_hours ||
                                                                    0)
                                                            }}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                            <div class="px-3 pb-3">
                                                <div
                                                    v-if="isAdmin(userStore.getUser?.role) || (!isAdmin(userStore.getUser?.role) && userStore.getUser?.show_working_hours && userStore.getUser?.uuid === employee?.uuid)">
                                                    <button @click="toggleExpanded(employeeIndex)"
                                                        class="text-primary text-xs hover:text-primary-700">
                                                        {{ !expandedRecords[employeeIndex] ?
                                                            $t('showLess') :
                                                            $t('showMore') }}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-for="day in monthDays"
                                            :key="employee.uuid + '_' + day.format('YYYY-MM-DD')" :class="[
                                                isDailyScheduleCopied(employee, day) && 'border-1.5 border-dashed border-gray-700',
                                                !isDailyScheduleCopiedEmpty() && !isDailyScheduleCopied(employee, day) && 'cursor-copy relative group',
                                                hasConflict(state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.shifts) && 'border-1.5 border-red-500 rounded-md',
                                                'p-3 border-0.5 border-gray-100 min-h-[92px]'
                                            ]"
                                            @click="!isDailyScheduleCopiedEmpty() && (employee?.uuid !== state.copy.selectedEmployeeDailySchedule.employee?.uuid || day.format('YYYY-MM-DD') !== state.copy.selectedEmployeeDailySchedule.date) && pasteEmployeeDailySchedule(employeeIndex, day)">
                                            <div class="space-y-2" v-if="!isDailyScheduleCopied(employee, day)">
                                                <div class="flex justify-end gap-2"
                                                    v-if="hasCreatePermission || isAdmin(userStore.getUser?.role)">
                                                    <Menu as="div"
                                                        class="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center">
                                                        <div>
                                                            <MenuButton
                                                                class="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                                                                <Tooltip position="left" :text="`
                                                                        ${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests} ${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests <= 1 ? $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequest') : $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')} | 
                                                                        ${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests} ${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests === 1 ? $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequest') : $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')}
                                                                        `"
                                                                    v-if="state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests > 0 || state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests > 0"
                                                                    class="relative">
                                                                    <button
                                                                        class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center">
                                                                        <Icon name="mdi:calendar-question-outline"
                                                                            class="h-3 w-3" aria-hidden="true" />
                                                                    </button>
                                                                    <div
                                                                        class="w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1">
                                                                    </div>
                                                                </Tooltip>
                                                            </MenuButton>
                                                        </div>
                                                        <transition
                                                            enter-active-class="transition ease-out duration-100"
                                                            enter-from-class="transform opacity-0 scale-95"
                                                            enter-to-class="transform opacity-100 scale-100"
                                                            leave-active-class="transition ease-in duration-75"
                                                            leave-from-class="transform opacity-100 scale-100"
                                                            leave-to-class="transform opacity-0 scale-95">
                                                            <MenuItems
                                                                class="absolute right-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                <div class="py-1">
                                                                    <MenuItem v-slot="{ active }">
                                                                    <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs cursor-pointer']"
                                                                        @click="viewChangeTimeRequests(employeeIndex, day)">
                                                                        {{
                                                                            $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')
                                                                        }}
                                                                    </a>
                                                                    </MenuItem>
                                                                    <MenuItem v-slot="{ active }">
                                                                    <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs cursor-pointer']"
                                                                        @click="viewSwapScheduleRequests(employeeIndex, day)">
                                                                        {{
                                                                            $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')
                                                                        }}
                                                                    </a>
                                                                    </MenuItem>
                                                                </div>
                                                            </MenuItems>
                                                        </transition>
                                                    </Menu>
                                                    <Tooltip position="left" :text="$t('dutySchedules.copy.copy')">
                                                        <button
                                                            class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                            @click="copyEmployeeDailySchedule(employee, day)">
                                                            <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip position="left" :text="$t('dutySchedules.newSchedule')">
                                                        <button
                                                            class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200"
                                                            @click="openAddNewShiftModal(employee, employeeIndex, day)">
                                                            +
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                                <div class="text-xs">
                                                    <div v-for="(shift, shiftIndex) in sortMultiDayShiftsFirst(state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.shifts)"
                                                        :key="shiftIndex" :class="[
                                                            'rounded-md p-1 relative mb-2.5'
                                                        ]" :style="{
                                                            backgroundColor: `${shift?.type?.color}`,
                                                        }">
                                                        <div class="absolute -left-1 -top-1 z-10 w-4 h-4 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center text-xxs"
                                                            v-if="shift?.type?.system_name === 'sick-leave'">
                                                            S
                                                        </div>
                                                        <div class="flex justify-between text-white cursor-pointer"
                                                            @click="(hasUpdatePermission || isAdmin(userStore.getUser?.role)) ? editSchedule(employee, employeeIndex, shift) : viewSchedule(employeeIndex, shift)">
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
                                                            <p v-if="shift?.shift_span_position === 'start'">{{
                                                                $t('dutySchedules.shiftSpan.start') }}</p>
                                                            <p v-if="shift?.shift_span_position === 'middle'">{{
                                                                $t('dutySchedules.shiftSpan.middle') }}</p>
                                                            <p v-if="shift?.shift_span_position === 'end'">{{
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
                                                                v-for="(tag, tagIndex) in shift?.tags" :key="tagIndex">
                                                                <div class="text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center"
                                                                    :style="{ backgroundColor: tag?.color }">
                                                                    <span v-if="tag?.tag">
                                                                        {{ tag?.tag?.charAt(0) }}
                                                                    </span>
                                                                </div>
                                                            </Tooltip>
                                                        </div>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            @click="removeShiftConfirmation(shift)"
                                                            v-if="hasDeletePermission || isAdmin(userStore.getUser?.role)">
                                                            <Tooltip position="left"
                                                                :text="$t('dutySchedules.removeSchedule.removeSchedule')">
                                                                <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                            </Tooltip>
                                                        </button>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            v-else v-if="userStore.getUser?.uuid === employee?.uuid">
                                                            <Menu as="div"
                                                                class="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center">
                                                                <div>
                                                                    <MenuButton
                                                                        class="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                                                                        <Tooltip position="left"
                                                                            :text="$t('dutySchedules.scheduleRequests.newRequest')">
                                                                            <Icon name="ic:baseline-question-mark"
                                                                                class="h-2.5 w-2.5"
                                                                                aria-hidden="true" />
                                                                        </Tooltip>
                                                                    </MenuButton>
                                                                </div>
                                                                <transition
                                                                    enter-active-class="transition ease-out duration-100"
                                                                    enter-from-class="transform opacity-0 scale-95"
                                                                    enter-to-class="transform opacity-100 scale-100"
                                                                    leave-active-class="transition ease-in duration-75"
                                                                    leave-from-class="transform opacity-100 scale-100"
                                                                    leave-to-class="transform opacity-0 scale-95">
                                                                    <MenuItems
                                                                        class="absolute right-0 z-10 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                        <div class="py-1">
                                                                            <MenuItem v-slot="{ active }">
                                                                            <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs']"
                                                                                @click="requestTimeAdjustment(employeeIndex, shift)">
                                                                                {{
                                                                                    $t('dutySchedules.scheduleRequests.changeTime.requestAChange')
                                                                                }}
                                                                            </a>
                                                                            </MenuItem>
                                                                            <MenuItem v-slot="{ active }">
                                                                            <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs']"
                                                                                @click="requestSwapSchedule(shift)">
                                                                                {{
                                                                                    $t('dutySchedules.scheduleRequests.swapSchedule.swapThisShift')
                                                                                }}
                                                                            </a>
                                                                            </MenuItem>
                                                                        </div>
                                                                    </MenuItems>
                                                                </transition>
                                                            </Menu>
                                                        </button>
                                                    </div>
                                                    <ModulesUserDutyScheduleScheduleSlotsRequestAvailableSlots
                                                        :daysData="state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]"
                                                        :employee="employee"
                                                        @error="(error: any) => state.error = error" />
                                                </div>
                                            </div>
                                            <div class="flex flex-col items-center space-y-2 mt-3 cursor-pointer"
                                                @click="stopCopying()" v-if="isDailyScheduleCopied(employee, day)">
                                                <p class="text-center text-sm">
                                                    {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                                </p>
                                                <p class="text-center text-xxs">
                                                    {{
                                                        $t('dutySchedules.copyPaste.clickHereToStopCopyingTheSchedule')
                                                    }}
                                                </p>
                                            </div>
                                            <div class="absolute inset-0 bg-primary bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                v-if="!isDailyScheduleCopiedEmpty() &&
                                                    (employee?.uuid !== state.copy.selectedEmployeeDailySchedule.employee?.uuid || day.format('YYYY-MM-DD') !== state.copy.selectedEmployeeDailySchedule.date)">
                                                <p class="text-white text-xs text-center">
                                                    {{
                                                        $t('dutySchedules.copyPaste.clickHereToPasteTheSchedule')
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-5">
                    <Pagination :data="state.monthlySchedules" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesUserDutyScheduleModalFilter :isModalOpen="state.modal.isFilterDutyScheduleOpen"
                @close="state.modal.isFilterDutyScheduleOpen = false" @setFilter="setFilter" />
            <ModulesUserDutyScheduleNormHoursModalCompensatoryHours :isModalOpen="state.modal.isCompensatoryHoursOpen"
                :selectedEmployee="state.normHours.selectedEmployeeSchedule"
                @close="state.modal.isCompensatoryHoursOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalInfo :isModalOpen="state.modal.isAnnualNormHoursInfoOpen"
                @close="state.modal.isAnnualNormHoursInfoOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalVacationHours :isModalOpen="state.modal.isVacationHoursOpen"
                :selectedEmployee="state.normHours.selectedEmployeeSchedule"
                @close="state.modal.isVacationHoursOpen = false" />
            <ModulesUserDutyScheduleModalNewShift :isModalOpen="state.modal.isAddShiftOpen"
                :isModalLoading="state.isModalLoading" :error="state.newShiftError"
                :selectedDate="state.newShift.selectedDate" :selectedEmployee="state.newShift.selectedEmployee"
                :showWarningDialog="state.showWarningDialog" :shiftWarnings="state.shiftWarnings"
                @dateTimeChange="dateTimeChange" @closeWarningDialog="closeWarningDialog"
                @close="state.modal.isAddShiftOpen = false" @saveShift="saveShift"
                @resetNewShiftError="state.newShiftError = {}" />
            <ModulesUserDutyScheduleModalEditShift :isModalLoading="state.isModalLoading"
                :isModalOpen="state.modal.isEditShiftOpen" :error="state.editShiftError"
                :selectedEmployee="state.editShift.selectedEmployee"
                :selectedEmployeeSchedule="state.editShift.selectedEmployeeSchedule"
                :showWarningDialog="state.showWarningDialog" :shiftWarnings="state.shiftWarnings"
                @dateTimeChange="dateTimeChange" @closeWarningDialog="closeWarningDialog"
                @close="state.modal.isEditShiftOpen = false" @resetEditShiftError="state.editShiftError = {}"
                @updateShift="updateSelectedSchedule" />
            <ModulesUserDutyScheduleModalRemoveShiftConfirmation
                :isModalOpen="state.modal.isRemoveShiftConfirmationOpen"
                @close="state.modal.isRemoveShiftConfirmationOpen = false" @confirm="removeShift" />
            <ModulesUserDutyScheduleModalRemoveShiftSpanConfirmation
                :isModalOpen="state.modal.isRemoveShiftSpanConfirmationOpen"
                @close="state.modal.isRemoveShiftSpanConfirmationOpen = false" @confirm-single="removeShift"
                @confirm-entire="removeEntireShiftSpan" />
            <ModulesUserDutyScheduleModalViewShift :isModalOpen="state.modal.isViewShiftOpen"
                :selectedEmployeeSchedule="state.viewShift.selectedEmployeeSchedule"
                @close="state.modal.isViewShiftOpen = false" />
            <ModulesUserDutyScheduleExtraHoursModalView :isModalOpen="state.modal.isManageExtraHoursOpen"
                :selectedEmployee="state.manageExtraHours.selectedEmployee"
                @close="state.modal.isManageExtraHoursOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
            <ModulesUserDutyScheduleLeaveRequestsModalView :isModalOpen="state.modal.isManageLeaveRequestsOpen"
                :selectedEmployee="state.manageLeaveRequests.selectedEmployee"
                @close="state.modal.isManageLeaveRequestsOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
            <ModulesUserDutyScheduleTimeRequestsModalRequests
                :isModalOpen="state.modal.isManageTimeAdjustmentRequestsOpen"
                :selectedDate="state.manageTimeRequest.selectedDate"
                :selectedEmployee="state.manageTimeRequest.selectedEmployee"
                @close="state.modal.isManageTimeAdjustmentRequestsOpen = false"
                @refreshDutySchedules="fetchDutySchedule()" />
            <ModulesUserDutyScheduleSwapScheduleModalRequests
                :isModalOpen="state.modal.isManageSwapScheduleRequestsOpen"
                :selectedDate="state.manageSwapScheduleRequest.selectedDate"
                :selectedEmployee="state.manageSwapScheduleRequest.selectedEmployee"
                @close="state.modal.isManageSwapScheduleRequestsOpen = false"
                @refreshDutySchedules="fetchDutySchedule()" />
            <ModulesUserDutyScheduleTimeRequestsModalNewRequest :isModalOpen="state.modal.isRequestTimeAdjustmentOpen"
                :selectedEmployee="state.manageTimeRequest.selectedEmployee"
                :selectedSchedule="state.manageTimeRequest.selectedSchedule"
                @close="state.modal.isRequestTimeAdjustmentOpen = false" />
            <ModulesUserDutyScheduleSwapScheduleModalNewRequest :isModalOpen="state.modal.isRequestSwapScheduleOpen"
                :selectedSchedule="state.manageSwapScheduleRequest.selectedSchedule"
                @close="state.modal.isRequestSwapScheduleOpen = false" />
            <ModulesUserDutyScheduleScheduleSlotsModalScheduleSlots :isModalOpen="state.modal.isManageScheduleSlotOpen"
                :selectedDay="state.manageScheduleSlot.selectedDay"
                @close="state.modal.isManageScheduleSlotOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
            <ModulesUserDutyScheduleModalCopyMultipleWeeks :isModalOpen="state.modal.isCopyMultipleWeeklyScheduleOpen"
                @close="state.modal.isCopyMultipleWeeklyScheduleOpen = false"
                @refreshDutySchedules="fetchDutySchedule()" />
            <ModulesUserDutyScheduleNormHoursModalGraph :isModalOpen="state.modal.isGraphOpen"
                :selectedEmployee="state.normHours.selectedEmployee" @close="state.modal.isGraphOpen = false" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useDepartmentStore } from '@/store/department'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useDutyScheduleStore } from '@/store/duty-schedule'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const emit = defineEmits(['setDutyScheduleCurrentDate', 'setDutyScheduleCurrentFilter'])
const language = useI18n()
const dutyScheduleStore = useDutyScheduleStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore()
const { formatNumber } = useNumberFormatter()

const currentDate = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))
const expandedRecords = reactive([] as boolean[])

const daysInMonth = computed(() => moment(currentDate.value).daysInMonth())
const monthDays = computed(() => {
    const start = moment(currentDate.value).startOf('month')
    return Array.from({ length: daysInMonth.value }, (_, i) => start.clone().add(i, 'day'))
})

let lastScrollTop = 0
const headerHeight = 395  // The height of the header

const state = reactive({
    addShift: {
        selectedEmployeeSchedule: {},
    } as any,
    copy: {
        allEmployeeSchedules: {},
        selectedEmployeeDailySchedule: {},
    } as any,
    copyShiftError: {} as Error,
    customWeekLabel: 'month',
    dataFilter: {
        search: '',
    },
    editShiftError: {} as Error,
    editShift: {
        selectedEmployee: {},
        selectedEmployeeSchedule: {},
    } as any,
    error: {} as Error,
    filter: {
        department_uuids: [],
        employment_status: [],
        employee_uuids: [],
    },
    isPageLoading: false,
    isModalLoading: false,
    manageScheduleSlot: {
        selectedDay: [],
    },
    manageExtraHours: {
        selectedEmployee: {},
        selectedSchedule: {},
    },
    manageLeaveRequests: {
        selectedEmployee: {},
    },
    manageTimeRequest: {
        selectedDate: '',
        selectedEmployee: {},
        selectedSchedule: {},
    },
    manageSwapScheduleRequest: {
        selectedDate: '',
        selectedEmployee: {},
        selectedSchedule: {},
    },
    modal: {
        isAddShiftOpen: false,
        isCompensatoryHoursOpen: false,
        isCopyMultipleWeeklyScheduleOpen: false,
        isDepartmentSickLeaveDateRangeOpen: false,
        isEditShiftOpen: false,
        isFilterDutyScheduleOpen: false,
        isManageExtraHoursOpen: false,
        isManageLeaveRequestsOpen: false,
        isManageScheduleSlotOpen: false,
        isManageTimeAdjustmentRequestsOpen: false,
        isManageSwapScheduleRequestsOpen: false,
        isRemoveShiftConfirmationOpen: false,
        isRemoveShiftSpanConfirmationOpen: false,
        isRequestTimeAdjustmentOpen: false,
        isRequestSwapScheduleOpen: false,
        isVacationHoursOpen: false,
        isViewShiftOpen: false,
        isAnnualNormHoursInfoOpen: false,
        isGraphOpen: false,
    } as any,
    newShift: {
        selectedDate: '',
        selectedEmployee: {},
    },
    newShiftError: {} as Error,
    normHours: {
        selectedEmployeeSchedule: {},
        selectedEmployee: {} as any,
    },
    progress: {
        percentage: 100,
        pendingRequests: 0,
        showProgressBar: false,
        totalRequests: 0,
    },
    removeShift: {
        selectedShift: {},
    } as any,
    selectedDate: moment().format('YYYY-MM-DD'),
    showAllShifts: false,
    showAllShiftTypes: false,
    showEmployeesWorkingToday: false,
    shiftPercentage: {} as any,
    shiftDateRange: {
        formDateRange: {
            start_date: moment().startOf('month'),
            end_date: moment().endOf('month'),
        },
    } as any,
    sortData: {
        sortField: 'firstname',
        sortOrder: 'ascend',
    },
    isUpdateShift: false,
    viewShift: {
        selectedEmployeeSchedule: {},
    } as any,
    monthlySchedules: [] as any,
    shiftWarnings: [] as any,
    showWarningDialog: false,
})

const hasCreatePermission = computed(() => {
    return !!userStore.user?.permissions?.find((permission: any) => permission.name === 'create_schedule')
})

const hasUpdatePermission = computed(() => {
    return !!userStore.user?.permissions?.find((permission: any) => permission.name === 'update_schedule')
})

const hasDeletePermission = computed(() => {
    return !!userStore.user?.permissions?.find((permission: any) => permission.name === 'delete_schedule')
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
        dutyScheduleStore.setCurrentPageNumber(1)
        fetchDutySchedule()
    }
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        currentDate.value = moment(newSelectedDate)
        fetchDutySchedule()
        emit('setDutyScheduleCurrentDate', state.selectedDate)
    }
})

watch(() => dutyScheduleStore.getShowEmployeesWorkingToday, (status: boolean) => {
    dutyScheduleStore.setShowEmployeesWorkingToday(status)
    fetchDutySchedule()
})

watch(() => state.monthlySchedules, (newSchedules) => {
    // Update the expanded records only if the number of records changes.
    if (newSchedules && newSchedules.data.length !== expandedRecords.length) {
        expandedRecords.splice(0, expandedRecords.length, ...newSchedules.data.map(() => true))
    }
})

watch(() => state.monthlySchedules, (newSchedules) => {
    // reset map
    for (const k of Object.keys(employeeShiftsByDate)) delete employeeShiftsByDate[k]
    if (!newSchedules?.data) return

    for (const employee of newSchedules.data) {
        employeeShiftsByDate[employee.uuid] = {}

        const dayItems = coerceToDayArray(employee)

        for (const d of dayItems) {
            // Try to locate the date string
            const dateKey =
                d?.date ??
                d?.full_date ??
                d?.day ??
                d?.date_key

            if (!dateKey) continue

            // shifts could be on d.shifts, or nested
            const shifts =
                (Array.isArray(d?.shifts) ? d.shifts : null) ??
                (Array.isArray(d?.data?.shifts) ? d.data.shifts : null) ??
                []

            employeeShiftsByDate[employee.uuid][dateKey] = shifts
        }
    }
}, { deep: true })

onMounted(() => {
    fetchDutySchedule()
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll)
    const scrollContainer = document.getElementById('month-view-scroll-container')
    scrollContainer?.addEventListener('scroll', handleHorizontalScroll)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('scroll', handleScroll)
    const scrollContainer = document.getElementById('month-view-scroll-container')
    scrollContainer?.removeEventListener('scroll', handleHorizontalScroll)
})

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        stopCopying()
    }
}

function handleScroll() {
    const wrapper = document.getElementById('fixed-header-month-view-wrapper')
    const header = document.getElementById('fixed-header-month-view')
    const scrollContainer = document.getElementById('month-view-scroll-container')
    const stickyCell = document.getElementById('fixed-header-sticky-cell')
    if (!wrapper || !header || !scrollContainer) return

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop

    if (currentScroll > headerHeight) {
        wrapper.classList.add('fixed-header-month-view-top')
        const scrollLeft = scrollContainer.scrollLeft
        header.style.transform = `translateX(-${scrollLeft}px)`
        if (stickyCell) stickyCell.style.transform = `translateX(${scrollLeft}px)` // counter the grid's shift
    } else {
        wrapper.classList.remove('fixed-header-month-view-top')
        header.style.transform = ''
        if (stickyCell) stickyCell.style.transform = ''
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll
}

function handleHorizontalScroll() {
    const wrapper = document.getElementById('fixed-header-month-view-wrapper')
    const header = document.getElementById('fixed-header-month-view')
    const scrollContainer = document.getElementById('month-view-scroll-container')
    const stickyCell = document.getElementById('fixed-header-sticky-cell')
    if (!wrapper || !header || !scrollContainer) return

    if (wrapper.classList.contains('fixed-header-month-view-top')) {
        const scrollLeft = scrollContainer.scrollLeft
        header.style.transform = `translateX(-${scrollLeft}px)`
        if (stickyCell) stickyCell.style.transform = `translateX(${scrollLeft}px)` // counter the grid's shift
    }
}

function isAdmin(role: any) {
    return role && role === 'Admin'
}

function sortMultiDayShiftsFirst(shifts: any) {
    if (!Array.isArray(shifts)) return []
    const sortedShifts = shifts.sort((a: any, b: any) => {
        const aMultiDay =
            moment(a.date_time_end).startOf('day').diff(moment(a.date_time_start).startOf('day'), 'days') >= 1
        const bMultiDay =
            moment(b.date_time_end).startOf('day').diff(moment(b.date_time_start).startOf('day'), 'days') >= 1

        if (aMultiDay && !bMultiDay) return -1
        if (!aMultiDay && bMultiDay) return 1
        return 0
    })
    return sortedShifts
}

const employeeShiftsByDate = reactive<Record<string, Record<string, any[]>>>({})

function coerceToDayArray(employee: any): any[] {
    // 1) If backend gives an array already
    if (Array.isArray(employee?.days)) return employee.days
    if (Array.isArray(employee?.weeks)) return employee.weeks

    // 2) If backend gives an object keyed by day/date
    // Example shapes:
    // employee.weeks = { "2026-02-01": {...}, "2026-02-02": {...} }
    // employee.weeks = { monday: {...}, tuesday: {...}, ... }
    if (employee?.days && typeof employee.days === 'object') return Object.values(employee.days)
    if (employee?.weeks && typeof employee.weeks === 'object') return Object.values(employee.weeks)

    // 3) Sometimes the day array is nested
    if (Array.isArray(employee?.data?.days)) return employee.data.days
    if (Array.isArray(employee?.data?.weeks)) return employee.data.weeks

    return []
}

async function fetchDutySchedule() {
    state.error = {}
    state.progress.totalRequests++
    state.progress.pendingRequests++
    identifyTheProgressPercentage()

    try {
        const start = moment(currentDate.value).startOf('month').format('YYYY-MM-DD')
        const end = moment(currentDate.value).endOf('month').format('YYYY-MM-DD')

        const params = {
            page: dutyScheduleStore.getCurrentPageNumber,
            page_length: dutyScheduleStore.getCurrentPageLength,
            date_start: start,
            date_end: end,
            filter_date_start: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            filter_date_end: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
            show_employees_working_today: dutyScheduleStore.getShowEmployeesWorkingToday,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        } as any

        if (state.filter.department_uuids?.length > 0) params.department_uuids = Array(state.filter.department_uuids)
        if (state.filter.employment_status) params.employment_status = Array(state.filter.employment_status)
        if (state.filter.employee_uuids?.length > 0) params.employee_uuids = Array(state.filter.employee_uuids)

        const response = await dutyScheduleService.getDutySchedulesMonthView(params)
        if (response) {
            state.monthlySchedules = response
            state.progress.totalRequests--
            state.progress.pendingRequests--
            identifyTheProgressPercentage()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
    }

    state.isPageLoading = false
}

function getEmployeeShiftsForDate(employee: any, dateKey: string) {
    return employeeShiftsByDate?.[employee.uuid]?.[dateKey] ?? []
}

function setFilter(filter: any) {
    state.filter.department_uuids = filter.department_uuids
    state.filter.employment_status = filter.employment_status
    state.filter.employee_uuids = filter.employee_uuids
    emit('setDutyScheduleCurrentFilter', state.filter)
    fetchDutySchedule()
}

function sortDutySchedule() {
    if (state.sortData.sortOrder === 'ascend') {
        state.sortData.sortOrder = 'descend'
    } else {
        state.sortData.sortOrder = 'ascend'
    }
    fetchDutySchedule()
}

function handleSearch(value: any) {
    dutyScheduleStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDutySchedule()
}

function previous() {
    const currentTablePage = dutyScheduleStore.getCurrentPageNumber - 1
    dutyScheduleStore.setCurrentPageNumber(currentTablePage)
    fetchDutySchedule()
}

function next() {
    const currentTablePage = dutyScheduleStore.getCurrentPageNumber + 1
    dutyScheduleStore.setCurrentPageNumber(currentTablePage)
    fetchDutySchedule()
}

function changePageLength(event: any) {
    dutyScheduleStore.setCurrentPageNumber(1)
    dutyScheduleStore.setCurrentPageLength(event.target.value)
    fetchDutySchedule()
}

function getSlotCount(date: string) {
    return state.monthlySchedules?.month_data?.[date]?.total_slots || 0
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

function previousMonth() {
    state.customWeekLabel = 'month'
    currentDate.value = moment(currentDate.value).subtract(1, 'month')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDutySchedule()
}

function setToday() {
    state.customWeekLabel = 'month'
    currentDate.value = moment()
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDutySchedule()
}

function nextMonth() {
    state.customWeekLabel = 'month'
    currentDate.value = moment(currentDate.value).add(1, 'month')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
    fetchDutySchedule()
}

function hasConflict(shifts: any) {
    const hasConflict = shifts?.some((shift: any) => shift.is_conflict === true)
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

function openAddNewShiftModal(employee: any, employeeIndex: number, day: any) {
    state.modal.isAddShiftOpen = true
    state.addShift.selectedEmployeeSchedule = {
        employeeIndex: employeeIndex,
    }
    state.newShift.selectedDate = moment(day).format('YYYY-MM-DD')
    state.newShift.selectedEmployee = employee
}

function openManageScheduleSlotModal(day: any) {
    state.manageScheduleSlot.selectedDay = {
        fullDate: day
    }
    state.modal.isManageScheduleSlotOpen = true
}

function viewChangeTimeRequests(employeeIndex: number, day: any) {
    const selectedEmployee = state.monthlySchedules?.data?.[employeeIndex]
    const selectedDate = moment(day).format('YYYY-MM-DD')
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedDate = selectedDate
    state.modal.isManageTimeAdjustmentRequestsOpen = true
}

function requestTimeAdjustment(employeeIndex: number, shift: any) {
    const selectedEmployee = state.monthlySchedules?.data?.[employeeIndex]
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedSchedule = shift
    state.modal.isRequestTimeAdjustmentOpen = true
}

function viewSwapScheduleRequests(employeeIndex: number, day: any) {
    const selectedEmployee = state.monthlySchedules?.data?.[employeeIndex]
    const selectedDate = moment(day).format('YYYY-MM-DD')
    state.manageSwapScheduleRequest.selectedEmployee = selectedEmployee
    state.manageSwapScheduleRequest.selectedDate = selectedDate
    state.modal.isManageSwapScheduleRequestsOpen = true
}

function requestSwapSchedule(shift: any) {
    state.manageSwapScheduleRequest.selectedSchedule = shift
    state.modal.isRequestSwapScheduleOpen = true
}

async function pinSelfToTopOfSchedule() {
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.pinSelfToTopOfSchedule()
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDutySchedule()
            userStore.setUserIsSchedulePinned(!userStore.getUser?.is_schedule_pinned)
        }
    } catch (error: any) {
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
        state.error = error
    }
}

async function saveShift(shiftDetails: any) {
    const employeeIndex = state.addShift.selectedEmployeeSchedule.employeeIndex
    const shiftType = shiftDetails.shift_type
    const params = {
        shift_type_uuid: shiftType,
        is_sleeping_sick_leave: shiftDetails.is_sleeping_sick_leave,
        do_not_count_weekends: shiftDetails.do_not_count_weekends,
        date_time_start: shiftDetails.date_time_start,
        date_time_end: shiftDetails.date_time_end,
        user_uuid: state.monthlySchedules?.data?.[employeeIndex].uuid,
        citizen_uuid: shiftDetails?.citizens,
        schedule_tag_uuid: shiftDetails.schedule_tag_uuid,
        department_uuid: shiftDetails.department_uuid,
        use_compensatory_time: shiftDetails.use_compensatory_time,
        note: shiftDetails.note,
        do_not_count_sick_leave: shiftDetails.do_not_count_sick_leave,
        is_recurring: shiftDetails.recurring.is_recurring,
        recurring: shiftDetails.recurring.recurring,
        recurring_until: shiftDetails.recurring.recurring_until,
    } as any
    if (shiftDetails.recurring.recurring === 'custom') {
        params.frequency = shiftDetails.recurring.frequency
        params.every = shiftDetails.recurring.every
        if (shiftDetails.recurring.frequency === 'weekly') {
            params.weekly_on = shiftDetails.recurring.weekly_on
        } else if (shiftDetails.recurring.frequency === 'monthly') {
            params.monthly_on_the_enabled = shiftDetails.recurring.monthly_on_the_enabled
            if (!shiftDetails.recurring.monthly_on_the_enabled) {
                params.monthly_each = shiftDetails.recurring.monthly_each
            } else {
                params.monthly_on_the_sequence = shiftDetails.recurring.monthly_on_the_sequence
                params.monthly_on_the_day = shiftDetails.recurring.monthly_on_the_day
            }
        } else if (shiftDetails.recurring.frequency === 'yearly') {
            params.yearly_in_months = shiftDetails.recurring.yearly_in_months
            if (shiftDetails.recurring.yearly_on_the_enabled) {
                params.yearly_on_the_sequence = shiftDetails.recurring.yearly_on_the_sequence
                params.yearly_on_the_day = shiftDetails.recurring.yearly_on_the_day
            }
        }
    }
    saveDutySchedule(params)
}

async function saveDutySchedule(params: object) {
    try {
        state.isModalLoading = true
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.saveDutySchedule(params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDutySchedule()
            state.modal.isAddShiftOpen = false
            setTimeout(() => {
                state.isModalLoading = false
            }, 300)
        }
    } catch (error: any) {
        state.newShiftError = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
        state.isModalLoading = false
    }
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

function isDailyScheduleCopiedEmpty() {
    return Object.keys(state.copy.selectedEmployeeDailySchedule).length === 0
}

function isDailyScheduleCopied(employee: any, day: any) {
    return employee?.uuid === state.copy.selectedEmployeeDailySchedule.employee?.uuid &&
        moment(day).format('YYYY-MM-DD') === state.copy.selectedEmployeeDailySchedule.date &&
        dutyScheduleStore.getCurrentPageNumber === state.copy.selectedEmployeeDailySchedule.currentTablePage
}

function copyEmployeeDailySchedule(employee: any, day: any) {
    state.copy.selectedEmployeeDailySchedule = {
        employee: employee,
        date: moment(day).format('YYYY-MM-DD'),
        currentTablePage: dutyScheduleStore.getCurrentPageNumber,
    }
}

function stopCopying() {
    state.copy.allEmployeeSchedules = {}
    state.copy.selectedEmployeeDailySchedule = {}
    state.copy.selectedEmployeeWeeklySchedule = {}
}

async function pasteEmployeeDailySchedule(employeeIndex: number, day: any) {
    const userSourceUuid = state.copy.selectedEmployeeDailySchedule.employee?.uuid
    const dateSource = state.copy.selectedEmployeeDailySchedule?.date
    const userDestinationUuid = state.monthlySchedules?.data?.[employeeIndex]?.uuid
    const dateDestination = moment(day).format('YYYY-MM-DD')
    const params = {
        user_uuid_source: userSourceUuid,
        user_uuid_destination: userDestinationUuid,
        date_source: dateSource,
        date_destination: dateDestination,
    }
    copyDutySchedule(params)
}

async function copyDutySchedule(params: object) {
    state.copyShiftError = {}
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.saveDutySchedule(params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDutySchedule()
            state.modal.isAddShiftOpen = false
        }
    } catch (error: any) {
        state.copyShiftError = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
}

function viewExtraHours(employee: any) {
    state.manageExtraHours.selectedEmployee = employee
    state.modal.isManageExtraHoursOpen = true
}

function viewLeaveRequests(employee: any) {
    state.manageLeaveRequests.selectedEmployee = employee
    state.modal.isManageLeaveRequestsOpen = true
}

function removeShiftConfirmation(shift: any) {
    state.removeShift.selectedShift = shift
    if (shift.shift_span_position !== 'single') {
        state.modal.isRemoveShiftSpanConfirmationOpen = true
        return
    }
    state.modal.isRemoveShiftConfirmationOpen = true
}

async function removeShift() {
    const scheduleUuid = state.removeShift.selectedShift.schedule_uuid
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.deleteDutySchedule(scheduleUuid)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDutySchedule()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
}

async function removeEntireShiftSpan() {
    const scheduleUuid = state.removeShift.selectedShift.schedule_uuid
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const params = {
            delete_entire_shift: true
        }
        const response = await dutyScheduleService.deleteDutySchedule(scheduleUuid, params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDutySchedule()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
}

function viewSchedule(employeeIndex: number, shift: any) {
    const userUuid = state.monthlySchedules?.data?.[employeeIndex].uuid
    state.viewShift.selectedEmployeeSchedule = {
        citizen_schedules: shift?.citizen_schedules,
        scheduleUuid: shift?.schedule_uuid,
        date_time_start: shift?.date_time_start,
        date_time_end: shift?.date_time_end,
        user_uuid: userUuid,
        shift_type: shift?.type,
        tags: shift?.tags,
        departments: shift?.departments,
        note: shift?.note,
        employeeIndex: employeeIndex,
    }
    state.modal.isViewShiftOpen = true
}

function editSchedule(employee: any, employeeIndex: number, shift: any) {
    const userUuid = employee.uuid
    state.editShift.selectedEmployee = employee
    state.editShift.selectedEmployeeSchedule = {
        citizen_schedules: shift?.citizen_schedules,
        scheduleUuid: shift?.schedule_uuid,
        date_time_start: shift?.date_time_start,
        date_time_end: shift?.date_time_end,
        recurring: {
            is_recurring: shift?.is_recurring
        },
        user_uuid: userUuid,
        shift_type: shift?.type,
        tags: shift?.tags,
        departments: shift?.departments,
        note: shift?.note,
        do_not_count_sick_leave: shift?.do_not_count_sick_leave,
        use_compensatory_time: shift?.use_compensatory_time,
    }
    state.modal.isEditShiftOpen = true
}

function updateSelectedSchedule(shiftDetails: any) {
    const scheduleUuid = state.editShift.selectedEmployeeSchedule.scheduleUuid
    const params = {
        shift_type_uuid: shiftDetails.shift_type,
        is_sleeping_sick_leave: shiftDetails.is_sleeping_sick_leave,
        do_not_count_weekends: shiftDetails.do_not_count_weekends,
        date_time_start: shiftDetails?.date_time_start,
        date_time_end: shiftDetails?.date_time_end,
        is_apply_to_all: shiftDetails?.recurring?.is_apply_to_all,
        user_uuid: state.editShift.selectedEmployeeSchedule.user_uuid,
        citizen_uuid: shiftDetails.citizens,
        schedule_tag_uuid: shiftDetails.schedule_tag_uuid,
        department_uuid: shiftDetails.department_uuid,
        note: shiftDetails.note,
        do_not_count_sick_leave: shiftDetails.do_not_count_sick_leave,
        use_compensatory_time: shiftDetails.use_compensatory_time,
    }
    updateDutySchedule(scheduleUuid, params)
}

async function updateDutySchedule(scheduleUuid: any, params: object) {
    state.isUpdateShift = true
    state.editShiftError = {}
    try {
        state.isModalLoading = true
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.updateDutySchedule(scheduleUuid, params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            state.modal.isEditShiftOpen = false
            identifyTheProgressPercentage()
            fetchDutySchedule()
        }
    } catch (error: any) {
        state.editShiftError = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    } finally {
        state.isUpdateShift = false
        fetchDutySchedule()
        setTimeout(() => {
            state.isModalLoading = false
        }, 300)
    }
}

function isPreviousMonthDisabled() {
    if (!isAdmin(userStore.getUser?.role) && userStore.getUser?.company?.is_lock_past_schedules) {
        const thisMonthStart = moment().startOf('month')
        const selectedMonthStart = moment(state.selectedDate).startOf('month')
        if (selectedMonthStart.isSame(thisMonthStart, 'month')) return true
    }
    return false
}

async function dateTimeChange(employeeUuid: string, newDateTimeStart: string, newDateTimeEnd: string) {
    try {
        const params = {
            date_time_start: newDateTimeStart,
            date_time_end: newDateTimeEnd,
            user_uuid: employeeUuid,
        }
        const response = await dutyScheduleService.scheduleValidation(params)
        if (response.data && !response.data.valid) {
            state.shiftWarnings = response.data.warnings
            state.showWarningDialog = true
        }
    } catch (error: any) { }
}

function closeWarningDialog() {
    state.showWarningDialog = false
    state.shiftWarnings = []
}

function openGraphModal(employee: any) {
    state.normHours.selectedEmployee = employee
    state.modal.isGraphOpen = true
}
</script>