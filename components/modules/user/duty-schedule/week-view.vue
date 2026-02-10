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
                                <button @click="!isPreviousWeekDisabled() && previousWeek()" type="button" :class="[
                                    isPreviousWeekDisabled() && 'cursor-not-allowed',
                                    'flex h-11 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50'
                                ]" :disabled="isPreviousWeekDisabled()">
                                    <span class="sr-only">Previous week</span>
                                    <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                                </button>
                                <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                    :disablePreviousWeeks="!isAdmin(userStore.getUser?.role)" dateType="duty-schedule"
                                    v-model="state.selectedDate" />
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
                    <div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="dutyScheduleStore.getShowEmployeesWorkingToday"
                                @toggleSwitch="dutyScheduleStore.setShowEmployeesWorkingToday(!dutyScheduleStore.getShowEmployeesWorkingToday)" />
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
                        <div>
                            <div>
                                <div class="grid grid-cols-9" id="fixed-header-week-view">
                                    <div class="col-span-2 border-0.5">
                                        <div class="flex items-center gap-x-3 px-3 pt-3">
                                            <p class="text-sm font-medium">
                                                {{ $t('dutySchedules.week') }} {{ weekNumber }}
                                            </p>
                                            <Tooltip :text="$t('dutySchedules.copy.copyThisWeeksSchedule')">
                                                <button
                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                    @click="copyWeeklySchedule(weekNumber)">
                                                    <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                                                </button>
                                            </Tooltip>
                                            <div class="flex-1 flex justify-end gap-x-2"
                                                v-if="isAdmin(userStore.getUser?.role)">
                                                <Tooltip :text="$t('dutySchedules.copy.copyMultipleWeeksSchedule')">
                                                    <button
                                                        class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                        @click="state.modal.isCopyMultipleWeeklyScheduleOpen = true">
                                                        <Icon name="mdi:content-copy" class="h-3 w-3"
                                                            aria-hidden="true" />
                                                    </button>
                                                </Tooltip>
                                            </div>
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
                                        v-for="day in weekDays" :key="day.date"
                                        class="relative cursor-pointer hover:bg-gray-200 flex items-center justify-center py-4 border-0.5"
                                        @click="openManageScheduleSlotModal(day)"
                                        v-if="isAdmin(userStore.getUser?.role)">
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
                                        <div v-if="getSlotCount(day.longName) > 0"
                                            class="absolute top-2 left-24 text-xxs flex items-center justify-center w-5 h-5 bg-red-400 text-white rounded-full">
                                            {{
                                                getSlotCount(day.longName) > 99 ? '99+' : getSlotCount(day.longName)
                                            }}
                                        </div>
                                    </Tooltip>
                                    <div :text="$t('dutySchedules.scheduleSlots.scheduleSlots')" v-for="day in weekDays"
                                        :key="day.date" class="flex items-center justify-center py-4 border-0.5"
                                        v-if="!isAdmin(userStore.getUser?.role)">
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
                                            v-if="state.weeklySchedules?.week_data?.monday?.holiday">
                                            {{ state.weeklySchedules?.week_data?.monday?.holiday?.name }}
                                        </p>
                                    </div>
                                    <div class="border-0.5 py-2 flex items-center justify-center">
                                        <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                            v-if="state.weeklySchedules?.week_data?.tuesday?.holiday">
                                            {{ state.weeklySchedules?.week_data?.tuesday?.holiday?.name }}
                                        </p>
                                    </div>
                                    <div class="border-0.5 py-2 flex items-center justify-center">
                                        <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                            v-if="state.weeklySchedules?.week_data?.wednesday?.holiday">
                                            {{ state.weeklySchedules?.week_data?.wednesday?.holiday?.name }}
                                        </p>
                                    </div>
                                    <div class="border-0.5 py-2 flex items-center justify-center">
                                        <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                            v-if="state.weeklySchedules?.week_data?.thursday?.holiday">
                                            {{ state.weeklySchedules?.week_data?.thursday?.holiday?.name }}
                                        </p>
                                    </div>
                                    <div class="border-0.5 py-2 flex items-center justify-center">
                                        <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                            v-if="state.weeklySchedules?.week_data?.friday?.holiday">
                                            {{ state.weeklySchedules?.week_data?.friday?.holiday?.name }}
                                        </p>
                                    </div>
                                    <div class="border-0.5 py-2 flex items-center justify-center">
                                        <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                            v-if="state.weeklySchedules?.week_data?.saturday?.holiday">
                                            {{ state.weeklySchedules?.week_data?.saturday?.holiday?.name }}
                                        </p>
                                    </div>
                                    <div class="border-0.5 py-2 flex items-center justify-center">
                                        <p class="bg-secondary text-white text-center text-xxs px-3 py-0.5 rounded-lg"
                                            v-if="state.weeklySchedules?.week_data?.sunday?.holiday">
                                            {{ state.weeklySchedules?.week_data?.sunday?.holiday?.name }}
                                        </p>
                                    </div>
                                </div>

                                <!-- <div class="relative mt-0.5 overflow-y-auto" style="max-height: 82vh;" -->
                                <div class="relative mt-0.5"
                                    @click="!isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && !isPastWeek() && pasteWeeklySchedule(weekNumber)"
                                    :class="[
                                        isWeeklyScheduleCopied(weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                        !isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && !isPastWeek() && 'cursor-copy relative group',
                                        !isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && isPastWeek() && 'cursor-not-allowed'
                                    ]">
                                    <div v-for="(employee, employeeIndex) in state.weeklySchedules?.data"
                                        :key="employeeIndex" class="grid grid-cols-9"
                                        v-if="!isWeeklyScheduleCopied(weekNumber)">
                                        <div class="col-span-9 flex flex-col items-center space-y-2 py-8 cursor-pointer border-1.5 border-dashed border-gray-700"
                                            @click="stopCopying()"
                                            v-if="isCopiedWeek() && isEmployeeWeeklyScheduleCopied() && isEmployeeSelectedAsWeeklyScheduleSource(employee)">
                                            <p class="text-center text-sm">
                                                {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                            </p>
                                            <p class="text-center text-xxs">
                                                {{
                                                    $t('dutySchedules.copyPaste.clickHereToStopCopyingTheSchedule')
                                                }}
                                            </p>
                                        </div>
                                        <div :class="[
                                            isEmployeeWeeklyScheduleCopied() && 'cursor-copy relative group',
                                            'col-span-9 grid grid-cols-9'
                                        ]" v-if="!isCopiedWeek() || !isEmployeeSelectedAsWeeklyScheduleSource(employee)"
                                            @click="isEmployeeWeeklyScheduleCopied() && (!isCopiedWeek() || !isEmployeeSelectedAsWeeklyScheduleSource(employee)) && pasteEmployeeWeeklySchedule(employee)">
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
                                                        <div class="flex items-center gap-x-1">
                                                            <Tooltip position="right"
                                                                :text="$t('dutySchedules.copy.copyEmployeeSchedule')"
                                                                v-if="isAdmin(userStore.getUser?.role)">
                                                                <button
                                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                                    @click="copyEmployeeWeeklySchedule(employee)">
                                                                    <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
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

                                                        <div v-if="employee?.norm_period"
                                                            class="flex items-center gap-1 cursor-pointer">
                                                            <p class="text-xxs">
                                                                {{ $t('dutySchedules.normPeriod') }}:
                                                                {{ employee?.norm_period?.display_label ?? '' }}
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
                                                            employee?.extra_hours > 0 ? 'text-green-700' : 'text-red-700',
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
                                                                employee?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                                'flex items-center gap-1 w-fit cursor-pointer'
                                                            ]" @click="viewCompensatoryHours(employee)">
                                                                <Icon name="ph:clock" class="h-3 w-3"
                                                                    aria-hidden="true" />
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
                                                                <Icon name="ph:clock" class="h-3 w-3"
                                                                    aria-hidden="true" />
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
                                            <div class="p-3 border-0.5" v-for="(week, weekIndex) in employee?.weeks"
                                                :key="weekIndex" :class="[
                                                    isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                                    !isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty() && 'cursor-copy relative group',
                                                    hasConflict(week) && 'border-1.5 border-red-500 rounded-md',
                                                ]"
                                                @click="!isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty() && pasteEmployeeDailySchedule(employeeIndex, weekIndex)">
                                                <div class="space-y-2"
                                                    v-if="!isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber)">
                                                    <div class="flex justify-end gap-2"
                                                        v-if="hasCreatePermission || isAdmin(userStore.getUser?.role)">
                                                        <Menu as="div"
                                                            class="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center">
                                                            <div>
                                                                <MenuButton
                                                                    class="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                                                                    <Tooltip position="left" :text="`
                                                                        ${week?.additional_hour_requests} ${week?.additional_hour_requests <= 1 ? $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequest') : $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')} | 
                                                                        ${week?.swap_requests} ${week?.swap_requests === 1 ? $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequest') : $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')}
                                                                        `"
                                                                        v-if="week?.additional_hour_requests > 0 || week?.swap_requests > 0"
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
                                                                            @click="viewChangeTimeRequests(employeeIndex, weekIndex, employee, weekNumber)">
                                                                            {{
                                                                                $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')
                                                                            }}
                                                                        </a>
                                                                        </MenuItem>
                                                                        <MenuItem v-slot="{ active }">
                                                                        <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs cursor-pointer']"
                                                                            @click="viewSwapScheduleRequests(employeeIndex, weekIndex, employee, weekNumber)">
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
                                                                @click="copyEmployeeDailySchedule(employeeIndex, weekIndex, employee, weekNumber)">
                                                                <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="left"
                                                            :text="$t('dutySchedules.newSchedule')">
                                                            <button
                                                                class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200"
                                                                @click="openAddNewShiftModal(employee, employeeIndex, weekIndex, week)">
                                                                +
                                                            </button>
                                                        </Tooltip>
                                                    </div>
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
                                                            <div class="flex justify-between text-white cursor-pointer"
                                                                @click="(hasUpdatePermission || isAdmin(userStore.getUser?.role)) ? editSchedule(employee, employeeIndex, weekIndex, shift, shiftIndex) : viewSchedule(employeeIndex, weekIndex, shift, shiftIndex)">
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
                                                            <button
                                                                class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                                @click="removeShiftConfirmation(shift)"
                                                                v-if="hasDeletePermission || isAdmin(userStore.getUser?.role)">
                                                                <Tooltip position="left"
                                                                    :text="$t('dutySchedules.removeSchedule.removeSchedule')">
                                                                    <Icon name="ph:x" class="h-2 w-2"
                                                                        aria-hidden="true" />
                                                                </Tooltip>
                                                            </button>
                                                            <button
                                                                class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                                v-else
                                                                v-if="userStore.getUser?.uuid === employee?.uuid">
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
                                                            :week="week" :employee="employee"
                                                            @error="(error: any) => state.error = error" />
                                                    </div>
                                                </div>
                                                <div class="flex flex-col items-center space-y-2 mt-3 cursor-pointer"
                                                    v-else @click="stopCopying()">
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
                                                    v-if="!isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty()">
                                                    <p class="text-white text-xs text-center">
                                                        {{ $t('dutySchedules.copyPaste.clickHereToPasteTheSchedule')
                                                        }}
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="absolute inset-0 bg-primary bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                v-if="isEmployeeWeeklyScheduleCopied()">
                                                <p class="text-white text-xs text-center">
                                                    {{ $t('dutySchedules.copyPaste.clickHereToPasteTheSchedule') }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-center space-y-2 mt-3 cursor-pointer" v-else
                                        @click="stopCopying()">
                                        <p class="text-center text-sm pt-5">
                                            {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                        </p>
                                        <p class="text-center text-xxs pb-10">
                                            {{ $t('dutySchedules.copyPaste.clickHereToStopCopyingTheSchedule') }}
                                        </p>
                                    </div>
                                    <div class="absolute inset-0 bg-primary bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        v-if="!isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty()">
                                        <p class="text-white text-xs text-center">
                                            {{ $t('dutySchedules.copyPaste.clickHereToPasteTheSchedule') }}
                                        </p>
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
            <ModulesUserDutyScheduleNormHoursModalUserNormPeriod :isModalOpen="state.modal.isUserNormPeriodOpen"
                :selectedEmployee="state.normHours.selectedEmployee" @close="state.modal.isUserNormPeriodOpen = false"
                @refreshDutySchedules="fetchDutySchedule()" />
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
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const language = useI18n()
const dutyScheduleStore = useDutyScheduleStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore()
const { formatNumber } = useNumberFormatter()
const currentDate = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))
const expandedRecords = reactive([] as boolean[])

const state = reactive({
    addShift: {
        selectedEmployeeSchedule: {}
    } as any,
    copy: {
        allEmployeeSchedules: {},
        selectedEmployeeDailySchedule: {},
        selectedEmployeeWeeklySchedule: {},
        selectedWeekNumber: null,
    } as any,
    copyShiftError: {} as Error,
    customWeekLabel: 'week',
    dataFilter: {
        search: ''
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
        isUserNormPeriodOpen: false,
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
        selectedShift: {}
    } as any,
    selectedDate: moment().format('YYYY-MM-DD'),
    showAllShifts: false,
    showAllShiftTypes: false,
    showEmployeesWorkingToday: false,
    shiftPercentage: {} as any,
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
    isUpdateShift: false,
    viewShift: {
        selectedEmployeeSchedule: {},
    } as any,
    weeklySchedules: [] as any,
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
        fetchDutySchedule()
    }
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        currentDate.value = moment(newSelectedDate)
        fetchDutySchedule()
    }
})

onMounted(() => {
    fetchDutySchedule()
    window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
})

watch(() => dutyScheduleStore.getShowEmployeesWorkingToday, (status: boolean) => {
    dutyScheduleStore.setShowEmployeesWorkingToday(status)
    fetchDutySchedule()
})

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        stopCopying()
    }
}

function isAdmin(role: any) {
    return role && role === 'Admin'
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

    const weekStart = moment(currentDate.value).startOf('isoWeek')
    const weekEnd = moment(currentDate.value).endOf('isoWeek')

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

async function fetchDutySchedule() {
    state.error = {}
    state.progress.totalRequests = state.progress.totalRequests + 1
    state.progress.pendingRequests = state.progress.pendingRequests + 1
    identifyTheProgressPercentage()
    try {
        const dateMoment = moment(currentDate.value)
        const startOfWeek = dateMoment.clone().startOf('isoWeek')
        const endOfWeek = dateMoment.clone().endOf('isoWeek')
        const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
        const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
        const params = {
            page: dutyScheduleStore.getCurrentPageNumber,
            page_length: dutyScheduleStore.getCurrentPageLength,
            date_start: startOfWeekFormatted,
            date_end: endOfWeekFormatted,
            filter_date_start: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            filter_date_end: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
            show_employees_working_today: dutyScheduleStore.getShowEmployeesWorkingToday,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        } as any
        if (state.filter.department_uuids?.length > 0) {
            params.department_uuids = Array(state.filter.department_uuids)
        }
        if (state.filter.employment_status) {
            params.employment_status = Array(state.filter.employment_status)
        }
        if (state.filter.employee_uuids?.length > 0) {
            params.employee_uuids = Array(state.filter.employee_uuids)
        }
        const response = await dutyScheduleService.getDutySchedules(params)
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

function isPreviousWeekDisabled() {
    const today = moment().startOf('week') // Start of today's week (Monday)
    const selectedDate = moment(state.selectedDate).startOf('week') // Start of the selected week (Monday)

    // For regular users, disable the previous week button only if we're in today's week
    if (!isAdmin(userStore.getUser?.role)) {
        // Disable the previous week button if we are in today's week (not in the future or past)
        if (selectedDate.isSame(today, 'week')) {
            return true // Disable button if we are in today's week
        }
    }

    return false // Admins can always go to the previous week
}

watch(() => state.weeklySchedules, (newSchedules) => {
    // Update the expanded records only if the number of records changes.
    if (newSchedules && newSchedules.data.length !== expandedRecords.length) {
        expandedRecords.splice(0, expandedRecords.length, ...newSchedules.data.map(() => true))
    }
})

function setFilter(filter: any) {
    state.filter.department_uuids = filter.department_uuids
    state.filter.employment_status = filter.employment_status
    state.filter.employee_uuids = filter.employee_uuids
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

function getSlotCount(dayName: string) {
    const dayMap = {
        Mon: 'monday',
        Tue: 'tuesday',
        Wed: 'wednesday',
        Thu: 'thursday',
        Fri: 'friday',
        Sat: 'saturday',
        Sun: 'sunday'
    } as any
    const key = dayMap[dayName]
    return state.weeklySchedules?.week_data?.[key]?.total_slots || 0
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
    fetchDutySchedule()
}

function setToday() {
    state.customWeekLabel = 'week'
    currentDate.value = moment()
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
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

function isPastWeek() {
    return moment(currentDate.value).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')
}

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

function openAddNewShiftModal(employee: any, employeeIndex: number, weekIndex: any, week: any) {
    state.modal.isAddShiftOpen = true
    state.addShift.selectedEmployeeSchedule = {
        employeeIndex: employeeIndex,
        weekIndex: weekIndex,
        ...week
    }
    state.newShift.selectedDate = week?.date
    state.newShift.selectedEmployee = employee
}

function openManageScheduleSlotModal(day: any) {
    state.manageScheduleSlot.selectedDay = day
    state.modal.isManageScheduleSlotOpen = true
}

function viewChangeTimeRequests(employeeIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    const selectedEmployee = state.weeklySchedules?.data?.[employeeIndex]
    const selectedDate = state.weeklySchedules?.data?.[employeeIndex].weeks[weekIndex]?.date
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedDate = selectedDate
    state.modal.isManageTimeAdjustmentRequestsOpen = true
}

function requestTimeAdjustment(employeeIndex: number, shift: any) {
    const selectedEmployee = state.weeklySchedules?.data?.[employeeIndex]
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedSchedule = shift
    state.modal.isRequestTimeAdjustmentOpen = true
}

function viewSwapScheduleRequests(employeeIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    const selectedEmployee = state.weeklySchedules?.data?.[employeeIndex]
    const selectedDate = state.weeklySchedules?.data?.[employeeIndex].weeks[weekIndex]?.date
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
        user_uuid: state.weeklySchedules?.data?.[employeeIndex].uuid,
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

function isDailyScheduleCopied(employeeIndex: number, weekIndex: number, weekNumber: number) {
    return state.copy.selectedEmployeeDailySchedule.employeeIndex === employeeIndex && state.copy.selectedEmployeeDailySchedule.weekIndex === weekIndex && state.copy.selectedEmployeeDailySchedule.weekNumber === weekNumber
}

function copyEmployeeDailySchedule(employeeIndex: number, weekIndex: any, employee: any, weekNumber: number) {
    state.copy.selectedEmployeeDailySchedule = {
        employeeIndex: employeeIndex,
        weekNumber: weekNumber,
        weekIndex: weekIndex,
        employee: employee,
    }
}

function stopCopying() {
    state.copy.allEmployeeSchedules = {}
    state.copy.selectedEmployeeDailySchedule = {}
    state.copy.selectedEmployeeWeeklySchedule = {}
}

async function pasteEmployeeDailySchedule(employeeIndex: number, weekIndex: number) {
    const copiedSelectedEmployeeSchedule = state.copy.selectedEmployeeDailySchedule
    const copiedWeekIndex = copiedSelectedEmployeeSchedule.weekIndex

    const userSource = copiedSelectedEmployeeSchedule.employee
    const dateSource = copiedSelectedEmployeeSchedule.employee.weeks[copiedWeekIndex].date
    const userDestination = state.weeklySchedules?.data?.[employeeIndex]
    const dateDestination = state.weeklySchedules?.data?.[employeeIndex].weeks[weekIndex].date
    const params = {
        user_uuid_source: userSource.uuid,
        user_uuid_destination: userDestination.uuid,
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

function isCopiedWeek() {
    return state.copy.selectedWeekNumber === weekNumber?.value
}

function isEmployeeWeeklyScheduleCopied() {
    return Object.keys(state.copy.selectedEmployeeWeeklySchedule).length > 0
}

function isEmployeeSelectedAsWeeklyScheduleSource(employee: any) {
    return state.copy.selectedEmployeeWeeklySchedule?.uuid === employee?.uuid
}

function copyEmployeeWeeklySchedule(weeklySchedule: any) {
    state.copy.selectedEmployeeWeeklySchedule = weeklySchedule
    state.copy.selectedWeekNumber = weekNumber?.value
}

function viewExtraHours(employee: any) {
    state.manageExtraHours.selectedEmployee = employee
    state.modal.isManageExtraHoursOpen = true
}

async function pasteEmployeeWeeklySchedule(weeklySchedule: any) {
    state.copyShiftError = {}
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const params = {
            user_uuid_source: state?.copy.selectedEmployeeWeeklySchedule?.uuid,
            user_uuid_destination: weeklySchedule?.uuid,
            week_source: state.copy.selectedWeekNumber,
            week_destination: weekNumber?.value,
        }
        const response = await dutyScheduleService.copyEmployeeWeeklyDutySchedule(params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDutySchedule()
        }
    } catch (error: any) {
        state.copyShiftError = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
}

function isAllWeeklyScheduleCopiedEmpty() {
    return Object.keys(state.copy.allEmployeeSchedules).length === 0
}

function isWeeklyScheduleCopied(weekNumber: number) {
    return state.copy.allEmployeeSchedules.weekNumber === weekNumber
}

function copyWeeklySchedule(weekNumber: number) {
    state.copy.allEmployeeSchedules = {
        weekNumber: weekNumber,
        yearSource: currentDate.value.year(),
        weeklySchedules: state.weeklySchedules?.data
    }
}

function pasteWeeklySchedule(weekNumber: number) {
    const params = {
        department: departmentStore.getSelectedDepartmentName,
        week_source: state.copy.allEmployeeSchedules.weekNumber,
        week_destination: weekNumber,
        year_source: state.copy.allEmployeeSchedules.yearSource,
        year_destination: currentDate.value.year(),
    }
    saveCopiedWeeklyDutySchedule(params)
}

async function saveCopiedWeeklyDutySchedule(params: object) {
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
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
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

function viewSchedule(employeeIndex: number, weekIndex: any, shift: any, shiftIndex: number) {
    const date = state.weeklySchedules?.data?.[employeeIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules?.data?.[employeeIndex].employee.uuid
    state.viewShift.selectedEmployeeSchedule = {
        citizen_schedules: shift?.citizen_schedules,
        scheduleUuid: shift?.schedule_uuid,
        date_time_start: shift?.date_time_start,
        date_time_end: shift?.date_time_end,
        user_uuid: userUuid,
        date: date,
        shift_type: shift?.type,
        tags: shift?.tags,
        departments: shift?.departments,
        note: shift?.note,
        employeeIndex: employeeIndex,
        weekIndex: weekIndex,
        shiftIndex: shiftIndex,
    }
    state.modal.isViewShiftOpen = true
}

function editSchedule(employee: any, employeeIndex: number, weekIndex: any, shift: any, shiftIndex: number) {
    const date = state.weeklySchedules?.data?.[employeeIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules?.data?.[employeeIndex].uuid
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
        date: date,
        shift_type: shift?.type,
        tags: shift?.tags,
        departments: shift?.departments,
        note: shift?.note,
        do_not_count_sick_leave: shift?.do_not_count_sick_leave,
        use_compensatory_time: shift?.use_compensatory_time,
        employeeIndex: employeeIndex,
        weekIndex: weekIndex,
        shiftIndex: shiftIndex,
    }
    state.modal.isEditShiftOpen = true
}

function updateSelectedSchedule(shiftDetails: any) {
    const scheduleUuid = state.editShift.selectedEmployeeSchedule.scheduleUuid
    const employeeIndex = state.editShift.selectedEmployeeSchedule.employeeIndex
    const weekIndex = state.editShift.selectedEmployeeSchedule.weekIndex
    const shiftIndex = state.editShift.selectedEmployeeSchedule.shiftIndex
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
    updateDutySchedule(scheduleUuid, params, employeeIndex, weekIndex, shiftIndex)
}

async function updateDutySchedule(scheduleUuid: any, params: object, employeeIndex: number, weekIndex: any, shiftIndex: number) {
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

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})

let lastScrollTop = 0
const headerHeight = 270  // The height of the header

function handleScroll() {
    const header = document.getElementById('fixed-header-week-view')
    if (!header) return

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop

    // If scrolling down and we reach the bottom of the header
    if (currentScroll > headerHeight) {
        header.classList.add('fixed-header-week-view-top')
    } else {
        // If scrolling up, remove the fixed position
        header.classList.remove('fixed-header-week-view-top')
    }

    // Update the last scroll position for the next scroll event
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll // Prevent negative scroll
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
    } catch (error: any) {

    }
}

function closeWarningDialog() {
    state.showWarningDialog = false
    state.shiftWarnings = []
}

function openUserNormPeriodModal(employee: any) {
    if (!isAdmin(userStore.getUser?.role)) return
    state.normHours.selectedEmployee = employee
    state.modal.isUserNormPeriodOpen = true
}
</script>
