<template>
    <div class="space-y-2">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="state?.copyShiftError?.message"
            v-if="state.copyShiftError?.message && state.copyShiftError.message.length > 0" />

        <!-- Drag success besked -->
        <Transition enter-active-class="transition ease-out duration-300 transform"
            enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-200 transform" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-4">
            <div v-if="state.dragSuccessMessage"
                class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl pointer-events-none">
                <div class="w-5 h-5 rounded-full bg-[#2dbab2] flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                {{ state.dragSuccessMessage }}
            </div>
        </Transition>
        <div class="flex h-full flex-col">
            <!-- Teleport date picker to breadcrumb row -->
            <Teleport to="#schedule-date-picker-target" v-if="teleportReady">
                <div class="flex items-center gap-1.5">
                    <div
                        class="relative flex items-center rounded-lg bg-white ring-1 ring-gray-200 overflow-hidden h-[32px]">
                        <button @click="!isPreviousMonthDisabled() && previousMonth()" type="button" :class="[
                            isPreviousMonthDisabled() && 'cursor-not-allowed',
                            'flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors'
                        ]" :disabled="isPreviousMonthDisabled()">
                            <Icon name="heroicons:chevron-left" class="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                            dateType="duty-schedule" v-model="state.selectedDate" />
                        <button @click="nextMonth()" type="button"
                            class="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <Icon name="heroicons:chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                    <button @click="setToday()"
                        class="text-primary text-xs font-semibold hover:text-primary-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors">
                        {{ $t('goToToday') }}
                    </button>
                </div>
            </Teleport>

            <div class="mb-2">
                <div class="flex flex-wrap items-center justify-between gap-2 py-1">
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div class="bg-blue-50 ring-1 ring-blue-200 rounded-lg px-3 py-1">
                            <h3 class="text-sm font-semibold leading-6 text-gray-900 text-center">
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
                        <label v-if="false" class="flex items-center gap-2 cursor-pointer">
                            <FormSwitch :value="userStore.getUser?.is_schedule_pinned ? true : false"
                                @toggleSwitch="pinSelfToTopOfSchedule()" />
                            <span class="text-xs text-gray-600">
                                {{ $t('dutySchedules.pinSelfToTopOfSchedule') }}
                            </span>
                        </label>
                        <div class="hidden lg:block h-4 w-px bg-slate-200" />
                        <label class="flex items-center gap-2 cursor-pointer">
                            <FormSwitch :value="dutyScheduleStore.getShowEmployeesWorkingToday"
                                @toggleSwitch="dutyScheduleStore.setShowEmployeesWorkingToday(!dutyScheduleStore.getShowEmployeesWorkingToday)" />
                            <span class="text-xs text-gray-600">
                                {{ $t('dutySchedules.showEmployeesWorkingToday') }}
                            </span>
                        </label>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <button
                            class="flex items-center gap-1 text-xxs bg-primary text-white hover:bg-primary-700 px-2 py-1 rounded font-semibold"
                            @click="pasteMonth(monthWeeks)"
                            v-if="state.copy.selectedMonth && state.copy.selectedMonth.month !== moment(state.selectedDate).month()">
                            <Icon name="ph:calendar-check" class="h-3.5 w-3.5" />
                            {{ $t('dutySchedules.monthView.insertMonthHere') }}
                        </button>
                        <Tooltip :text="$t('dutySchedules.monthView.copyMonth')" position="left"
                            v-if="!state.copy.selectedMonth">
                            <button
                                class="flex items-center gap-1 text-xxs text-gray-500 hover:text-primary bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded"
                                @click="copyMonth()">
                                <Icon name="ph:calendar-blank" class="h-3.5 w-3.5" />
                                {{ $t('dutySchedules.monthView.copyMonth') }}
                            </button>
                        </Tooltip>
                        <div v-if="state.copy.selectedMonth"
                            class="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1">
                            <span class="text-xxs text-primary font-semibold">
                                📋 {{ $t('dutySchedules.monthView.monthCopied') }}
                            </span>
                        </div>
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
                                class="flex items-center justify-center gap-x-2 outline-none rounded-md text-xs truncate font-semibold bg-primary border border-primary text-white hover:bg-primary-800 px-2 py-2"
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
                                    <option value="100" :selected="dutyScheduleStore.getCurrentPageLength === '100'">
                                        100
                                    </option>
                                    <option value="200" :selected="dutyScheduleStore.getCurrentPageLength === '200'">
                                        200
                                    </option>
                                    <option value="300" :selected="dutyScheduleStore.getCurrentPageLength === '300'">
                                        300
                                    </option>
                                    <option value="400" :selected="dutyScheduleStore.getCurrentPageLength === '400'">
                                        400
                                    </option>
                                    <option value="500" :selected="dutyScheduleStore.getCurrentPageLength === '500'">
                                        500
                                    </option>
                                    <option value="all" :selected="dutyScheduleStore.getCurrentPageLength === 'all'">
                                        {{ $t('all') }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="xl:min-w-[160px] [&_input]:!h-[38px] [&_button]:!h-[38px] [&_form]:!h-[38px]">
                            <TableSearch @search="handleSearch" :placeholder="$t('dutySchedules.findEmployee')" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progress bar (matches week-view: h-1.5 with gradient) -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full transition-all ease-in-out duration-500 mb-1.5"
                :style="{ width: `${state.progress.percentage}%` }" v-if="state.progress.showProgressBar" />
            <div class="h-1.5 mb-1.5" v-else />

            <!-- ============================================================ -->
            <!-- NEW LAYOUT: Employee sidebar + weekly day grid               -->
            <!-- ============================================================ -->
            <div class="flex bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">

                <!-- LEFT: Fixed employee avatar sidebar -->
                <div class="flex-shrink-0 w-[90px] border-r border-gray-200 bg-gray-50/50 rounded-l-xl">
                    <!-- Top-left corner: copy button -->
                    <div class="h-[73px] border-b border-gray-200 flex items-center justify-center px-2"
                        v-if="isAdmin(userStore.getUser?.role)">
                        <Tooltip :text="$t('dutySchedules.copy.copyMultipleWeeksSchedule')" position="right">
                            <button
                                class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                @click="state.modal.isCopyMultipleWeeklyScheduleOpen = true">
                                <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                            </button>
                        </Tooltip>
                    </div>
                    <div class="h-[73px] border-b border-gray-200" v-else />

                    <!-- Employee avatars with rich popover -->
                    <div v-for="(employee, employeeIndex) in state.monthlySchedules?.data"
                        :key="'sidebar-' + employee.uuid"
                        class="border-b border-gray-100 flex flex-col items-center justify-center py-3 px-2 cursor-default relative"
                        @mouseenter="showPopover(employeeIndex)" @mouseleave="hidePopoverWithDelay()">
                        <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                            :class="[
                                employee?.shift_threshold === 'high' && 'ring-green-500',
                                employee?.shift_threshold === 'moderate' && 'ring-yellow-500',
                                employee?.shift_threshold === 'low' && 'ring-red-500',
                                'h-10 w-10 rounded-full bg-gray-50 object-cover ring-2 cursor-pointer mx-auto transition-transform hover:scale-110'
                            ]" />
                        <p class="text-[10px] font-medium mt-1.5 text-center leading-tight text-gray-700 w-full">
                            {{ employee?.firstname }} {{ employee?.lastname }}
                        </p>
                        <!-- Rich popover on hover -->
                        <div v-if="state.hoveredEmployee === employeeIndex"
                            class="absolute left-full ml-2 top-0 z-[60] bg-white rounded-xl shadow-2xl ring-1 ring-gray-200 p-4 w-[340px] text-left"
                            @mouseenter="showPopover(employeeIndex)"
                            @mouseleave="hidePopoverWithDelay()">
                            <div class="flex items-center gap-3 mb-3">
                                <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                                    :class="[employee?.shift_threshold === 'high' && 'border-green-700', employee?.shift_threshold === 'moderate' && 'border-yellow-500', employee?.shift_threshold === 'low' && 'border-red-600', 'h-12 w-12 rounded-full bg-gray-50 object-cover border-2 shadow-md ring-2 ring-white']" />
                                <div>
                                    <p class="text-sm font-semibold text-gray-900">
                                        {{ employee?.firstname }} {{ employee?.lastname }}
                                    </p>
                                    <p class="text-xxs text-gray-500" v-if="employee?.employee_detail?.job?.title">
                                        {{ employee?.employee_detail?.job?.title }}
                                    </p>
                                </div>
                                <div class="ml-auto flex gap-1">
                                    <button
                                        class="bg-gray-100 w-7 h-7 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"
                                        @click="viewExtraHours(employee)"
                                        v-if="isAdmin(userStore.getUser?.role) || userStore.getUser?.uuid === employee?.uuid">
                                        <Icon name="mdi:clock-outline" class="h-3 w-3" />
                                    </button>
                                    <button
                                        class="bg-gray-100 w-7 h-7 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"
                                        @click="viewLeaveRequests(employee)"
                                        v-if="isAdmin(userStore.getUser?.role) || userStore.getUser?.uuid === employee?.uuid">
                                        <Icon name="mdi:wallet-travel" class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <div class="text-xxs space-y-0.5 mb-2">
                                <p><span class="text-gray-500">{{ $t('dutySchedules.filter.departments') }}:</span>
                                    <span v-for="(department, departmentIndex) in employee?.departments"
                                        :key="departmentIndex">
                                        {{ department?.name }}
                                        <span v-if="departmentIndex as number < employee.departments.length - 1">,
                                        </span>
                                        <span v-else>.</span></span>
                                </p>
                                <p>
                                    {{ $t('dutySchedules.annualNormHours') }}: {{ employee?.annual_norm_hours ?? 0 }}
                                </p>
                                <p>
                                    {{ $t('dutySchedules.weeklyNormHours') }}: {{
                                        (Math.round(Number(employee?.annual_norm_hours) / 52)) ??
                                        0 }}
                                </p>
                                <p>
                                    {{ $t('dutySchedules.totalHours') }}: {{ employee?.total_hours ?? 0 }}
                                </p>
                                <p
                                    :class="[employee?.average_weekly_work_time?.severity === 'info' ? 'text-green-700' : employee?.average_weekly_work_time?.severity === 'warning' ? 'text-amber-700' : 'text-red-700']">
                                    {{ $t('dutySchedules.averageWeeklyHours.averageWeeklyHours') }}:
                                    {{ employee?.average_weekly_work_time?.average_weekly_hours }}
                                </p>
                                <p
                                    :class="[parseFloat(String(employee?.log_data?.total_time_account_earned_hours || 0).replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700']">
                                    {{ $t('dutySchedules.monthView.earnedHours') }}:
                                    {{ employee?.log_data?.total_time_account_earned_hours }}
                                </p>
                                <p
                                    :class="[parseFloat(String(employee?.extra_hours || 0).replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700']">
                                    {{ $t('dutySchedules.monthView.extraHours') }}:
                                    {{ employee?.extra_hours }}
                                </p>
                                <p class="text-primary cursor-pointer hover:text-primary-700 mt-1"
                                    @click="navigateTo('/calendar?employee_uuid=' + employee?.uuid)">
                                    {{ $t('dutySchedules.monthView.seeCalendar') }}
                                </p>
                            </div>
                            <div v-if="(isAdmin(userStore.getUser?.role) || userStore.getUser?.show_working_hours) && employee?.hours?.length > 0"
                                class="border-t border-gray-100 pt-2">
                                <div class="grid grid-cols-7 text-xxs mb-1">
                                    <div class="col-span-3"></div>
                                    <div class="col-span-2 text-right pr-2 text-gray-400 font-semibold">
                                        {{ $t('dutySchedules.month') }}
                                    </div>
                                    <div
                                        class="col-span-2 text-right pr-2 text-gray-400 font-semibold border-l border-gray-100">
                                        {{ $t('dutySchedules.yearToDate') }}
                                    </div>
                                </div>
                                <div v-for="(time, timeIndex) in employee?.hours" :key="timeIndex"
                                    :class="[timeIndex as number % 2 ? 'bg-white' : 'bg-gray-50', 'grid grid-cols-7 text-xxs py-0.5']">
                                    <div class="col-span-3 pl-1 flex items-center gap-1 truncate">
                                        <div class="w-2 h-2 rounded-sm flex-shrink-0"
                                            :style="{ background: time?.shift?.color }"></div>
                                        <span class="truncate">
                                            {{
                                                language.locale.value === 'en' ?
                                                    time?.shift?.en_name : time?.shift?.dk_name
                                            }}
                                        </span>
                                    </div>
                                    <div class="col-span-2 text-right pr-2">
                                        {{ time?.monthly_hours || time?.weekly_hours }}
                                    </div>
                                    <div class="col-span-2 text-right pr-2 border-l border-gray-100">
                                        {{ time?.yearly_hours }}
                                    </div>
                                </div>
                                <div class="grid grid-cols-7 text-xxs py-0.5 border-t border-gray-200 mt-0.5">
                                    <div class="col-span-3 pl-1 font-bold">{{ $t('dutySchedules.total') }}:</div>
                                    <div class="col-span-2 text-right pr-2 font-bold">
                                        {{employee?.hours?.reduce((sum, t) => sum + (parseFloat(t?.monthly_hours ||
                                            t?.weekly_hours) || 0), 0).toFixed(2)}}
                                    </div>
                                    <div class="col-span-2 text-right pr-2 font-bold border-l border-gray-100">
                                        {{employee?.hours?.reduce((sum, t) => sum + (parseFloat(t?.yearly_hours) || 0),
                                            0).toFixed(2)}}
                                    </div>
                                </div>
                            </div>
                            <div class="border-t border-gray-100 pt-2 mt-2 space-y-1"
                                v-if="isAdmin(userStore.getUser?.role) || userStore.getUser?.show_working_hours">
                                <div class="text-primary flex items-center gap-1 cursor-pointer text-xxs"
                                    @click="openGraphModal(employee)">
                                    <Icon name="ph:chart-bar-bold" class="h-3 w-3" />
                                    {{ $t('dutySchedules.normHours.compensatoryHoursGraph') }}
                                </div>
                                <div :class="[employee?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700', 'flex items-center gap-1 cursor-pointer text-xxs']"
                                    @click="viewCompensatoryHours(employee)">
                                    <Icon name="ph:clock" class="h-3 w-3" />
                                    {{ $t('dutySchedules.normHours.compensatoryHours') }}:
                                    {{
                                        formatNumber(language.locale.value,
                                            employee?.total_norm_hours?.compensatory_hours) ?? 0
                                    }}
                                </div>
                                <div :class="[employee?.total_norm_hours?.available_vacation_hours > 0 ? 'text-green-700' : 'text-red-700', 'flex items-center gap-1 cursor-pointer text-xxs']"
                                    @click="viewAvailableVacationHours(employee)">
                                    <Icon name="ph:clock" class="h-3 w-3" />
                                    {{ $t('dutySchedules.normHours.availableVacationHours') }}:
                                    {{
                                        formatNumber(language.locale.value,
                                            employee?.total_norm_hours?.available_vacation_hours || 0)
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: Scrollable week-based grid -->
                <div class="flex-1 overflow-x-auto" id="month-view-scroll-container">
                    <!-- Iterate through each week of the month -->
                    <div v-for="(week, weekIndex) in monthWeeks" :key="'week-' + weekIndex">
                        <!-- Week label -->
                        <div class="bg-slate-50 border-b border-gray-200 px-3 py-1 flex items-center gap-2">
                            <span class="text-primary text-xs font-bold">
                                {{ $t('dutySchedules.week') }} {{ week.weekNumber }}
                            </span>
                            <button
                                v-if="state.copy.selectedWeek && state.copy.selectedWeek.weekNumber !== week.weekNumber"
                                class="text-xxs text-primary font-medium bg-primary/10 border border-primary/20 rounded px-2 py-0.5 cursor-pointer hover:bg-primary/20"
                                @click="pasteWeek(week)">
                                📋 {{ $t('dutySchedules.monthView.insertWeekHere') }}
                            </button>
                            <span class="text-[10px] text-gray-400">
                                {{
                                    week.days[0] ? moment(week.days[0]).format('D. MMM') : ''
                                }}
                                –
                                {{
                                    week.days[6] ?
                                        moment(week.days[6]).format('D. MMM') :
                                        (week.days.filter(day => day !== null).pop() ?
                                            moment(week.days.filter(day => day !== null).pop()).format('D. MMM') : '')
                                }}
                            </span>
                            <div class="ml-auto flex items-center gap-1"
                                v-if="isDailyScheduleCopiedEmpty() && !state.copy.selectedWeek && !state.copy.selectedMonth">
                                <Tooltip :text="$t('dutySchedules.monthView.copyWeek')" position="left">
                                    <button
                                        class="flex items-center gap-1 text-xxs text-gray-500 hover:text-primary bg-gray-100 hover:bg-blue-50 px-2 py-0.5 rounded"
                                        @click="copyWeek(week)">
                                        <Icon name="ph:calendar" class="h-3 w-3" />
                                        {{ $t('dutySchedules.week') }}
                                    </button>
                                </Tooltip>
                            </div>
                            <!-- Copy/paste controls for week -->
                            <div class="ml-auto flex items-center gap-1"
                                v-if="isAdmin(userStore.getUser?.role) && !isDailyScheduleCopiedEmpty()">
                                <button @click="stopCopying()"
                                    class="text-xxs text-gray-500 hover:text-red-500 flex items-center gap-0.5">
                                    <Icon name="ph:x" class="h-3 w-3" />
                                    {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                </button>
                            </div>
                        </div>

                        <!-- Week header with day columns -->
                        <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 sticky top-0 z-20">
                            <template v-for="(day, dayIndex) in week.days" :key="'wh-' + dayIndex">
                                <!-- Admin: clickable with tooltip + slot badge -->
                                <Tooltip v-if="isAdmin(userStore.getUser?.role)"
                                    :text="day !== null ? $t('dutySchedules.scheduleSlots.scheduleSlots') : ''"
                                    :position="dayIndex === 0 ? 'right' : 'left'" :class="[
                                        isToday(day) && 'bg-primary/10',
                                        day === null && 'bg-gray-100/50',
                                        day !== null && 'cursor-pointer hover:bg-blue-50/50 transition-colors',
                                        'relative px-2 py-1 border-r border-gray-200 last:border-r-0 text-center min-w-[120px]'
                                    ]" @click="day !== null && openManageScheduleSlotModal(day)">
                                    <template v-if="day !== null">
                                        <div class="flex flex-col items-center gap-0.5">
                                            <div class="flex items-center gap-1.5">
                                                <span :class="[
                                                    isToday(day) ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold' : 'text-sm font-semibold text-gray-900'
                                                ]">
                                                    {{ moment(day).format('D') }}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    {{ getDayName(day) }}
                                                </span>
                                            </div>
                                            <span v-if="getHoliday(day)"
                                                class="inline-block text-amber-700 bg-amber-100 ring-1 ring-amber-300 text-[9px] font-semibold px-2 py-0.5 rounded-full leading-none mt-0.5 truncate max-w-full">
                                                🌴 {{ getHoliday(day) }}
                                            </span>
                                        </div>
                                        <!-- Slot badge -->
                                        <div v-if="getSlotCountForDay(day) > 0"
                                            class="slot-badge absolute top-1 right-1 bg-primary font-bold shadow-sm">
                                            {{ getSlotCountForDay(day) > 99 ? '99+' : getSlotCountForDay(day) }}
                                        </div>
                                    </template>
                                </Tooltip>
                                <!-- Non-admin: plain div -->
                                <div v-else :class="[
                                    isToday(day) && 'bg-primary/10',
                                    day === null && 'bg-gray-100/50',
                                    'relative px-2 py-3 border-r border-gray-200 last:border-r-0 text-center min-w-[120px]'
                                ]">
                                    <template v-if="day !== null">
                                        <div class="flex flex-col items-center gap-0.5">
                                            <div class="flex items-center gap-1.5">
                                                <span :class="[
                                                    isToday(day) ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold' : 'text-sm font-semibold text-gray-900'
                                                ]">
                                                    {{ moment(day).format('D') }}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    {{ getDayName(day) }}
                                                </span>
                                            </div>
                                            <span v-if="getHoliday(day)"
                                                class="inline-block text-amber-700 bg-amber-100 ring-1 ring-amber-300 text-[9px] font-semibold px-2 py-0.5 rounded-full leading-none mt-0.5 truncate max-w-full">
                                                🌴 {{ getHoliday(day) }}
                                            </span>
                                        </div>
                                    </template>
                                </div>
                            </template>
                        </div>

                        <!-- Compact day row: alle vagter paa tvaers af medarbejdere -->
                        <div class="grid grid-cols-7 border-b border-gray-100">
                            <div v-for="(day, dayIndex) in week.days" :key="'compact-' + weekIndex + '-' + dayIndex"
                                :class="[
                                    day === null && 'bg-gray-50/50',
                                    day !== null && isToday(day) && 'bg-blue-50/30',
                                    day !== null && isWeekend(day) && !isToday(day) && 'bg-gray-50/30',
                                    'px-3 py-1.5 border-r border-gray-200 last:border-r-0 min-w-[120px] align-top'
                                ]" @dragover.prevent="isAdmin(userStore.getUser?.role) && onMonthDragOver($event)"
                                @dragleave="isAdmin(userStore.getUser?.role) && onMonthDragLeave($event)"
                                @drop.prevent="isAdmin(userStore.getUser?.role) && onMonthDrop($event, day)"
                                @click="!isDailyScheduleCopiedEmpty() && !isCopiedDay(day) && day !== null ? pasteDayAllEmployees(day) : null">
                                <template v-if="day !== null">
                                    <!-- Dag actions -->
                                    <div class="flex justify-end gap-1 mb-1" v-if="isDailyScheduleCopiedEmpty()">
                                        <Tooltip position="left" :text="$t('dutySchedules.copy.copy')">
                                            <button
                                                class="bg-gray-100 w-5 h-5 text-gray-500 rounded hover:bg-gray-300 flex items-center justify-center"
                                                @click.stop="copyDayForAllEmployees(day)">
                                                <Icon name="mdi:content-copy" class="h-2.5 w-2.5" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip position="left" :text="$t('dutySchedules.newSchedule')"
                                            v-if="hasCreatePermission || isAdmin(userStore.getUser?.role)">
                                            <button
                                                class="bg-gray-100 w-5 h-5 text-gray-500 rounded hover:bg-gray-300 flex items-center justify-center font-bold"
                                                @click.stop="openAddNewShiftModalForDay(day)">+</button>
                                        </Tooltip>
                                    </div>
                                    <div v-if="!isDailyScheduleCopiedEmpty() && isCopiedDay(day)"
                                        class="flex justify-between items-center mb-1">
                                        <span class="text-xxs text-primary font-bold">
                                            ✓ {{ $t('dutySchedules.monthView.copied') }}
                                        </span>
                                        <button @click.stop="stopCopying()"
                                            class="text-xxs text-red-500 bg-red-50 rounded px-1">
                                            {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                        </button>
                                    </div>
                                    <div v-if="!isDailyScheduleCopiedEmpty() && !isCopiedDay(day) && day !== null"
                                        class="text-center mb-1">
                                        <div v-if="!isDailyScheduleCopiedEmpty() && !isCopiedDay(day) && day !== null"
                                            class="flex items-center justify-center mb-1 rounded bg-primary/10 border border-primary/30 py-1 cursor-pointer"
                                            @click.stop="pasteDayAllEmployees(day)">
                                            <span class="text-xxs text-primary font-semibold">
                                                📋 {{ $t('dutySchedules.monthView.insertHere') }}
                                            </span>
                                        </div>
                                    </div>
                                    <!-- Shifts for all employees that day -->
                                    <div class="space-y-3">
                                        <template v-for="(employee, employeeIndex) in state.monthlySchedules?.data"
                                            :key="'emp-' + employeeIndex">
                                            <ModulesUserDutyScheduleScheduleSlotsRequestAvailableSlots
                                                :daysData="state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]"
                                                :employee="employee" @error="(error: any) => state.error = error" />
                                            <div v-if="(isAdmin(userStore.getUser?.role) || hasCreatePermission) && (state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests > 0 || state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests > 0)"
                                                class="flex justify-end" @click.stop>
                                                <Tooltip :position="dayIndex === 0 ? 'right' : 'left'"
                                                    :text="`${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests} ${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests <= 1 ? $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequest') : $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')} | ${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests} ${state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests === 1 ? $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequest') : $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')}`"
                                                    class="relative">
                                                    <button
                                                        class="bg-gray-100 w-5 h-5 text-gray-500 rounded hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors relative"
                                                        @click.stop="openRequestMenu(`${employeeIndex}-${moment(day).format('YYYY-MM-DD')}`, $event)">
                                                        <Icon name="mdi:calendar-question-outline" class="h-3 w-3"
                                                            aria-hidden="true" />
                                                        <div
                                                            class="w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1 pointer-events-none" />
                                                    </button>
                                                </Tooltip>
                                                <Teleport to="body">
                                                    <div v-if="requestMenuState.openKey === `${employeeIndex}-${moment(day).format('YYYY-MM-DD')}`"
                                                        class="fixed z-[9999] w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-1"
                                                        :style="{ top: requestMenuState.top + 'px', left: requestMenuState.left + 'px' }">
                                                        <button
                                                            class="text-gray-700 block px-4 py-2 text-xs cursor-pointer hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                                            @click.stop="viewChangeTimeRequests(employeeIndex as number, day); requestMenuState.openKey = null">
                                                            {{
                                                                $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')
                                                            }}
                                                        </button>
                                                        <button
                                                            class="text-gray-700 block px-4 py-2 text-xs cursor-pointer hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                                            @click.stop="viewSwapScheduleRequests(employeeIndex as number, day); requestMenuState.openKey = null">
                                                            {{
                                                                $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')
                                                            }}
                                                        </button>
                                                    </div>
                                                </Teleport>
                                            </div>
                                            <div v-for="(shift, shiftIndex) in sortMultiDayShiftsFirst(state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.shifts)"
                                                :key="'s-' + employeeIndex + '-' + shiftIndex"
                                                :class="['rounded-lg relative cursor-pointer mt-2 overflow-visible', shift.is_conflict ? 'ring-2 ring-red-400' : '']"
                                                :draggable="isAdmin(userStore.getUser?.role)"
                                                :style="{ backgroundColor: shift?.type?.color }"
                                                @click.stop="editSchedule(employee, employeeIndex as number, shift)"
                                                @dragstart="isAdmin(userStore.getUser?.role) && onMonthDragStart($event, employee, day, shift)"
                                                @dragend="isAdmin(userStore.getUser?.role) && onMonthDragEnd($event)">
                                                <!-- Conflict indicator -->
                                                <div v-if="shift.is_conflict" class="absolute -top-2 -left-2 z-30">
                                                    <Tooltip position="right" :wrap="true"
                                                        :text="$t('dutySchedules.conflictTooltip', { count: (sortMultiDayShiftsFirst(state.monthlySchedules?.data?.[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]?.shifts) || []).filter(s => s.is_conflict).length + 1 })">
                                                        <div
                                                            class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center cursor-help">
                                                            <Icon name="ph:warning" class="w-3 h-3"
                                                                style="color:white" />
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                                <div class="absolute top-1 left-1 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                                    style="font-size:0.875rem"
                                                    v-if="shift?.type?.system_name === 'sick-leave'">
                                                    🤒
                                                </div>
                                                <div class="absolute top-1 left-1 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                                    style="font-size:0.875rem"
                                                    v-if="shift?.type?.system_name === 'vacation-leave'">
                                                    🏖️
                                                </div>
                                                <button
                                                    class="w-5 h-5 rounded-full flex items-center justify-center absolute -right-1 -top-2"
                                                    style="background-color:#fef2f2;color:#dc2626;border:1.5px solid #fecaca"
                                                    @click.stop="removeShiftConfirmation(shift)"
                                                    v-if="hasDeletePermission || isAdmin(userStore.getUser?.role)">
                                                    <Tooltip position="left"
                                                        :text="$t('dutySchedules.removeSchedule.removeSchedule')">
                                                        <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                    </Tooltip>
                                                </button>
                                                <button
                                                    class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                    v-else v-if="userStore.getUser?.uuid === employee?.uuid"
                                                    @click.stop>
                                                    <Menu as="div"
                                                        class="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center">
                                                        <div>
                                                            <MenuButton
                                                                class="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                                                                <Tooltip position="left"
                                                                    :text="$t('dutySchedules.scheduleRequests.newRequest')">
                                                                    <Icon name="ic:baseline-question-mark"
                                                                        class="h-2.5 w-2.5" aria-hidden="true" />
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
                                                                class="absolute right-0 z-[200] w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                <div class="py-1">
                                                                    <MenuItem v-slot="{ active }">
                                                                    <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs cursor-pointer']"
                                                                        @click.stop="requestTimeAdjustment(employeeIndex as number, shift)">
                                                                        {{
                                                                            $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequest')
                                                                        }}
                                                                    </a>
                                                                    </MenuItem>
                                                                    <MenuItem v-slot="{ active }">
                                                                    <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs cursor-pointer']"
                                                                        @click.stop="requestSwapSchedule(shift)">
                                                                        {{
                                                                            $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequest')
                                                                        }}
                                                                    </a>
                                                                    </MenuItem>
                                                                </div>
                                                            </MenuItems>
                                                        </transition>
                                                    </Menu>
                                                </button>
                                                <div class="flex items-center justify-between px-2 pt-2 pb-1">
                                                    <span class="text-sm font-bold" style="color:white">
                                                        {{ moment(shift?.date_time_start).format('HH:mm') }}
                                                    </span>
                                                    <Icon name="ph:arrow-right" class="w-3 h-3 flex-shrink-0"
                                                        style="color:rgba(255,255,255,0.7)" />
                                                    <span class="text-sm font-bold" style="color:white">
                                                        {{ moment(shift?.date_time_end).format('HH:mm') }}
                                                    </span>
                                                </div>
                                                <div class="mx-2 border-t mb-1"
                                                    style="border-color:rgba(255,255,255,0.25)"></div>

                                                <div class="flex items-center gap-2 px-2 pb-1.5">
                                                    <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=ffffff&color=0f4c75&name=${employee?.firstname}+${employee?.lastname}&size=32`"
                                                        class="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                                        style="border:2px solid rgba(255,255,255,0.8)" />
                                                    <span class="text-xs font-bold truncate" style="color:white">
                                                        {{ employee?.firstname }} {{ employee?.lastname }}
                                                    </span>
                                                </div>

                                                <div class="flex items-center gap-1 px-2 pb-1"
                                                    v-if="shift?.departments?.length > 0">
                                                    <Icon name="ph:house" class="w-3 h-3 flex-shrink-0"
                                                        style="color:white" />
                                                    <span class="text-xxs truncate" style="color:white">
                                                        {{
                                                            shift?.departments?.map((d: any) => d.name).join(', ')
                                                        }}
                                                    </span>
                                                </div>

                                                <div v-if="shift?.shift_span_position && shift?.shift_span_position !== 'single'"
                                                    class="px-2 pb-1.5">
                                                    <div class="flex items-center gap-1 rounded-full px-1.5 py-0.5 w-fit"
                                                        style="background:rgba(255,255,255,0.2)">
                                                        <span class="text-xxs font-medium" style="color:white">
                                                            <span v-if="shift.shift_span_position === 'start'">
                                                                → {{ $t('dutySchedules.shiftSpan.start') }}
                                                            </span>
                                                            <span v-if="shift.shift_span_position === 'middle'">
                                                                ↔ {{ $t('dutySchedules.shiftSpan.middle') }}
                                                            </span>
                                                            <span v-if="shift.shift_span_position === 'end'">
                                                                ← {{ $t('dutySchedules.shiftSpan.end') }}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div class="flex flex-wrap gap-1 px-2 pb-1"
                                                    v-if="shift?.citizen_schedules?.length > 0">
                                                    <div v-for="(cs, csIdx) in shift.citizen_schedules" :key="csIdx"
                                                        class="flex items-center gap-1 bg-white rounded-full pl-0.5 pr-1.5 py-0.5">
                                                        <div
                                                            class="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                            <span class="font-bold text-gray-600" style="font-size:8px">
                                                                {{
                                                                    (cs?.citizen?.firstname?.charAt(0) || '') +
                                                                    (cs?.citizen?.lastname?.charAt(0) || '')
                                                                }}
                                                            </span>
                                                        </div>
                                                        <span class="text-xxs font-semibold text-gray-700">
                                                            {{ cs?.citizen?.firstname }}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Tooltip v-if="shift && shift.note && shift.note.trim()"
                                                    :text="`${$t('dutySchedules.shiftNote')}: ${shift.note}`"
                                                    position="left" :wrap="true">
                                                    <div class="flex items-center gap-1 px-2 pb-1.5 cursor-help">
                                                        <Icon name="ph:note" class="w-3 h-3 flex-shrink-0"
                                                            style="color:white" />
                                                        <span
                                                            class="text-white max-w-32 text-[10px] font-medium truncate">
                                                            {{ shift.note }}
                                                        </span>
                                                    </div>
                                                </Tooltip>

                                                <div class="flex items-center flex-wrap gap-1 px-2 pb-1.5"
                                                    v-if="shift?.tags?.length > 0">
                                                    <Tooltip :text="tag?.tag" v-for="(tag, tagIndex) in shift?.tags"
                                                        :key="tagIndex">
                                                        <div class="w-4 h-4 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                                                            :style="{ backgroundColor: tag?.color, fontSize: '9px', color: 'white' }">
                                                            <span v-if="tag?.tag">{{ tag?.tag?.charAt(0) }}</span>
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="h-full" />
                                </template>
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
            :availableEmployees="filteredEmployeesForModal" :isModalLoading="state.isModalLoading"
            :showEmployeeSelect="true" :error="state.newShiftError" :selectedDate="state.newShift.selectedDate"
            :selectedEmployee="state.newShift.selectedEmployee" :showWarningDialog="state.showWarningDialog"
            :shiftWarnings="state.shiftWarnings" @dateTimeChange="dateTimeChange"
            @closeWarningDialog="closeWarningDialog" @close="state.modal.isAddShiftOpen = false" @saveShift="saveShift"
            @resetNewShiftError="state.newShiftError = {}" />
        <ModulesUserDutyScheduleModalEditShift :isModalLoading="state.isModalLoading"
            :availableEmployees="filteredEmployeesForModal" :isModalOpen="state.modal.isEditShiftOpen"
            :error="state.editShiftError" :selectedEmployee="state.editShift.selectedEmployee"
            :selectedEmployeeSchedule="state.editShift.selectedEmployeeSchedule"
            :showWarningDialog="state.showWarningDialog" :shiftWarnings="state.shiftWarnings"
            @dateTimeChange="dateTimeChange" @closeWarningDialog="closeWarningDialog"
            @close="state.modal.isEditShiftOpen = false" @resetEditShiftError="state.editShiftError = {}"
            @updateShift="updateSelectedSchedule" />
        <ModulesUserDutyScheduleModalRemoveShiftConfirmation :isModalOpen="state.modal.isRemoveShiftConfirmationOpen"
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
        <ModulesUserDutyScheduleTimeRequestsModalRequests :isModalOpen="state.modal.isManageTimeAdjustmentRequestsOpen"
            :selectedDate="state.manageTimeRequest.selectedDate"
            :selectedEmployee="state.manageTimeRequest.selectedEmployee"
            @close="state.modal.isManageTimeAdjustmentRequestsOpen = false"
            @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleSwapScheduleModalRequests :isModalOpen="state.modal.isManageSwapScheduleRequestsOpen"
            :selectedDate="state.manageSwapScheduleRequest.selectedDate"
            :selectedEmployee="state.manageSwapScheduleRequest.selectedEmployee"
            @close="state.modal.isManageSwapScheduleRequestsOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleTimeRequestsModalNewRequest :isModalOpen="state.modal.isRequestTimeAdjustmentOpen"
            :selectedEmployee="state.manageTimeRequest.selectedEmployee"
            :selectedSchedule="state.manageTimeRequest.selectedSchedule"
            @close="state.modal.isRequestTimeAdjustmentOpen = false" />
        <ModulesUserDutyScheduleSwapScheduleModalNewRequest :isModalOpen="state.modal.isRequestSwapScheduleOpen"
            :selectedSchedule="state.manageSwapScheduleRequest.selectedSchedule"
            @close="state.modal.isRequestSwapScheduleOpen = false" />
        <ModulesUserDutyScheduleScheduleSlotsModalScheduleSlots :isModalOpen="state.modal.isManageScheduleSlotOpen"
            :selectedDay="state.manageScheduleSlot.selectedDay" @close="state.modal.isManageScheduleSlotOpen = false"
            @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleModalCopyMultipleWeeks :isModalOpen="state.modal.isCopyMultipleWeeklyScheduleOpen"
            @close="state.modal.isCopyMultipleWeeklyScheduleOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleNormHoursModalGraph :isModalOpen="state.modal.isGraphOpen"
            :selectedEmployee="state.normHours.selectedEmployee" @close="state.modal.isGraphOpen = false" />

        <!-- Floating stop-copying button — shown when something has been copied -->
        <Teleport to="body">
            <div v-if="!isDailyScheduleCopiedEmpty() || state.copy.selectedWeek || state.copy.selectedMonth"
                class="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full shadow-xl cursor-pointer select-none"
                style="box-shadow: 0 4px 24px rgba(15,76,117,0.35)" @click="stopCopying()">
                <Icon name="mdi:content-copy" class="h-4 w-4" />
                <span class="text-sm font-semibold">{{ $t('dutySchedules.copyPaste.copyingActive') }}</span>
                <Icon name="ph:x-bold" class="h-4 w-4 ml-1 opacity-70" />
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
let _dragShift: any = null
let _dragSourceEmployee: any = null
let _dragSourceDay: string | null = null
let _hoverTimer: ReturnType<typeof setTimeout> | null = null

function showPopover(index: number) {
    if (_hoverTimer) { clearTimeout(_hoverTimer); _hoverTimer = null }
    state.hoveredEmployee = index
}

function hidePopoverWithDelay() {
    _hoverTimer = setTimeout(() => {
        state.hoveredEmployee = null
        _hoverTimer = null
    }, 1000)
}
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
const filteredEmployeesForModal = computed(() => {
    const dept = departmentStore.getSelectedDepartmentName
    const employees = state.monthlySchedules?.data || []
    if (!dept || dept === 'Alle afdelinger' || dept === 'All departments' || dept === 'all' || dept === '') return employees
    return employees.filter((emp: any) =>
        emp.departments?.some((d: any) => d.name === dept)
    )
})

const { formatNumber } = useNumberFormatter()
const currentDate = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))
const expandedRecords = reactive([] as boolean[])

const teleportReady = ref(false)

const requestMenuState = reactive({
    openKey: null as string | null,
    top: 0,
    left: 0,
})

function openRequestMenu(key: string, event: MouseEvent) {
    if (requestMenuState.openKey === key) {
        requestMenuState.openKey = null
        return
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    requestMenuState.top = rect.bottom + 4
    requestMenuState.left = Math.max(4, rect.right - 192)
    requestMenuState.openKey = key
}

function closeRequestMenu() {
    requestMenuState.openKey = null
}

const state = reactive({
    addShift: {
        selectedEmployeeSchedule: {},
    } as any,
    copy: {
        allEmployeeSchedules: {},
        selectedEmployeeDailySchedule: {},
        selectedWeek: null as any, // { weekNumber, days, year }
        selectedMonth: null as any, // { weeks, year, month }
    } as any,
    copyShiftError: {} as Error,
    customWeekLabel: 'month',
    dataFilter: {
        search: '',
    },
    dragSuccessMessage: '' as string,
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
    isDragging: false,
    isPageLoading: false,
    isModalLoading: false,
    isUpdateShift: false,
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
    monthlySchedules: null as any,
    newShift: {
        selectedDate: '',
        selectedEmployee: {},
        availableEmployees: [] as any[],
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
    hoveredEmployee: null as number | null,
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
    shiftWarnings: [] as any[],
    showWarningDialog: false,
    sortData: {
        sortField: 'firstname',
        sortOrder: 'ascend',
    },
    viewShift: {
        selectedEmployeeSchedule: {},
    } as any,
})


onMounted(() => {
    nextTick(() => {
        teleportReady.value = document.getElementById("schedule-date-picker-target") ? true : false
    })
})

// ============================================================
// NEW: Weekly grid computation
// ============================================================
const monthWeeks = computed(() => {
    const start = moment(currentDate.value).startOf('month')
    const end = moment(currentDate.value).endOf('month')
    const weeks: { weekNumber: number; days: (any | null)[] }[] = []

    let current = start.clone().startOf('isoWeek') // Monday
    while (current.isSameOrBefore(end)) {
        const weekDays: (any | null)[] = []
        const weekNum = current.isoWeek()

        for (let i = 0; i < 7; i++) {
            const day = current.clone().add(i, 'days')
            if (day.month() === start.month()) {
                weekDays.push(day)
            } else {
                weekDays.push(null)
            }
        }

        // Only add weeks that have at least one day in the month
        if (weekDays.some(d => d !== null)) {
            weeks.push({ weekNumber: weekNum, days: weekDays })
        }

        current.add(7, 'days')
    }

    return weeks
})

// Day name helper (translated short names)
function getDayName(day: any) {
    if (!day) return ''
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const key = names[moment(day).isoWeekday() - 1]
    return key ? language.t(`calendar.week.short.${key}`) : ''
}

function isToday(day: any) {
    return day && moment(day).isSame(moment(), 'day')
}

function isWeekend(day: any) {
    if (!day) return false
    const wd = moment(day).isoWeekday()
    return wd === 6 || wd === 7
}

function getEasterSunday(year: number) {
    // Gauss’ algorithm for calculating Easter
    const a = year % 19
    const b = Math.floor(year / 100)
    const cc = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(cc / 4)
    const k = cc % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31)
    const day = ((h + l - 7 * m + 114) % 31) + 1
    return moment(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
}

function getDanishHolidays(year: number): Record<string, string> {
    const easter = getEasterSunday(year)
    const holidays: Record<string, string> = {}
    const add = (m: any, name: string) => { holidays[m.format('YYYY-MM-DD')] = name }
    // Fixed public holidays
    add(moment(`${year}-01-01`), 'Nytårsdag')
    add(moment(`${year}-12-24`), 'Juleaften')
    add(moment(`${year}-12-25`), '1. juledag')
    add(moment(`${year}-12-26`), '2. juledag')
    // Easter-related
    add(easter.clone().subtract(3, 'days'), 'Skærtorsdag')
    add(easter.clone().subtract(2, 'days'), 'Langfredag')
    add(easter.clone(), 'Påskedag')
    add(easter.clone().add(1, 'days'), '2. påskedag')
    add(easter.clone().add(26, 'days'), 'Store bededag')
    add(easter.clone().add(39, 'days'), 'Kristi himmelfartsdag')
    add(easter.clone().add(49, 'days'), 'Pinsedag')
    add(easter.clone().add(50, 'days'), '2. pinsedag')
    return holidays
}

function getHoliday(day: any) {
    if (!day) return null
    const dateKey = moment(day).format('YYYY-MM-DD')
    // Check backend data first, then fall back to frontend calculation
    const backendHoliday = state.monthlySchedules?.month_data?.[dateKey]?.holiday?.name
    if (backendHoliday) return backendHoliday
    const year = moment(day).year()
    const danishHolidays = getDanishHolidays(year)
    return danishHolidays[dateKey] || null
}

// ============================================================
// Permissions
// ============================================================
const hasCreatePermission = computed(() => {
    return userStore.getUser?.permissions?.includes('duty-schedule.create') || false
})

const hasDeletePermission = computed(() => {
    return userStore.getUser?.permissions?.includes('duty-schedule.delete') || false
})

function isAdmin(role: any) {
    return role && role === 'Admin'
}

// ============================================================
// Data fetching
// ============================================================
async function fetchDutySchedule() {
    state.error = {}
    state.progress.totalRequests++
    state.progress.pendingRequests++
    identifyTheProgressPercentage()
    try {
        state.isPageLoading = true
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
            state.isPageLoading = false
            emit('setDutyScheduleCurrentDate', state.selectedDate)
        }
    } catch (error: any) {
        state.error = error
        state.isPageLoading = false
    }
}

// ============================================================
// Navigation
// ============================================================
function setToday() {
    state.customWeekLabel = 'month'
    currentDate.value = moment()
    state.selectedDate = moment().format('YYYY-MM-DD')
}

function previousMonth() {
    state.customWeekLabel = 'month'
    currentDate.value = moment(currentDate.value).subtract(1, 'month')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
}

function nextMonth() {
    state.customWeekLabel = 'month'
    currentDate.value = moment(currentDate.value).add(1, 'month')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
}

// ============================================================
// Shift helpers
// ============================================================
function hasConflict(shifts: any) {
    return shifts?.some((shift: any) => shift.is_conflict === true) || false
}

function sortMultiDayShiftsFirst(shifts: any) {
    if (!shifts) return []
    return [...shifts].sort((a: any, b: any) => {
        const aMulti = a.shift_span_position !== 'single' ? 0 : 1
        const bMulti = b.shift_span_position !== 'single' ? 0 : 1
        return aMulti - bMulti
    })
}

// ============================================================
// Employee actions
// ============================================================
function viewCompensatoryHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isCompensatoryHoursOpen = true
}

function viewAvailableVacationHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isVacationHoursOpen = true
}

function openAddNewShiftModalForDay(day: any) {
    state.modal.isAddShiftOpen = true
    state.newShift.selectedDate = moment(day).format('YYYY-MM-DD')
    state.newShift.selectedEmployee = filteredEmployeesForModal.value?.[0] || null
    state.newShift.availableEmployees = filteredEmployeesForModal.value || []
}

function isCopiedDay(day: any) {
    if (!day) return false
    return state.copy.selectedEmployeeDailySchedule?.date === moment(day).format('YYYY-MM-DD')
}

function copyWeek(week: any) {
    state.copy.selectedWeek = {
        weekNumber: week.weekNumber,
        days: week.days.filter((d: any) => d !== null),
        year: moment(week.days.find((d: any) => d !== null)).year()
    }
    state.copy.selectedMonth = null
}

async function pasteWeek(targetWeek: any) {
    if (!state.copy.selectedWeek) return
    const srcDays = state.copy.selectedWeek.days
    const dstDays = targetWeek.days.filter((d: any) => d !== null)
    // Copy day by day – match by weekday (Mon = Mon, Tue = Tue, etc.)
    for (let di = 0; di < Math.min(srcDays.length, dstDays.length); di++) {
        const srcDate = moment(srcDays[di]).format('YYYY-MM-DD')
        const dstDate = moment(dstDays[di]).format('YYYY-MM-DD')
        for (let ei = 0; ei < (state.monthlySchedules?.data?.length || 0); ei++) {
            const emp = state.monthlySchedules?.data?.[ei]
            if (!emp) continue
            const shifts = emp?.days?.[srcDate]?.shifts || []
            if (shifts.length === 0) continue
            await copyDutySchedule({
                user_uuid_source: emp.uuid,
                user_uuid_destination: emp.uuid,
                date_source: srcDate,
                date_destination: dstDate,
            })
        }
    }
    fetchDutySchedule()
}

function copyMonth() {
    // Save a snapshot of the current month including all employees’ shifts
    const employeeSnapshot = JSON.parse(JSON.stringify(state.monthlySchedules?.data || []))
    state.copy.selectedMonth = {
        weeks: JSON.parse(JSON.stringify(monthWeeks.value)),
        year: moment(state.selectedDate).year(),
        month: moment(state.selectedDate).month(),
        employeeSnapshot: employeeSnapshot
    }
    state.copy.selectedWeek = null
    state.copy.selectedEmployeeDailySchedule = {}
    console.log('copyMonth: gemte', employeeSnapshot.length, 'medarbejdere')
}

async function pasteMonth(targetWeeks: any[]) {
    if (!state.copy.selectedMonth) return
    const srcWeeks = state.copy.selectedMonth.weeks
    const empSnap = state.copy.selectedMonth.employeeSnapshot || []
    console.log('pasteMonth: src uger', srcWeeks.length, 'dst uger', targetWeeks.length, 'emp', empSnap.length)
    // Match weeks 1:1 — if the months have a different number of weeks, use the minimum
    for (let wi = 0; wi < Math.min(srcWeeks.length, targetWeeks.length); wi++) {
        const srcDays = srcWeeks[wi].days.filter((d: any) => d !== null)
        const dstDays = targetWeeks[wi].days.filter((d: any) => d !== null)
        // Match by weekday position (index 0 = Mon, 1 = Tue, etc.)
        for (let di = 0; di < Math.min(srcDays.length, dstDays.length); di++) {
            const srcDate = moment(srcDays[di]).format('YYYY-MM-DD')
            const dstDate = moment(dstDays[di]).format('YYYY-MM-DD')
            // Use the snapshot to find shifts from the source month
            for (let ei = 0; ei < empSnap.length; ei++) {
                const emp = empSnap[ei]
                if (!emp) continue
                const shifts = emp?.days?.[srcDate]?.shifts || []
                if (shifts.length === 0) continue
                console.log('Kopierer', emp.firstname, srcDate, '->', dstDate)
                await copyDutySchedule({
                    user_uuid_source: emp.uuid,
                    user_uuid_destination: emp.uuid,
                    date_source: srcDate,
                    date_destination: dstDate,
                })
            }
        }
    }
    fetchDutySchedule()
}

function onMonthDragStart(e: DragEvent, emp: any, day: any, sh: any) {
    _dragShift = sh; _dragSourceEmployee = emp; _dragSourceDay = moment(day).format('YYYY-MM-DD')
    state.isDragging = true
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onMonthDragEnd(e: DragEvent) {
    setTimeout(() => {
        state.isDragging = false
        _dragShift = null; _dragSourceEmployee = null; _dragSourceDay = null
        document.querySelectorAll('.drag-over-cell').forEach((el: any) => {
            el.style.outline = ''; el.style.background = ''; el.classList.remove('drag-over-cell')
        })
    }, 200)
}

function onMonthDragOver(e: DragEvent) {
    e.preventDefault()
    const t = e.currentTarget as HTMLElement
    if (t) { t.style.outline = '2px dashed #2dbab2'; t.style.background = 'rgba(45,186,178,0.08)'; t.classList.add('drag-over-cell') }
}

function onMonthDragLeave(e: DragEvent) {
    const t = e.currentTarget as HTMLElement
    const rel = e.relatedTarget as HTMLElement
    if (t && (!rel || !t.contains(rel))) { t.style.outline = ''; t.style.background = ''; t.classList.remove('drag-over-cell') }
}

async function onMonthDrop(e: DragEvent, targetDay: any) {
    e.preventDefault()
    const t = e.currentTarget as HTMLElement
    if (t) { t.style.outline = ''; t.style.background = ''; t.classList.remove('drag-over-cell') }
    if (!_dragShift || !targetDay) return
    const targetDate = moment(targetDay).format('YYYY-MM-DD')
    if (_dragSourceDay === targetDate) { state.isDragging = false; _dragShift = null; return }
    const sh = _dragShift
    const emp = _dragSourceEmployee
    _dragShift = null; _dragSourceEmployee = null; _dragSourceDay = null; state.isDragging = false
    try {
        await dutyScheduleService.moveShift(sh.schedule_uuid, {
            date: targetDate,
            user_uuid: emp.uuid
        })
        state.dragSuccessMessage = language.t('dutySchedules.shiftMovedTo') + ' ' + moment(targetDay).format('D. ') + language.t('calendar.month.' + moment(targetDay).format('MMMM'))
        setTimeout(() => { state.dragSuccessMessage = '' }, 3000)
        await fetchDutySchedule()
    } catch (err: any) { state.error = err }
}

function copyDayForAllEmployees(day: any) {
    // Gem dato og alle medarbejdere saa vi ved hvad der skal kopieres
    state.copy.selectedEmployeeDailySchedule = {
        date: moment(day).format('YYYY-MM-DD'),
        employee: state.monthlySchedules?.data?.[0], // bruges kun som reference
        currentTablePage: dutyScheduleStore.getCurrentPageNumber,
    }
}

async function pasteDayAllEmployees(day: any) {
    const dateSource = state.copy.selectedEmployeeDailySchedule?.date
    const dateDestination = moment(day).format('YYYY-MM-DD')
    if (!dateSource || dateSource === dateDestination) return
    // Kopier vagter for HVER medarbejder der HAR vagter paa source-dag
    for (let i = 0; i < (state.monthlySchedules?.data?.length || 0); i++) {
        const emp = state.monthlySchedules?.data?.[i]
        if (!emp) continue
        const shifts = emp?.days?.[dateSource]?.shifts || []
        if (shifts.length === 0) continue // spring over hvis ingen vagter
        await copyDutySchedule({
            user_uuid_source: emp.uuid,
            user_uuid_destination: emp.uuid,
            date_source: dateSource,
            date_destination: dateDestination,
        })
    }
    fetchDutySchedule()
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

function getSlotCountForDay(day: any) {
    const dateKey = moment(day).format('YYYY-MM-DD')
    return state.monthlySchedules?.month_data?.[dateKey]?.total_slots || 0
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

// ============================================================
// Shift CRUD
// ============================================================
async function saveShift(shiftDetails: any) {
    const employeeIndex = state.addShift.selectedEmployeeSchedule.employeeIndex
    const shiftType = shiftDetails.shift_type
    const params = {
        shift_type_uuid: shiftType,
        is_sleeping_sick_leave: shiftDetails?.is_sleeping_sick_leave,
        do_not_count_weekends: shiftDetails?.do_not_count_weekends,
        date_time_start: shiftDetails?.date_time_start,
        date_time_end: shiftDetails?.date_time_end,
        user_uuid: shiftDetails?.user_uuid,
        citizen_uuid: shiftDetails?.citizens,
        schedule_tag_uuid: shiftDetails?.schedule_tag_uuid,
        department_uuid: shiftDetails?.department_uuid,
        use_compensatory_time: shiftDetails?.use_compensatory_time,
        note: shiftDetails?.note,
        do_not_count_sick_leave: shiftDetails?.do_not_count_sick_leave,
        is_recurring: shiftDetails?.recurring.is_recurring,
        recurring: shiftDetails?.recurring?.recurring,
        recurring_until: shiftDetails?.recurring?.recurring_until,
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
            setTimeout(() => { state.isModalLoading = false }, 300)
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

// ============================================================
// Copy/paste
// ============================================================
function isDailyScheduleCopiedEmpty() {
    return Object.keys(state.copy.selectedEmployeeDailySchedule).length === 0
}

function isDailyScheduleCopied(employee: any, day: any) {
    if (!day) return false
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
    state.copy.selectedWeek = null
    state.copy.selectedMonth = null
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

// ============================================================
// Extra hours, leave, schedule management
// ============================================================
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
        const params = { delete_entire_shift: true }
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

// ============================================================
// View/edit shifts
// ============================================================
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
        recurring: { is_recurring: shift?.is_recurring },
        user_uuid: userUuid,
        shift_type: shift?.type,
        tags: shift?.tags,
        departments: shift?.departments,
        note: shift?.note,
        do_not_count_sick_leave: shift?.do_not_count_sick_leave,
        use_compensatory_time: shift?.use_compensatory_time,
        shift_span_position: shift?.shift_span_position,
    }
    state.modal.isEditShiftOpen = true
}

async function updateSelectedSchedule(shiftDetails: any) {
    console.log("[DEBUG] employee_uuid from modal:", shiftDetails.employee_uuid, "original:", state.editShift.selectedEmployeeSchedule.user_uuid)
    const scheduleUuid = state.editShift.selectedEmployeeSchedule.scheduleUuid
    const originalEmployeeUuid = state.editShift.selectedEmployeeSchedule.user_uuid
    const newEmployeeUuid = shiftDetails.employee_uuid || originalEmployeeUuid
    // Medarbejder-skift haandteres via user_uuid i updateDutySchedule params nedenfor
    const employeeUuid = newEmployeeUuid
    const params = {
        shift_type_uuid: shiftDetails.shift_type,
        is_sleeping_sick_leave: shiftDetails.is_sleeping_sick_leave,
        do_not_count_weekends: shiftDetails.do_not_count_weekends,
        date_time_start: shiftDetails?.date_time_start,
        date_time_end: shiftDetails?.date_time_end,
        is_apply_to_all: shiftDetails?.recurring?.is_apply_to_all,
        user_uuid: employeeUuid,
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
        setTimeout(() => { state.isModalLoading = false }, 300)
    }
}

// ============================================================
// Pagination, sorting, filtering, search
// ============================================================
function previous() {
    dutyScheduleStore.setCurrentPageNumber(dutyScheduleStore.getCurrentPageNumber - 1)
    fetchDutySchedule()
}

function next() {
    dutyScheduleStore.setCurrentPageNumber(dutyScheduleStore.getCurrentPageNumber + 1)
    fetchDutySchedule()
}

function changePageLength(event: any) {
    dutyScheduleStore.setCurrentPageLength(event.target.value)
    dutyScheduleStore.setCurrentPageNumber(1)
    fetchDutySchedule()
}

function sortDutySchedule() {
    state.sortData.sortOrder = state.sortData.sortOrder === 'ascend' ? 'descend' : 'ascend'
    fetchDutySchedule()
}

function setFilter(filter: any) {
    state.filter = filter
    state.modal.isFilterDutyScheduleOpen = false
    emit('setDutyScheduleCurrentFilter', filter)
    fetchDutySchedule()
}

function handleSearch(search: string) {
    state.dataFilter.search = search
    fetchDutySchedule()
}

function toggleShowHideAllShifts() {
    state.showAllShifts = !state.showAllShifts
    expandedRecords.fill(state.showAllShifts)
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}

function isPreviousMonthDisabled() {
    if (!isAdmin(userStore.getUser?.role) && userStore.getUser?.company?.is_lock_past_schedules) {
        const thisMonthStart = moment().startOf('month')
        const selectedMonthStart = moment(state.selectedDate).startOf('month')
        if (selectedMonthStart.isSame(thisMonthStart, 'month')) return true
    }
    return false
}

async function dateTimeChange(employeeUuid: string, newDateTimeStart: string, newDateTimeEnd: string, shiftSpanPosition?: string) {
    try {
        const params: any = {
            date_time_start: newDateTimeStart,
            date_time_end: newDateTimeEnd,
            user_uuid: employeeUuid,
            ...(shiftSpanPosition && { shift_span_position: shiftSpanPosition }),
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

// ============================================================
// Watchers
// ============================================================
watch(() => state.progress.percentage, (newPercentage: any) => {
    if (newPercentage < 100) {
        state.progress.showProgressBar = true
    } else {
        setTimeout(() => {
            state.progress.showProgressBar = false
        }, 500)
    }
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    dutyScheduleStore.setCurrentPageNumber(1)
    fetchDutySchedule()
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    currentDate.value = moment(newSelectedDate)
    fetchDutySchedule()
})

watch(() => dutyScheduleStore.getShowEmployeesWorkingToday, (status: boolean) => {
    state.showEmployeesWorkingToday = status
    fetchDutySchedule()
})

// ============================================================
// Lifecycle
// ============================================================
onMounted(() => {
    fetchDutySchedule()
    document.addEventListener('click', closeRequestMenu)
})

onUnmounted(() => {
    document.removeEventListener('click', closeRequestMenu)
})
</script>
