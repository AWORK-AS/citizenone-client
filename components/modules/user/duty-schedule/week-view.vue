<template>
    <div class="space-y-5">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="state?.errorUpdateShift?.message"
            v-if="state.errorUpdateShift?.message && state.errorUpdateShift.message.length > 0" />
        <Alert type="danger" :text="state?.copyShiftError?.message"
            v-if="state.copyShiftError?.message && state.copyShiftError.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="flex justify-end gap-x-3">
                <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/schedules/draft')"
                    v-if="isAdmin(userStore.getUser?.roles)">
                    <Icon name="ph:note" class="h-4 w-4" aria-hidden="true" />
                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    {{ $t('dutySchedules.draft.draft')?.toLowerCase() }}
                </FormButton>
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isDownloadOpen = true">
                    <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('dutySchedules.download.download') }}
                </FormButton>
            </div>
            <div class="flex h-full flex-col">
                <header class="grid grid-cols-1 md:grid-cols-3 md:items-center justify-between py-4 gap-3">
                    <div>
                        <div class="font-medium mt-2">
                            {{ $t('dutySchedules.typeofShifts') }}:
                            <button class="text-xs text-primary hover:text-primary-700 hover:underline"
                                @click="state.modal.isDepartmentSickLeaveDateRangeOpen = true">
                                ({{ formatDateToReadable(state.shiftDateRange.formDateRange.start_date) }} -
                                {{ formatDateToReadable(state.shiftDateRange.formDateRange.end_date) }})
                            </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 text-sm">
                            <div class="flex items-center justify-between gap-x-2"
                                v-for="(shiftPercentage, index) in state.shiftPercentage?.data" :key="index">
                                <div class="flex items-center gap-x-2">
                                    <div class="w-3 h-3 rounded-sm"
                                        :style="{ backgroundColor: shiftPercentage?.color }"></div>
                                    <span>
                                        {{ language.locale.value === 'en' ? shiftPercentage?.en_name :
                                            shiftPercentage?.dk_name }}
                                    </span>
                                </div>
                                <p class="text-xs">{{ shiftPercentage?.percentage }}%</p>
                            </div>
                        </div>
                    </div>
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
                    <div class="flex items-center justify-end">
                        <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                            <button @click="previousWeek" type="button"
                                class="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                                <span class="sr-only">Previous week</span>
                                <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button @click="setToday" type="button"
                                class="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block">
                                {{ $t('calendar.today') }}
                            </button>
                            <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                            <button @click="nextWeek" type="button"
                                class="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                                <span class="sr-only">Next week</span>
                                <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </header>
                <div class="bg-primary h-3 rounded-full transition-all ease-in-out duration-500 mb-1.5"
                    :style="{ width: `${state.progress.percentage}%` }" v-if="state.progress.showProgressBar" />
                <div class="isolate flex flex-auto flex-col bg-white">
                    <div class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                        <div>
                            <div>
                                <div class="shadow grid grid-cols-9">
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
                                                v-if="isAdmin(userStore.getUser?.roles)">
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
                                        <div class="px-3 pb-2">
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
                                        v-if="isAdmin(userStore.getUser?.roles)">
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
                                            {{ getSlotCount(day.longName) > 99 ? '99+' : getSlotCount(day.longName) }}
                                        </div>
                                    </Tooltip>
                                    <div :text="$t('dutySchedules.scheduleSlots.scheduleSlots')" v-for="day in weekDays"
                                        :key="day.date" class="flex items-center justify-center py-4 border-0.5"
                                        v-if="!isAdmin(userStore.getUser?.roles)">
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

                                <div class="relative mt-0.5 overflow-y-auto" style="max-height: 82vh;"
                                    @click="!isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && !isPastWeek() && pasteWeeklySchedule(weekNumber)"
                                    :class="[
                                        isWeeklyScheduleCopied(weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                        !isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && !isPastWeek() && 'cursor-copy relative group',
                                        !isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && isPastWeek() && 'cursor-not-allowed'
                                    ]">
                                    <div v-for="(weeklySchedule, weeklyScheduleIndex) in state.weeklySchedules"
                                        :key="weeklyScheduleIndex" class="grid grid-cols-9"
                                        v-if="!isWeeklyScheduleCopied(weekNumber)">
                                        <div class="col-span-9 flex flex-col items-center space-y-2 py-8 cursor-pointer border-1.5 border-dashed border-gray-700"
                                            @click="stopCopying()"
                                            v-if="isCopiedWeek() && isEmployeeWeeklyScheduleCopied() && isEmployeeSelectedAsWeeklyScheduleSource(weeklySchedule)">
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
                                        ]" v-if="!isCopiedWeek() || !isEmployeeSelectedAsWeeklyScheduleSource(weeklySchedule)"
                                            @click="isEmployeeWeeklyScheduleCopied() && (!isCopiedWeek() || !isEmployeeSelectedAsWeeklyScheduleSource(weeklySchedule)) && pasteEmployeeWeeklySchedule(weeklySchedule)">
                                            <div class="p-3 col-span-2 border-0.5">
                                                <div class="relative">
                                                    <div class="flex justify-between">
                                                        <div class="flex items-center gap-x-2">
                                                            <img :src="weeklySchedule?.employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${weeklySchedule?.employee?.firstname + ' ' + weeklySchedule?.employee?.lastname}`"
                                                                :class="[
                                                                    weeklySchedule?.employee?.shift_threshold === 'high' && 'border-green-700',
                                                                    weeklySchedule?.employee?.shift_threshold === 'moderate' && 'border-yellow-500',
                                                                    weeklySchedule?.employee?.shift_threshold === 'low' && 'border-red-600',
                                                                    'h-10 w-10 rounded-full bg-gray-50 object-cover border-2'
                                                                ]" />
                                                            <p class="text-sm font-medium">
                                                                {{ weeklySchedule?.employee?.firstname }}
                                                                {{ weeklySchedule?.employee?.lastname }}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Tooltip position="left"
                                                                :text="$t('dutySchedules.copy.copyEmployeeSchedule')">
                                                                <button
                                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                                    @click="copyEmployeeWeeklySchedule(weeklySchedule)">
                                                                    <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                    <div class="-mt-2 ml-12">
                                                        <p class="text-xxs">
                                                            {{ weeklySchedule?.employee?.employee_detail?.job?.title }}
                                                        </p>
                                                        <div class="text-xxs">
                                                            {{ $t('departments.departments') }}:
                                                            <span
                                                                v-for="(department, departmentIndex) in weeklySchedule?.employee?.departments"
                                                                :key="departmentIndex">
                                                                {{ department?.name }}<span
                                                                    v-if="departmentIndex < weeklySchedule.employee.departments.length - 1">,
                                                                </span><span v-else>.</span>
                                                            </span>
                                                        </div>
                                                        <p class="text-xxs">
                                                            {{ $t('dutySchedules.annualNormHours') }}:
                                                            {{ weeklySchedule?.employee?.annual_norm_hours ?? 0 }}
                                                        </p>
                                                        <p class="text-xxs">
                                                            {{ $t('dutySchedules.totalHours') }}:
                                                            {{ weeklySchedule?.employee?.total_hours ?? 0 }}
                                                        </p>
                                                        <div class="p-0 m-0 text-xxs text-primary cursor-pointer hover:text-primary-700"
                                                            @click="navigateTo(`/calendar?employee_uuid=${weeklySchedule?.employee?.uuid}`)">
                                                            {{ $t('dutySchedules.viewCalendar') }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div :class="[
                                                    expandedRecords[weeklyScheduleIndex] && 'hidden',
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
                                                        <p v-for="(time, timeIndex) in weeklySchedule?.employee?.hours"
                                                            :key="timeIndex">
                                                            {{ language.locale.value === 'en' ? time?.shift?.en_name :
                                                                time?.shift?.dk_name }}
                                                        </p>
                                                    </div>
                                                    <div class="col-span-2 flex gap-2 flex-col items-end">
                                                        <p v-for="(time, timeIndex) in weeklySchedule?.employee?.hours"
                                                            :key="timeIndex">
                                                            {{ time?.weekly_hours }}
                                                        </p>
                                                    </div>
                                                    <div
                                                        class="col-span-2 flex gap-2 flex-col items-end border-l-0.5 border-gray-200 ml-3">
                                                        <p v-for="(time, timeIndex) in weeklySchedule?.employee?.hours"
                                                            :key="timeIndex">
                                                            {{ time?.yearly_hours }}
                                                        </p>
                                                    </div>
                                                    <div
                                                        class="col-span-7 space-y-2 mt-4 border-t-0.5 border-gray-200 pt-3">
                                                        <div :class="[
                                                            weeklySchedule?.employee?.compensatory_hours?.total_in_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                            'flex items-center gap-1'
                                                        ]">
                                                            <Icon name="ph:clock" class="h-3 w-3" aria-hidden="true" />
                                                            {{
                                                                $t('dutySchedules.compensatoryHours')
                                                            }}:
                                                            {{
                                                                formatNumber(language.locale.value,
                                                                    weeklySchedule?.employee?.compensatory_hours?.total_in_hours)
                                                                ??
                                                                0
                                                            }}
                                                        </div>
                                                    </div>
                                                    <div class="col-span-7 space-y-2 mt-1">
                                                        <div :class="[
                                                            weeklySchedule?.employee?.available_vacation_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                            'flex items-center gap-1'
                                                        ]">
                                                            <Icon name="ph:clock" class="h-3 w-3" aria-hidden="true" />
                                                            {{
                                                                $t('dutySchedules.availableVacationHours')
                                                            }}:
                                                            {{
                                                                formatNumber(language.locale.value,
                                                                    weeklySchedule?.employee?.available_vacation_hours) ?? 0
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button @click="toggleExpanded(weeklyScheduleIndex)"
                                                        class="text-primary text-xs hover:text-primary-700">
                                                        {{ !expandedRecords[weeklyScheduleIndex] ?
                                                            $t('showLess') :
                                                            $t('showMore') }}
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="p-3 border-0.5"
                                                v-for="(week, weekIndex) in weeklySchedule?.weeks" :key="weekIndex"
                                                :class="[
                                                    isDailyScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                                    !isDailyScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty() && 'cursor-copy relative group'
                                                ]"
                                                @click="!isDailyScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty() && pasteEmployeeDailySchedule(weeklyScheduleIndex, weekIndex)">
                                                <div class="space-y-2"
                                                    v-if="!isDailyScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber)">
                                                    <div class="flex justify-end gap-2"
                                                        v-if="isAdmin(userStore.getUser?.roles)">
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
                                                                            @click="viewChangeTimeRequests(weeklyScheduleIndex, weekIndex, weeklySchedule, weekNumber)">
                                                                            {{
                                                                                $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')
                                                                            }}
                                                                        </a>
                                                                        </MenuItem>
                                                                        <MenuItem v-slot="{ active }">
                                                                        <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs cursor-pointer']"
                                                                            @click="viewSwapScheduleRequests(weeklyScheduleIndex, weekIndex, weeklySchedule, weekNumber)">
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
                                                                @click="copyEmployeeDailySchedule(weeklyScheduleIndex, weekIndex, weeklySchedule, weekNumber)">
                                                                <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="left"
                                                            :text="$t('dutySchedules.newSchedule')">
                                                            <button
                                                                class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200"
                                                                @click="openAddNewShiftModal(weeklySchedule?.employee, weeklyScheduleIndex, weekIndex, week)">
                                                                +
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                    <div class="text-xs">
                                                        <div v-for="(shift, shiftIndex) in sortMultiDayShiftsFirst(week?.shifts)"
                                                            :key="shiftIndex" class="rounded-md p-1 relative mb-2.5"
                                                            :style="{
                                                                backgroundColor: `${shift?.type?.color}`,
                                                                width: `${calculateShiftWidth(shift, weekIndex.toString())}`,
                                                                marginTop: `${calculateMarginTop(weeklySchedule?.weeks, weekIndex.toString(), shiftIndex)}rem`
                                                            }">
                                                            <div class="flex justify-between text-white cursor-pointer"
                                                                @click="isAdmin(userStore.getUser?.roles) ? editSchedule(weeklySchedule?.employee, weeklyScheduleIndex, weekIndex, shift, shiftIndex) : viewSchedule(weeklyScheduleIndex, weekIndex, shift, shiftIndex)">
                                                                <p
                                                                    class="w-full px-2 py-2 flex items-center justify-center border border-white rounded-tl-md rounded-bl-md">
                                                                    {{ moment(shift?.date_time_start).format('HH:mm') }}
                                                                </p>
                                                                <p
                                                                    class="w-full px-2 py-2 flex items-center justify-center border border-white  rounded-tr-md rounded-br-md">
                                                                    {{ moment(shift?.date_time_end).format('HH:mm') }}
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
                                                            <div class="text-xxs text-white px-1 py-0.5">
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
                                                                @click="removeShift(week, weeklyScheduleIndex, weekIndex, shift, shiftIndex)"
                                                                v-if="isAdmin(userStore.getUser?.roles)">
                                                                <Tooltip :text="$t('dutySchedules.removeSchedule')">
                                                                    <Icon name="ph:x" class="h-2 w-2"
                                                                        aria-hidden="true" />
                                                                </Tooltip>
                                                            </button>
                                                            <button
                                                                class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                                v-else
                                                                v-if="userStore.getUser?.uuid === weeklySchedule?.employee?.uuid">
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
                                                                                    @click="requestTimeAdjustment(weeklyScheduleIndex, shift)">
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
                                                            :week="week" :employee="weeklySchedule?.employee"
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
                                                    v-if="!isDailyScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty()">
                                                    <p class="text-white text-xs text-center">
                                                        {{ $t('dutySchedules.copyPaste.clickHereToPasteTheSchedule') }}
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
            </div>
            <ModulesUserDutyScheduleModalDownload :isModalOpen="state.modal.isDownloadOpen"
                @close="state.modal.isDownloadOpen = false" />
            <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isDepartmentSickLeaveDateRangeOpen"
                :dateRange="state.shiftDateRange" @close="state.modal.isDepartmentSickLeaveDateRangeOpen = false"
                @filterDate="filterDutyScheduleDate" />
            <ModulesUserDutyScheduleModalNewShift :isModalOpen="state.modal.isAddShiftOpen" :error="state.newShiftError"
                :selectedDate="state.newShift.selectedDate" :selectedEmployee="state.newShift.selectedEmployee"
                @close="state.modal.isAddShiftOpen = false" @saveShift="saveShift"
                @resetNewShiftError="state.newShiftError = {}" />
            <ModulesUserDutyScheduleModalEditShift :isModalOpen="state.modal.isEditShiftOpen"
                :error="state.editShiftError" :selectedEmployee="state.editShift.selectedEmployee"
                :selectedEmployeeSchedule="state.editShift.selectedEmployeeSchedule"
                @close="state.modal.isEditShiftOpen = false" @resetEditShiftError="state.editShiftError = {}"
                @updateShift="updateSelectedSchedule" />
            <ModulesUserDutyScheduleModalViewShift :isModalOpen="state.modal.isViewShiftOpen"
                :selectedEmployeeSchedule="state.viewShift.selectedEmployeeSchedule"
                @close="state.modal.isViewShiftOpen = false" />
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
        </LoadingSpinner>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useDepartmentStore } from '@/store/department'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const language = useI18n()
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore()
const customPagesStore = useCustomPagesStore() as any
const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const currentDate = ref(moment())
const selectedDay = ref(moment())
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
    editShiftError: {} as Error,
    editShift: {
        selectedEmployee: {},
        selectedEmployeeSchedule: {},
    } as any,
    error: {} as Error,
    errorUpdateShift: {} as Error,
    isPageLoading: false,
    manageScheduleSlot: {
        selectedDay: [],
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
        isCopyMultipleWeeklyScheduleOpen: false,
        isDepartmentSickLeaveDateRangeOpen: false,
        isDownloadOpen: false,
        isEditShiftOpen: false,
        isManageScheduleSlotOpen: false,
        isManageTimeAdjustmentRequestsOpen: false,
        isManageSwapScheduleRequestsOpen: false,
        isRequestTimeAdjustmentOpen: false,
        isRequestSwapScheduleOpen: false,
        isViewShiftOpen: false,
    } as any,
    newShift: {
        selectedDate: '',
        selectedEmployee: {},
    },
    newShiftError: {} as Error,
    progress: {
        percentage: 100,
        pendingRequests: 0,
        showProgressBar: false,
        totalRequests: 0,
    },
    showAllShifts: false,
    shiftPercentage: {} as any,
    shiftDateRange: {
        formDateRange: {
            start_date: moment().startOf('week').add(1, 'day'),
            end_date: moment().startOf('week').add(7, 'day'),
        },
    } as any,
    isFirstLoad: true,
    isRemoveShift: false,
    isUpdateShift: false,
    originalWeeklySchedules: [] as any,
    viewShift: {
        selectedEmployeeSchedule: {},
    } as any,
    weeklySchedules: [] as any,
    weeklySlots: {} as any,
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

onMounted(() => {
    fetchDutySchedule()
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

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

function filterDutyScheduleDate(formDateRange: any) {
    state.shiftDateRange.formDateRange.start_date = formDateRange?.[0]
    state.shiftDateRange.formDateRange.end_date = formDateRange?.[1]
    fetchDutySchedule()
    setCustomWeekLabel(formDateRange?.[0], formDateRange?.[1])
}

function setCustomWeekLabel(startDate: any, endDate: any) {
    const start = new Date(startDate) as any
    const end = new Date(endDate) as any

    // Calculate difference in days
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    // Check for week
    const isWeek =
        (start.getDay() === 0 || start.getDay() === 1) && diffDays === 7

    // Check for full month
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
    return shifts
        .find((shift: any) => {
            const startDay = moment(shift.date_time_start).startOf('day')
            const endDay = moment(shift.date_time_end).startOf('day')
            const isMultiDay = endDay.diff(startDay, 'days') >= 1
            const isExcluded = endDay.diff(startDay, 'days') === 1 && moment(shift.date_time_end).format('HH:mm:ss') === '00:00:00'

            return isMultiDay && !isExcluded
        })
}

async function fetchDutySchedulePercentage() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            start_date: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            end_date: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await dutyScheduleService.getDutyScheduleAbsencePercentage(params)
        if (response) {
            state.shiftPercentage = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchDutySchedule() {
    state.error = {}
    state.weeklySchedules = []
    state.originalWeeklySchedules = []
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
        }
        const response = await dutyScheduleService.getDutySchedules(params)
        if (response) {
            state.weeklySchedules = response?.data
            state.weeklySlots = response?.week_slots
            state.originalWeeklySchedules = JSON.parse(JSON.stringify(response?.data))
            fetchDutySchedulePercentage()
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
    return state.weeklySlots[key]?.total_slots || 0
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

function setSelectedDay(day: any) {
    selectedDay.value = day.fullDate
    stopCopying()
}

function isPastWeek() {
    return moment(currentDate.value).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')
}

function openAddNewShiftModal(employee: any, weeklyScheduleIndex: number, weekIndex: any, week: any) {
    state.modal.isAddShiftOpen = true
    state.addShift.selectedEmployeeSchedule = {
        weeklyScheduleIndex: weeklyScheduleIndex,
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

function viewChangeTimeRequests(weeklyScheduleIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    const selectedEmployee = state.weeklySchedules[weeklyScheduleIndex]?.employee
    const selectedDate = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex]?.date
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedDate = selectedDate
    state.modal.isManageTimeAdjustmentRequestsOpen = true
}

function requestTimeAdjustment(weeklyScheduleIndex: number, shift: any) {
    const selectedEmployee = state.weeklySchedules[weeklyScheduleIndex]?.employee
    state.manageTimeRequest.selectedEmployee = selectedEmployee
    state.manageTimeRequest.selectedSchedule = shift
    state.modal.isRequestTimeAdjustmentOpen = true
}

function viewSwapScheduleRequests(weeklyScheduleIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    const selectedEmployee = state.weeklySchedules[weeklyScheduleIndex]?.employee
    const selectedDate = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex]?.date
    state.manageSwapScheduleRequest.selectedEmployee = selectedEmployee
    state.manageSwapScheduleRequest.selectedDate = selectedDate
    state.modal.isManageSwapScheduleRequestsOpen = true
}

function requestSwapSchedule(shift: any) {
    state.manageSwapScheduleRequest.selectedSchedule = shift
    state.modal.isRequestSwapScheduleOpen = true
}

async function saveShift(shiftDetails: any) {
    const weeklyScheduleIndex = state.addShift.selectedEmployeeSchedule.weeklyScheduleIndex
    const shiftType = shiftDetails.shift_type
    const params = {
        shift_type_uuid: shiftType,
        date_time_start: shiftDetails.date_time_start,
        date_time_end: shiftDetails.date_time_end,
        user_uuid: state.weeklySchedules[weeklyScheduleIndex].employee.uuid,
        citizen_uuid: shiftDetails?.citizens,
        schedule_tag_uuid: shiftDetails.schedule_tag_uuid,
        department_uuid: shiftDetails.department_uuid,
        use_compensatory_time: shiftDetails.use_compensatory_time,
        note: shiftDetails.note,
    }
    saveDutySchedule(params)
}

async function saveDutySchedule(params: object) {
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
        state.newShiftError = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
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

function isDailyScheduleCopied(weeklyScheduleIndex: number, weekIndex: number, weekNumber: number) {
    return state.copy.selectedEmployeeDailySchedule.weeklyScheduleIndex === weeklyScheduleIndex && state.copy.selectedEmployeeDailySchedule.weekIndex === weekIndex && state.copy.selectedEmployeeDailySchedule.weekNumber === weekNumber
}

function copyEmployeeDailySchedule(weeklyScheduleIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    state.copy.selectedEmployeeDailySchedule = {
        weeklyScheduleIndex: weeklyScheduleIndex,
        weekNumber: weekNumber,
        weekIndex: weekIndex,
        weeklySchedule: weeklySchedule,
    }
}

function stopCopying() {
    state.copy.allEmployeeSchedules = {}
    state.copy.selectedEmployeeDailySchedule = {}
    state.copy.selectedEmployeeWeeklySchedule = {}
}

async function pasteEmployeeDailySchedule(weeklyScheduleIndex: number, weekIndex: number) {
    const copiedSelectedEmployeeSchedule = state.copy.selectedEmployeeDailySchedule
    const copiedWeekIndex = copiedSelectedEmployeeSchedule.weekIndex

    const userSource = copiedSelectedEmployeeSchedule.weeklySchedule.employee
    const dateSource = copiedSelectedEmployeeSchedule.weeklySchedule.weeks[copiedWeekIndex].date
    const userDestination = state.weeklySchedules[weeklyScheduleIndex].employee
    const dateDestination = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date
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

function isEmployeeSelectedAsWeeklyScheduleSource(weeklySchedule: any) {
    return state.copy.selectedEmployeeWeeklySchedule?.employee?.uuid === weeklySchedule?.employee?.uuid
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
            user_uuid_source: state?.copy.selectedEmployeeWeeklySchedule?.employee?.uuid,
            user_uuid_destination: weeklySchedule?.employee?.uuid,
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
        weeklySchedules: state.weeklySchedules
    }
}

function pasteWeeklySchedule(weekNumber: number) {
    state.weeklySchedules = state.copy.allEmployeeSchedules.weeklySchedules
    const params = {
        department: departmentStore.getSelectedDepartmentName,
        week_source: state.copy.allEmployeeSchedules.weekNumber,
        week_destination: weekNumber,
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

async function removeShift(week: any, weeklyScheduleIndex: number, weekIndex: number, shift: any, shiftIndex: number) {
    state.isRemoveShift = true
    const scheduleUuid = shift.schedule_uuid
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
    } finally {
        state.isRemoveShift = false
    }
}

function viewSchedule(weeklyScheduleIndex: number, weekIndex: any, shift: any, shiftIndex: number) {
    const date = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules[weeklyScheduleIndex].employee.uuid
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
        weeklyScheduleIndex: weeklyScheduleIndex,
        weekIndex: weekIndex,
        shiftIndex: shiftIndex,
    }
    state.modal.isViewShiftOpen = true
}

function editSchedule(employee: any, weeklyScheduleIndex: number, weekIndex: any, shift: any, shiftIndex: number) {
    const date = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules[weeklyScheduleIndex].employee.uuid
    state.editShift.selectedEmployee = employee
    state.editShift.selectedEmployeeSchedule = {
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
        weeklyScheduleIndex: weeklyScheduleIndex,
        weekIndex: weekIndex,
        shiftIndex: shiftIndex,
    }
    state.modal.isEditShiftOpen = true
}

function updateSelectedSchedule(shiftDetails: any) {
    const scheduleUuid = state.editShift.selectedEmployeeSchedule.scheduleUuid
    const weeklyScheduleIndex = state.editShift.selectedEmployeeSchedule.weeklyScheduleIndex
    const weekIndex = state.editShift.selectedEmployeeSchedule.weekIndex
    const shiftIndex = state.editShift.selectedEmployeeSchedule.shiftIndex
    const params = {
        // date: state.editShift.selectedEmployeeSchedule.date,
        shift_type_uuid: shiftDetails.shift_type,
        date_time_start: shiftDetails?.date_time_start,
        date_time_end: shiftDetails?.date_time_end,
        user_uuid: state.editShift.selectedEmployeeSchedule.user_uuid,
        citizen_uuid: shiftDetails.citizens,
        schedule_tag_uuid: shiftDetails.schedule_tag_uuid,
        department_uuid: shiftDetails.department_uuid,
        note: shiftDetails.note,
    }
    updateDutySchedule(scheduleUuid, params, weeklyScheduleIndex, weekIndex, shiftIndex)
}

async function updateDutySchedule(scheduleUuid: any, params: object, weeklyScheduleIndex: number, weekIndex: any, shiftIndex: number) {
    state.isUpdateShift = true
    let errorUpdateShift = {}
    try {
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
        errorUpdateShift = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    } finally {
        state.errorUpdateShift = errorUpdateShift
        state.isUpdateShift = false
        fetchDutySchedule()
    }
}
</script>
