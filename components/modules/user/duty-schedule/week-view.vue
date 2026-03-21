<template>
    <div class="space-y-5">
        <div class="px-4 sm:px-6 lg:px-8">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
        </div>
        <div class="px-4 sm:px-6 lg:px-8">
            <Alert type="danger" :text="state?.copyShiftError?.message"
                v-if="state.copyShiftError?.message && state.copyShiftError.message.length > 0" />
        </div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <div>
                <header class="space-y-2 px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-3 py-3">
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
                                    <FormDateRangeField id="date" name="date"
                                        :placeholder="$t('dutySchedules.form.date')"
                                        :disablePreviousWeeks="isPreviousWeekDisabled()" dateType="duty-schedule"
                                        v-model="state.filter.date_range" />
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
                        <div class="flex items-center justify-end gap-x-2">
                            <button class="flex items-center gap-x-1 text-sm text-primary group"
                                @click="state.modal.isFilterDutyScheduleOpen = true">
                                <Icon name="ic:outline-filter-list"
                                    class="text-primary w-6 h-6 group-hover:text-primary-700" />
                                <span class="group-hover:text-primary-700">
                                    {{ $t('filter') }}
                                </span>
                            </button>
                            <div class="bg-white border border-gray-200 rounded-md px-3 py-3">
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
                        <div class="flex items-center w-full">
                            <TableSearch class="w-full" @search="handleSearch" />
                        </div>
                    </div>
                </header>
                <div class="px-4 sm:px-6 lg:px-8">
                    <div class="bg-primary h-3 rounded-full transition-all ease-in-out duration-500 mb-1.5"
                        :style="{ width: `${state.progress.percentage}%` }" v-if="state.progress.showProgressBar" />
                    <div class="h-3 mb-1.5" v-else />
                </div>

                <div class="flex gap-x-2">
                    <div class="bg-white border-r border-gray-200 shrink-0">
                        <div class="sticky top-0 h-[62vh] overflow-y-auto p-4 space-y-5 w-32">
                            <div v-for="(employee, employeeIndex) in state.userHours?.data" :key="employeeIndex">
                                <div class="flex flex-col items-center gap-1">
                                    <ModulesUserDutyScheduleUserHoursTooltip position="right"
                                        :selectedEmployee="employee" class="cursor-pointer"
                                        v-if="isAdmin(userStore.getUser?.role) || (!isAdmin(userStore.getUser?.role) && userStore.getUser?.uuid === employee?.uuid)">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${getDisplayName(employee).firstName + ' ' + getDisplayName(employee).lastName}`"
                                                :class="[
                                                    employee?.shift_threshold === 'high' && 'border-green-700',
                                                    employee?.shift_threshold === 'moderate' && 'border-yellow-500',
                                                    employee?.shift_threshold === 'low' && 'border-red-600',
                                                    'h-12 w-12 rounded-full bg-gray-50 object-cover border-2'
                                                ]" />
                                        </div>
                                    </ModulesUserDutyScheduleUserHoursTooltip>
                                    <div class="flex items-center gap-x-2" v-else>
                                        <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${getDisplayName(employee).firstName + ' ' + getDisplayName(employee).lastName}`"
                                            :class="[
                                                employee?.shift_threshold === 'high' && 'border-green-700',
                                                employee?.shift_threshold === 'moderate' && 'border-yellow-500',
                                                employee?.shift_threshold === 'low' && 'border-red-600',
                                                'h-12 w-12 rounded-full bg-gray-50 object-cover border-2'
                                            ]" />
                                    </div>
                                    <div class="flex flex-col items-center leading-tight">
                                        <span class="text-xxs text-center font-semibold text-gray-800">
                                            {{ getDisplayName(employee).firstName }}
                                            {{ getDisplayName(employee).lastName }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 min-w-0 bg-gray-50 space-y-10 pl-1 pr-4">
                        <div v-for="(weekStart, wIndex) in weeksInRange" :key="weekStart.valueOf()"
                            :id="`weekly-${wIndex}`">

                            <!-- Sticky header -->
                            <div class="sticky top-16 z-10 bg-gray-50 overflow-x-auto scrollbar-none"
                                :id="`week-header-${wIndex}`" @scroll="syncScroll(wIndex, 'header')">

                                <div class="min-w-[1000px]">

                                    <!-- Week number and copy buttons -->
                                    <div class="flex items-center gap-x-3 px-1 py-3">
                                        <p class="text-secondary text-lg font-medium">
                                            {{ $t('dutySchedules.week') }} {{ getWeekNumber(weekStart) }}
                                        </p>
                                        <div class="flex-1 flex justify-end gap-x-2">
                                            <Tooltip :text="$t('dutySchedules.copy.copyThisWeeksSchedule')"
                                                position="left">
                                                <button
                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                    @click="copyWeeklySchedule(getWeekNumber(weekStart))">
                                                    <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip :text="$t('dutySchedules.copy.copyMultipleWeeksSchedule')"
                                                position="left" v-if="isAdmin(userStore.getUser?.role)">
                                                <button
                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                    @click="state.modal.isCopyMultipleWeeklyScheduleOpen = true">
                                                    <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <!-- Day name headers — admin -->
                                    <div class="grid grid-cols-7 gap-x-2" v-if="isAdmin(userStore.getUser?.role)">
                                        <Tooltip v-for="day in getWeekDays(weekStart)" :key="day.date"
                                            :text="$t('dutySchedules.scheduleSlots.scheduleSlots')" :class="[
                                                hasConflict(state.dutySchedules?.data?.[day?.date]?.schedules) ? 'border-red-500 border-t border-r border-l border-b border-b-gray-200' : 'border-gray-200 border-t border-r border-b border-l',
                                                day.date === moment().format('YYYY-MM-DD') ? 'bg-secondary hover:bg-secondary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100',
                                                'relative cursor-pointer p-2 rounded-tl-md rounded-tr-md'
                                            ]" @click="openManageScheduleSlotModal(day)">
                                            <div>
                                                <div>
                                                    <span class="flex gap-x-1 text-xs font-semibold">
                                                        <span v-if="day.weekName === 'Mon'">
                                                            {{ $t('calendar.week.short.Monday') }}
                                                        </span>
                                                        <span v-if="day.weekName === 'Tue'">
                                                            {{ $t('calendar.week.short.Tuesday') }}
                                                        </span>
                                                        <span v-if="day.weekName === 'Wed'">
                                                            {{ $t('calendar.week.short.Wednesday') }}
                                                        </span>
                                                        <span v-if="day.weekName === 'Thu'">
                                                            {{ $t('calendar.week.short.Thursday') }}
                                                        </span>
                                                        <span v-if="day.weekName === 'Fri'">
                                                            {{ $t('calendar.week.short.Friday') }}
                                                        </span>
                                                        <span v-if="day.weekName === 'Sat'">
                                                            {{ $t('calendar.week.short.Saturday') }}
                                                        </span>
                                                        <span v-if="day.weekName === 'Sun'">
                                                            {{ $t('calendar.week.short.Sunday') }}
                                                        </span>
                                                        <span>{{ day.day }}</span>
                                                    </span>
                                                    <div v-if="state.dutySchedules?.data?.[day?.date]?.total_slots"
                                                        class="absolute top-2 right-4 text-xxs flex items-center justify-center w-4 h-4 bg-red-400 text-white rounded-full">
                                                        {{
                                                            state.dutySchedules?.data?.[day?.date]?.total_slots
                                                        }}
                                                    </div>
                                                </div>
                                                <div :class="[
                                                    day.date === moment().format('YYYY-MM-DD') ? 'text-gray-50' : 'text-gray-500',
                                                    'text-xs'
                                                ]">
                                                    <span v-if="day.month === 'January'">
                                                        {{ $t('calendar.month.January') }}
                                                    </span>
                                                    <span v-if="day.month === 'February'">
                                                        {{ $t('calendar.month.February') }}
                                                    </span>
                                                    <span v-if="day.month === 'March'">
                                                        {{ $t('calendar.month.March') }}
                                                    </span>
                                                    <span v-if="day.month === 'April'">
                                                        {{ $t('calendar.month.April') }}
                                                    </span>
                                                    <span v-if="day.month === 'May'">
                                                        {{ $t('calendar.month.May') }}
                                                    </span>
                                                    <span v-if="day.month === 'June'">
                                                        {{ $t('calendar.month.June') }}
                                                    </span>
                                                    <span v-if="day.month === 'July'">
                                                        {{ $t('calendar.month.July') }}
                                                    </span>
                                                    <span v-if="day.month === 'August'">
                                                        {{ $t('calendar.month.August') }}
                                                    </span>
                                                    <span v-if="day.month === 'September'">
                                                        {{ $t('calendar.month.September') }}
                                                    </span>
                                                    <span v-if="day.month === 'October'">
                                                        {{ $t('calendar.month.October') }}
                                                    </span>
                                                    <span v-if="day.month === 'November'">
                                                        {{ $t('calendar.month.November') }}
                                                    </span>
                                                    <span v-if="day.month === 'December'">
                                                        {{ $t('calendar.month.December') }}
                                                    </span>
                                                </div>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <!-- Day name headers — non-admin -->
                                    <div class="grid grid-cols-7 gap-x-2" v-if="!isAdmin(userStore.getUser?.role)">
                                        <div v-for="day in getWeekDays(weekStart)" :key="day.date" :class="[

                                            hasConflict(state.dutySchedules?.data?.[day?.date]?.schedules) ? 'border-red-500 border-t border-r border-l border-b border-b-gray-200' : 'border-gray-200 border-t border-r border-b border-l',
                                            day.date === moment().format('YYYY-MM-DD') ? 'bg-secondary hover:bg-secondary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100',
                                            'p-2 rounded-tl-md rounded-tr-md'
                                        ]">
                                            <span class="flex gap-x-1 text-xs font-semibold">
                                                <span v-if="day.weekName === 'Mon'">
                                                    {{ $t('calendar.week.short.Monday') }}
                                                </span>
                                                <span v-if="day.weekName === 'Tue'">
                                                    {{ $t('calendar.week.short.Tuesday') }}
                                                </span>
                                                <span v-if="day.weekName === 'Wed'">
                                                    {{ $t('calendar.week.short.Wednesday') }}
                                                </span>
                                                <span v-if="day.weekName === 'Thu'">
                                                    {{ $t('calendar.week.short.Thursday') }}
                                                </span>
                                                <span v-if="day.weekName === 'Fri'">
                                                    {{ $t('calendar.week.short.Friday') }}
                                                </span>
                                                <span v-if="day.weekName === 'Sat'">
                                                    {{ $t('calendar.week.short.Saturday') }}
                                                </span>
                                                <span v-if="day.weekName === 'Sun'">
                                                    {{ $t('calendar.week.short.Sunday') }}
                                                </span>
                                                <span>{{ day.day }}</span>
                                            </span>
                                            <div :class="[
                                                day.date === moment().format('YYYY-MM-DD') ? 'text-gray-50' : 'text-gray-500',
                                                'text-xs'
                                            ]">
                                                <span v-if="day.month === 'January'">
                                                    {{ $t('calendar.month.January') }}
                                                </span>
                                                <span v-if="day.month === 'February'">
                                                    {{ $t('calendar.month.February') }}
                                                </span>
                                                <span v-if="day.month === 'March'">
                                                    {{ $t('calendar.month.March') }}
                                                </span>
                                                <span v-if="day.month === 'April'">
                                                    {{ $t('calendar.month.April') }}
                                                </span>
                                                <span v-if="day.month === 'May'">
                                                    {{ $t('calendar.month.May') }}
                                                </span>
                                                <span v-if="day.month === 'June'">
                                                    {{ $t('calendar.month.June') }}
                                                </span>
                                                <span v-if="day.month === 'July'">
                                                    {{ $t('calendar.month.July') }}
                                                </span>
                                                <span v-if="day.month === 'August'">
                                                    {{ $t('calendar.month.August') }}
                                                </span>
                                                <span v-if="day.month === 'September'">
                                                    {{ $t('calendar.month.September') }}
                                                </span>
                                                <span v-if="day.month === 'October'">
                                                    {{ $t('calendar.month.October') }}
                                                </span>
                                                <span v-if="day.month === 'November'">
                                                    {{ $t('calendar.month.November') }}
                                                </span>
                                                <span v-if="day.month === 'December'">
                                                    {{ $t('calendar.month.December') }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Holiday badges -->
                                    <div class="grid grid-cols-7 gap-x-2">
                                        <div v-for="day in getWeekDays(weekStart)" :key="day.date"
                                            class="bg-white border-l border-r border-gray-200 px-2">
                                            <Badge type="primary" class="w-fit text-xxs"
                                                v-if="state.dutySchedules?.data?.[day?.date]?.holiday">
                                                {{ state.dutySchedules?.data?.[day?.date]?.holiday?.name }}
                                            </Badge>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Scrollable body — horizontal scroll synced with header above -->
                            <div class="overflow-x-auto" :id="`week-body-${wIndex}`"
                                @scroll="syncScroll(wIndex, 'body')">

                                <div class="grid grid-cols-7 gap-x-2 min-w-[1000px]">
                                    <div v-for="(day, dayIndex) in getWeekDays(weekStart)" :key="dayIndex" :class="[
                                        hasConflict(state.dutySchedules?.data?.[day?.date]?.schedules) ? 'border-red-500' : 'border-gray-200',
                                        'bg-white p-2 rounded-br-md rounded-bl-md border-r border-b border-l space-y-2 min-h-96'
                                    ]">
                                        <div class="flex justify-end pr-1"
                                            v-if="hasCreatePermission || isAdmin(userStore.getUser?.role)">
                                            <Tooltip position="left" :text="$t('dutySchedules.newSchedule')">
                                                <button
                                                    class="bg-gray-100 w-5 h-5 text-sm text-gray-700 rounded-sm hover:bg-gray-200"
                                                    @click="openAddNewShiftModal(day)">
                                                    +
                                                </button>
                                            </Tooltip>
                                        </div>
                                        <div v-for="(schedule, scheduleIndex) in state.dutySchedules?.data?.[day?.date]?.schedules"
                                            :key="scheduleIndex" class="rounded-md relative cursor-pointer"
                                            @click="(hasUpdatePermission || isAdmin(userStore.getUser?.role)) ? editSchedule(schedule) : viewSchedule(schedule)">
                                            <div class="border-l-3 text-xs p-2 rounded-sm" :style="{
                                                borderColor: schedule?.shift?.color,
                                                backgroundColor: hexToRgba(schedule?.shift?.color, 0.1)
                                            }">
                                                <div class="flex justify-between gap-x-2">
                                                    <div class="flex items-center gap-x-2">
                                                        <div>
                                                            <div class="rounded-full w-2 h-2"
                                                                :style="{ backgroundColor: `${schedule?.shift?.color}` }" />
                                                        </div>
                                                        <p>
                                                            {{ language.locale.value === 'en' ? schedule?.shift?.en_name
                                                                :
                                                                schedule?.shift?.dk_name }}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <button
                                                            class="bg-red-300 hover:bg-red-400 text-white w-4 h-4 text-sm rounded-sm flex items-center justify-center"
                                                            @click.stop="removeShiftConfirmation(schedule)"
                                                            v-if="hasDeletePermission || isAdmin(userStore.getUser?.role)">
                                                            <Tooltip position="left"
                                                                :text="$t('dutySchedules.removeSchedule.removeSchedule')">
                                                                <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                            </Tooltip>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="mt-2">
                                                    <div class="text-xs">
                                                        <p>
                                                            {{ moment(schedule?.date_time_start).format('HH:mm') }} -
                                                            {{ moment(schedule?.date_time_end).format('HH:mm') }}
                                                        </p>
                                                        <p>
                                                            {{ schedule?.user?.firstname }}
                                                            {{ schedule?.user?.lastname ?? '' }}
                                                        </p>
                                                    </div>
                                                    <div v-if="schedule?.shift_span_position" class="py-0.5 text-xxs">
                                                        <p v-if="schedule?.shift_span_position === 'start'">
                                                            {{ $t('dutySchedules.shiftSpan.start') }}
                                                        </p>
                                                        <p v-if="schedule?.shift_span_position === 'middle'">
                                                            {{ $t('dutySchedules.shiftSpan.middle') }}
                                                        </p>
                                                        <p v-if="schedule?.shift_span_position === 'end'">
                                                            {{ $t('dutySchedules.shiftSpan.end') }}
                                                        </p>
                                                    </div>
                                                    <div :class="[
                                                        schedule?.citizen_schedules?.length > 0 && 'mt-0.5'
                                                    ]" v-if="schedule?.citizen_schedules?.length > 0">
                                                        <p v-for="(citizenSchedule, citizenScheduleIndex) in schedule?.citizen_schedules"
                                                            :key="citizenScheduleIndex" class="text-xxs py-0.5">
                                                            {{ citizenSchedule?.citizen?.firstname }}
                                                            {{ citizenSchedule?.citizen?.lastname }}
                                                        </p>
                                                    </div>
                                                    <div class="text-xxs py-0.5"
                                                        v-if="schedule?.departments?.length > 0">
                                                        {{ $t('departments.departments') }}:
                                                        <span
                                                            v-for="(department, departmentIndex) in schedule?.departments"
                                                            :key="departmentIndex">
                                                            {{ department?.name }}<span
                                                                v-if="(departmentIndex as number) < schedule?.departments.length - 1">,
                                                            </span><span v-else>.</span>
                                                        </span>
                                                    </div>
                                                    <div class="flex items-center flex-wrap gap-0.5 mt-1"
                                                        v-if="schedule?.tags?.length > 0">
                                                        <Tooltip :text="tag?.tag"
                                                            v-for="(tag, tagIndex) in schedule?.tags" :key="tagIndex">
                                                            <div class="text-white w-4 h-4 text-xxs rounded-sm flex items-center justify-center"
                                                                :style="{ backgroundColor: hexToRgba(tag?.color, 0.1), color: tag?.color }">
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
                <div class="px-4 sm:px-6 lg:px-8 mt-5">
                    <Pagination :data="state.userHours" @previous="previous" @next="next" />
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
                :selectedDate="state.newShift.selectedDate" :showWarningDialog="state.showWarningDialog"
                :shiftWarnings="state.shiftWarnings" @dateTimeChange="dateTimeChange"
                @closeWarningDialog="closeWarningDialog" @close="state.modal.isAddShiftOpen = false"
                @saveShift="saveShift" @resetNewShiftError="state.newShiftError = {}" />
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
                @close="state.modal.isManageExtraHoursOpen = false" @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleLeaveRequestsModalView :isModalOpen="state.modal.isManageLeaveRequestsOpen"
                :selectedEmployee="state.manageLeaveRequests.selectedEmployee"
                @close="state.modal.isManageLeaveRequestsOpen = false" @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleTimeRequestsModalRequests
                :isModalOpen="state.modal.isManageTimeAdjustmentRequestsOpen"
                :selectedDate="state.manageTimeRequest.selectedDate"
                :selectedEmployee="state.manageTimeRequest.selectedEmployee"
                @close="state.modal.isManageTimeAdjustmentRequestsOpen = false"
                @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleSwapScheduleModalRequests
                :isModalOpen="state.modal.isManageSwapScheduleRequestsOpen"
                :selectedDate="state.manageSwapScheduleRequest.selectedDate"
                :selectedEmployee="state.manageSwapScheduleRequest.selectedEmployee"
                @close="state.modal.isManageSwapScheduleRequestsOpen = false"
                @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleTimeRequestsModalNewRequest :isModalOpen="state.modal.isRequestTimeAdjustmentOpen"
                :selectedEmployee="state.manageTimeRequest.selectedEmployee"
                :selectedSchedule="state.manageTimeRequest.selectedSchedule"
                @close="state.modal.isRequestTimeAdjustmentOpen = false" />
            <ModulesUserDutyScheduleSwapScheduleModalNewRequest :isModalOpen="state.modal.isRequestSwapScheduleOpen"
                :selectedSchedule="state.manageSwapScheduleRequest.selectedSchedule"
                @close="state.modal.isRequestSwapScheduleOpen = false" />
            <ModulesUserDutyScheduleScheduleSlotsModalScheduleSlots :isModalOpen="state.modal.isManageScheduleSlotOpen"
                :selectedDay="state.manageScheduleSlot.selectedDay"
                @close="state.modal.isManageScheduleSlotOpen = false" @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleModalCopyMultipleWeeks :isModalOpen="state.modal.isCopyMultipleWeeklyScheduleOpen"
                @close="state.modal.isCopyMultipleWeeklyScheduleOpen = false"
                @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleNormHoursModalGraph :isModalOpen="state.modal.isGraphOpen"
                :selectedEmployee="state.normHours.selectedEmployee" @close="state.modal.isGraphOpen = false" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useDepartmentStore } from '@/store/department'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useDutyScheduleStore } from '@/store/duty-schedule'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const emit = defineEmits(['setDutyScheduleCurrentDate', 'setDutyScheduleCurrentFilter'])
const language = useI18n()
const dutyScheduleStore = useDutyScheduleStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore()
const currentDate = ref(moment())
const scrollLock = ref<Record<number, boolean>>({})

const state = reactive({
    copy: {
        allEmployeeSchedules: {},
        selectedEmployeeDailySchedule: {},
        selectedEmployeeWeeklySchedule: {},
        selectedWeekNumber: null,
    } as any,
    copyShiftError: {} as Error,
    dataFilter: {
        search: ''
    },
    dutySchedules: [] as any,
    editShiftError: {} as Error,
    editShift: {
        selectedEmployee: {},
        selectedEmployeeSchedule: {},
    } as any,
    error: {} as Error,
    filter: {
        date_range: [moment().startOf('isoWeek'), moment().endOf('isoWeek')] as any,
        department_uuids: [],
        employment_status: [],
        employee_uuids: [],
    },
    isModalLoading: false,
    isPageLoading: false,
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
    shiftWarnings: [] as any,
    showWarningDialog: false,
    userHours: [] as any,
    viewShift: {
        selectedEmployeeSchedule: {},
    } as any,
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
        fetchDutySchedules()
    }
})

watch(() => state.filter.date_range, (newSelectedDate: any) => {
    if (newSelectedDate) {
        // currentDate.value = moment(newSelectedDate)
        fetchDutySchedules()
        // emit('setDutyScheduleCurrentDate', state.selectedDate)
    }
})

watch(() => dutyScheduleStore.getShowEmployeesWorkingToday, (status: boolean) => {
    dutyScheduleStore.setShowEmployeesWorkingToday(status)
    fetchDutySchedules()
})

watch(() => state.dutySchedules, (newSchedules) => {
    // Update the expanded records only if the number of records changes.
    // if (newSchedules && newSchedules.data.length !== expandedRecords.length) {
    //     expandedRecords.splice(0, expandedRecords.length, ...newSchedules.data.map(() => true))
    // }
})

onMounted(() => {
    fetchDutySchedules()
    getDutySchedulesUserHours()
    window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        stopCopying()
    }
}

function isAdmin(role: any) {
    return role && role === 'Admin'
}

function getDisplayName(employee: any) {
    return {
        firstName: employee?.firstname || employee?.firstName || '',
        lastName: employee?.lastname || employee?.lastName || '',
    }
}

const weeksInRange = computed(() => {
    const [start, end] = state.filter.date_range
    if (!start || !end) return [moment(currentDate.value).startOf('isoWeek')]

    const weeks: moment.Moment[] = []
    const cursor = moment(start).startOf('isoWeek')
    const endMoment = moment(end)

    while (cursor.isSameOrBefore(endMoment, 'day')) {
        weeks.push(cursor.clone())
        cursor.add(1, 'week')
    }

    return weeks
})

function getWeekNumber(weekStart: moment.Moment): number {
    return weekStart.isoWeek()
}

function getWeekDays(weekStart: moment.Moment) {
    return Array.from({ length: 7 }).map((_, i) => {
        const day = moment(weekStart).add(i, 'day')
        return {
            shortName: day.format('dd')[0],
            weekName: day.format('ddd'),
            day: day.date(),
            date: day.format('YYYY-MM-DD'),
            fullDate: day,
            month: day.format('MMMM'),
        }
    })
}

function syncScroll(wIndex: number, source: 'header' | 'body') {
    if (scrollLock.value[wIndex]) return
    scrollLock.value[wIndex] = true

    const header = document.getElementById(`week-header-${wIndex}`)
    const body = document.getElementById(`week-body-${wIndex}`)
    if (!header || !body) { scrollLock.value[wIndex] = false; return }

    if (source === 'body') header.scrollLeft = body.scrollLeft
    if (source === 'header') body.scrollLeft = header.scrollLeft

    requestAnimationFrame(() => { scrollLock.value[wIndex] = false })
}

async function fetchDutySchedules() {
    state.error = {}
    state.progress.totalRequests = state.progress.totalRequests + 1
    state.progress.pendingRequests = state.progress.pendingRequests + 1
    identifyTheProgressPercentage()
    try {
        const params = {
            page: dutyScheduleStore.getCurrentPageNumber,
            page_length: dutyScheduleStore.getCurrentPageLength,
            date_start: moment(state.filter.date_range[0]).format('YYYY-MM-DD'),
            date_end: moment(state.filter.date_range[1]).format('YYYY-MM-DD'),
            filter_date_start: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            filter_date_end: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
            show_employees_working_today: dutyScheduleStore.getShowEmployeesWorkingToday,
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
            state.dutySchedules = response
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

async function getDutySchedulesUserHours() {
    state.error = {}
    state.progress.totalRequests = state.progress.totalRequests + 1
    state.progress.pendingRequests = state.progress.pendingRequests + 1
    identifyTheProgressPercentage()
    try {
        const params = {
            page: dutyScheduleStore.getCurrentPageNumber,
            page_length: dutyScheduleStore.getCurrentPageLength,
            date_start: moment(state.filter.date_range[0]).format('YYYY-MM-DD'),
            date_end: moment(state.filter.date_range[1]).format('YYYY-MM-DD'),
            // filter_date_start: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            // filter_date_end: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
            // show_employees_working_today: dutyScheduleStore.getShowEmployeesWorkingToday,
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
        const response = await dutyScheduleService.getDutySchedulesUserHours(params)
        if (response) {
            state.userHours = response
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
    if (isAdmin(userStore.getUser?.role)) return false

    if (!userStore.getUser?.company?.is_lock_past_schedules) return false

    return moment(state.filter.date_range[0]).isSameOrBefore(moment(), 'day')
}

function setFilter(filter: any) {
    state.filter.department_uuids = filter.department_uuids
    state.filter.employment_status = filter.employment_status
    state.filter.employee_uuids = filter.employee_uuids
    emit('setDutyScheduleCurrentFilter', state.filter)
    fetchDutySchedules()
}

function handleSearch(value: any) {
    dutyScheduleStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDutySchedules()
    getDutySchedulesUserHours()
}

function previous() {
    const currentTablePage = dutyScheduleStore.getCurrentPageNumber - 1
    dutyScheduleStore.setCurrentPageNumber(currentTablePage)
    getDutySchedulesUserHours()
}

function next() {
    const currentTablePage = dutyScheduleStore.getCurrentPageNumber + 1
    dutyScheduleStore.setCurrentPageNumber(currentTablePage)
    getDutySchedulesUserHours()
}

function changePageLength(event: any) {
    dutyScheduleStore.setCurrentPageNumber(1)
    dutyScheduleStore.setCurrentPageLength(event.target.value)
    getDutySchedulesUserHours()
}

function previousWeek() {
    const diff = moment(state.filter.date_range[1]).diff(moment(state.filter.date_range[0]), 'days') + 1
    state.filter.date_range = [
        moment(state.filter.date_range[0]).subtract(diff, 'days'),
        moment(state.filter.date_range[1]).subtract(diff, 'days'),
    ]
}

function setToday() {
    state.filter.date_range = [moment().startOf('isoWeek'), moment().endOf('isoWeek')]
}

function nextWeek() {
    const diff = moment(state.filter.date_range[1]).diff(moment(state.filter.date_range[0]), 'days') + 1
    state.filter.date_range = [
        moment(state.filter.date_range[0]).add(diff, 'days'),
        moment(state.filter.date_range[1]).add(diff, 'days'),
    ]
}

const weekNumber = computed(() => {
    return moment(currentDate.value).week()
})

function hasConflict(schedules: any) {
    const hasConflict = schedules?.some((shift: any) => shift.is_conflict === true)
    return hasConflict
}

function openAddNewShiftModal(day: any) {
    state.modal.isAddShiftOpen = true
    state.newShift.selectedDate = day?.date
}

function openManageScheduleSlotModal(day: any) {
    state.manageScheduleSlot.selectedDay = day
    state.modal.isManageScheduleSlotOpen = true
}

function viewChangeTimeRequests(employeeIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    const selectedEmployee = state.dutySchedules?.data?.[employeeIndex]
    const selectedDate = state.dutySchedules?.data?.[employeeIndex].weeks[weekIndex]?.date
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedDate = selectedDate
    state.modal.isManageTimeAdjustmentRequestsOpen = true
}

function requestTimeAdjustment(employeeIndex: number, shift: any) {
    const selectedEmployee = state.dutySchedules?.data?.[employeeIndex]
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedSchedule = shift
    state.modal.isRequestTimeAdjustmentOpen = true
}

function viewSwapScheduleRequests(employeeIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    const selectedEmployee = state.dutySchedules?.data?.[employeeIndex]
    const selectedDate = state.dutySchedules?.data?.[employeeIndex].weeks[weekIndex]?.date
    state.manageSwapScheduleRequest.selectedEmployee = selectedEmployee
    state.manageSwapScheduleRequest.selectedDate = selectedDate
    state.modal.isManageSwapScheduleRequestsOpen = true
}

function requestSwapSchedule(shift: any) {
    state.manageSwapScheduleRequest.selectedSchedule = shift
    state.modal.isRequestSwapScheduleOpen = true
}

async function saveShift(shiftDetails: any) {
    const params = {
        shift_type_uuid: shiftDetails.shift_type,
        is_sleeping_sick_leave: shiftDetails.is_sleeping_sick_leave,
        do_not_count_weekends: shiftDetails.do_not_count_weekends,
        date_time_start: shiftDetails.date_time_start,
        date_time_end: shiftDetails.date_time_end,
        user_uuid: shiftDetails?.user_uuid,
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
            fetchDutySchedules()
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
    return state.copy.selectedEmployeeDailySchedule.employeeIndex === employeeIndex &&
        state.copy.selectedEmployeeDailySchedule.weekIndex === weekIndex &&
        state.copy.selectedEmployeeDailySchedule.weekNumber === weekNumber &&
        dutyScheduleStore.getCurrentPageNumber === state.copy.selectedEmployeeDailySchedule.currentTablePage
}

function copyEmployeeDailySchedule(employeeIndex: number, weekIndex: any, employee: any, weekNumber: number) {
    state.copy.selectedEmployeeDailySchedule = {
        employeeIndex: employeeIndex,
        weekNumber: weekNumber,
        weekIndex: weekIndex,
        employee: employee,
        currentTablePage: dutyScheduleStore.getCurrentPageNumber,
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
    const userDestination = state.dutySchedules?.data?.[employeeIndex]
    const dateDestination = state.dutySchedules?.data?.[employeeIndex].weeks[weekIndex].date
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
            fetchDutySchedules()
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
            fetchDutySchedules()
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
        dutySchedules: state.dutySchedules?.data
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
            fetchDutySchedules()
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
    const scheduleUuid = state.removeShift.selectedShift.uuid
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.deleteDutySchedule(scheduleUuid)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDutySchedules()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
}

async function removeEntireShiftSpan() {
    const scheduleUuid = state.removeShift.selectedShift.uuid
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
            fetchDutySchedules()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
}

function viewSchedule(schedule: any) {
    state.viewShift.selectedEmployeeSchedule = schedule
    state.modal.isViewShiftOpen = true
}

function editSchedule(schedule: any) {
    const userUuid = schedule?.user?.uuid
    state.editShift.selectedEmployee = schedule?.user
    state.editShift.selectedEmployeeSchedule = {
        citizen_schedules: schedule?.citizen_schedules,
        scheduleUuid: schedule?.uuid,
        date_time_start: schedule?.date_time_start,
        date_time_end: schedule?.date_time_end,
        recurring: {
            is_recurring: schedule?.is_recurring
        },
        user_uuid: userUuid,
        shift_type: schedule?.shift,
        tags: schedule?.tags,
        departments: schedule?.departments,
        note: schedule?.note,
        do_not_count_sick_leave: schedule?.do_not_count_sick_leave,
        use_compensatory_time: schedule?.use_compensatory_time,
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
            fetchDutySchedules()
        }
    } catch (error: any) {
        state.editShiftError = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    } finally {
        state.isUpdateShift = false
        fetchDutySchedules()
        setTimeout(() => {
            state.isModalLoading = false
        }, 300)
    }
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

function hexToRgba(hex: any, alpha: any = 1) {
    if (!hex) return 'transparent'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>
