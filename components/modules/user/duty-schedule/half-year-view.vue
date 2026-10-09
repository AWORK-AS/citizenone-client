<template>
    <div class="space-y-2">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="state?.copyShiftError?.message"
            v-if="state.copyShiftError?.message && state.copyShiftError.message.length > 0" />

        <div class="flex h-full flex-col">

            <!-- Teleport navigation to breadcrumb row -->
            <Teleport to="#schedule-date-picker-target" v-if="teleportReady">
                <div class="flex items-center gap-1.5">
                    <div
                        class="relative flex items-center rounded-lg bg-white ring-1 ring-gray-200 overflow-hidden h-[32px]">
                        <button @click="previousHalfYear()" type="button"
                            class="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <Icon name="heroicons:chevron-left" class="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span class="px-2 text-xs font-semibold text-gray-700 select-none">{{ periodLabel }}</span>
                        <button @click="nextHalfYear()" type="button"
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

            <!-- Toolbar -->
            <div class="mb-2">
                <div class="flex flex-wrap items-center justify-between gap-2 py-1">
                    <!-- Left: Period label + toggle -->
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div class="bg-blue-50 ring-1 ring-blue-200 rounded-lg px-3 py-1">
                            <h3 class="text-sm font-semibold leading-6 text-gray-900 text-center">
                                {{ periodLabel }}
                            </h3>
                        </div>
                        <div class="hidden lg:block h-4 w-px bg-slate-200" />
                        <label class="flex items-center gap-2 cursor-pointer">
                            <FormSwitch :value="dutyScheduleStore.getShowEmployeesWorkingToday"
                                @toggleSwitch="dutyScheduleStore.setShowEmployeesWorkingToday(!dutyScheduleStore.getShowEmployeesWorkingToday)" />
                            <span class="text-xs text-gray-600">
                                {{ $t('dutySchedules.showEmployeesWorkingToday') }}
                            </span>
                        </label>
                    </div>

                    <!-- Right: Filter / Sort / Entries / Search -->
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <!-- Filter -->
                        <button v-if="hasManageFavoritesAccess" class="flex items-center gap-x-1 text-sm text-primary group"
                            @click="state.modal.isManageFavoritesOpen = true">
                            <Icon name="mdi:star-outline" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                            <span class="group-hover:text-primary-700">{{ $t('dutySchedules.favorites.manageFavorites') }}</span>
                        </button>
                        <button class="flex items-center gap-x-1 text-sm text-primary group"
                            @click="state.modal.isFilterDutyScheduleOpen = true">
                            <Icon name="ic:outline-filter-list"
                                class="text-primary w-6 h-6 group-hover:text-primary-700" />
                            <span class="group-hover:text-primary-700">{{ $t('filter') }}</span>
                        </button>

                        <!-- Sort -->
                        <Tooltip :text="state.sortData.sortOrder === 'ascend'
                            ? $t('dutySchedules.sort.sortNamesInDescendingOrder')
                            : $t('dutySchedules.sort.sortNamesInAscendingOrder')" position="left">
                            <button :aria-label="state.sortData.sortOrder === 'ascend'
                            ? $t('dutySchedules.sort.sortNamesInDescendingOrder')
                            : $t('dutySchedules.sort.sortNamesInAscendingOrder')"
                                class="flex items-center justify-center gap-x-2 outline-none rounded-md text-xs truncate font-semibold bg-primary border border-primary text-white hover:bg-primary-800 px-2 py-2"
                                @click="sortDutySchedule">
                                <Icon name="heroicons:arrow-down" class="h-5 w-5" aria-hidden="true"
                                    v-show="state.sortData?.sortOrder === 'ascend'" />
                                <Icon name="heroicons:arrow-up" class="h-5 w-5" aria-hidden="true"
                                    v-show="state.sortData?.sortOrder === 'descend'" />
                            </button>
                        </Tooltip>

                        <!-- Entries per page -->
                        <div class="bg-white border border-gray-200 rounded-md px-3 py-2">
                            <div class="flex items-center gap-x-1">
                                <span>{{ $t('entriesPerPage') }}:</span>
                                <select class="focus:outline-none bg-transparent" @change="changePageLength"
                                    id="halfYearPageLength">
                                    <option value="10" :selected="dutyScheduleStore.getCurrentPageLength === '10'">10
                                    </option>
                                    <option value="20" :selected="dutyScheduleStore.getCurrentPageLength === '20'">20
                                    </option>
                                    <option value="30" :selected="dutyScheduleStore.getCurrentPageLength === '30'">30
                                    </option>
                                    <option value="40" :selected="dutyScheduleStore.getCurrentPageLength === '40'">40
                                    </option>
                                    <option value="50" :selected="dutyScheduleStore.getCurrentPageLength === '50'">50
                                    </option>
                                    <option value="100" :selected="dutyScheduleStore.getCurrentPageLength === '100'">100
                                    </option>
                                    <option value="200" :selected="dutyScheduleStore.getCurrentPageLength === '200'">200
                                    </option>
                                    <option value="300" :selected="dutyScheduleStore.getCurrentPageLength === '300'">300
                                    </option>
                                    <option value="400" :selected="dutyScheduleStore.getCurrentPageLength === '400'">400
                                    </option>
                                    <option value="500" :selected="dutyScheduleStore.getCurrentPageLength === '500'">500
                                    </option>
                                    <option value="all" :selected="dutyScheduleStore.getCurrentPageLength === 'all'">{{
                                        $t('all') }}</option>
                                </select>
                            </div>
                        </div>

                        <!-- Search -->
                        <div
                            class="flex-1 sm:flex-none sm:w-auto xl:min-w-[160px] [&_input]:!h-[38px] [&_button]:!h-[38px] [&_form]:!h-[38px]">
                            <TableSearch type="duty-schedule" @search="handleSearch"
                                :placeholder="$t('dutySchedules.findEmployee')" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progress bar -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full transition-all ease-in-out duration-500 mb-1.5"
                :style="{ width: `${state.progress.percentage}%` }" v-if="state.progress.showProgressBar" />
            <div class="h-1.5 mb-1.5" v-else />

            <!-- Main layout: employee sidebar + multi-month grid -->
            <div class="flex bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">

                <!-- LEFT: Fixed employee avatar sidebar -->
                <div class="flex-shrink-0 w-[90px] border-r border-gray-200 bg-gray-50/50 rounded-l-xl">
                    <!-- Top-left corner spacer -->
                    <div class="h-[40px] border-b border-gray-200" />

                    <!-- Employee avatars with rich popover -->
                    <div v-for="(employee, employeeIndex) in sidebarEmployees" :key="'sidebar-' + employee.uuid"
                        class="border-b border-gray-100 flex flex-col items-center justify-center py-3 px-2 cursor-default relative"
                        @mouseenter="(isAtLeast('Admin') || userStore.getUser?.uuid === employee?.uuid) && showPopover(employeeIndex)"
                        @mouseleave="hidePopoverWithDelay()">
                        <img :src="employee?.profile_image ?? avatarUrl(`${employee?.firstname + ' ' + employee?.lastname}`)"
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
                            @mouseenter="showPopover(employeeIndex)" @mouseleave="hidePopoverWithDelay()">
                            <div class="flex items-center gap-3 mb-3">
                                <img :src="employee?.profile_image ?? avatarUrl(`${employee?.firstname + ' ' + employee?.lastname}`)"
                                    :class="[employee?.shift_threshold === 'high' && 'border-green-700', employee?.shift_threshold === 'moderate' && 'border-yellow-500', employee?.shift_threshold === 'low' && 'border-red-600', 'h-12 w-12 rounded-full bg-gray-50 object-cover border-2 shadow-md ring-2 ring-white']" />
                                <div>
                                    <p class="text-sm font-semibold text-gray-900">
                                        {{ employee?.firstname }} {{ employee?.lastname }}
                                    </p>
                                    <p class="text-xxs text-gray-500" v-if="employeeJobTitles(employee)">
                                        {{ employeeJobTitles(employee) }}
                                    </p>
                                </div>
                                <div class="ml-auto flex gap-1">
                                    <Tooltip position="left" :text="$t('dutySchedules.extraHours.extraHours')"
                                        v-if="hasScheduleManageAccess || userStore.getUser?.uuid === employee?.uuid">
                                        <button :aria-label="$t('dutySchedules.extraHours.extraHours')"
                                            class="bg-gray-100 w-7 h-7 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"
                                            @click="viewExtraHours(employee)">
                                            <Icon name="mdi:clock-outline" class="h-3 w-3" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip position="left" :text="$t('dutySchedules.leaveRequests.leaveRequests')"
                                        v-if="isAdmin(userStore.getUser?.role) || userStore.getUser?.uuid === employee?.uuid">
                                        <button :aria-label="$t('dutySchedules.leaveRequests.leaveRequests')"
                                            class="bg-gray-100 w-7 h-7 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center relative"
                                            @click="viewLeaveRequests(employee)">
                                            <Icon name="mdi:wallet-travel" class="h-3 w-3" />
                                            <div v-if="employee?.pending_leave_requests > 0"
                                                class="w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1 pointer-events-none" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip position="left"
                                        :text="isFavorited(employee) ? $t('dutySchedules.favorites.removeFromFavorites') : $t('dutySchedules.favorites.addToFavorites')"
                                        v-if="hasManageFavoritesAccess && userStore.getUser?.uuid !== employee?.uuid">
                                        <button :aria-label="isFavorited(employee) ? $t('dutySchedules.favorites.removeFromFavorites') : $t('dutySchedules.favorites.addToFavorites')"
                                            :class="[
                                                isFavorited(employee) ? 'text-yellow-500' : 'text-gray-500',
                                                'bg-gray-100 w-7 h-7 rounded-lg hover:bg-yellow-50 flex items-center justify-center'
                                            ]"
                                            @click="toggleFavoriteEmployee(employee)">
                                            <Icon :name="isFavorited(employee) ? 'mdi:star' : 'mdi:star-outline'"
                                                class="h-3 w-3" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                            <div class="text-xxs space-y-0.5 mb-2">
                                <p>
                                    <span class="text-gray-500">{{ $t('dutySchedules.filter.departments') }}:</span>
                                    <span v-for="(department, departmentIndex) in employee?.departments"
                                        :key="departmentIndex">
                                        {{ department?.name }}<span
                                            v-if="(departmentIndex as number) < employee.departments.length - 1">,
                                        </span><span v-else>.</span>
                                    </span>
                                </p>
                                <p>{{ $t('dutySchedules.annualNormHours') }}: {{ formatNumber(language.locale.value,
                                    employee?.annual_norm_hours ?? 0) }}</p>
                                <p>{{ $t('dutySchedules.weeklyNormHours') }}: {{
                                    calculateWeeklyNormHours(employee, periodStart.year()) }}</p>
                                <p>{{ $t('dutySchedules.totalHours') }}: {{ employee?.total_hours ?? 0 }}</p>
                                <p
                                    :class="[employee?.average_weekly_work_time?.severity === 'info' ? 'text-green-700' : employee?.average_weekly_work_time?.severity === 'warning' ? 'text-amber-700' : 'text-red-700']">
                                    {{ $t('dutySchedules.averageWeeklyHours.averageWeeklyHours') }}:
                                    {{ employee?.average_weekly_work_time?.average_weekly_hours }}
                                </p>
                                <p
                                    :class="[parseLocaleNumber(language.locale.value, employee?.log_data?.total_time_account_earned_hours) > 0 ? 'text-green-700' : 'text-red-700']">
                                    {{ $t('dutySchedules.monthView.earnedHours') }}:
                                    {{ employee?.log_data?.total_time_account_earned_hours }}
                                </p>
                                <p
                                    :class="[parseLocaleNumber(language.locale.value, employee?.extra_hours) > 0 ? 'text-green-700' : 'text-red-700']">
                                    {{ $t('dutySchedules.monthView.extraHours') }}:
                                    {{ employee?.extra_hours }}
                                </p>
                                <p class="text-primary cursor-pointer hover:text-primary-700 mt-1"
                                    @click="navigateTo('/calendar?employee_uuid=' + employee?.uuid)">
                                    {{ $t('dutySchedules.monthView.seeCalendar') }}
                                </p>
                                <Tooltip v-if="employee?.holiday_hours?.enabled"
                                    :text="$t('dutySchedules.holidayHoursHint')" position="top" :wrap="true"
                                    class="w-full mt-1.5">
                                    <div class="w-full rounded-lg border border-amber-200 bg-amber-50/70 px-2 py-1.5">
                                        <div class="flex items-center gap-1 mb-1">
                                            <Icon name="ph:calendar-check" class="w-3 h-3 text-amber-500"
                                                aria-hidden="true" />
                                            <span class="text-xxs font-semibold text-amber-800">
                                                {{ $t('dutySchedules.holidays') }}
                                            </span>
                                        </div>
                                        <div
                                            class="grid grid-cols-[1fr_auto_auto] gap-x-2.5 gap-y-0.5 text-xxs text-amber-800">
                                            <span></span>
                                            <span class="text-right font-medium text-amber-600">
                                                {{ $t('dutySchedules.month') }}
                                            </span>
                                            <span class="text-right font-medium text-amber-600">
                                                {{ $t('dutySchedules.currentYear') }}
                                            </span>
                                            <span>
                                                {{ $t('dutySchedules.holidayWorkedShort') }}
                                            </span>
                                            <span class="text-right tabular-nums">
                                                {{ employee?.holiday_hours?.worked_weekly }}
                                            </span>
                                            <span class="text-right tabular-nums">
                                                {{ employee?.holiday_hours?.worked_yearly }}
                                            </span>
                                            <template
                                                v-if="parseLocaleNumber(language.locale.value, employee?.holiday_hours?.compensation_yearly) > 0">
                                                <span>
                                                    {{ $t('dutySchedules.holidayCompensation') }}
                                                </span>
                                                <span class="text-right tabular-nums">
                                                    {{ employee?.holiday_hours?.compensation_weekly }}
                                                </span>
                                                <span class="text-right tabular-nums">
                                                    {{ employee?.holiday_hours?.compensation_yearly }}
                                                </span>
                                            </template>
                                            <span>
                                                {{ $t('dutySchedules.holidayNonWorkedShort') }}
                                            </span>
                                            <span class="text-right tabular-nums">
                                                {{ employee?.holiday_hours?.nonworked_weekly }}
                                            </span>
                                            <span class="text-right tabular-nums">
                                                {{ employee?.holiday_hours?.nonworked_yearly }}
                                            </span>
                                        </div>
                                    </div>
                                </Tooltip>
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
                                        {{ $t('dutySchedules.currentYear') }}
                                    </div>
                                </div>
                                <div v-for="(time, timeIndex) in employee?.hours" :key="timeIndex"
                                    :class="[(timeIndex as number) % 2 ? 'bg-white' : 'bg-gray-50', 'grid grid-cols-7 text-xxs py-0.5']">
                                    <div class="col-span-3 pl-1 flex items-center gap-1 truncate">
                                        <div class="w-2 h-2 rounded-sm flex-shrink-0"
                                            :style="{ background: time?.shift?.color }"></div>
                                        <span class="truncate">
                                            {{
                                                language.locale.value === 'en' ? time?.shift?.en_name :
                                                    language.locale.value === 'no' ? time?.shift?.no_name :
                                                        language.locale.value === 'sv' ? time?.shift?.sv_name :
                                                            time?.shift?.dk_name
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
                                        {{formatNumber(language.locale.value, employee?.hours?.reduce((sum: number, t:
                                            any) => sum +
                                            parseLocaleNumber(language.locale.value, t?.monthly_hours || t?.weekly_hours ||
                                                '0'), 0))
                                        }}
                                    </div>
                                    <div class="col-span-2 text-right pr-2 font-bold border-l border-gray-100">
                                        {{formatNumber(language.locale.value, employee?.hours?.reduce((sum: number, t:
                                            any) => sum +
                                            parseLocaleNumber(language.locale.value, t?.yearly_hours ?? '0'), 0))
                                        }}
                                    </div>
                                </div>
                            </div>
                            <div class="border-t border-gray-100 pt-2 mt-2 space-y-1"
                                v-if="employee?.show_compensatory_hours">
                                <div class="text-primary flex items-center gap-1 cursor-pointer text-xxs"
                                    @click="openGraphModal(employee)">
                                    <Icon name="ph:chart-bar-bold" class="h-3 w-3" />
                                    {{
                                        $t('dutySchedules.normHours.compensatoryHoursGraph')
                                    }}
                                </div>
                                <div :class="[employee?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700', 'flex items-center gap-1 cursor-pointer text-xxs']"
                                    @click="viewCompensatoryHours(employee)">
                                    <Icon name="ph:clock" class="h-3 w-3" />
                                    {{
                                        $t('dutySchedules.normHours.compensatoryHours')
                                    }}:
                                    {{
                                        formatNumber(language.locale.value,
                                            employee?.total_norm_hours?.compensatory_hours) ?? 0
                                    }}
                                </div>
                                <div :class="[employee?.total_norm_hours?.available_vacation_days > 0 ? 'text-green-700' : 'text-red-700', 'flex items-center gap-1 cursor-pointer text-xxs']"
                                    @click="viewAvailableVacationHours(employee)">
                                    <Icon name="ph:clock" class="h-3 w-3" />
                                    {{
                                        $t('dutySchedules.normHours.availableVacationDays')
                                    }}:
                                    {{
                                        formatNumber(language.locale.value,
                                            employee?.total_norm_hours?.available_vacation_days || 0)
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: Scrollable multi-month grid -->
                <div class="flex-1 overflow-x-auto">

                    <!-- Iterate through each month in the half-year -->
                    <div v-for="(monthMeta, monthMetaIndex) in allMonths" :key="'month-' + monthMeta.key">

                        <!-- Month header separator -->
                        <div class="bg-primary/5 border-b border-primary/20 px-4 py-2 flex items-center gap-3">
                            <span class="text-sm font-bold text-primary">{{ monthMeta.label }}</span>
                            <span class="text-xs text-gray-400">{{ monthMeta.year }}</span>
                            <span v-if="isCurrentMonth(monthMeta)"
                                class="ml-1 text-[10px] font-bold text-white bg-primary rounded-full px-2 py-0.5">
                                {{ $t('goToToday') }}
                            </span>
                        </div>

                        <!-- Weeks for this month -->
                        <div v-for="(week, weekIndex) in monthMeta.weeks"
                            :key="'week-' + monthMeta.key + '-' + weekIndex">

                            <!-- Week label row -->
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
                                    {{ week.days[0] ? formatLocalized(moment(week.days[0]), 'D. MMM') : '' }}
                                    –
                                    {{week.days[6] ?
                                        formatLocalized(moment(week.days[6]), 'D. MMM') :
                                        (week.days.filter((d: any) => d !== null).pop() ?
                                            formatLocalized(moment(week.days.filter((d: any) => d !== null).pop()), 'D. MMM') : '')}}
                                </span>
                                <div class="ml-auto flex items-center gap-1"
                                    v-if="isDailyScheduleCopiedEmpty() && !state.copy.selectedWeek && !state.copy.selectedMonth">
                                    <Tooltip :text="$t('dutySchedules.monthView.copyWeek')" position="left">
                                        <button :aria-label="$t('dutySchedules.monthView.copyWeek')"
                                            class="flex items-center gap-1 text-xxs text-gray-500 hover:text-primary bg-gray-100 hover:bg-blue-50 px-2 py-0.5 rounded"
                                            @click="copyWeek(week)">
                                            <Icon name="ph:calendar" class="h-3 w-3" />
                                            {{ $t('dutySchedules.week') }}
                                        </button>
                                    </Tooltip>
                                </div>
                                <div class="ml-auto flex items-center gap-1"
                                    v-if="isAdmin(userStore.getUser?.role) && !isDailyScheduleCopiedEmpty()">
                                    <button @click="stopCopying()"
                                        class="text-xxs text-gray-500 hover:text-red-500 flex items-center gap-0.5">
                                        <Icon name="ph:x" class="h-3 w-3" />
                                        {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                    </button>
                                </div>
                            </div>

                            <!-- Day header row -->
                            <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 sticky top-0 z-20">
                                <template v-for="(day, dayIndex) in week.days"
                                    :key="'wh-' + monthMeta.key + '-' + weekIndex + '-' + dayIndex">
                                    <!-- Admin: clickable with tooltip + slot badge -->
                                    <Tooltip v-if="hasScheduleManageAccess"
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
                                                    <span class="text-xs text-gray-500">{{ getDayName(day) }}</span>
                                                </div>
                                                <span v-if="getHoliday(day)"
                                                    class="capitalize inline-block text-amber-700 bg-amber-100 ring-1 ring-amber-300 text-[9px] font-semibold px-2 py-0.5 rounded-full leading-none mt-0.5 truncate max-w-full">
                                                    {{ getHoliday(day) }}
                                                </span>
                                            </div>
                                            <!-- Slot badge -->
                                            <div v-if="getSlotCountForDay(day) > 0"
                                                class="slot-badge absolute top-1 right-1 bg-primary font-bold shadow-sm">
                                                {{ getSlotCountForDay(day) > 99 ? '99+' :
                                                    getSlotCountForDay(day) }}
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
                                            <ModulesUserDutyScheduleScheduleSlotsOfferedShiftsIcon
                                                :count="getMyOfferedSlotCountForDay(monthMeta.key, day)" />
                                            <div class="flex flex-col items-center gap-0.5">
                                                <div class="flex items-center gap-1.5">
                                                    <span :class="[
                                                        isToday(day) ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold' : 'text-sm font-semibold text-gray-900'
                                                    ]">
                                                        {{ moment(day).format('D') }}
                                                    </span>
                                                    <span class="text-xs text-gray-500">{{ getDayName(day) }}</span>
                                                </div>
                                                <span v-if="getHoliday(day)"
                                                    class="capitalize inline-block text-amber-700 bg-amber-100 ring-1 ring-amber-300 text-[9px] font-semibold px-2 py-0.5 rounded-full leading-none mt-0.5 truncate max-w-full">
                                                    {{ getHoliday(day) }}
                                                </span>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </div>

                            <!-- Day content row -->
                            <div class="grid grid-cols-7 border-b border-gray-100">
                                <div v-for="(day, dayIndex) in week.days"
                                    :key="'cell-' + monthMeta.key + '-' + weekIndex + '-' + dayIndex" :class="[
                                        day === null && 'bg-gray-50/50',
                                        day !== null && isToday(day) && 'bg-blue-50/30',
                                        day !== null && isWeekend(day) && !isToday(day) && 'bg-gray-50/30',
                                        'px-3 py-1.5 border-r border-gray-200 last:border-r-0 min-w-[120px] align-top'
                                    ]"
                                    @click="!isDailyScheduleCopiedEmpty() && !isCopiedDay(day) && day !== null ? pasteDayAllEmployees(day) : null">
                                    <template v-if="day !== null">
                                        <!-- Day actions: copy + new shift -->
                                        <div class="flex justify-end gap-1 mb-3" v-if="isDailyScheduleCopiedEmpty()">
                                            <Tooltip position="left" :text="$t('dutySchedules.copy.copy')">
                                                <button :aria-label="$t('dutySchedules.copy.copy')"
                                                    class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                    @click.stop="copyDayForAllEmployees(day)">
                                                    <Icon name="mdi:content-copy" class="h-3 w-3" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip position="left" :text="$t('dutySchedules.newSchedule')"
                                                v-if="hasCreatePermission || isAdmin(userStore.getUser?.role)">
                                                <button :aria-label="$t('dutySchedules.newSchedule')"
                                                    class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md border border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary transition-colors"
                                                    @click.stop="openAddNewShiftModalForDay(day)">
                                                    <Icon name="ph:plus" class="h-3.5 w-3.5" aria-hidden="true" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                        <!-- Copied day indicator -->
                                        <div v-if="!isDailyScheduleCopiedEmpty() && isCopiedDay(day)"
                                            class="flex justify-between items-center mb-1">
                                            <span class="text-xxs text-primary font-bold">✓ {{
                                                $t('dutySchedules.monthView.copied') }}</span>
                                            <button @click.stop="stopCopying()"
                                                class="text-xxs text-red-500 bg-red-50 rounded px-1">
                                                {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                            </button>
                                        </div>
                                        <!-- Paste here prompt -->
                                        <div v-if="!isDailyScheduleCopiedEmpty() && !isCopiedDay(day) && day !== null"
                                            class="text-center mb-1">
                                            <div class="flex items-center justify-center mb-1 rounded bg-primary/10 border border-primary/30 py-1 cursor-pointer"
                                                @click.stop="pasteDayAllEmployees(day)">
                                                <span class="text-xxs text-primary font-semibold">📋 {{
                                                    $t('dutySchedules.monthView.insertHere') }}</span>
                                            </div>
                                        </div>

                                        <!-- Shifts for all employees -->
                                        <div class="space-y-3">
                                            <!-- Pass 1: holiday badges for all employees (rendered before any shifts) -->
                                            <template
                                                v-for="(employee, employeeIndex) in getMonthEmployees(monthMeta.key)"
                                                :key="'hol-' + monthMeta.key + '-' + employeeIndex">
                                                <ModulesUserDutyScheduleScheduleSlotsRequestAvailableSlots
                                                    :daysData="getMonthEmployees(monthMeta.key)[employeeIndex]?.days?.[moment(day).format('YYYY-MM-DD')]"
                                                    :employee="employee" @error="(err: any) => state.error = err" />
                                                <Tooltip
                                                    v-if="isNonWorkedHolidayCell(day, monthMeta.key, employee.uuid)"
                                                    :text="$t('dutySchedules.holidayNonWorkedTooltip')" position="top"
                                                    :wrap="true" class="w-full">
                                                    <div
                                                        class="rounded-xl border border-amber-300 bg-amber-50 px-2 py-1.5 flex items-start gap-1.5 w-full">
                                                        <Icon name="ph:calendar-check"
                                                            class="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5"
                                                            aria-hidden="true" />
                                                        <div class="leading-tight">
                                                            <p class="text-xxs font-semibold text-amber-800">{{
                                                                $t('dutySchedules.holidayFreeBadge') }}</p>
                                                            <p class="text-xxs text-amber-700">{{
                                                                $t('dutySchedules.holidayNonWorkedAssigned') }}</p>
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </template>

                                            <!-- Pass 2: shifts for all employees -->
                                            <template
                                                v-for="(employee, employeeIndex) in getMonthEmployees(monthMeta.key)"
                                                :key="'emp-' + monthMeta.key + '-' + employeeIndex">
                                                <!-- Change time / swap schedule request badge -->
                                                <div v-if="(isAtLeast('Admin') || hasCreatePermission) && (employee?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests > 0 || employee?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests > 0)"
                                                    class="flex justify-end" @click.stop>
                                                    <Tooltip :position="dayIndex === 0 ? 'right' : 'left'"
                                                        :text="`${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests} ${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests <= 1 ? $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequest') : $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')} | ${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests} ${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests === 1 ? $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequest') : $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')}`"
                                                        class="relative">
                                                        <button :aria-label="`${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests} ${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.additional_hour_requests <= 1 ? $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequest') : $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')} | ${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests} ${employee?.days?.[moment(day).format('YYYY-MM-DD')]?.swap_requests === 1 ? $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequest') : $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')}`"
                                                            class="bg-gray-100 w-5 h-5 text-gray-500 rounded hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors relative"
                                                            @click.stop="openRequestMenu(`${monthMeta.key}-${employeeIndex}-${moment(day).format('YYYY-MM-DD')}`, $event)">
                                                            <Icon name="mdi:calendar-question-outline" class="h-3 w-3"
                                                                aria-hidden="true" />
                                                            <div
                                                                class="w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1 pointer-events-none" />
                                                        </button>
                                                    </Tooltip>
                                                    <Teleport to="body">
                                                        <div v-if="requestMenuState.openKey === `${monthMeta.key}-${employeeIndex}-${moment(day).format('YYYY-MM-DD')}`"
                                                            class="fixed z-[9999] w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-1"
                                                            :style="{ top: requestMenuState.top + 'px', left: requestMenuState.left + 'px' }">
                                                            <button
                                                                class="text-gray-700 block px-4 py-2 text-xs cursor-pointer hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                                                @click.stop="viewChangeTimeRequests(employee, day); requestMenuState.openKey = null">
                                                                {{
                                                                    $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')
                                                                }}
                                                            </button>
                                                            <button
                                                                class="text-gray-700 block px-4 py-2 text-xs cursor-pointer hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                                                @click.stop="viewSwapScheduleRequests(employee, day); requestMenuState.openKey = null">
                                                                {{
                                                                    $t('dutySchedules.scheduleRequests.swapSchedule.swapScheduleRequests')
                                                                }}
                                                            </button>
                                                        </div>
                                                    </Teleport>
                                                </div>
                                                <div v-for="(shift, shiftIndex) in sortMultiDayShiftsFirst(getShiftsForEmployeeDay(monthMeta.key, employee.uuid, moment(day).format('YYYY-MM-DD')))"
                                                    :key="'s-' + monthMeta.key + '-' + employeeIndex + '-' + shiftIndex"
                                                    :class="['rounded-xl relative cursor-pointer !mt-4 overflow-visible shadow-sm hover:shadow-md transition-all', shift.is_conflict ? 'ring-2 ring-red-400' : '']"
                                                    :style="{ backgroundColor: shift?.type?.color }"
                                                    @click.stop="editSchedule(employee, employeeIndex as number, shift)">

                                                    <!-- Conflict indicator -->
                                                    <div v-if="shift.is_conflict" class="absolute -top-2 -left-2 z-30">
                                                        <Tooltip position="right" :wrap="true"
                                                            :text="$t('dutySchedules.conflictTooltip', { count: (sortMultiDayShiftsFirst(getShiftsForEmployeeDay(monthMeta.key, employee.uuid, moment(day).format('YYYY-MM-DD'))) || []).filter((s: any) => s.is_conflict).length + 1 })">
                                                            <div
                                                                class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center cursor-help">
                                                                <Icon name="ph:warning" class="w-3 h-3"
                                                                    style="color:white" />
                                                            </div>
                                                        </Tooltip>
                                                    </div>

                                                    <!-- Sick leave icon -->
                                                    <div class="absolute -top-3 -left-2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                                        style="font-size:0.875rem"
                                                        v-if="shift?.type?.system_name === 'sick-leave'">
                                                        🤒
                                                    </div>
                                                    <!-- Vacation icon -->
                                                    <div class="absolute -top-3 -left-2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                                        style="font-size:0.875rem"
                                                        v-if="shift?.type?.system_name === 'vacation-leave'">
                                                        🏖️
                                                    </div>
                                                    <div class="absolute -top-3 -left-2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                                                        style="font-size:0.875rem"
                                                        v-if="shift?.type?.system_name === 'compensatory-time'">
                                                        ⏳
                                                    </div>
                                                    <div v-if="isWorkedHolidayShift(shift)"
                                                        class="absolute left-5 -top-2 sm:-right-3 sm:-top-3 z-10">
                                                        <Tooltip :text="$t('dutySchedules.holidayWorkedTooltip')"
                                                            position="top" :wrap="true">
                                                            <div
                                                                class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-0.5 border-amber-300 flex items-center justify-center cursor-help">
                                                                <Icon name="ph:calendar-check"
                                                                    class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500"
                                                                    aria-hidden="true" />
                                                            </div>
                                                        </Tooltip>
                                                    </div>

                                                    <!-- Delete button -->
                                                    <button
                                                        class="w-5 h-5 rounded-full flex items-center justify-center absolute -right-1 -top-2 z-10"
                                                        style="background-color:#fef2f2;color:#dc2626;border:1.5px solid #fecaca"
                                                        @click.stop="removeShiftConfirmation(shift, employee)"
                                                        v-if="hasDeletePermission || isAdmin(userStore.getUser?.role)">
                                                        <Tooltip position="left"
                                                            :text="$t('dutySchedules.removeSchedule.removeSchedule')">
                                                            <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                        </Tooltip>
                                                    </button>

                                                    <!-- Spacer for delete button / holiday badge overlap -->
                                                    <div v-if="hasDeletePermission || isAdmin(userStore.getUser?.role) || isWorkedHolidayShift(shift)"
                                                        class="h-2" />

                                                    <!-- Time row -->
                                                    <div class="flex items-center justify-between px-2 pt-2 pb-1">
                                                        <span
                                                            class="text-sm font-bold text-white tracking-tight leading-none">
                                                            {{ moment(shift?.date_time_start).format('HH:mm') }}
                                                        </span>
                                                        <Icon name="ph:arrow-right"
                                                            class="w-3 h-3 flex-shrink-0 text-white/70" />
                                                        <span
                                                            class="text-sm font-bold text-white tracking-tight leading-none">
                                                            {{ moment(shift?.date_time_end).format('HH:mm') }}
                                                        </span>
                                                    </div>

                                                    <!-- Divider -->
                                                    <div class="mx-2 border-t border-white/20 mb-1"></div>

                                                    <!-- Employee avatar + name -->
                                                    <div class="flex items-center gap-2 px-2 pb-1.5">
                                                        <img :src="employee?.profile_image ?? avatarUrl(`${employee?.firstname}+${employee?.lastname}`)"
                                                            class="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                                            style="border:2px solid rgba(255,255,255,0.8)" />
                                                        <span class="text-xs font-bold text-white truncate">
                                                            {{ employee?.firstname }} {{ employee?.lastname }}
                                                        </span>
                                                    </div>

                                                    <!-- Department -->
                                                    <div class="flex items-center gap-1 px-2 pb-1"
                                                        v-if="shift?.departments?.length > 0">
                                                        <Icon name="ph:house"
                                                            class="w-3 h-3 flex-shrink-0 text-white" />
                                                        <span class="text-xxs text-white truncate">
                                                            {{shift?.departments?.map((d: any) => d.name).join(', ')}}
                                                        </span>
                                                    </div>

                                                    <!-- Multi-day span label -->
                                                    <div v-if="shift?.shift_span_position && shift?.shift_span_position !== 'single'"
                                                        class="px-2 pb-1.5">
                                                        <div
                                                            class="flex items-center gap-1 rounded-full px-1.5 py-0.5 w-fit bg-white/20">
                                                            <span class="text-xxs font-medium text-white">
                                                                <span v-if="shift.shift_span_position === 'start'">→ {{
                                                                    $t('dutySchedules.shiftSpan.start') }}</span>
                                                                <span v-if="shift.shift_span_position === 'middle'">↔ {{
                                                                    $t('dutySchedules.shiftSpan.middle') }}</span>
                                                                <span v-if="shift.shift_span_position === 'end'">← {{
                                                                    $t('dutySchedules.shiftSpan.end') }}</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <!-- Citizen schedules -->
                                                    <div class="flex flex-wrap gap-1 px-2 pb-1"
                                                        v-if="shift?.citizen_schedules?.length > 0">
                                                        <div v-for="(cs, csIdx) in shift.citizen_schedules" :key="csIdx"
                                                            class="flex items-center gap-1 bg-white rounded-full pl-0.5 pr-1.5 py-0.5">
                                                            <div
                                                                class="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                                <span class="font-bold text-gray-600"
                                                                    style="font-size:8px">
                                                                    {{ (cs?.citizen?.firstname?.charAt(0) || '') +
                                                                        (cs?.citizen?.lastname?.charAt(0) || '') }}
                                                                </span>
                                                            </div>
                                                            <span class="text-xxs font-semibold text-gray-700">{{
                                                                cs?.citizen?.firstname }}</span>
                                                        </div>
                                                    </div>

                                                    <!-- Note -->
                                                    <Tooltip v-if="shift && shift.note && shift.note.trim()"
                                                        :text="`${$t('dutySchedules.shiftNote')}: ${shift.note}`"
                                                        position="left" :wrap="true">
                                                        <div class="flex items-center gap-1 px-2 pb-1.5 cursor-help">
                                                            <Icon name="ph:note"
                                                                class="w-3 h-3 flex-shrink-0 text-white" />
                                                            <span
                                                                class="text-white max-w-32 text-[10px] font-medium truncate">{{
                                                                    shift.note }}</span>
                                                        </div>
                                                    </Tooltip>

                                                    <!-- Tags -->
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
            </div>
        </div>

        <!-- Modals -->
        <ModulesUserDutyScheduleNormHoursModalCompensatoryHours :isModalOpen="state.modal.isCompensatoryHoursOpen"
            :selectedEmployee="state.normHours.selectedEmployeeSchedule"
            @close="state.modal.isCompensatoryHoursOpen = false" />
        <ModulesUserDutyScheduleNormHoursModalVacationHours :isModalOpen="state.modal.isVacationHoursOpen"
            :selectedEmployee="state.normHours.selectedEmployeeSchedule"
            @close="state.modal.isVacationHoursOpen = false" />
        <ModulesUserDutyScheduleNormHoursModalGraph :isModalOpen="state.modal.isGraphOpen"
            :selectedEmployee="state.normHours.selectedEmployee" @close="state.modal.isGraphOpen = false" />
        <ModulesUserDutyScheduleModalNewShift :isModalOpen="state.modal.isAddShiftOpen"
            :availableEmployees="filteredEmployeesForModal" :isModalLoading="state.isModalLoading"
            :showEmployeeSelect="true" :error="state.newShiftError" :selectedDate="state.newShift.selectedDate"
            :selectedEmployee="state.newShift.selectedEmployee" :showWarningDialog="state.showWarningDialog"
            :shiftWarnings="state.shiftWarnings" @dateTimeChange="dateTimeChange"
            @closeWarningDialog="closeWarningDialog" @close="state.modal.isAddShiftOpen = false" @saveShift="saveShift"
            @resetNewShiftError="state.newShiftError = {}" />
        <ModulesUserDutyScheduleModalEditShift :isModalLoading="state.isModalLoading" :showNotifyEmployee="true"
            :availableEmployees="filteredEmployeesForModal" :isModalOpen="state.modal.isEditShiftOpen"
            :error="state.editShiftError" :selectedEmployee="state.editShift.selectedEmployee"
            :selectedEmployeeSchedule="state.editShift.selectedEmployeeSchedule"
            :showWarningDialog="state.showWarningDialog" :shiftWarnings="state.shiftWarnings"
            @dateTimeChange="dateTimeChange" @closeWarningDialog="closeWarningDialog"
            @close="state.modal.isEditShiftOpen = false" @resetEditShiftError="state.editShiftError = {}"
            @updateShift="updateSelectedSchedule" />
        <ModulesUserDutyScheduleModalRemoveShiftReason :isModalOpen="state.modal.isRemoveShiftReasonOpen"
            :availableEmployees="filteredEmployeesForModal" :currentEmployeeUuid="state.removeShift.selectedEmployee?.uuid"
            @close="state.modal.isRemoveShiftReasonOpen = false" @markAbsence="markShiftAbsence"
            @deleteShift="removeShift"
            @reassign="reassignShift" />
        <ModulesUserDutyScheduleModalRemoveShiftSpanConfirmation
            :isModalOpen="state.modal.isRemoveShiftSpanConfirmationOpen"
            @close="state.modal.isRemoveShiftSpanConfirmationOpen = false"
            @confirm-single="state.modal.isRemoveShiftReasonOpen = true" @confirm-entire="removeEntireShiftSpan" />
        <ModulesUserDutyScheduleModalViewShift :isModalOpen="state.modal.isViewShiftOpen"
            :selectedEmployeeSchedule="state.viewShift.selectedEmployeeSchedule"
            @close="state.modal.isViewShiftOpen = false" />
        <ModulesUserDutyScheduleExtraHoursModalView :isModalOpen="state.modal.isManageExtraHoursOpen"
            :selectedEmployee="state.manageExtraHours.selectedEmployee"
            @close="state.modal.isManageExtraHoursOpen = false" @refreshDutySchedules="fetchHalfYear()" />
        <ModulesUserDutyScheduleLeaveRequestsModalView :isModalOpen="state.modal.isManageLeaveRequestsOpen"
            :selectedEmployee="state.manageLeaveRequests.selectedEmployee"
            @close="state.modal.isManageLeaveRequestsOpen = false" @refreshDutySchedules="fetchHalfYear()" />
        <ModulesUserDutyScheduleScheduleSlotsModalScheduleSlots :isModalOpen="state.modal.isManageScheduleSlotOpen"
            :selectedDay="state.manageScheduleSlot.selectedDay" @close="state.modal.isManageScheduleSlotOpen = false"
            @refreshDutySchedules="fetchHalfYear()" />

        <ModulesUserDutyScheduleModalFilter :isModalOpen="state.modal.isFilterDutyScheduleOpen"
            @close="state.modal.isFilterDutyScheduleOpen = false" @setFilter="setFilter" />
        <ModulesUserDutyScheduleModalManageFavorites :isModalOpen="state.modal.isManageFavoritesOpen"
            @close="state.modal.isManageFavoritesOpen = false" @refreshDutySchedules="fetchHalfYear()" />
        <ModulesUserDutyScheduleTimeRequestsModalRequests :isModalOpen="state.modal.isManageTimeAdjustmentRequestsOpen"
            :selectedDate="state.manageTimeRequest.selectedDate"
            :selectedEmployee="state.manageTimeRequest.selectedEmployee"
            @close="state.modal.isManageTimeAdjustmentRequestsOpen = false" @refreshDutySchedules="fetchHalfYear()" />
        <ModulesUserDutyScheduleSwapScheduleModalRequests :isModalOpen="state.modal.isManageSwapScheduleRequestsOpen"
            :selectedDate="state.manageSwapScheduleRequest.selectedDate"
            :selectedEmployee="state.manageSwapScheduleRequest.selectedEmployee"
            @close="state.modal.isManageSwapScheduleRequestsOpen = false" @refreshDutySchedules="fetchHalfYear()" />

        <!-- Floating stop-copying button -->
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
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useEntireShiftEdit } from '@/composables/useEntireShiftEdit'
import { dutyScheduleFavoriteEmployeeService } from '@/components/api/user/DutyScheduleFavoriteEmployeeService'
import { useFavoriteEmployees } from '@/composables/useFavoriteEmployees'
import { useDepartmentStore } from '@/store/department'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useDutyScheduleStore } from '@/store/duty-schedule'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import { calculateWeeklyNormHours } from '@/composables/normHours'
import { employeeJobTitles, resolveFirstShiftDate } from '@/utils/scheduleSort'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatLocalized } = useDatetimeFormatter()

let _hoverTimer: ReturnType<typeof setTimeout> | null = null

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

const language = useI18n()
const dutyScheduleStore = useDutyScheduleStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore()
const { formatNumber, parseLocaleNumber } = useNumberFormatter()
const { isAtLeast, can } = usePermissions()
const favoriteEmployees = useFavoriteEmployees()
const hasScheduleManageAccess = computed(() => isAtLeast('Admin') || can('update_schedule'))
const hasManageFavoritesAccess = computed(() => true)

// Period anchor: start of the half-year (Jan or Jul of some year)
const periodStart = ref(getHalfYearStart(moment()))
const teleportReady = ref(false)

function getHalfYearStart(m: moment.Moment): moment.Moment {
    const month = m.month() // 0-based
    if (month < 6) {
        return m.clone().startOf('year')
    } else {
        return m.clone().month(6).startOf('month')
    }
}

// ============================================================
// Computed: all 6 months with weeks
// ============================================================
const allMonths = computed(() => {
    const months = []
    for (let i = 0; i < 6; i++) {
        const m = periodStart.value.clone().add(i, 'months')
        const key = m.format('YYYY-MM')
        const label = language.t(`calendar.month.${m.format('MMMM')}`)
        const year = m.format('YYYY')
        const weeks = computeWeeksForMonth(m)
        months.push({ key, label, year, moment: m.clone(), weeks })
    }
    return months
})

function computeWeeksForMonth(m: moment.Moment) {
    const start = m.clone().startOf('month')
    const end = m.clone().endOf('month')
    const weeks: { weekNumber: number; days: (any | null)[] }[] = []
    let current = start.clone().startOf('isoWeek')
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
        if (weekDays.some(d => d !== null)) {
            weeks.push({ weekNumber: weekNum, days: weekDays })
        }
        current.add(7, 'days')
    }
    return weeks
}

// Period label e.g. "Januar – Juni 2026"
const periodLabel = computed(() => {
    const first = allMonths.value[0]
    const last = allMonths.value[5]
    if (first.year === last.year) {
        return `${first.label} – ${last.label} ${first.year}`
    }
    return `${first.label} ${first.year} – ${last.label} ${last.year}`
})

function isCurrentMonth(monthMeta: any) {
    return monthMeta.key === moment().format('YYYY-MM')
}

// ============================================================
// State
// ============================================================
const state = reactive({
    copy: {
        selectedEmployeeDailySchedule: {} as any,
        selectedWeek: null as any,
        selectedMonth: null as any,
    },
    copyShiftError: {} as Error,
    editShift: {
        selectedEmployee: {} as any,
        selectedEmployeeSchedule: {} as any,
    },
    editShiftError: {} as Error,
    error: {} as Error,
    hoveredEmployee: null as number | null,
    isModalLoading: false,
    isUpdateShift: false,
    manageExtraHours: {
        selectedEmployee: {} as any,
    },
    manageLeaveRequests: {
        selectedEmployee: {} as any,
    },
    manageScheduleSlot: {
        selectedDay: {} as any,
    },
    manageTimeRequest: {
        selectedDate: '',
        selectedEmployee: {} as any,
        selectedSchedule: {} as any,
    },
    manageSwapScheduleRequest: {
        selectedDate: '',
        selectedEmployee: {} as any,
        selectedSchedule: {} as any,
    },
    modal: {
        isAddShiftOpen: false,
        isCompensatoryHoursOpen: false,
        isEditShiftOpen: false,
        isFilterDutyScheduleOpen: false,
        isGraphOpen: false,
        isManageExtraHoursOpen: false,
        isManageFavoritesOpen: false,
        isManageLeaveRequestsOpen: false,
        isManageScheduleSlotOpen: false,
        isManageTimeAdjustmentRequestsOpen: false,
        isManageSwapScheduleRequestsOpen: false,
        isRemoveShiftReasonOpen: false,
        isRemoveShiftSpanConfirmationOpen: false,
        isVacationHoursOpen: false,
        isViewShiftOpen: false,
    } as any,
    dataFilter: {
        search: '',
    },
    sortData: {
        sortField: 'firstname',
        sortOrder: 'ascend',
    },
    filter: {
        department_uuids: [],
        employment_status: [],
        employee_uuids: [],
        schedule_tag_uuids: [],
    },
    monthDataMap: {} as Record<string, any>,
    newShift: {
        selectedDate: '',
        selectedEmployee: null as any,
    },
    newShiftError: {} as Error,
    normHours: {
        selectedEmployee: {} as any,
        selectedEmployeeSchedule: {} as any,
    },
    progress: {
        percentage: 100,
        pendingRequests: 0,
        showProgressBar: false,
        totalRequests: 0,
    },
    removeShift: {
        selectedShift: {} as any,
        selectedEmployee: {} as any,
    },
    shiftWarnings: [] as any[],
    showWarningDialog: false,
    viewShift: {
        selectedEmployeeSchedule: {} as any,
    },
})

// ============================================================
// Sidebar employees: union of all months, deduplicated by uuid
// ============================================================
const sidebarEmployees = computed(() => {
    const seen = new Set<string>()
    const result: any[] = []
    for (const monthMeta of allMonths.value) {
        const employees = state.monthDataMap[monthMeta.key]?.data ?? []
        for (const emp of employees) {
            if (!seen.has(emp.uuid)) {
                seen.add(emp.uuid)
                result.push(emp)
            }
        }
    }
    return result
})

const filteredEmployeesForModal = computed(() => {
    const dept = departmentStore.getSelectedDepartmentName
    const employees = sidebarEmployees.value
    if (!dept || dept === 'Alle afdelinger' || dept === 'All departments' || dept === 'all' || dept === '') return employees
    return employees.filter((emp: any) => emp.departments?.some((d: any) => d.name === dept))
})

// ============================================================
// Data helpers
// ============================================================
function getMonthEmployees(monthKey: string): any[] {
    return state.monthDataMap[monthKey]?.data ?? []
}

function getShiftsForEmployeeDay(monthKey: string, employeeUuid: string, dateKey: string): any[] {
    const employees = state.monthDataMap[monthKey]?.data ?? []
    const emp = employees.find((e: any) => e.uuid === employeeUuid)
    return emp?.days?.[dateKey]?.shifts ?? []
}

// ============================================================
// Navigation
// ============================================================
function previousHalfYear() {
    periodStart.value = periodStart.value.clone().subtract(6, 'months')
    fetchHalfYear()
}

function nextHalfYear() {
    periodStart.value = periodStart.value.clone().add(6, 'months')
    fetchHalfYear()
}

function setToday() {
    periodStart.value = getHalfYearStart(moment())
    fetchHalfYear()
}

// ============================================================
// Fetching — single call covering the full half-year period
// ============================================================
async function fetchHalfYear() {
    state.error = {}
    state.progress.totalRequests++
    state.progress.pendingRequests++
    identifyTheProgressPercentage()
    try {
        // date_start = 1 Jan for H1, 1 Jul for H2 (i.e. start of this half-year)
        // date_end   = last day of the half-year (30 Jun or 31 Dec)
        const dateStart = periodStart.value.clone().format('YYYY-MM-DD')
        const dateEnd = periodStart.value.clone().add(5, 'months').endOf('month').format('YYYY-MM-DD')
        const params = {
            page: 1,
            page_length: dutyScheduleStore.getCurrentPageLength || 50,
            date_start: dateStart,
            date_end: dateEnd,
            filter_date_start: dateStart,
            filter_date_end: dateEnd,
            department: departmentStore.getSelectedDepartmentName,
            show_employees_working_today: dutyScheduleStore.getShowEmployeesWorkingToday,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        } as any
        if (state.filter.department_uuids?.length > 0) params.department_uuids = Array(state.filter.department_uuids)
        if (state.filter.employment_status) params.employment_status = Array(state.filter.employment_status)
        if (state.filter.employee_uuids?.length > 0) params.employee_uuids = Array(state.filter.employee_uuids)
        if (state.filter.schedule_tag_uuids?.length > 0) params.schedule_tag_uuids = Array(state.filter.schedule_tag_uuids)
        if (state.filter.job_title_uuids?.length > 0) params.job_title_uuids = Array(state.filter.job_title_uuids)
        const firstShiftDate = resolveFirstShiftDate(undefined, dateStart, dateEnd, userStore.getUser?.company)
        if (firstShiftDate) params.sort_by_first_shift_date = firstShiftDate
        const response = await dutyScheduleService.getDutySchedulesMonthView(params)
        if (response) {
            // Share the same response across every month key so all
            // per-month lookups (employees, shifts, holidays, slots) work correctly.
            for (const monthMeta of allMonths.value) {
                state.monthDataMap[monthMeta.key] = response
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.progress.totalRequests--
    state.progress.pendingRequests--
    identifyTheProgressPercentage()
}

// ============================================================
// Progress
// ============================================================
function identifyTheProgressPercentage() {
    if (state.progress.totalRequests === 0) {
        state.progress.percentage = 100
    } else {
        state.progress.percentage = (state.progress.pendingRequests / state.progress.totalRequests) * 100
        if (state.progress.percentage === 100) {
            state.progress.percentage = 50
        }
    }
}

// ============================================================
// Shared period data (single API response covering all months)
// ============================================================
const periodData = computed(() => {
    const firstKey = allMonths.value[0]?.key
    return firstKey ? state.monthDataMap[firstKey] : null
})

// ============================================================
// Holiday helpers — identical to month view: API first, local fallback
// ============================================================
function getEasterSunday(year: number): moment.Moment {
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
    const m2 = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m2 + 114) / 31)
    const day = ((h + l - 7 * m2 + 114) % 31) + 1
    return moment(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
}

function getDanishHolidays(year: number): Record<string, string> {
    const easter = getEasterSunday(year)
    const holidays: Record<string, string> = {}
    const add = (m: moment.Moment, name: string) => { holidays[m.format('YYYY-MM-DD')] = name }
    add(moment(`${year}-01-01`), 'Nytårsdag')
    add(moment(`${year}-12-24`), 'Juleaften')
    add(moment(`${year}-12-25`), '1. juledag')
    add(moment(`${year}-12-26`), '2. juledag')
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

function getHoliday(day: any): string | null {
    if (!day) return null
    const dateKey = moment(day).format('YYYY-MM-DD')
    const backendHoliday = periodData.value?.month_data?.[dateKey]?.holiday?.name
    if (backendHoliday) return backendHoliday
    const year = moment(day).year()
    const danishHolidays = getDanishHolidays(year)
    return danishHolidays[dateKey] || null
}

// Public-holiday markers (opt-in via the company flag), mirroring the week view.
const holidaysEnabled = computed(() => !!userStore.getUser?.company?.holiday_non_sunday_hours_enabled)

function isWorkedHolidayShift(shift: any): boolean {
    if (!holidaysEnabled.value || !shift?.date_time_start) return false
    return !!getHoliday(shift.date_time_start)
}

function isNonWorkedHolidayCell(day: any, monthKey: string, employeeUuid: string): boolean {
    if (!holidaysEnabled.value || !day) return false
    if (!getHoliday(day)) return false
    if (moment(day).day() === 0) return false // Sundays excluded (matches backend)
    const dateKey = moment(day).format('YYYY-MM-DD')
    const employees = state.monthDataMap[monthKey]?.data ?? []
    const anyShift = employees.some((e: any) => e?.days?.[dateKey]?.shifts?.length > 0)
    return !anyShift
}

// ============================================================
// Schedule slot helpers
// ============================================================
// Offered shifts on a day that the logged-in employee can take. Read from
// their own row, which the API filters by eligibility, not from the
// department-wide count managers see.
function getMyOfferedSlotCountForDay(monthKey: string, day: any): number {
    const me = getMonthEmployees(monthKey).find((employee: any) => employee?.uuid === userStore.getUser?.uuid)
    return me?.days?.[moment(day).format('YYYY-MM-DD')]?.slots?.length || 0
}

function getSlotCountForDay(day: any): number {
    const dateKey = moment(day).format('YYYY-MM-DD')
    return periodData.value?.month_data?.[dateKey]?.total_slots || 0
}

function openManageScheduleSlotModal(day: any) {
    state.manageScheduleSlot.selectedDay = { fullDate: day }
    state.modal.isManageScheduleSlotOpen = true
}

// ============================================================
// Day/week helpers
// ============================================================
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
// Shift helpers
// ============================================================
function sortMultiDayShiftsFirst(shifts: any) {
    if (!shifts) return []
    return [...shifts].sort((a: any, b: any) => {
        const aMulti = a.shift_span_position !== 'single' ? 0 : 1
        const bMulti = b.shift_span_position !== 'single' ? 0 : 1
        if (aMulti !== bMulti) return aMulti - bMulti
        // Same type: earliest start time first (task 232)
        return moment(a.date_time_start).valueOf() - moment(b.date_time_start).valueOf()
    })
}

// ============================================================
// Popover
// ============================================================
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

// ============================================================
// Employee actions
// ============================================================
function viewExtraHours(employee: any) {
    state.manageExtraHours.selectedEmployee = employee
    state.modal.isManageExtraHoursOpen = true
}

function viewLeaveRequests(employee: any) {
    state.manageLeaveRequests.selectedEmployee = employee
    state.modal.isManageLeaveRequestsOpen = true
}

function viewCompensatoryHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isCompensatoryHoursOpen = true
}

function viewAvailableVacationHours(employee: any) {
    state.normHours.selectedEmployeeSchedule = employee
    state.modal.isVacationHoursOpen = true
}

function openGraphModal(employee: any) {
    state.normHours.selectedEmployee = employee
    state.modal.isGraphOpen = true
}

// ============================================================
// New shift
// ============================================================
function openAddNewShiftModalForDay(day: any) {
    state.modal.isAddShiftOpen = true
    state.newShift.selectedDate = moment(day).format('YYYY-MM-DD')
    state.newShift.selectedEmployee = filteredEmployeesForModal.value?.[0] || null
}

async function saveShift(shiftDetails: any) {
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
        is_recurring: shiftDetails?.recurring?.is_recurring,
        recurring: shiftDetails?.recurring?.recurring,
        recurring_until: shiftDetails?.recurring?.recurring_until,
    } as any
    if (shiftDetails.recurring?.recurring === 'custom') {
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
    await saveDutySchedule(params)
}

async function saveDutySchedule(params: object) {
    try {
        state.isModalLoading = true
        state.progress.totalRequests++
        state.progress.pendingRequests++
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.saveDutySchedule(params)
        if (response) {
            state.progress.totalRequests--
            state.progress.pendingRequests--
            identifyTheProgressPercentage()
            fetchHalfYear()
            state.modal.isAddShiftOpen = false
            setTimeout(() => { state.isModalLoading = false }, 300)
        }
    } catch (error: any) {
        state.newShiftError = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
        state.isModalLoading = false
    }
}

// ============================================================
// Edit/update shift
// ============================================================
const { withEntireShift } = useEntireShiftEdit()

async function editSchedule(employee: any, employeeIndex: number, shift: any) {
    state.editShift.selectedEmployee = employee
    state.editShift.selectedEmployeeSchedule = await withEntireShift({
        citizen_schedules: shift?.citizen_schedules,
        scheduleUuid: shift?.schedule_uuid,
        date_time_start: shift?.date_time_start,
        date_time_end: shift?.date_time_end,
        recurring: { is_recurring: shift?.is_recurring },
        user_uuid: employee.uuid,
        shift_type: shift?.type,
        tags: shift?.tags,
        departments: shift?.departments,
        note: shift?.note,
        do_not_count_sick_leave: shift?.do_not_count_sick_leave,
        use_compensatory_time: shift?.use_compensatory_time,
        shift_span_position: shift?.shift_span_position,
    }, (uuid: string) => dutyScheduleService.getDutySchedule(uuid))
    state.modal.isEditShiftOpen = true
}

async function updateSelectedSchedule(shiftDetails: any) {
    const scheduleUuid = state.editShift.selectedEmployeeSchedule.scheduleUuid
    const originalEmployeeUuid = state.editShift.selectedEmployeeSchedule.user_uuid
    const newEmployeeUuid = shiftDetails.employee_uuid || originalEmployeeUuid
    const params = {
        shift_type_uuid: shiftDetails.shift_type,
        is_sleeping_sick_leave: shiftDetails.is_sleeping_sick_leave,
        do_not_count_weekends: shiftDetails.do_not_count_weekends,
        date_time_start: shiftDetails?.date_time_start,
        date_time_end: shiftDetails?.date_time_end,
        edit_entire_shift: state.editShift.selectedEmployeeSchedule.edit_entire_shift,
        is_apply_to_all: shiftDetails?.recurring?.is_apply_to_all,
        user_uuid: newEmployeeUuid,
        citizen_uuid: shiftDetails.citizens,
        schedule_tag_uuid: shiftDetails.schedule_tag_uuid,
        department_uuid: shiftDetails.department_uuid,
        note: shiftDetails.note,
        do_not_count_sick_leave: shiftDetails.do_not_count_sick_leave,
        use_compensatory_time: shiftDetails.use_compensatory_time,
        notify_employee: shiftDetails.notify_employee,
    }
    await updateDutySchedule(scheduleUuid, params)
}

async function updateDutySchedule(scheduleUuid: any, params: object) {
    state.isUpdateShift = true
    state.editShiftError = {}
    try {
        state.isModalLoading = true
        state.progress.totalRequests++
        state.progress.pendingRequests++
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.updateDutySchedule(scheduleUuid, params)
        if (response) {
            state.progress.totalRequests--
            state.progress.pendingRequests--
            state.modal.isEditShiftOpen = false
            identifyTheProgressPercentage()
            fetchHalfYear()
        }
    } catch (error: any) {
        state.editShiftError = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
    } finally {
        state.isUpdateShift = false
        fetchHalfYear()
        setTimeout(() => { state.isModalLoading = false }, 300)
    }
}

// ============================================================
// Remove shift
// ============================================================
function removeShiftConfirmation(shift: any, employee: any) {
    state.removeShift.selectedShift = shift
    state.removeShift.selectedEmployee = employee
    if (shift.shift_span_position !== 'single') {
        state.modal.isRemoveShiftSpanConfirmationOpen = true
        return
    }
    state.modal.isRemoveShiftReasonOpen = true
}

async function markShiftAbsence(reason: string) {
    const scheduleUuid = state.removeShift.selectedShift.schedule_uuid
    try {
        state.progress.totalRequests++
        state.progress.pendingRequests++
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.markScheduleAbsence(scheduleUuid, { reason })
        if (response) {
            state.progress.totalRequests--
            state.progress.pendingRequests--
            identifyTheProgressPercentage()
            fetchHalfYear()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
    }
}

async function reassignShift(employeeUuid: string) {
    const scheduleUuid = state.removeShift.selectedShift.schedule_uuid
    const date = moment(state.removeShift.selectedShift.date_time_start).format('YYYY-MM-DD')
    try {
        state.progress.totalRequests++
        state.progress.pendingRequests++
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.moveShift(scheduleUuid, { date, user_uuid: employeeUuid })
        if (response) {
            state.progress.totalRequests--
            state.progress.pendingRequests--
            identifyTheProgressPercentage()
            fetchHalfYear()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
    }
}

async function removeShift() {
    const scheduleUuid = state.removeShift.selectedShift.schedule_uuid
    try {
        state.progress.totalRequests++
        state.progress.pendingRequests++
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.deleteDutySchedule(scheduleUuid)
        if (response) {
            state.progress.totalRequests--
            state.progress.pendingRequests--
            identifyTheProgressPercentage()
            fetchHalfYear()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
    }
}

async function removeEntireShiftSpan() {
    const scheduleUuid = state.removeShift.selectedShift.schedule_uuid
    try {
        state.progress.totalRequests++
        state.progress.pendingRequests++
        identifyTheProgressPercentage()
        const params = { delete_entire_shift: true }
        const response = await dutyScheduleService.deleteDutySchedule(scheduleUuid, params)
        if (response) {
            state.progress.totalRequests--
            state.progress.pendingRequests--
            identifyTheProgressPercentage()
            fetchHalfYear()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
    }
}

// ============================================================
// Copy / paste
// ============================================================
function isDailyScheduleCopiedEmpty() {
    return Object.keys(state.copy.selectedEmployeeDailySchedule).length === 0
}

function isCopiedDay(day: any) {
    if (!day) return false
    return state.copy.selectedEmployeeDailySchedule?.date === moment(day).format('YYYY-MM-DD')
}

function copyDayForAllEmployees(day: any) {
    state.copy.selectedEmployeeDailySchedule = {
        date: moment(day).format('YYYY-MM-DD'),
        currentTablePage: dutyScheduleStore.getCurrentPageNumber,
    }
}

async function pasteDayAllEmployees(day: any) {
    const dateSource = state.copy.selectedEmployeeDailySchedule?.date
    const dateDestination = moment(day).format('YYYY-MM-DD')
    if (!dateSource || dateSource === dateDestination) return
    const sourceMonthKey = dateSource.substring(0, 7)
    const sourceEmployees = state.monthDataMap[sourceMonthKey]?.data ?? []
    for (const emp of sourceEmployees) {
        const shifts = emp?.days?.[dateSource]?.shifts || []
        if (shifts.length === 0) continue
        await copyDutySchedule({
            user_uuid_source: emp.uuid,
            user_uuid_destination: emp.uuid,
            date_source: dateSource,
            date_destination: dateDestination,
        })
    }
    fetchHalfYear()
}

function copyWeek(week: any) {
    state.copy.selectedWeek = {
        weekNumber: week.weekNumber,
        days: week.days.filter((d: any) => d !== null),
        year: moment(week.days.find((d: any) => d !== null)).year(),
    }
    state.copy.selectedMonth = null
}

async function pasteWeek(targetWeek: any) {
    if (!state.copy.selectedWeek) return
    const srcDays = state.copy.selectedWeek.days
    const dstDays = targetWeek.days.filter((d: any) => d !== null)
    for (let di = 0; di < Math.min(srcDays.length, dstDays.length); di++) {
        const srcDate = moment(srcDays[di]).format('YYYY-MM-DD')
        const dstDate = moment(dstDays[di]).format('YYYY-MM-DD')
        const sourceMonthKey = srcDate.substring(0, 7)
        const sourceEmployees = state.monthDataMap[sourceMonthKey]?.data ?? []
        for (const emp of sourceEmployees) {
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
    fetchHalfYear()
}

function stopCopying() {
    state.copy.selectedEmployeeDailySchedule = {}
    state.copy.selectedWeek = null
    state.copy.selectedMonth = null
}

async function copyDutySchedule(params: object) {
    state.copyShiftError = {}
    try {
        state.progress.totalRequests++
        state.progress.pendingRequests++
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.saveDutySchedule(params)
        if (response) {
            state.progress.totalRequests--
            state.progress.pendingRequests--
            identifyTheProgressPercentage()
        }
    } catch (error: any) {
        state.copyShiftError = error
        state.progress.totalRequests--
        state.progress.pendingRequests--
        identifyTheProgressPercentage()
    }
}

// ============================================================
// Shift warnings
// ============================================================
async function dateTimeChange(employeeUuid: string, newDateTimeStart: string, newDateTimeEnd: string, shiftSpanPosition?: string, shiftTypeUuid?: string) {
    try {
        const params: any = {
            date_time_start: newDateTimeStart,
            date_time_end: newDateTimeEnd,
            user_uuid: employeeUuid,
            ...(shiftSpanPosition && { shift_span_position: shiftSpanPosition }),
            ...(shiftTypeUuid && { shift_type_uuid: shiftTypeUuid }),
        }
        const response = await dutyScheduleService.scheduleValidation(params)
        if (response.data && !response.data.valid) {
            state.shiftWarnings = response.data.warnings
            state.showWarningDialog = true
        } else {
            state.shiftWarnings = []
        }
    } catch (error: any) { }
}

function closeWarningDialog() {
    state.showWarningDialog = false
    state.shiftWarnings = []
}

// ============================================================
// Filter / Sort / Search / Pagination
// ============================================================
function changePageLength(event: any) {
    dutyScheduleStore.setCurrentPageLength(event.target.value)
    dutyScheduleStore.setCurrentPageNumber(1)
    fetchHalfYear()
}

function sortDutySchedule() {
    state.sortData.sortOrder = state.sortData.sortOrder === 'ascend' ? 'descend' : 'ascend'
    fetchHalfYear()
}

function setFilter(filter: any) {
    state.filter = filter
    state.sortData.sortField = filter?.sort_by === 'job_title' ? 'job_title' : 'firstname'
    state.modal.isFilterDutyScheduleOpen = false
    fetchHalfYear()
}

function handleSearch(search: string) {
    state.dataFilter.search = search
    fetchHalfYear()
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

watch(() => departmentStore.getSelectedDepartmentName, () => {
    fetchHalfYear()
})

watch(() => dutyScheduleStore.getShowEmployeesWorkingToday, () => {
    fetchHalfYear()
})

// The API pre-formats hour figures (comma/period placement) according to the user's
// language at request time, so cached data becomes mis-formatted after a language
// switch — refetch so weekly_hours/yearly_hours/etc. match the new locale's format.
watch(() => language.locale.value, () => {
    // Clear synchronously so the old locale's cached numbers don't flash
    // re-parsed under the new locale's rules while the refetch is in flight.
    state.monthDataMap = {}
    fetchHalfYear()
})

// ============================================================
// Schedule request actions
// ============================================================
function viewChangeTimeRequests(employee: any, day: any) {
    state.manageTimeRequest.selectedEmployee = employee
    state.manageTimeRequest.selectedDate = moment(day).format('YYYY-MM-DD')
    state.modal.isManageTimeAdjustmentRequestsOpen = true
}

function viewSwapScheduleRequests(employee: any, day: any) {
    state.manageSwapScheduleRequest.selectedEmployee = employee
    state.manageSwapScheduleRequest.selectedDate = moment(day).format('YYYY-MM-DD')
    state.modal.isManageSwapScheduleRequestsOpen = true
}

// ============================================================
// Lifecycle
// ============================================================
onMounted(() => {
    nextTick(() => {
        teleportReady.value = document.getElementById('schedule-date-picker-target') ? true : false
    })
    fetchHalfYear()
    favoriteEmployees.ensureLoaded()
    document.addEventListener('click', closeRequestMenu)
})

onUnmounted(() => {
    document.removeEventListener('click', closeRequestMenu)
})

function isFavorited(employee: any) {
    return employee?.is_favorited_by_viewer || favoriteEmployees.isFavorited(employee?.uuid)
}

async function toggleFavoriteEmployee(employee: any) {
    if (!employee?.uuid || employee.uuid === userStore.getUser?.uuid) return
    try {
        if (isFavorited(employee)) {
            await dutyScheduleFavoriteEmployeeService.removeFavoriteEmployee(employee.uuid)
            favoriteEmployees.remove(employee.uuid)
        } else {
            await dutyScheduleFavoriteEmployeeService.addFavoriteEmployee(employee.uuid)
            favoriteEmployees.add(employee.uuid)
        }
        fetchHalfYear()
    } catch (error: any) {
        state.error = error
    }
}
</script>
