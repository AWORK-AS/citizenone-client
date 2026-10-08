<template>
    <div class="space-y-3 min-w-0">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="state?.copyShiftError?.message"
            v-if="state.copyShiftError?.message && state.copyShiftError.message.length > 0" />
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-4">
            <div v-if="state.dragSuccessMessage"
                class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl pointer-events-none">
                <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                {{ state.dragSuccessMessage }}
            </div>
        </Transition>
        <div class="flex h-full flex-col min-w-0">
            <!-- Teleport date picker to breadcrumb row -->
            <Teleport to="#schedule-date-picker-target" v-if="teleportReady">
                <div class="flex items-center gap-1.5">
                    <div
                        class="relative flex items-center rounded-lg bg-white ring-1 ring-gray-200 overflow-hidden h-[32px]">
                        <button @click="!isPreviousWeekDisabled() && previousWeek()" type="button" :class="[
                            isPreviousWeekDisabled() && 'cursor-not-allowed',
                            'flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors'
                        ]" :disabled="isPreviousWeekDisabled()">
                            <Icon name="heroicons:chevron-left" class="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                            :disablePreviousWeeks="isPreviousWeekDisabled()" dateType="duty-schedule"
                            v-model="state.selectedDate" />
                        <button @click="nextWeek()" type="button"
                            class="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <Icon name="heroicons:chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                    <button @click="setToday()"
                        class="text-primary text-xs font-semibold hover:text-primary-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors">{{
                            $t('goToToday') }}</button>
                </div>
            </Teleport>
            <!-- One row where it fits. It was a month label and two toggles above a
                 row of filters, which with the page toolbar put the grid 436px down a
                 782px window - more than half of it before the first employee. -->
            <div class="mb-1">
                <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-y-2">
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <FormSwitch :value="userStore.getUser?.is_schedule_pinned ? true : false"
                                @toggleSwitch="pinSelfToTopOfSchedule()" />
                            <span class="text-xs text-gray-600 leading-tight">
                                {{ $t('dutySchedules.pinSelfToTopOfSchedule') }}
                            </span>
                        </label>
                        <div class="hidden lg:block h-4 w-px bg-slate-200" />
                        <label class="flex items-center gap-2 cursor-pointer">
                            <FormSwitch :value="dutyScheduleStore.getShowEmployeesWorkingToday"
                                @toggleSwitch="dutyScheduleStore.setShowEmployeesWorkingToday(!dutyScheduleStore.getShowEmployeesWorkingToday)" />
                            <span class="text-xs text-gray-600 leading-tight">
                                {{ $t('dutySchedules.showEmployeesWorkingToday') }}
                            </span>
                        </label>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                            class="flex items-center gap-1.5 outline-none rounded-lg text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 px-3 h-8 text-gray-600"
                            @click="state.modal.isFilterDutyScheduleOpen = true">
                            <Icon name="ic:outline-filter-list" class="h-4 w-4" />
                            {{ $t('filter') }}
                            <span v-if="activeFilterCount > 0"
                                class="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold px-1">
                                {{ activeFilterCount }}
                            </span>
                        </button>
                        <Tooltip v-if="hasManageFavoritesAccess" :text="$t('dutySchedules.favorites.manageFavorites')">
                            <button :aria-label="$t('dutySchedules.favorites.manageFavorites')"
                                class="flex items-center gap-1.5 outline-none rounded-lg text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 px-2.5 h-8 text-gray-600"
                                @click="state.modal.isManageFavoritesOpen = true">
                                <Icon name="mdi:star-outline" class="h-4 w-4" aria-hidden="true" />
                                <span class="hidden 2xl:inline">{{ $t('dutySchedules.favorites.manageFavorites') }}</span>
                            </button>
                        </Tooltip>
                        <Tooltip
                            :text="state.sortData.sortOrder === 'ascend' ? $t('dutySchedules.sort.sortNamesInDescendingOrder') : $t('dutySchedules.sort.sortNamesInAscendingOrder')"
                            position="left">
                            <button :aria-label="state.sortData.sortOrder === 'ascend' ? $t('dutySchedules.sort.sortNamesInDescendingOrder') : $t('dutySchedules.sort.sortNamesInAscendingOrder')"
                                class="flex items-center justify-center outline-none rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 w-8 h-8"
                                @click="sortDutySchedule">
                                <Icon name="heroicons:arrow-down" class="h-4 w-4" aria-hidden="true"
                                    v-show="state.sortData?.sortOrder === 'ascend'" />
                                <Icon name="heroicons:arrow-up" class="h-4 w-4" aria-hidden="true"
                                    v-show="state.sortData?.sortOrder === 'descend'" />
                            </button>
                        </Tooltip>
                        <Tooltip :text="$t('entriesPerPage')">
                        <div class="bg-white border border-gray-200 rounded-lg px-2 h-8 flex items-center text-xs text-gray-600">
                            <div class="flex items-center gap-x-1">
                                <Icon name="ph:rows" class="h-4 w-4" aria-hidden="true" />
                                <select class="focus:outline-none bg-transparent text-xs" @change="changePageLength"
                                    :aria-label="$t('entriesPerPage')"
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
                        </Tooltip>
                        <div
                            class="flex-1 sm:flex-none sm:w-auto xl:min-w-[160px] [&_input]:!h-8 [&_button]:!h-8 [&_form]:!h-8 [&_input]:!text-xs">
                            <TableSearch type="duty-schedule" @search="handleSearch"
                                :placeholder="$t('dutySchedules.findEmployee')" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full transition-all ease-in-out duration-500 mb-1.5"
                :style="{ width: `${state.progress.percentage}%` }" v-if="state.progress.showProgressBar" />
            <div class="h-1.5 mb-1.5" v-else />
            <div class="isolate flex flex-auto flex-col min-w-0 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                <div ref="weekHeaderRef"
                    class="overflow-x-hidden sticky top-[var(--sticky-toolbar-offset,4rem)] z-30 bg-white rounded-t-xl border-b border-gray-100">
                    <div class="min-w-[700px]">
                        <div>
                            <div class="grid grid-cols-9" id="fixed-header-week-view">
                                <div class="col-span-2 border-r border-gray-100 bg-gray-50/50">
                                    <div class="flex items-center gap-x-1.5 sm:gap-x-3 px-2 pt-2 sm:px-3 sm:pt-3">
                                        <p class="text-sm sm:text-base font-bold text-blue-600 whitespace-nowrap">
                                            {{ $t('dutySchedules.week') }} {{ weekNumber }}
                                        </p>
                                        <Tooltip :text="$t('dutySchedules.copy.copyThisWeeksSchedule')"
                                            position="right">
                                            <button :aria-label="$t('dutySchedules.copy.copyThisWeeksSchedule')"
                                                class="bg-gray-100 w-7 h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                @click="copyWeeklySchedule(weekNumber)">
                                                <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                                            </button>
                                        </Tooltip>
                                        <div class="flex-1 flex justify-end gap-x-2" v-if="isAtLeast('Admin')">
                                            <Tooltip :text="$t('dutySchedules.copy.copyMultipleWeeksSchedule')"
                                                position="right">
                                                <button :aria-label="$t('dutySchedules.copy.copyMultipleWeeksSchedule')"
                                                    class="bg-gray-100 w-7 h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                    @click="state.modal.isCopyMultipleWeeklyScheduleOpen = true">
                                                    <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div class="px-3 pb-2" v-if="isAtLeast('Admin')">
                                        <button @click="toggleShowHideAllShifts()"
                                            class="text-primary text-xs hover:text-primary-700">
                                            {{ state.showAllShifts ?
                                                $t('hideAll') :
                                                $t('showAll') }}
                                        </button>
                                    </div>
                                </div>
                                <div v-for="(day, dayIndex) in weekDays" :key="day.date"
                                    :class="['relative cursor-pointer hover:bg-blue-50/50 flex flex-col items-center justify-center py-2 sm:py-3 border-0.5 transition-colors', isToday(day.fullDate) && 'bg-blue-50 border-x-2 border-t-2 border-blue-400']"
                                    @click="openManageScheduleSlotModal(day)" v-if="hasScheduleManageAccess">
                                    <Tooltip :text="$t('dutySchedules.scheduleSlots.scheduleSlots')"
                                        :position="dayIndex === 0 ? 'right' : 'left'">
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
                                    </Tooltip>
                                    <Tooltip :text="$t('dutySchedules.viewActivityLogForDay')" position="right"
                                        class="!absolute top-1 left-1">
                                        <button :aria-label="$t('dutySchedules.viewActivityLogForDay')" type="button"
                                            class="w-5 h-5 rounded-md text-slate-400 hover:text-primary hover:bg-white flex items-center justify-center transition-colors"
                                            @click.stop="emit('openDayActivityLog', day.fullDate.format('YYYY-MM-DD'))">
                                            <Icon name="ph:clock-counter-clockwise" class="h-3 w-3"
                                                aria-hidden="true" />
                                        </button>
                                    </Tooltip>
                                    <div v-if="getSlotCount(day.longName) > 0"
                                        class="slot-badge absolute top-2 right-2 bg-primary font-bold shadow-sm">
                                        {{ getSlotCount(day.longName) > 99 ? '99+' : getSlotCount(day.longName) }}
                                    </div>
                                    <span v-if="getHolidayForDay(day.longName)"
                                        class="absolute bottom-1 left-0 right-0 text-center px-0.5">
                                        <span
                                            class="capitalize inline-flex items-center gap-0.5 bg-amber-100 ring-1 ring-amber-300 text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                                            style="color:#b45309">{{ getHolidayForDay(day.longName) }}</span>
                                    </span>
                                    <Tooltip v-if="coverageWarningsByDay[dayIndex as number]?.length > 0"
                                        :text="coverageWarningsByDay[dayIndex as number].map((d: any) => `${d.name}: ${d.assigned}/${d.minimum}`).join(', ')"
                                        position="top" class="!absolute -top-1 -right-1">
                                        <div data-testid="coverage-warning-badge"
                                            class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm cursor-help">
                                            <Icon name="ph:warning" class="w-3 h-3 text-white" />
                                        </div>
                                    </Tooltip>
                                </div>
                                <div v-for="(day, dayIndex) in weekDays" :key="day.date"
                                    :class="['relative flex flex-col items-center justify-center py-2 sm:py-3 pb-5 sm:pb-6 border-0.5', isToday(day.fullDate) && 'bg-blue-50 border-x-2 border-t-2 border-blue-400']"
                                    v-if="!hasScheduleManageAccess">
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
                                    <Tooltip :text="$t('dutySchedules.viewActivityLogForDay')" position="right"
                                        class="!absolute top-1 left-1">
                                        <button :aria-label="$t('dutySchedules.viewActivityLogForDay')" type="button"
                                            class="w-5 h-5 rounded-md text-slate-400 hover:text-primary hover:bg-white flex items-center justify-center transition-colors"
                                            @click.stop="emit('openDayActivityLog', day.fullDate.format('YYYY-MM-DD'))">
                                            <Icon name="ph:clock-counter-clockwise" class="h-3 w-3"
                                                aria-hidden="true" />
                                        </button>
                                    </Tooltip>
                                    <span v-if="getHolidayForDay(day.longName)"
                                        class="absolute bottom-1 left-0 right-0 text-center px-0.5">
                                        <span
                                            class="capitalize inline-flex items-center gap-0.5 bg-amber-100 ring-1 ring-amber-300 text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                                            style="color:#b45309">{{ getHolidayForDay(day.longName) }}</span>
                                    </span>
                                    <Tooltip v-if="coverageWarningsByDay[dayIndex as number]?.length > 0"
                                        :text="coverageWarningsByDay[dayIndex as number].map((d: any) => `${d.name}: ${d.assigned}/${d.minimum}`).join(', ')"
                                        position="top" class="!absolute top-1 right-1">
                                        <div data-testid="coverage-warning-badge"
                                            class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm cursor-help">
                                            <Icon name="ph:warning" class="w-3 h-3 text-white" />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>

                            <div id="fixed-header-spacer" class="hidden" />

                            <div class="hidden">
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
                        </div>
                    </div>
                </div>
                <div ref="weekBodyRef" class="overflow-x-auto" @scroll="syncWeekHeaderScroll">
                    <div class="min-w-[700px]">
                        <div>

                            <div class="relative mt-0.5"
                                @click="!isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && !isPastWeek() && !state.isPasting && pasteWeeklySchedule(weekNumber)"
                                :class="[
                                    isWeeklyScheduleCopied(weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                    !isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && !isPastWeek() && 'cursor-copy relative group',
                                    !isWeeklyScheduleCopied(weekNumber) && !isAllWeeklyScheduleCopiedEmpty() && isPastWeek() && 'cursor-not-allowed'
                                ]">
                                <template v-if="!isWeeklyScheduleCopied(weekNumber)">
                                <template v-for="(employee, employeeIndex) in state.weeklySchedules?.data"
                                    :key="employeeIndex">
                                <!-- Department group header, on "All departments" only. Rows are
                                     ordered by group at fetch time, so employeeIndex - which the
                                     copy/paste and "show more" state is keyed on - is unchanged. -->
                                <div v-if="isGroupingActive && groupStartsAt(employeeIndex as number)"
                                    class="grid grid-cols-9 bg-gray-50 border-y border-gray-200 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                                    role="button" tabindex="0"
                                    :aria-expanded="!isGroupCollapsed(groupOf(employee))"
                                    @click.stop="toggleGroup(groupOf(employee))"
                                    @keydown.enter.prevent.stop="toggleGroup(groupOf(employee))"
                                    @keydown.space.prevent.stop="toggleGroup(groupOf(employee))">
                                    <div class="col-span-2 border-r border-gray-100 px-3 py-2 min-w-0">
                                        <Tooltip :text="isGroupCollapsed(groupOf(employee)) ? $t('dutySchedules.groups.expand') : $t('dutySchedules.groups.collapse')"
                                            class="!flex w-full">
                                            <div class="flex items-center gap-2 min-w-0 w-full">
                                                <Icon :name="isGroupCollapsed(groupOf(employee)) ? 'heroicons:chevron-right' : 'heroicons:chevron-down'"
                                                    class="h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
                                                <span class="text-sm font-semibold text-gray-900 truncate">
                                                    {{ groupOf(employee) || $t('dutySchedules.groups.noDepartment') }}
                                                </span>
                                                <span class="ml-auto flex-shrink-0 text-xs text-gray-500">
                                                    {{ $t('dutySchedules.groups.employees', { count: groupStats[groupOf(employee)]?.employees ?? 0 }) }}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div v-for="day in WEEK_DAY_KEYS" :key="day"
                                        class="px-2 py-2 flex items-center justify-center gap-2 text-xs text-gray-600 border-l border-gray-100">
                                        <span v-if="groupStats[groupOf(employee)]?.shifts[day]">
                                            {{ $t('dutySchedules.groups.shifts', { count: groupStats[groupOf(employee)].shifts[day] }) }}
                                        </span>
                                        <Tooltip v-if="groupStats[groupOf(employee)]?.conflicts[day]"
                                            :text="$t('dutySchedules.groups.conflicts', { count: groupStats[groupOf(employee)].conflicts[day] })">
                                            <span class="inline-flex items-center gap-0.5 font-semibold text-red-600"
                                                :aria-label="$t('dutySchedules.groups.conflicts', { count: groupStats[groupOf(employee)].conflicts[day] })">
                                                <Icon name="ph:warning" class="h-3.5 w-3.5" aria-hidden="true" />
                                                {{ groupStats[groupOf(employee)].conflicts[day] }}
                                            </span>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div class="grid grid-cols-9"
                                    v-if="!isGroupingActive || !isGroupCollapsed(groupOf(employee))">
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
                                        @click="isEmployeeWeeklyScheduleCopied() && (!isCopiedWeek() || !isEmployeeSelectedAsWeeklyScheduleSource(employee)) && !state.isPasting && pasteEmployeeWeeklySchedule(employee)">
                                        <div class="col-span-2 border-r border-gray-100 bg-gray-50/30">
                                            <div class="px-2 pt-2 pb-1 sm:px-3 sm:pt-2.5 sm:pb-1 relative">
                                                <div class="flex flex-col gap-1.5">
                                                    <div class="flex items-center gap-x-1.5 sm:gap-x-2 min-w-0">
                                                        <img :src="employee?.profile_image ?? avatarUrl(`${getDisplayName(employee).firstName + ' ' + getDisplayName(employee).lastName}`)"
                                                            :class="[
                                                                employee?.shift_threshold === 'high' && 'border-green-700',
                                                                employee?.shift_threshold === 'moderate' && 'border-yellow-500',
                                                                employee?.shift_threshold === 'low' && 'border-red-600',
                                                                'h-8 w-8 flex-shrink-0 rounded-full bg-gray-50 object-cover border-2 shadow-sm ring-1 ring-white'
                                                            ]" />
                                                        <p class="text-xs sm:text-sm font-medium truncate min-w-0">
                                                            {{ getDisplayName(employee).firstName }}
                                                            {{ getDisplayName(employee).lastName }}
                                                        </p>
                                                        <!-- On the name line: on a line of its own it set the
                                                             height of every row, shifts or not. -->
                                                        <button
                                                            v-if="isAtLeast('Admin') || (!isAtLeast('Admin') && userStore.getUser?.show_working_hours && userStore.getUser?.uuid === employee?.uuid)"
                                                            @click="toggleExpanded(employeeIndex as number)"
                                                            class="ml-auto flex-shrink-0 text-primary text-xs hover:text-primary-700">
                                                            {{ !expandedRecords[employeeIndex as number] ?
                                                                $t('showLess') :
                                                                $t('showMore') }}
                                                        </button>
                                                    </div>
                                                    <div class="flex items-center flex-wrap gap-x-0.5 gap-y-1 sm:gap-x-1 pl-10 [&_button]:!w-6 [&_button]:!h-6">
                                                        <Tooltip position="right"
                                                            :text="$t('dutySchedules.copy.copyEmployeeSchedule')"
                                                            v-if="isAtLeast('Admin')">
                                                            <button :aria-label="$t('dutySchedules.copy.copyEmployeeSchedule')"
                                                                class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                                @click="copyEmployeeWeeklySchedule(employee)">
                                                                <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="right"
                                                            :text="$t('dutySchedules.extraHours.extraHours')"
                                                            v-if="hasScheduleManageAccess || userStore.getUser?.uuid === employee?.uuid">
                                                            <button :aria-label="$t('dutySchedules.extraHours.extraHours')"
                                                                class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                                @click="viewExtraHours(employee)">
                                                                <Icon name="mdi:clock-outline" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="right"
                                                            :text="$t('dutySchedules.leaveRequests.leaveRequests')"
                                                            v-if="isAtLeast('Admin') || (!isAtLeast('Admin') && userStore.getUser?.uuid === employee?.uuid)">
                                                            <button :aria-label="$t('dutySchedules.leaveRequests.leaveRequests')"
                                                                class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors relative"
                                                                @click="viewLeaveRequests(employee)">
                                                                <Icon name="mdi:wallet-travel" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                <div v-if="employee?.pending_leave_requests > 0"
                                                                    class="w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1 pointer-events-none" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="right"
                                                            :text="$t('dutySchedules.shiftRequests.shiftRequests')"
                                                            v-if="isAtLeast('Admin') || (!isAtLeast('Admin') && userStore.getUser?.uuid === employee?.uuid)">
                                                            <button :aria-label="$t('dutySchedules.shiftRequests.shiftRequests')"
                                                                class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors relative"
                                                                @click="viewShiftRequests(employee)">
                                                                <Icon name="mdi:calendar-plus" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                <div v-if="employee?.pending_shift_requests > 0"
                                                                    class="w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1 pointer-events-none" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="right"
                                                            :text="$t('dutySchedules.compensatoryTimeRequests.compensatoryTimeRequests')"
                                                            v-if="userStore.getUser?.company?.compensatory_time_enabled && (isAtLeast('Admin') || (!isAtLeast('Admin') && userStore.getUser?.uuid === employee?.uuid))">
                                                            <button :aria-label="$t('dutySchedules.compensatoryTimeRequests.compensatoryTimeRequests')"
                                                                class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors relative"
                                                                @click="viewCompensatoryTimeRequests(employee)">
                                                                <Icon name="mdi:clock-check-outline" class="h-3 w-3"
                                                                    aria-hidden="true" />
                                                <div v-if="employee?.pending_compensatory_time_requests > 0"
                                                                    class="w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1 pointer-events-none" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip position="right"
                                                            :text="isFavorited(employee) ? $t('dutySchedules.favorites.removeFromFavorites') : $t('dutySchedules.favorites.addToFavorites')"
                                                            v-if="hasManageFavoritesAccess && userStore.getUser?.uuid !== employee?.uuid">
                                                            <button :aria-label="isFavorited(employee) ? $t('dutySchedules.favorites.removeFromFavorites') : $t('dutySchedules.favorites.addToFavorites')"
                                                                :class="[
                                                                    isFavorited(employee) ? 'text-yellow-500' : 'text-gray-500',
                                                                    'bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm rounded-lg hover:bg-yellow-50 flex items-center justify-center transition-colors'
                                                                ]"
                                                                @click="toggleFavoriteEmployee(employee)">
                                                                <Icon :name="isFavorited(employee) ? 'mdi:star' : 'mdi:star-outline'"
                                                                    class="h-3 w-3" aria-hidden="true" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <div :class="[
                                                    expandedRecords[employeeIndex as number] && 'hidden',
                                                    'mt-1 ml-10'
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

                                                    <div v-if="isStatsLoading(employee)" class="space-y-1 py-1">
                                                        <div class="h-2 bg-gray-200 rounded animate-pulse w-3/4" />
                                                        <div class="h-2 bg-gray-200 rounded animate-pulse w-1/2" />
                                                        <div class="h-2 bg-gray-200 rounded animate-pulse w-2/3" />
                                                    </div>
                                                    <template v-else>
                                                        <!-- Left out entirely for staff marked as not
                                                             using an annual norm: a norm of zero is not
                                                             information. -->
                                                        <div class="flex items-center gap-1 cursor-pointer"
                                                            v-if="empStats(employee)?.uses_annual_norm_hours !== false"
                                                            @click="state.modal.isAnnualNormHoursInfoOpen = true">
                                                            <p class="text-xxs">
                                                                {{ $t('dutySchedules.annualNormHours') }}:
                                                                {{ formatNumber(language.locale.value,
                                                                    empStats(employee)?.annual_norm_hours ?? 0) }}
                                                            </p>
                                                            <Icon name="ph:question" class="h-3.5 w-3.5"
                                                                aria-hidden="true" />
                                                        </div>

                                                        <div class="flex items-center gap-1 cursor-pointer"
                                                            v-if="empStats(employee)?.uses_annual_norm_hours !== false"
                                                            @click="state.modal.isAnnualNormHoursInfoOpen = true">
                                                            <p class="text-xxs">
                                                                {{ $t('dutySchedules.weeklyNormHours') }}:
                                                                {{
                                                                    calculateWeeklyNormHours({
                                                                        annual_norm_hours: empStats(employee)?.annual_norm_hours,
                                                                        employee_detail: employee?.employee_detail,
                                                                        norm_period: empStats(employee)?.norm_period,
                                                                    }, currentDate.year())
                                                                }}
                                                            </p>
                                                            <Icon name="ph:question" class="h-3.5 w-3.5"
                                                                aria-hidden="true" />
                                                        </div>

                                                        <p class="text-xxs">
                                                            {{ $t('dutySchedules.totalHours') }}:
                                                            {{ empStats(employee)?.total_hours ?? 0 }}
                                                        </p>
                                                        <p :class="[
                                                            empStats(employee)?.average_weekly_work_time?.severity === 'info' ? 'text-green-700' :
                                                                empStats(employee)?.average_weekly_work_time?.severity === 'warning' ? 'text-amber-700' :
                                                                    'text-red-700',
                                                            'text-xxs'
                                                        ]">
                                                            {{
                                                                $t('dutySchedules.averageWeeklyHours.averageWeeklyHours')
                                                            }}:
                                                            {{
                                                                empStats(employee)?.average_weekly_work_time?.average_weekly_hours
                                                            }}
                                                        </p>
                                                        <p :class="[
                                                            parseLocaleNumber(language.locale.value, empStats(employee)?.log_data?.total_time_account_earned_hours) > 0 ? 'text-green-700' : 'text-red-700',
                                                            'text-xxs'
                                                        ]">
                                                            {{ $t('dutySchedules.earnedWorkHours') }}:
                                                            {{
                                                                empStats(employee)?.log_data?.total_time_account_earned_hours
                                                            }}
                                                        </p>
                                                        <p :class="[
                                                            parseLocaleNumber(language.locale.value, empStats(employee)?.extra_hours) > 0 ? 'text-green-700' : 'text-red-700',
                                                            'text-xxs'
                                                        ]">
                                                            {{ $t('dutySchedules.extraHours.extraHours') }}:
                                                            {{ empStats(employee)?.extra_hours }}
                                                        </p>
                                                        <Tooltip v-if="empStats(employee)?.holiday_hours?.enabled"
                                                            :text="$t('dutySchedules.holidayHoursHint')" position="top"
                                                            :wrap="true" class="w-full mt-1.5">
                                                            <div
                                                                class="w-full rounded-lg border border-amber-200 bg-amber-50/70 px-2 py-1.5">
                                                                <div class="flex items-center gap-1 mb-1">
                                                                    <Icon name="ph:calendar-check"
                                                                        class="w-3 h-3 text-amber-500"
                                                                        aria-hidden="true" />
                                                                    <span class="text-xxs font-semibold text-amber-800">
                                                                        {{ $t('dutySchedules.holidays') }}
                                                                    </span>
                                                                </div>
                                                                <div
                                                                    class="grid grid-cols-[1fr_auto_auto] gap-x-2.5 gap-y-0.5 text-xxs text-amber-800">
                                                                    <span></span>
                                                                    <span class="text-right font-medium text-amber-600">
                                                                        {{
                                                                            $t('dutySchedules.week')
                                                                        }}
                                                                    </span>
                                                                    <span class="text-right font-medium text-amber-600">
                                                                        {{
                                                                            $t('dutySchedules.currentYear')
                                                                        }}
                                                                    </span>

                                                                    <span>
                                                                        {{
                                                                            $t('dutySchedules.holidayWorkedShort')
                                                                        }}
                                                                    </span>
                                                                    <span class="text-right tabular-nums">
                                                                        {{
                                                                            empStats(employee)?.holiday_hours?.worked_weekly
                                                                        }}
                                                                    </span>
                                                                    <span class="text-right tabular-nums">
                                                                        {{
                                                                            empStats(employee)?.holiday_hours?.worked_yearly
                                                                        }}
                                                                    </span>

                                                                    <template
                                                                        v-if="parseLocaleNumber(language.locale.value, empStats(employee)?.holiday_hours?.compensation_yearly) > 0">
                                                                        <span>{{ $t('dutySchedules.holidayCompensation')
                                                                            }}</span>
                                                                        <span class="text-right tabular-nums">{{
                                                                            empStats(employee)?.holiday_hours?.compensation_weekly
                                                                            }}</span>
                                                                        <span class="text-right tabular-nums">{{
                                                                            empStats(employee)?.holiday_hours?.compensation_yearly
                                                                            }}</span>
                                                                    </template>

                                                                    <span>
                                                                        {{
                                                                            $t('dutySchedules.holidayNonWorkedShort')
                                                                        }}
                                                                    </span>
                                                                    <span class="text-right tabular-nums">
                                                                        {{
                                                                            empStats(employee)?.holiday_hours?.nonworked_weekly
                                                                        }}
                                                                    </span>
                                                                    <span class="text-right tabular-nums">
                                                                        {{
                                                                            empStats(employee)?.holiday_hours?.nonworked_yearly
                                                                        }}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </Tooltip>
                                                    </template>

                                                    <div class="p-0 m-0 text-xxs text-primary cursor-pointer hover:text-primary-700"
                                                        @click="showShiftTypeDistribution(employee)">
                                                        {{ $t('dutySchedules.showTheDistributionOfShiftTypes') }}
                                                    </div>

                                                    <div class="p-0 m-0 text-xxs text-primary cursor-pointer hover:text-primary-700"
                                                        @click="navigateTo(`/calendar?employee_uuid=${employee?.uuid}`)">
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
                                                        <!-- This column accumulates over the employee's current norm
                                                             cycle, which only equals the calendar year when their norm
                                                             period does. Don't caption a May–April cycle "current year". -->
                                                        <Tooltip v-if="cycleRange(employee)"
                                                            :text="cycleTooltip(employee)" position="left">
                                                            <p class="text-xxs py-2 pr-2 text-right leading-tight">
                                                                {{ $t('normPeriod.form.normPeriod') }}
                                                            </p>
                                                        </Tooltip>
                                                        <p v-else class="text-xxs py-2 pr-2 text-right leading-tight">
                                                            {{ $t('dutySchedules.currentYear') }}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="text-xs grid grid-cols-7">
                                                    <div class="col-span-3 min-w-0">
                                                        <div v-for="(time, timeIndex) in empStats(employee)?.hours?.filter((t: any) => t?.shift?.system_name !== 'time-filter')"
                                                            :key="timeIndex" :class="[
                                                                (timeIndex as number) % 2 ? 'bg-white' : 'bg-gray-100',
                                                                'py-1'
                                                            ]">
                                                            <div class="pl-1.5 sm:pl-3">
                                                                <Tooltip class="!block w-full" :text="language.locale.value === 'en' ? time?.shift?.en_name :
                                                                    language.locale.value === 'no' ? time?.shift?.no_name :
                                                                        language.locale.value === 'sv' ? time?.shift?.sv_name :
                                                                            time?.shift?.dk_name" position="right">
                                                                    <div class="flex items-center gap-x-1 min-w-0">
                                                                        <div class="flex-shrink-0">
                                                                            <div :class="`w-2 h-2 rounded-sm`"
                                                                                :style="{ background: time?.shift?.color }" />
                                                                        </div>
                                                                        <div class="truncate min-w-0">
                                                                            {{
                                                                                language.locale.value === 'en' ?
                                                                                    time?.shift?.en_name :
                                                                                    language.locale.value === 'no' ?
                                                                                        time?.shift?.no_name :
                                                                                        language.locale.value === 'sv' ?
                                                                                            time?.shift?.sv_name :
                                                                                            time?.shift?.dk_name
                                                                            }}
                                                                        </div>
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2">
                                                        <div v-for="(time, timeIndex) in empStats(employee)?.hours?.filter((t: any) => t?.shift?.system_name !== 'time-filter')"
                                                            :key="timeIndex" :class="[
                                                                (timeIndex as number) % 2 ? 'bg-white' : 'bg-gray-100',
                                                            ]">
                                                            <div class="text-right py-1 pr-2">
                                                                {{ time?.weekly_hours }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2 border-l-0.5 border-gray-200">
                                                        <div v-for="(time, timeIndex) in empStats(employee)?.hours?.filter((t: any) => t?.shift?.system_name !== 'time-filter')"
                                                            :key="timeIndex" :class="[
                                                                (timeIndex as number) % 2 ? 'bg-white' : 'bg-gray-100',
                                                            ]">
                                                            <div class="text-right py-1 pr-2">
                                                                {{ time?.yearly_hours }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="text-xs grid grid-cols-7 cursor-pointer hover:bg-blue-50/60 transition-colors"
                                                    @click="state.modal.isTimeRangeFilterOpen = true">
                                                    <div class="col-span-3 min-w-0">
                                                        <div
                                                            class="py-1 pl-1.5 sm:pl-3 flex items-center gap-1 text-gray-500 italic">
                                                            <Icon name="ph:clock" class="w-2 h-2 flex-shrink-0" />
                                                            <span class="truncate">
                                                                {{
                                                                    state.filter.time_from && state.filter.time_to
                                                                        ? state.filter.time_from + '–' + state.filter.time_to
                                                                        : $t('dutySchedules.timeRange')
                                                                }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2">
                                                        <div class="text-right py-1 pr-2 text-gray-500">
                                                            {{
                                                                state.filter.time_from && state.filter.time_to
                                                                    ? empStats(employee)?.hours?.find((t: any) =>
                                                                        t?.shift?.system_name
                                                                        === 'time-filter')?.weekly_hours ?? '--'
                                                                    : '--'
                                                            }}
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2 border-l-0.5 border-gray-200">
                                                        <div class="text-right py-1 pr-2 text-gray-500">
                                                            {{
                                                                state.filter.time_from && state.filter.time_to
                                                                    ? empStats(employee)?.hours?.find((t: any) =>
                                                                        t?.shift?.system_name
                                                                        === 'time-filter')?.yearly_hours ?? '--'
                                                                    : '--'
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="text-xs grid grid-cols-7 border-t-0.5 border-gray-200">
                                                    <div class="col-span-3 min-w-0">
                                                        <div class="py-1 pl-1.5 sm:pl-3 font-bold">
                                                            {{
                                                                $t('dutySchedules.total')
                                                            }}:
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2">
                                                        <div class="text-right py-1 pr-2 font-bold">
                                                            {{
                                                                formatNumber(language.locale.value,
                                                                    shiftTypeTotal(employee, 'weekly_hours'))
                                                            }}
                                                        </div>
                                                    </div>
                                                    <div class="col-span-2 border-l-0.5 border-gray-200">
                                                        <div class="text-right py-1 pr-2 font-bold">
                                                            {{
                                                                formatNumber(language.locale.value,
                                                                    shiftTypeTotal(employee, 'yearly_hours'))
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <!-- Pro-rated period. Additive: every figure above is still the
                                                     full-year one, this box is the only range-aware norm/balance. -->
                                                <div class="text-xs border-t-0.5 border-gray-200 px-1.5 sm:px-3 py-2">
                                                    <div class="flex items-center gap-2">
                                                        <div class="flex items-center gap-1 text-xxs text-primary cursor-pointer hover:text-primary-700"
                                                            @click="state.modal.isHoursPeriodOpen = true">
                                                            <Icon name="ph:calendar-blank"
                                                                class="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                                                            <span>
                                                                {{ state.hoursPeriod.isActive
                                                                    ? hoursPeriodLabel(employee)
                                                                    : $t('dutySchedules.normHours.period.selectPeriod')
                                                                }}
                                                            </span>
                                                        </div>
                                                        <button v-if="state.hoursPeriod.isActive" type="button"
                                                            class="text-xxs text-gray-500 hover:text-gray-700 underline"
                                                            @click="clearHoursPeriod()">
                                                            {{ $t('dutySchedules.normHours.period.clear') }}
                                                        </button>
                                                    </div>

                                                    <template v-if="state.hoursPeriod.isActive">
                                                        <div v-if="empStats(employee)?.period"
                                                            class="mt-1.5 grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-0.5 text-xxs">
                                                            <span>
                                                                {{ $t('dutySchedules.normHours.period.normHours') }}
                                                            </span>
                                                            <span class="text-right tabular-nums">
                                                                {{ formatNumber(language.locale.value,
                                                                    empStats(employee)?.period?.norm_hours) }}
                                                            </span>
                                                            <span>
                                                                {{ $t('dutySchedules.normHours.period.workedHours') }}
                                                            </span>
                                                            <span class="text-right tabular-nums">
                                                                {{ formatNumber(language.locale.value,
                                                                    empStats(employee)?.period?.worked_hours) }}
                                                            </span>
                                                            <span class="font-semibold">
                                                                {{ $t('dutySchedules.normHours.period.balance') }}
                                                            </span>
                                                            <!-- balance_hours is a raw JSON number, so a plain sign
                                                                 test is safe here (no parseLocaleNumber). -->
                                                            <span :class="[
                                                                empStats(employee)?.period?.balance_hours >= 0 ? 'text-green-700' : 'text-red-700',
                                                                'text-right tabular-nums font-semibold'
                                                            ]">
                                                                {{ formatNumber(language.locale.value,
                                                                    empStats(employee)?.period?.balance_hours) }}
                                                            </span>
                                                            <span v-if="empStats(employee)?.period?.basis === 'workdays'"
                                                                class="col-span-2 text-gray-500 italic">
                                                                {{ $t('dutySchedules.normHours.period.basisWorkdays', {
                                                                    days: empStats(employee)?.period?.workdays_in_range,
                                                                    total: empStats(employee)?.period?.workdays_in_norm_period
                                                                }) }}
                                                            </span>
                                                            <span v-if="carryOverEnabled"
                                                                class="col-span-2 text-gray-500 italic">
                                                                {{
                                                                    $t('dutySchedules.normHours.period.excludesCarryOver')
                                                                }}
                                                            </span>
                                                        </div>
                                                        <p v-else-if="!isStatsLoading(employee)"
                                                            class="mt-1.5 text-xxs text-gray-500 italic">
                                                            {{ $t('dutySchedules.normHours.period.notAvailable') }}
                                                        </p>
                                                    </template>
                                                </div>
                                                <div class="text-xs grid grid-cols-7"
                                                    v-if="employee?.show_compensatory_hours">
                                                    <div
                                                        class="px-3 col-span-7 mt-4 border-t-0.5 border-gray-200 pt-3 space-y-2">

                                                        <!-- Compensatory hours graph -->
                                                        <div class="flex items-center gap-2 sm:gap-1 w-fit cursor-pointer text-primary"
                                                            @click="openGraphModal(employee)">
                                                            <div
                                                                class="w-7 h-7 sm:w-auto sm:h-auto rounded-md sm:rounded-none bg-blue-100 sm:bg-transparent flex items-center justify-center flex-shrink-0">
                                                                <Icon name="ph:chart-bar-bold"
                                                                    class="h-4 w-4 sm:h-3 sm:w-3 text-blue-600 sm:text-primary"
                                                                    aria-hidden="true" />
                                                            </div>
                                                            {{ $t('dutySchedules.normHours.compensatoryHoursGraph') }}
                                                        </div>

                                                        <!-- Compensatory hours -->
                                                        <div :class="[
                                                            empStats(employee)?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                                                            'flex items-center gap-2 sm:gap-1 w-fit cursor-pointer'
                                                        ]" @click="viewCompensatoryHours(employee)">
                                                            <div :class="[
                                                                empStats(employee)?.total_norm_hours?.compensatory_hours > 0 ? 'bg-green-100' : 'bg-red-100',
                                                                'w-7 h-7 sm:w-auto sm:h-auto rounded-md sm:rounded-none sm:bg-transparent flex items-center justify-center flex-shrink-0'
                                                            ]">
                                                                <Icon name="ph:clock-countdown" :class="[
                                                                    empStats(employee)?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-600' : 'text-red-600',
                                                                    'h-4 w-4 sm:h-3 sm:w-3 sm:text-current'
                                                                ]" aria-hidden="true" />
                                                            </div>
                                                            {{ $t('dutySchedules.normHours.compensatoryHours') }}:
                                                            {{ formatNumber(language.locale.value,
                                                                empStats(employee)?.total_norm_hours?.compensatory_hours) ??
                                                                0 }}
                                                        </div>

                                                        <!-- Available vacation hours -->
                                                        <div :class="[
                                                            empStats(employee)?.total_norm_hours?.available_vacation_days > 0 ? 'text-green-700' : 'text-red-700',
                                                            'flex items-center gap-2 sm:gap-1 w-fit cursor-pointer'
                                                        ]" @click="viewAvailableVacationHours(employee)">
                                                            <div :class="[
                                                                empStats(employee)?.total_norm_hours?.available_vacation_days > 0 ? 'bg-green-100' : 'bg-red-100',
                                                                'w-7 h-7 sm:w-auto sm:h-auto rounded-md sm:rounded-none sm:bg-transparent flex items-center justify-center flex-shrink-0'
                                                            ]">
                                                                <Icon name="ph:umbrella-simple" :class="[
                                                                    empStats(employee)?.total_norm_hours?.available_vacation_days > 0 ? 'text-green-600' : 'text-red-600',
                                                                    'h-4 w-4 sm:h-3 sm:w-3 sm:text-current'
                                                                ]" aria-hidden="true" />
                                                            </div>
                                                            {{ $t('dutySchedules.normHours.availableVacationDays') }}:
                                                            {{ formatNumber(language.locale.value,
                                                                empStats(employee)?.total_norm_hours?.available_vacation_days
                                                                || 0)
                                                            }}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="p-1.5 sm:p-2 border-0.5 relative"
                                            :style="hasConflict(week) ? { backgroundColor: 'rgb(254 226 226 / 0.6)' } : {}"
                                            v-for="(week, weekIndex) in employee?.weeks" :key="weekIndex" :class="[
                                                isDailyScheduleCopied(employeeIndex as number, weekIndex as number, weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                                !isDailyScheduleCopied(employeeIndex as number, weekIndex as number, weekNumber) && !isDailyScheduleCopiedEmpty() && 'cursor-copy relative group',
                                                hasConflict(week) && 'border-1.5 border-red-400 rounded-md bg-red-100/60',
                                            ]"
                                            @click="!isDailyScheduleCopied(employeeIndex as number, weekIndex as number, weekNumber) && !isDailyScheduleCopiedEmpty() && !state.isPasting && pasteEmployeeDailySchedule(employeeIndex as number, weekIndex as number)">
                                            <div v-if="hasConflict(week)" class="absolute -top-1 -left-2 z-20 group/ct">
                                                <Tooltip position="left" :text="$t('dutySchedules.conflictTooltip', {
                                                    count:
                                                        week.shifts.filter((shift: any) => shift.is_conflict).length + 1
                                                })">
                                                    <div
                                                        class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm cursor-help">
                                                        <Icon name="ph:warning" class="w-3 h-3 text-white" />
                                                    </div>
                                                </Tooltip>
                                                <!-- <div
                                                    class="hidden group-hover/ct:block absolute top-0 z-[9999] right-full mr-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none min-w-max">
                                                    {{$t('dutySchedules.conflictTooltip', {
                                                        count:
                                                            week.shifts.filter(s => s.is_conflict).length + 1
                                                    })}}
                                                </div> -->
                                            </div>
                                            <!-- Drop-zone overlay aktiv under drag -->
                                            <div :class="['absolute inset-0 z-10', isAtLeast('Admin') && state.isDragging ? 'pointer-events-auto' : 'pointer-events-none']"
                                                @dragover.prevent="isAtLeast('Admin') && onDragOver($event)"
                                                @dragleave="isAtLeast('Admin') && onDragLeave($event)"
                                                @drop.prevent="isAtLeast('Admin') && onDrop($event, employee, weekIndex)">
                                            </div>
                                            <div class="space-y-1.5"
                                                v-if="!isDailyScheduleCopied(employeeIndex as number, weekIndex as number, weekNumber)">
                                                <div class="flex justify-end gap-1 sm:gap-2"
                                                    v-if="(hasCreatePermission || isAtLeast('Admin')) && !isShiftLocked(week?.date)">
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
                                                                        class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors">
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
                                                                            @click="viewChangeTimeRequests(employeeIndex as number, weekIndex as number, employee, weekNumber)">
                                                                            {{
                                                                                $t('dutySchedules.scheduleRequests.changeTime.changeTimeRequests')
                                                                            }}
                                                                        </a>
                                                                    </MenuItem>
                                                                    <MenuItem v-slot="{ active }">
                                                                        <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-xs cursor-pointer']"
                                                                            @click="viewSwapScheduleRequests(employeeIndex as number, weekIndex as number, employee, weekNumber)">
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
                                                        <button :aria-label="$t('dutySchedules.copy.copy')"
                                                            class="bg-gray-100 w-6 h-6 sm:w-7 sm:h-7 text-sm text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                            @click="copyEmployeeDailySchedule(employeeIndex as number, weekIndex as number, employee, weekNumber)">
                                                            <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip position="left" :text="$t('dutySchedules.newSchedule')">
                                                        <button :aria-label="$t('dutySchedules.newSchedule')"
                                                            class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md border border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary transition-colors"
                                                            @click="openAddNewShiftModal(employee, employeeIndex as number, weekIndex as number, week)"
                                                            @mouseenter="setHoveredCell(employeeIndex, weekIndex, employee, week)"
                                                            @mouseleave="clearHoveredCell(employeeIndex, weekIndex)">
                                                            <Icon name="ph:plus" class="h-3.5 w-3.5"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                                <div class="text-xs">
                                                    <!-- Non-worked public holiday: employee is free but is assigned 7.4h -->
                                                    <Tooltip v-if="isNonWorkedHolidayCell(week)"
                                                        :text="$t('dutySchedules.holidayNonWorkedTooltip')"
                                                        position="top" :wrap="true" class="w-full mb-4">
                                                        <div
                                                            class="rounded-xl border border-amber-300 bg-amber-50 px-2 py-1.5 flex items-start gap-1.5 w-full">
                                                            <Icon name="ph:calendar-check"
                                                                class="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5"
                                                                aria-hidden="true" />
                                                            <div class="leading-tight">
                                                                <p class="text-xxs font-semibold text-amber-800">
                                                                    {{ $t('dutySchedules.holidayFreeBadge') }}
                                                                </p>
                                                                <p class="text-xxs text-amber-700">
                                                                    {{ $t('dutySchedules.holidayNonWorkedAssigned') }}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                    <div v-for="(shift, shiftIndex) in visibleShifts(employee, weekIndex as string, week?.shifts)"
                                                        :key="shiftIndex" :class="[
                                                            'rounded-lg relative mb-1.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing z-20',
                                                            isShiftLocked(shift?.date_time_start) && 'opacity-60',
                                                            isSpanHighlighted(shift) && 'outline outline-2 outline-offset-2 outline-primary-400 shadow-lg'
                                                        ]" :style="{
                                                            backgroundColor: `${shift?.type?.color}`,
                                                            width: `${calculateShiftWidth(shift, weekIndex.toString())}`,
                                                            marginTop: `${calculateMarginTop(employee?.weeks, weekIndex.toString(), shiftIndex as number)}rem`
                                                        }" :draggable="isAtLeast('Admin') && !isShiftLocked(shift?.date_time_start)"
                                                        @dragstart="isAtLeast('Admin') && !isShiftLocked(shift?.date_time_start) && onDragStart($event, employee, weekIndex as number, shift)"
                                                        @dragend="isAtLeast('Admin') && onDragEnd($event)"
                                                        @mouseenter="hoverSpan(shift)" @mouseleave="hoverSpan(null)">
                                                        <div class="absolute -left-2 -top-2 sm:-left-3 sm:-top-3 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center text-xs sm:text-sm"
                                                            v-if="shift?.type?.system_name === 'sick-leave'">
                                                            🤒
                                                        </div>
                                                        <div class="absolute -left-2 -top-2 sm:-left-3 sm:-top-3 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center text-xs sm:text-sm"
                                                            v-if="shift?.type?.system_name === 'vacation-leave'">
                                                            🏖️
                                                        </div>
                                                        <Tooltip v-if="isShiftLocked(shift?.date_time_start)"
                                                            :text="$t('dutySchedules.lockedShiftTooltip')" position="top"
                                                            :wrap="true" class="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 z-10">
                                                            <div
                                                                class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center">
                                                                <Icon name="ph:lock-simple" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500"
                                                                    aria-hidden="true" />
                                                            </div>
                                                        </Tooltip>
                                                        <div v-if="isWorkedHolidayShift(shift)"
                                                            class="absolute left-4 -top-2 sm:-right-3 sm:-top-3 z-10">
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
                                                        <div v-if="isWorkedHolidayShift(shift)" class="h-2" />
                                                        <div class="flex flex-col lg:flex-row lg:items-center lg:flex-wrap text-white cursor-pointer px-1.5 sm:px-2 pt-1 sm:pt-1.5 pb-0.5"
                                                            @click="((hasUpdatePermission || isAtLeast('Admin')) && !isShiftLocked(shift?.date_time_start)) ? editSchedule(employee, employeeIndex as number, weekIndex as number, shift, shiftIndex as number) : viewSchedule(employeeIndex as number, weekIndex as number, shift, shiftIndex as number)">
                                                            <!-- Start time -->
                                                            <div v-if="shift?.date_time_start && shift?.date_time_end" class="flex items-center gap-0.5">
                                                                <div v-if="shift?.is_from_lastweek"
                                                                    class="bg-white/20 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <Icon name="ph:arrow-left"
                                                                        class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                                                </div>
                                                                <Tooltip v-if="!isQuickEditingField(employeeIndex, weekIndex, shiftIndex, 'start')"
                                                                    :text="$t('dutySchedules.quickEditTime.tooltip')"
                                                                    :disabled="!canQuickEditShift(shift)">
                                                                    <span
                                                                        class="text-xs 2xl:text-sm font-bold text-white tracking-tight leading-none"
                                                                        @click="handleTimeClick($event, employeeIndex, weekIndex, shift, shiftIndex, 'start')">
                                                                        {{ moment(shift?.date_time_start).format("HH:mm") }}
                                                                    </span>
                                                                </Tooltip>
                                                                <span v-else class="inline-flex flex-col w-16" @click.stop>
                                                                    <FormTimeFieldTransparent name="quick-edit-start"
                                                                        :value="state.quickEditTime.value"
                                                                        @update:value="state.quickEditTime.value = $event"
                                                                        @closed="confirmQuickEditTime(shift)"
                                                                        @cancelled="cancelQuickEditTime()" />
                                                                    <span class="text-[9px] leading-tight text-white/70 mt-0.5">
                                                                        {{ $t('dutySchedules.quickEditTime.hint') }}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <!-- A dash, not an arrow icon: the arrow pushed "08:00 → 17:00"
                                                                 past a 97px column, so the times stacked on three lines. -->
                                                            <span v-if="shift?.date_time_start && shift?.date_time_end"
                                                                class="hidden lg:inline text-xs 2xl:text-sm font-bold text-white/70 leading-none mx-0.5"
                                                                aria-hidden="true">–</span>
                                                            <!-- End time -->
                                                            <div v-if="shift?.date_time_start && shift?.date_time_end" class="flex items-center gap-0.5 mt-0.5 sm:mt-0">
                                                                <Tooltip v-if="!isQuickEditingField(employeeIndex, weekIndex, shiftIndex, 'end')"
                                                                    :text="$t('dutySchedules.quickEditTime.tooltip')"
                                                                    :disabled="!canQuickEditShift(shift)">
                                                                    <span
                                                                        class="text-xs 2xl:text-sm font-bold text-white/80 sm:text-white tracking-tight leading-none"
                                                                        @click="handleTimeClick($event, employeeIndex, weekIndex, shift, shiftIndex, 'end')">
                                                                        {{ moment(shift?.date_time_end).format("HH:mm") }}
                                                                    </span>
                                                                </Tooltip>
                                                                <span v-else class="inline-flex flex-col w-16" @click.stop>
                                                                    <FormTimeFieldTransparent name="quick-edit-end"
                                                                        :value="state.quickEditTime.value"
                                                                        @update:value="state.quickEditTime.value = $event"
                                                                        @closed="confirmQuickEditTime(shift)"
                                                                        @cancelled="cancelQuickEditTime()" />
                                                                    <span class="text-[9px] leading-tight text-white/70 mt-0.5">
                                                                        {{ $t('dutySchedules.quickEditTime.hint') }}
                                                                    </span>
                                                                </span>
                                                                <div v-if="shift?.is_until_nextweek"
                                                                    class="bg-white/20 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <Icon name="ph:arrow-right"
                                                                        class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                                                </div>
                                                            </div>
                                                            <div v-else class="flex items-center gap-0.5">
                                                                <span class="text-xs 2xl:text-sm font-bold text-white tracking-tight leading-none">
                                                                    {{ $t('dutySchedules.allDay') }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Tooltip v-if="shift?.hours !== null && shift?.hours !== undefined"
                                                            :text="shiftHoursTooltip(shift)"
                                                            position="left" :wrap="true">
                                                            <div
                                                                class="flex items-center gap-1 px-1.5 sm:px-2 pb-1 cursor-help">
                                                                <Icon name="ph:clock" class="w-3 h-3 flex-shrink-0"
                                                                    style="color:rgba(255,255,255,0.7)" />
                                                                <span
                                                                    class="text-white/80 text-[10px] font-medium">
                                                                    {{ shiftDisplayHours(shift) }}
                                                                </span>
                                                            </div>
                                                        </Tooltip>
                                                        <div v-if="shift?.shift_span_position && shift?.shift_span_position !== 'single'"
                                                            class="flex items-center gap-1 px-1.5 sm:px-2.5 pb-1 sm:pb-1.5">
                                                            <div v-if="shift.shift_span_position === 'start'"
                                                                class="flex items-center flex-col xl:flex-row gap-1 bg-white/20 rounded-full px-2 py-0.5">
                                                                <Icon name="ph:arrow-right"
                                                                    class="w-4 h-4 lg:w-3 lg:h-3 text-white flex-shrink-0" />
                                                                <span
                                                                    class="text-[10px] lg:text-xxs text-center font-medium text-white">
                                                                    {{
                                                                        $t('dutySchedules.shiftSpan.start')
                                                                    }}
                                                                </span>
                                                            </div>
                                                            <div v-if="shift.shift_span_position === 'middle'"
                                                                class="flex items-center flex-col xl:flex-row gap-1 bg-white/20 rounded-full px-2 py-0.5">
                                                                <Icon name="ph:arrows-horizontal"
                                                                    class="w-4 h-4 lg:w-3 lg:h-3 text-white flex-shrink-0" />
                                                                <span
                                                                    class="text-[9px] lg:text-xxs text-center font-medium text-white">
                                                                    {{
                                                                        $t('dutySchedules.shiftSpan.middle')
                                                                    }}
                                                                </span>
                                                            </div>
                                                            <div v-if="shift.shift_span_position === 'end'"
                                                                class="flex items-center flex-col xl:flex-row gap-1 bg-white/20 rounded-full px-2 py-0.5">
                                                                <Icon name="ph:arrow-left"
                                                                    class="w-4 h-4 lg:w-3 lg:h-3 text-white flex-shrink-0" />
                                                                <span
                                                                    class="text-[10px] lg:text-xxs text-center font-medium text-white">
                                                                    {{
                                                                        $t('dutySchedules.shiftSpan.end')
                                                                    }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="flex flex-wrap gap-1 px-1.5 sm:px-2.5 pb-1 sm:pb-1.5"
                                                            v-if="shift && shift.citizen_schedules && shift.citizen_schedules.length > 0">
                                                            <!-- Mobile: initials-only avatars stacked horizontally -->
                                                            <div class="flex xl:hidden flex-wrap gap-1">
                                                                <Tooltip v-for="(cs, csIdx) in shift.citizen_schedules"
                                                                    :key="csIdx"
                                                                    :text="(cs?.citizen?.firstname ?? '') + ' ' + (cs?.citizen?.lastname ?? '')"
                                                                    position="top">
                                                                    <div
                                                                        class="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 ring-1 ring-white/50">
                                                                        <span class="font-bold text-white"
                                                                            style="font-size:8px">
                                                                            {{ (cs?.citizen?.firstname?.charAt(0) ?? '')
                                                                                + (cs?.citizen?.lastname?.charAt(0) ?? '')
                                                                            }}
                                                                        </span>
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                            <!-- Desktop: full pill with name -->
                                                            <div v-for="(cs, csIdx) in shift.citizen_schedules"
                                                                :key="csIdx"
                                                                class="hidden xl:flex items-center gap-1 bg-white rounded-full pl-0.5 pr-2 py-0.5">
                                                                <div
                                                                    class="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                                    <span class="font-bold text-gray-600"
                                                                        style="font-size:9px">
                                                                        {{
                                                                            (cs && cs.citizen && cs.citizen.firstname ?
                                                                                cs.citizen.firstname.charAt(0) : "") +
                                                                            (cs && cs.citizen && cs.citizen.lastname ?
                                                                                cs.citizen.lastname.charAt(0) : "")
                                                                        }}
                                                                    </span>
                                                                </div>
                                                                <span
                                                                    class="text-xxs font-semibold text-gray-700 leading-none">
                                                                    {{
                                                                        cs && cs.citizen ? cs.citizen.firstname : ""
                                                                    }}
                                                                    {{
                                                                        cs && cs.citizen && cs.citizen.lastname ?
                                                                            cs.citizen.lastname.charAt(0) + "." : ""
                                                                    }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="flex flex-col gap-0.5 px-1.5 sm:px-2.5 pb-1 sm:pb-1.5"
                                                            v-if="shift && shift.departments && shift.departments.length > 0">
                                                            <div v-for="(dept, dIdx) in shift.departments" :key="dIdx"
                                                                class="flex items-center gap-1">
                                                                <Icon name="ph:house"
                                                                    class="w-3 h-3 flex-shrink-0 text-white" />
                                                                <span class="text-xxs font-medium"
                                                                    style="color:white">{{ dept.name }}</span>
                                                            </div>
                                                        </div>
                                                        <div class="flex items-center flex-wrap gap-1 px-1.5 sm:px-2.5 pb-1 sm:pb-2"
                                                            v-if="shift && shift.tags && shift.tags.length > 0">
                                                            <Tooltip :text="tag && tag.tag ? tag.tag : ''"
                                                                v-for="(tag, tagIdx) in shift.tags" :key="tagIdx">
                                                                <div class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                                                                    :style="{ backgroundColor: tag && tag.color ? tag.color : '#888', fontSize: '10px' }">
                                                                    <span v-if="tag && tag.tag">
                                                                        {{ tag.tag.charAt(0) }}
                                                                    </span>
                                                                </div>
                                                            </Tooltip>
                                                        </div>
                                                        <Tooltip v-if="shift && shift.note && shift.note.trim()"
                                                            :text="`${$t('dutySchedules.shiftNote')}: ${shift.note}`"
                                                            position="left" :wrap="true">
                                                            <div
                                                                class="flex items-center gap-1 px-1.5 sm:px-2 pb-1 cursor-help">
                                                                <Icon name="ph:note" class="w-3 h-3 flex-shrink-0"
                                                                    style="color:white" />
                                                                <span
                                                                    class="text-white max-w-10 xl:max-w-24 text-[10px] font-medium truncate">
                                                                    {{ shift.note }}
                                                                </span>
                                                            </div>
                                                        </Tooltip>
                                                        <button
                                                            class="w-5 h-5 rounded-full flex items-center justify-center absolute -right-1 -top-2 z-10"
                                                            style="background-color:#fef2f2;color:#dc2626;border:1.5px solid #fecaca"
                                                            draggable="false" @pointerdown.stop
                                                            @click.stop="removeShiftConfirmation(shift, employee)"
                                                            v-if="(hasDeletePermission || isAtLeast('Admin')) && !isShiftLocked(shift?.date_time_start)">
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
                                                                                    @click="requestTimeAdjustment(employeeIndex as number, shift)">
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
                                                    <Tooltip v-if="hiddenShiftCount(employee, weekIndex as string, week?.shifts) > 0"
                                                        class="!block w-full [&>div]:w-full"
                                                        :text="$t('dutySchedules.moreShifts', { count: hiddenShiftCount(employee, weekIndex as string, week?.shifts) })">
                                                        <button type="button"
                                                            :aria-label="$t('dutySchedules.moreShifts', { count: hiddenShiftCount(employee, weekIndex as string, week?.shifts) })"
                                                            class="relative z-20 w-full rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold py-1"
                                                            @click.stop="toggleCell(employee, weekIndex as string)">
                                                            +{{ hiddenShiftCount(employee, weekIndex as string, week?.shifts) }}
                                                        </button>
                                                    </Tooltip>
                                                    <button v-else-if="isCellExpanded(employee, weekIndex as string)" type="button"
                                                        class="relative z-20 w-full text-primary text-xs hover:text-primary-700 py-0.5"
                                                        @click.stop="toggleCell(employee, weekIndex as string)">
                                                        {{ $t('showLess') }}
                                                    </button>
                                                    <ModulesUserDutyScheduleScheduleSlotsRequestAvailableSlots
                                                        :daysData="week" :employee="employee"
                                                        @error="(error: any) => state.error = error" />
                                                </div>
                                            </div>
                                            <div class="flex flex-col items-center space-y-2 mt-3 cursor-pointer" v-else
                                                @click="stopCopying()">
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
                                                v-if="!isDailyScheduleCopied(employeeIndex as number, weekIndex as number, weekNumber) && !isDailyScheduleCopiedEmpty()">
                                                <p class="text-white text-xs text-center">
                                                    {{
                                                        $t('dutySchedules.copyPaste.clickHereToPasteTheSchedule')
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
                                </template>
                                </template>
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
        <ModulesUserDutyScheduleModalManageFavorites :isModalOpen="state.modal.isManageFavoritesOpen"
            @close="state.modal.isManageFavoritesOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleNormHoursModalCompensatoryHours :isModalOpen="state.modal.isCompensatoryHoursOpen"
            :selectedEmployee="state.normHours.selectedEmployeeSchedule"
            @close="state.modal.isCompensatoryHoursOpen = false" />
        <ModulesUserDutyScheduleModalShiftTypes :isModalOpen="state.modal.isShowDistributionOfShiftTypes"
            :selectedEmployee="state.shiftTypesDistribution.selectedEmployee"
            @close="state.modal.isShowDistributionOfShiftTypes = false" />
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
            @resetNewShiftError="state.newShiftError = {}" @resetShiftWarnings="state.shiftWarnings = []" />
        <ModulesUserDutyScheduleModalEditShift :isModalLoading="state.isModalLoading" :showNotifyEmployee="true"
            :isModalOpen="state.modal.isEditShiftOpen" :error="state.editShiftError"
            :selectedEmployee="state.editShift.selectedEmployee"
            :selectedEmployeeSchedule="state.editShift.selectedEmployeeSchedule"
            :showWarningDialog="state.showWarningDialog" :shiftWarnings="state.shiftWarnings"
            @dateTimeChange="dateTimeChange" @closeWarningDialog="closeWarningDialog"
            @close="state.modal.isEditShiftOpen = false; state.shiftWarnings = []"
            @resetEditShiftError="state.editShiftError = {}" @updateShift="updateSelectedSchedule" />
        <ModulesUserDutyScheduleModalRemoveShiftReason :isModalOpen="state.modal.isRemoveShiftReasonOpen"
            :availableEmployees="state.weeklySchedules?.data" :currentEmployeeUuid="state.removeShift.selectedEmployee?.uuid"
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
            @close="state.modal.isManageExtraHoursOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleLeaveRequestsModalView :isModalOpen="state.modal.isManageLeaveRequestsOpen"
            :selectedEmployee="state.manageLeaveRequests.selectedEmployee"
            @close="state.modal.isManageLeaveRequestsOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleShiftRequestsModalView :isModalOpen="state.modal.isManageShiftRequestsOpen"
            :selectedEmployee="state.manageShiftRequests.selectedEmployee"
            @close="state.modal.isManageShiftRequestsOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
        <ModulesUserDutyScheduleCompensatoryTimeRequestsModalView
            :isModalOpen="state.modal.isManageCompensatoryTimeRequestsOpen"
            :selectedEmployee="state.manageCompensatoryTimeRequests.selectedEmployee"
            @close="state.modal.isManageCompensatoryTimeRequestsOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
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
        <ModulesUserDutyScheduleModalTimeRangeFilter :isModalOpen="state.modal.isTimeRangeFilterOpen"
            :timeFrom="state.filter.time_from" :timeTo="state.filter.time_to"
            @close="state.modal.isTimeRangeFilterOpen = false" @setTimeRange="setTimeRange" />
        <ModulesUserDutyScheduleNormHoursModalDateRange :isModalOpen="state.modal.isHoursPeriodOpen"
            :dateRange="state.hoursPeriod" @close="state.modal.isHoursPeriodOpen = false"
            @filterDate="setHoursPeriod" />

        <!-- Floating stop-copying button — shown when something has been copied -->
        <div v-if="!isDailyScheduleCopiedEmpty()"
            class="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full shadow-xl cursor-pointer select-none"
            style="box-shadow: 0 4px 24px rgba(15,76,117,0.35)" @click="stopCopying()">
            <Icon name="mdi:content-copy" class="h-4 w-4" />
            <span class="text-sm font-semibold">{{ $t('dutySchedules.copyPaste.copyingActive') }}</span>
            <Icon name="ph:x-bold" class="h-4 w-4 ml-1 opacity-70" />
        </div>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useEntireShiftEdit } from '@/composables/useEntireShiftEdit'
import { shiftService } from '@/components/api/user/ShiftService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { dutyScheduleFavoriteEmployeeService } from '@/components/api/user/DutyScheduleFavoriteEmployeeService'
import { useFavoriteEmployees } from '@/composables/useFavoriteEmployees'
import { useDepartmentStore } from '@/store/department'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useDutyScheduleStore } from '@/store/duty-schedule'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { useScheduleLock } from '@/composables/useScheduleLock'
import { calculateWeeklyNormHours } from '@/composables/normHours'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const emit = defineEmits(['setDutyScheduleCurrentDate', 'setDutyScheduleCurrentFilter', 'openDayActivityLog'])
const language = useI18n()
const dutyScheduleStore = useDutyScheduleStore() as any
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
const { isDateLocked, scheduleLockCutoff } = useScheduleLock()
const favoriteEmployees = useFavoriteEmployees()

// Holiday markers only show for companies that opted in to holiday hours.
const holidaysEnabled = computed(() => !!userStore.getUser?.company?.holiday_non_sunday_hours_enabled)
// period.balance_hours excludes carry-over, while the Afspadseringstimer line above it
// (total_norm_hours) includes it. The two differ by exactly the carried-over amount, so
// only say so when carry-over is actually switched on.
const carryOverEnabled = computed(() => !!userStore.getUser?.company?.transfer_norm_hours_enabled)
const departmentStore = useDepartmentStore()
const { formatNumber, parseLocaleNumber } = useNumberFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { errorAlert } = useAlert()
const currentDate = ref(moment())
const teleportReady = ref(false)
const route = useRoute()
const hasHandledSwapDeepLink = ref(false)
const hasHandledShiftRequestDeepLink = ref(false)
const expandedRecords = reactive([] as boolean[])
const weekHeaderRef = ref<HTMLElement | null>(null)
const weekBodyRef = ref<HTMLElement | null>(null)

function syncWeekHeaderScroll() {
    if (weekHeaderRef.value && weekBodyRef.value) {
        weekHeaderRef.value.scrollLeft = weekBodyRef.value.scrollLeft
    }
}

function buildEmptyWeeks() {
    const weekDaysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const startOfWeek = moment(currentDate.value).startOf('isoWeek')
    const weekData = state.weeklySchedules?.week_data || {}

    return weekDaysOrder.reduce((weeks: any, dayKey: string, index: number) => {
        const fallbackDate = moment(startOfWeek).add(index, 'day').format('YYYY-MM-DD')
        weeks[dayKey] = {
            date: weekData?.[dayKey]?.date || fallbackDate,
            shifts: [],
            slots: [],
            additional_hour_requests: 0,
            swap_requests: 0,
            total_slots: 0,
        }
        return weeks
    }, {})
}

function buildEmptyWeekData() {
    const weekDaysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const startOfWeek = moment(currentDate.value).startOf('isoWeek')

    return weekDaysOrder.reduce((weekData: any, dayKey: string, index: number) => {
        weekData[dayKey] = {
            date: moment(startOfWeek).add(index, 'day').format('YYYY-MM-DD'),
            total_slots: 0,
            holiday: null,
        }
        return weekData
    }, {})
}

function getDisplayName(employee: any) {
    return {
        firstName: employee?.firstname || employee?.firstName || '',
        lastName: employee?.lastname || employee?.lastName || '',
    }
}

const state = reactive({
    addShift: {
        selectedEmployeeSchedule: {}
    } as any,
    quickEditTime: {
        employeeIndex: null as number | null,
        weekIndex: null as any,
        shiftIndex: null as number | null,
        field: null as 'start' | 'end' | null,
        value: '',
    },
    hoveredCell: null as { employeeIndex: number, weekIndex: any, employee: any, week: any } | null,
    shiftTypes: [] as any[],
    departmentsWithMinimumStaff: [] as any[],
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
        schedule_tag_uuids: [],
        time_from: '',
        time_to: '',
    },
    isPageLoading: false,
    isModalLoading: false,
    isPasting: false,
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
    manageShiftRequests: {
        selectedEmployee: {},
    },
    manageCompensatoryTimeRequests: {
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
        isManageFavoritesOpen: false,
        isManageLeaveRequestsOpen: false,
        isManageScheduleSlotOpen: false,
        isManageShiftRequestsOpen: false,
        isManageCompensatoryTimeRequestsOpen: false,
        isManageTimeAdjustmentRequestsOpen: false,
        isManageSwapScheduleRequestsOpen: false,
        isRemoveShiftReasonOpen: false,
        isRemoveShiftSpanConfirmationOpen: false,
        isRequestTimeAdjustmentOpen: false,
        isRequestSwapScheduleOpen: false,
        isShowDistributionOfShiftTypes: false,
        isVacationHoursOpen: false,
        isViewShiftOpen: false,
        isAnnualNormHoursInfoOpen: false,
        isGraphOpen: false,
        isTimeRangeFilterOpen: false,
        isHoursPeriodOpen: false,
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
        selectedEmployee: {},
    } as any,
    selectedDate: moment().format('YYYY-MM-DD'),
    shiftTypesDistribution: {
        selectedEmployee: {} as any,
    },
    showAllShifts: false,
    // Day cells opened past the shift cap, keyed `${employee uuid}-${weekday}`.
    expandedCells: {} as Record<string, boolean>,
    dragSuccessMessage: '' as string,
    isDragging: false as boolean,
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
    employeeHoursStats: {} as Record<string, any>,
    employeeHoursStatsLoading: {} as Record<string, boolean>,
    // Optional pro-rated period for the hours panel. While inactive the stats request
    // omits period_start/period_end entirely and the response is the plain year figures.
    hoursPeriod: {
        isActive: false,
        formDateRange: {
            start_date: moment().startOf('month').format('YYYY-MM-DD'),
            end_date: moment().endOf('month').format('YYYY-MM-DD'),
        },
    } as any,
    shiftWarnings: [] as any,
    showWarningDialog: false,
})

// Number of active filters, surfaced as a badge on the Filter button.
const activeFilterCount = computed(() => {
    const f = state.filter
    let n = 0
    if (f.department_uuids?.length) n++
    if (f.employment_status?.length) n++
    if (f.employee_uuids?.length) n++
    if (f.time_from && f.time_to) n++
    return n
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

const hasScheduleManageAccess = computed(() => isAtLeast('Admin') || hasUpdatePermission.value)
const hasManageFavoritesAccess = computed(() => true)

function isShiftLocked(date: any): boolean {
    if (!date) return false
    return isDateLocked(date, hasScheduleManageAccess.value)
}

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

// The API pre-formats hour figures (comma/period placement) according to the user's
// language at request time, so cached data becomes mis-formatted after a language
// switch — refetch so weekly_hours/yearly_hours/etc. match the new locale's format.
watch(() => language.locale.value, () => {
    // Clear synchronously so the old locale's cached numbers don't flash
    // re-parsed under the new locale's rules while the refetch is in flight.
    state.employeeHoursStats = {}
    state.employeeHoursStatsLoading = {}
    fetchDutySchedule()
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

onMounted(async () => {
    teleportReady.value = true
    await fetchDutySchedule()
    favoriteEmployees.ensureLoaded()
    handleSwapRequestDeepLink()
    handleShiftRequestDeepLink()
    window.addEventListener('keydown', handleKeyDown)
    fetchDepartmentsWithMinimumStaff()
    fetchShiftTypesForShortcuts()
})

async function fetchShiftTypesForShortcuts() {
    try {
        const response = await shiftService.getAllShifts({})
        state.shiftTypes = response?.data ?? []
    } catch (error: any) {
        state.shiftTypes = []
    }
}

async function fetchDepartmentsWithMinimumStaff() {
    try {
        const response = await departmentService.getAllDepartments({})
        state.departmentsWithMinimumStaff = (response?.data ?? []).filter((d: any) => d.minimum_staff_count)
    } catch (error: any) {
        state.departmentsWithMinimumStaff = []
    }
}

// Coverage indicator (task #257): for each day of the visible week, flag departments
// whose configured minimum_staff_count exceeds the number of distinct employees with a
// shift covering that department that day.
// `employee.weeks` is keyed by day name (monday..sunday), not a numeric-indexed array —
// weekDays is Monday-first (isoWeek), so this maps dayIndex 0-6 to the matching key.
const weekDayNameKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const coverageWarningsByDay = computed(() => {
    if (!userStore.getUser?.is_extended_duty_schedule_active) return []
    if (state.departmentsWithMinimumStaff.length === 0) return []

    const employees = state.weeklySchedules?.data ?? []

    return weekDays.value.map((_day: any, dayIndex: number) => {
        const staffedDepartmentUuids: Record<string, Set<string>> = {}

        employees.forEach((employee: any) => {
            const week = employee?.weeks?.[weekDayNameKeys[dayIndex]]
            const shifts = week?.shifts ?? []
            shifts.forEach((shift: any) => {
                (shift?.departments ?? []).forEach((dept: any) => {
                    if (!dept?.uuid) return
                    if (!staffedDepartmentUuids[dept.uuid]) staffedDepartmentUuids[dept.uuid] = new Set()
                    staffedDepartmentUuids[dept.uuid].add(employee.uuid)
                })
            })
        })

        const understaffed = state.departmentsWithMinimumStaff
            .map((dept: any) => ({
                name: dept.name,
                minimum: dept.minimum_staff_count,
                assigned: staffedDepartmentUuids[dept.uuid]?.size ?? 0,
            }))
            .filter((dept: any) => dept.assigned < dept.minimum)

        return understaffed
    })
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
        fetchDutySchedule()
    } catch (error: any) {
        state.error = error
    }
}

// Open the relevant request panel for an employee when arriving from an e-mail link.
function openRequestFromDeepLink(reqType: string, employeeUuid: string, date: string) {
    const employee = (state.weeklySchedules?.data ?? []).find((e: any) => e?.uuid === employeeUuid)
    if (!employee) return
    if (reqType === 'swap') {
        state.manageSwapScheduleRequest.selectedEmployee = employee
        state.manageSwapScheduleRequest.selectedDate = date
        state.modal.isManageSwapScheduleRequestsOpen = true
    } else if (reqType === 'time') {
        state.manageTimeRequest.selectedEmployee = employee
        state.manageTimeRequest.selectedDate = date
        state.modal.isManageTimeAdjustmentRequestsOpen = true
    } else if (reqType === 'extra') {
        viewExtraHours(employee)
    } else if (reqType === 'leave') {
        viewLeaveRequests(employee)
    }
}

onBeforeUnmount(() => {
    teleportReady.value = false
    window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        stopCopying()
        return
    }
    // Ignore shortcuts while typing anywhere (quick time-edit inputs, search fields, etc.)
    const target = event.target as HTMLElement
    if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
    if (state.hoveredCell && event.key.length === 1) {
        tryRapidFillShortcut(event.key)
    }
}


function showShiftTypeDistribution(employee: any) {
    state.shiftTypesDistribution.selectedEmployee = employee
    state.modal.isShowDistributionOfShiftTypes = true
}

// AW-2026-4263 — a night shift is stored as one row per day it touches, so each
// block's own `hours` is only that day's piece (1.75 + 8.75). Under each block of a
// span show the whole shift's total (10.5) instead; the tooltip keeps the piece.
function isSpanShift(shift: any) {
    return !!shift?.shift_span_position && shift.shift_span_position !== 'single'
}

// Hovering one block of a night shift outlines every block of that same shift, so
// the "Vagt start" and "Vagt slut" halves can be told apart from the nights next to
// them. Keyed by the backend's `span_id`, not `shift_parent_uuid`: that uuid can be
// shared by unrelated nights.
const hoveredSpanId = ref<number | null>(null)

function hoverSpan(shift: any) {
    hoveredSpanId.value = isSpanShift(shift) ? (shift?.span_id ?? null) : null
}

function isSpanHighlighted(shift: any) {
    return hoveredSpanId.value !== null && isSpanShift(shift) && shift?.span_id === hoveredSpanId.value
}

function shiftDisplayHours(shift: any) {
    return isSpanShift(shift) && shift?.span_hours !== null && shift?.span_hours !== undefined
        ? shift.span_hours
        : shift?.hours
}

function shiftHoursTooltip(shift: any) {
    const total = `${language.t('dutySchedules.viewSchedule.hours')}: ${shiftDisplayHours(shift)}`
    return shiftDisplayHours(shift) !== shift?.hours
        ? `${total} · ${language.t('dutySchedules.viewSchedule.hoursThisDay')}: ${shift.hours}`
        : total
}

function sortMultiDayShiftsFirst(shifts: any) {
    const sortedShifts = shifts.sort((a: any, b: any) => {
        const aMultiDay = a.date_time_start && a.date_time_end && moment(a.date_time_end).startOf('day').diff(moment(a.date_time_start).startOf('day'), 'days') >= 1
        const bMultiDay = b.date_time_start && b.date_time_end && moment(b.date_time_end).startOf('day').diff(moment(b.date_time_start).startOf('day'), 'days') >= 1

        if (aMultiDay && !bMultiDay) return -1 // a comes first
        if (!aMultiDay && bMultiDay) return 1  // b comes first
        // Same type: earliest start time first (all-day entries have no start time, so they sort first)
        if (!a.date_time_start || !b.date_time_start) return (a.date_time_start ? 1 : 0) - (b.date_time_start ? 1 : 0)
        return moment(a.date_time_start).valueOf() - moment(b.date_time_start).valueOf()
    })
    return sortedShifts
}

function calculateShiftWidth(shift: any, weekIndex: string) {
    if (weekIndex === 'sunday') return 'auto'

    if (!shift.date_time_start || !shift.date_time_end) {
        return 'auto' // All-day entries render as a single-day cell, not a multi-day span
    }

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

// ── Department groups ─────────────────────────────────────────────────────────
// On "All departments" a company like Memox is hundreds of rows in one list.
// Grouped by department, with the viewer's own departments first and open and
// the rest folded to one line each - a header that still says how many shifts
// and conflicts each day holds, so a folded group hides nothing that needs a
// person. Open/closed is remembered per department.
const WEEK_DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const isAllDepartmentsSelected = computed(() => {
    const selected: any = departmentStore.getSelectedDepartment
    return !selected?.uuid || selected.uuid === 'all-departments'
})

// An employee in several departments sits under the first alphabetically -
// once, so a row is never shown (and counted) twice.
function groupOf(employee: any): string {
    const names = (employee?.departments ?? [])
        .map((department: any) => department?.name)
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b))
    return names[0] ?? ''
}

function ownDepartmentNames(rows: any[]): Set<string> {
    const me = rows.find((row: any) => row?.uuid && row.uuid === userStore.getUser?.uuid)
    return new Set((me?.departments ?? []).map((department: any) => department?.name).filter(Boolean))
}

function groupingApplies(rows: any[]) {
    return isAllDepartmentsSelected.value
        && !(state.filter.department_uuids?.length > 0)
        && new Set(rows.map(groupOf)).size > 1
}

// Stable, so the backend's order (pinned self first, then by name) holds
// inside each group.
function orderByDepartmentGroup(rows: any[]) {
    if (!groupingApplies(rows)) return rows
    const own = ownDepartmentNames(rows)
    const rank = (name: string) => (name === '' ? 2 : own.has(name) ? 0 : 1)
    return [...rows].sort((a: any, b: any) => {
        const ga = groupOf(a)
        const gb = groupOf(b)
        return rank(ga) - rank(gb) || ga.localeCompare(gb)
    })
}

const isGroupingActive = computed(() => groupingApplies(state.weeklySchedules?.data ?? []))

const groupStats = computed(() => {
    const stats: Record<string, { employees: number, shifts: Record<string, number>, conflicts: Record<string, number> }> = {}
    for (const employee of state.weeklySchedules?.data ?? []) {
        const name = groupOf(employee)
        stats[name] ??= { employees: 0, shifts: {}, conflicts: {} }
        stats[name].employees++
        for (const day of WEEK_DAY_KEYS) {
            const shifts = employee?.weeks?.[day]?.shifts ?? []
            stats[name].shifts[day] = (stats[name].shifts[day] ?? 0) + shifts.length
            stats[name].conflicts[day] = (stats[name].conflicts[day] ?? 0)
                + shifts.filter((shift: any) => shift?.is_conflict).length
        }
    }
    return stats
})

function groupStartsAt(index: number) {
    const rows = state.weeklySchedules?.data ?? []
    return index === 0 || groupOf(rows[index]) !== groupOf(rows[index - 1])
}

function isGroupCollapsed(name: string) {
    const remembered = dutyScheduleStore.getDepartmentGroupOpen(name)
    if (remembered !== undefined) return !remembered
    // Never chosen: open your own departments, fold the rest. Someone in no
    // department (an owner, an admin) sees everything open.
    const own = ownDepartmentNames(state.weeklySchedules?.data ?? [])
    return own.size > 0 && !own.has(name)
}

function toggleGroup(name: string) {
    dutyScheduleStore.setDepartmentGroupOpen(name, isGroupCollapsed(name))
}

// A cell shows this many shifts, then "+N". One employee with twelve shifts on a
// day made their row 1543px tall - two screens of scrolling for one cell.
const MAX_VISIBLE_SHIFTS = 2

const cellKey = (employee: any, weekIndex: string) => `${employee?.uuid}-${weekIndex}`

function isCellExpanded(employee: any, weekIndex: string) {
    return !!state.expandedCells[cellKey(employee, weekIndex)]
}

function toggleCell(employee: any, weekIndex: string) {
    const key = cellKey(employee, weekIndex)
    state.expandedCells[key] = !state.expandedCells[key]
}

// Always a prefix of sortMultiDayShiftsFirst(): shiftIndex is used as an index
// into that order (edit, quick edit, the span margins), so hiding from the end
// keeps every visible index pointing at the same shift. Multi-day shifts sort
// first and are never hidden - their width reaches into the next columns.
function visibleShifts(employee: any, weekIndex: string, shifts: any) {
    const sorted = shifts ? sortMultiDayShiftsFirst(shifts) : []
    if (sorted.length <= MAX_VISIBLE_SHIFTS || isCellExpanded(employee, weekIndex)) return sorted
    const multiDay = sorted.filter((shift: any) => !!getMultiDayShift([shift])).length
    return sorted.slice(0, Math.max(MAX_VISIBLE_SHIFTS - 1, multiDay))
}

function hiddenShiftCount(employee: any, weekIndex: string, shifts: any) {
    return (shifts?.length ?? 0) - visibleShifts(employee, weekIndex, shifts).length
}

function getMultiDayShift(shifts: any) {
    return shifts?.find((shift: any) => {
        if (!shift.date_time_start || !shift.date_time_end) {
            return false // All-day entries never span multiple days
        }

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
        if (state.filter.schedule_tag_uuids?.length > 0) {
            params.schedule_tag_uuids = Array(state.filter.schedule_tag_uuids)
        }
        if (state.filter.time_from) {
            params.time_from = state.filter.time_from
        }
        if (state.filter.time_to) {
            params.time_to = state.filter.time_to
        }
        const response = await dutyScheduleService.getDutySchedules(params)
        if (response) {
            if (Array.isArray(response.data)) response.data = orderByDepartmentGroup(response.data)
            state.weeklySchedules = response
            state.employeeHoursStats = {}
            state.employeeHoursStatsLoading = {}
            if (response.data && response.data.length !== expandedRecords.length) {
                expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => true))
            }
            response.data?.forEach((employee: any, index: number) => {
                if (!expandedRecords[index]) fetchEmployeeHoursStats(employee)
            })
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
    if (isAtLeast('Admin')) return false // Admins can always go to the previous week

    const cutoff = scheduleLockCutoff()
    if (!cutoff) return false

    const cutoffWeek = cutoff.clone().startOf('week')
    const selectedWeek = moment(state.selectedDate).startOf('week')

    return selectedWeek.isSame(cutoffWeek, 'week')
}

function setFilter(filter: any) {
    state.filter.department_uuids = filter.department_uuids
    state.filter.employment_status = filter.employment_status
    state.filter.employee_uuids = filter.employee_uuids
    state.filter.schedule_tag_uuids = filter.schedule_tag_uuids ?? []
    state.filter.time_from = filter.time_from ?? ''
    state.filter.time_to = filter.time_to ?? ''
    emit('setDutyScheduleCurrentFilter', state.filter)
    fetchDutySchedule()
}

function setTimeRange({ time_from, time_to }: { time_from: string; time_to: string }) {
    state.filter.time_from = time_from
    state.filter.time_to = time_to
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
    if (state.showAllShifts) {
        state.weeklySchedules?.data?.forEach((employee: any) => fetchEmployeeHoursStats(employee))
    }
}

function toggleExpanded(index: number) {
    const wasHidden = expandedRecords[index]
    expandedRecords[index] = !expandedRecords[index]
    if (wasHidden) {
        fetchEmployeeHoursStats(state.weeklySchedules?.data?.[index])
    }
}

async function fetchEmployeeHoursStats(employee: any) {
    const uuid = employee?.uuid
    if (!uuid || state.employeeHoursStats[uuid]) return
    state.employeeHoursStatsLoading[uuid] = true
    try {
        const dateMoment = moment(currentDate.value)
        const params = {
            date_start: dateMoment.clone().startOf('isoWeek').format('YYYY-MM-DD'),
            date_end: dateMoment.clone().endOf('isoWeek').format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
        } as any
        // period_start/period_end are both-or-neither: sending them adds the pro-rated
        // `period` block to the response and leaves every year figure untouched.
        if (state.hoursPeriod.isActive
            && state.hoursPeriod.formDateRange.start_date
            && state.hoursPeriod.formDateRange.end_date) {
            params.period_start = state.hoursPeriod.formDateRange.start_date
            params.period_end = state.hoursPeriod.formDateRange.end_date
        }
        const response = await dutyScheduleService.getEmployeeHoursStats(uuid, params)
        if (response) {
            state.employeeHoursStats[uuid] = response?.data ?? response
        }
    } catch (_) {
        // stats unavailable
    } finally {
        state.employeeHoursStatsLoading[uuid] = false
    }
}

function empStats(employee: any) {
    return state.employeeHoursStats[employee?.uuid]
}

// fetchEmployeeHoursStats() early-returns on a cached uuid, so anything that changes
// the request has to drop the cache first or the change silently no-ops.
function refetchEmployeeHoursStats() {
    state.employeeHoursStats = {}
    state.employeeHoursStatsLoading = {}
    state.weeklySchedules?.data?.forEach((employee: any, index: number) => {
        if (!expandedRecords[index]) fetchEmployeeHoursStats(employee)
    })
}

function setHoursPeriod(formDateRange: any) {
    state.hoursPeriod.formDateRange.start_date = formDateRange.start_date
    state.hoursPeriod.formDateRange.end_date = formDateRange.end_date
    state.hoursPeriod.isActive = true
    refetchEmployeeHoursStats()
}

function clearHoursPeriod() {
    state.hoursPeriod.isActive = false
    refetchEmployeeHoursStats()
}

// The backend clamps the requested range to the intersection with the employment and
// norm period and echoes the clamped values back, so label the box with what was
// actually measured rather than with what the user asked for.
function hoursPeriodLabel(employee: any) {
    const period = empStats(employee)?.period
    const start = period?.start ?? state.hoursPeriod.formDateRange.start_date
    const end = period?.end ?? state.hoursPeriod.formDateRange.end_date
    return `${formatDateToReadable(start)} - ${formatDateToReadable(end)}`
}

// Total of the shift-type rows plus only the NON-WORKED holiday hours.
// Worked holiday hours (e.g. 9h × 1.5 = 13.5) are already in the shift-type rows;
// the Holidays box just mirrors them, so adding them again would double-count.
function shiftTypeTotal(employee: any, key: 'weekly_hours' | 'yearly_hours'): number {
    const stats = empStats(employee)
    let sum = (stats?.hours ?? [])
        .filter((t: any) => t?.shift?.system_name !== 'time-filter')
        .reduce((s: number, t: any) => s + parseLocaleNumber(language.locale.value, t?.[key]), 0)
    return sum
}

function isStatsLoading(employee: any) {
    return !!state.employeeHoursStatsLoading[employee?.uuid]
}

// Returns the employee's norm cycle only when it differs from the calendar year —
// null means the "Indeværende år" caption is still accurate and stays.
function cycleRange(employee: any) {
    const normPeriod = employee?.norm_period
    const start = normPeriod?.period_start
    const end = normPeriod?.period_end
    if (!start || !end) return null
    const startMoment = moment(start)
    const endMoment = moment(end)
    if (!startMoment.isValid() || !endMoment.isValid()) return null
    const isCalendarYear = startMoment.isSame(startMoment.clone().startOf('year'), 'day')
        && endMoment.isSame(endMoment.clone().endOf('year'), 'day')
        && startMoment.year() === endMoment.year()
    return isCalendarYear ? null : { start: startMoment, end: endMoment }
}

function cycleTooltip(employee: any) {
    const range = cycleRange(employee)
    if (!range) return ''
    const name = employee?.norm_period?.name
    const dates = `${range.start.format('DD.MM.YYYY')} - ${range.end.format('DD.MM.YYYY')}`
    return name ? `${name} (${dates})` : dates
}

function previousWeek() {
    state.customWeekLabel = 'week'
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
}

function setToday() {
    state.customWeekLabel = 'week'
    currentDate.value = moment()
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
}

function nextWeek() {
    state.customWeekLabel = 'week'
    currentDate.value = moment(currentDate.value).add(1, 'week')
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
}

const weekNumber = computed(() => {
    return moment(currentDate.value).isoWeek()
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
    if (!employee?.uuid) {
        errorAlert('Error', 'This employee is not linked to a local user yet.')
        return
    }
    state.modal.isAddShiftOpen = true
    state.addShift.selectedEmployeeSchedule = {
        employeeIndex: employeeIndex,
        weekIndex: weekIndex,
        ...week
    }
    state.newShift.selectedDate = week?.date
    state.newShift.selectedEmployee = employee
}

function setHoveredCell(employeeIndex: number, weekIndex: any, employee: any, week: any) {
    state.hoveredCell = { employeeIndex, weekIndex, employee, week }
}

function clearHoveredCell(employeeIndex: number, weekIndex: any) {
    if (state.hoveredCell?.employeeIndex === employeeIndex && state.hoveredCell?.weekIndex === weekIndex) {
        state.hoveredCell = null
    }
}

// Excel-style rapid fill: while an empty cell's "+" button is hovered, pressing a
// shift type's assigned shortcut key creates that shift directly on the cell's
// date, using the shift type's own default time_in/time_out - no modal involved.
async function tryRapidFillShortcut(key: string) {
    const cell = state.hoveredCell
    if (!cell?.employee?.uuid) return

    const matchedShiftType = state.shiftTypes.find(
        (shiftType: any) => shiftType?.shortcut_key && shiftType.shortcut_key.toLowerCase() === key.toLowerCase()
    )
    if (!matchedShiftType) return

    const date = cell.week?.date
    if (!date) return

    const departmentUuid = cell.employee?.departments?.[0]?.uuid ? [cell.employee.departments[0].uuid] : []

    // Rapid-fill always creates a single-day shift on the hovered cell, regardless
    // of the shift type's own end_time_day_offset (some leave-type shift types, e.g.
    // Compensatory Time, configure that as a multi-day default span - applying it here
    // would let one keypress silently book many days with no confirmation). A shift
    // meant to span multiple days should go through the full modal instead.
    const params = {
        user_uuid: cell.employee.uuid,
        shift_type_uuid: matchedShiftType.uuid,
        date_time_start: `${date} ${matchedShiftType.time_in}`,
        date_time_end: `${date} ${matchedShiftType.time_out}`,
        department_uuid: departmentUuid,
    }

    try {
        await dutyScheduleService.saveDutySchedule(params)
        fetchDutySchedule()
    } catch (error: any) {
        errorAlert('Error', error?.data?.message || error?.message || 'Could not create the shift.')
    }
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

function handleSwapRequestDeepLink() {
    if (hasHandledSwapDeepLink.value) return
    const swapRequestEmployee = route.query.swapRequestEmployee as string | undefined
    const swapRequestDate = route.query.swapRequestDate as string | undefined
    if (!swapRequestEmployee || !swapRequestDate) return

    hasHandledSwapDeepLink.value = true

    const matchedEmployee = state.weeklySchedules?.data?.find(
        (employee: any) => employee?.uuid === swapRequestEmployee
    )
    state.manageSwapScheduleRequest.selectedEmployee = matchedEmployee ?? { uuid: swapRequestEmployee }
    state.manageSwapScheduleRequest.selectedDate = swapRequestDate
    state.modal.isManageSwapScheduleRequestsOpen = true
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
    const employeeUuid = state.weeklySchedules?.data?.[employeeIndex]?.uuid
    if (!employeeUuid) {
        errorAlert('Error', 'This employee is not linked to a local user yet.')
        return
    }
    const shiftType = shiftDetails.shift_type
    const params = {
        shift_type_uuid: shiftType,
        is_sleeping_sick_leave: shiftDetails.is_sleeping_sick_leave,
        do_not_count_weekends: shiftDetails.do_not_count_weekends,
        date_time_start: shiftDetails.date_time_start,
        date_time_end: shiftDetails.date_time_end,
        user_uuid: employeeUuid,
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
    if (state.isPasting) return
    state.isPasting = true
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
    } finally {
        state.isPasting = false
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

function viewLeaveRequests(employee: any) {
    state.manageLeaveRequests.selectedEmployee = employee
    state.modal.isManageLeaveRequestsOpen = true
}

function handleShiftRequestDeepLink() {
    if (hasHandledShiftRequestDeepLink.value) return
    const shiftRequestEmployee = route.query.shiftRequestEmployee as string | undefined
    if (!shiftRequestEmployee) return

    hasHandledShiftRequestDeepLink.value = true

    const matchedEmployee = state.weeklySchedules?.data?.find(
        (employee: any) => employee?.uuid === shiftRequestEmployee
    )
    state.manageShiftRequests.selectedEmployee = matchedEmployee ?? { uuid: shiftRequestEmployee }
    state.modal.isManageShiftRequestsOpen = true
}

function viewShiftRequests(employee: any) {
    state.manageShiftRequests.selectedEmployee = employee
    state.modal.isManageShiftRequestsOpen = true
}

function viewCompensatoryTimeRequests(employee: any) {
    state.manageCompensatoryTimeRequests.selectedEmployee = employee
    state.modal.isManageCompensatoryTimeRequestsOpen = true
}

async function pasteEmployeeWeeklySchedule(weeklySchedule: any) {
    if (state.isPasting) return
    state.isPasting = true
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
    } finally {
        state.isPasting = false
    }
}

function isAllWeeklyScheduleCopiedEmpty() {
    return Object.keys(state.copy.allEmployeeSchedules).length === 0
}

function isWeeklyScheduleCopied(weekNumber: number) {
    return state.copy.allEmployeeSchedules.weekNumber === weekNumber
}

let copyWeeklyScheduleTimer: ReturnType<typeof setTimeout> | null = null

function copyWeeklySchedule(weekNumber: number) {
    if (copyWeeklyScheduleTimer) return
    state.copy.allEmployeeSchedules = {
        weekNumber: weekNumber,
        yearSource: currentDate.value.year(),
        weeklySchedules: state.weeklySchedules?.data
    }
    copyWeeklyScheduleTimer = setTimeout(() => { copyWeeklyScheduleTimer = null }, 300)
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
    if (state.isPasting) return
    state.isPasting = true
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
    } finally {
        state.isPasting = false
    }
}

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
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.markScheduleAbsence(scheduleUuid, { reason })
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

async function reassignShift(employeeUuid: string) {
    const scheduleUuid = state.removeShift.selectedShift.schedule_uuid
    const date = moment(state.removeShift.selectedShift.date_time_start).format('YYYY-MM-DD')
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.moveShift(scheduleUuid, { date, user_uuid: employeeUuid })
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
    const userUuid = state.weeklySchedules?.data?.[employeeIndex].uuid
    state.viewShift.selectedEmployeeSchedule = {
        citizen_schedules: shift?.citizen_schedules,
        scheduleUuid: shift?.schedule_uuid,
        date_time_start: shift?.date_time_start,
        date_time_end: shift?.date_time_end,
        hours: shift?.hours,
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

const { withEntireShift } = useEntireShiftEdit()

async function editSchedule(employee: any, employeeIndex: number, weekIndex: any, shift: any, shiftIndex: number) {
    const date = state.weeklySchedules?.data?.[employeeIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules?.data?.[employeeIndex].uuid
    state.editShift.selectedEmployee = employee
    state.editShift.selectedEmployeeSchedule = await withEntireShift({
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
        shift_span_position: shift?.shift_span_position,
        employeeIndex: employeeIndex,
        weekIndex: weekIndex,
        shiftIndex: shiftIndex,
    }, (uuid: string) => dutyScheduleService.getDutySchedule(uuid))
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
        edit_entire_shift: state.editShift.selectedEmployeeSchedule.edit_entire_shift,
        is_apply_to_all: shiftDetails?.recurring?.is_apply_to_all,
        user_uuid: state.editShift.selectedEmployeeSchedule.user_uuid,
        citizen_uuid: shiftDetails.citizens,
        schedule_tag_uuid: shiftDetails.schedule_tag_uuid,
        department_uuid: shiftDetails.department_uuid,
        note: shiftDetails.note,
        do_not_count_sick_leave: shiftDetails.do_not_count_sick_leave,
        use_compensatory_time: shiftDetails.use_compensatory_time,
        notify_employee: shiftDetails.notify_employee,
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
        setTimeout(() => {
            state.isModalLoading = false
        }, 300)
    }
}

// Reproduces the exact same transformation modal-edit-shift.vue applies to a raw
// shift/schedule row before sending it to updateDutySchedule (see its watcher on
// props.selectedEmployeeSchedule) - schedule_tag_uuid/department_uuid/citizen_uuid
// are full-replace on the backend (ScheduleRepository::update), so omitting them
// here would silently wipe the shift's tags/department/citizens.
function buildScheduleUpdateParams(shift: any, userUuid: string, dateTimeStart: string, dateTimeEnd: string) {
    const citizenUuids: string[] = []
    shift?.citizen_schedules?.forEach((citizenSchedule: any) => {
        citizenUuids.push(citizenSchedule.citizen.uuid)
    })

    const scheduleTagUuid: string[] = []
    shift?.tags?.forEach((tag: any) => {
        scheduleTagUuid.push(tag.uuid)
    })

    const departmentUuid: string[] = []
    if (shift?.departments?.[0]) {
        departmentUuid.push(shift.departments[0].uuid)
    }

    return {
        shift_type_uuid: shift?.type?.uuid,
        is_sleeping_sick_leave: false,
        do_not_count_weekends: false,
        date_time_start: dateTimeStart,
        date_time_end: dateTimeEnd,
        user_uuid: userUuid,
        citizen_uuid: citizenUuids,
        schedule_tag_uuid: scheduleTagUuid,
        department_uuid: departmentUuid,
        note: shift?.note,
        do_not_count_sick_leave: shift?.do_not_count_sick_leave,
        use_compensatory_time: shift?.use_compensatory_time,
    }
}

function canQuickEditShift(shift: any): boolean {
    return (hasUpdatePermission.value || isAtLeast('Admin')) && !isShiftLocked(shift?.date_time_start)
}

function isQuickEditingField(employeeIndex: number, weekIndex: any, shiftIndex: number, field: 'start' | 'end'): boolean {
    return state.quickEditTime.employeeIndex === employeeIndex
        && state.quickEditTime.weekIndex === weekIndex
        && state.quickEditTime.shiftIndex === shiftIndex
        && state.quickEditTime.field === field
}

function handleTimeClick(event: MouseEvent, employeeIndex: number, weekIndex: any, shift: any, shiftIndex: number, field: 'start' | 'end') {
    if (!canQuickEditShift(shift)) return
    event.stopPropagation()
    startQuickEditTime(employeeIndex, weekIndex, shift, shiftIndex, field)
}

function startQuickEditTime(employeeIndex: number, weekIndex: any, shift: any, shiftIndex: number, field: 'start' | 'end') {
    const current = field === 'start' ? shift?.date_time_start : shift?.date_time_end
    state.quickEditTime = {
        employeeIndex,
        weekIndex,
        shiftIndex,
        field,
        value: moment(current).format('HH:mm'),
    }
}

function cancelQuickEditTime() {
    state.quickEditTime = {
        employeeIndex: null,
        weekIndex: null,
        shiftIndex: null,
        field: null,
        value: '',
    }
}

function confirmQuickEditTime(shift: any) {
    const { employeeIndex, weekIndex, shiftIndex, field, value } = state.quickEditTime
    if (employeeIndex === null || shiftIndex === null || !field || !value) {
        cancelQuickEditTime()
        return
    }

    const [hours, minutes] = value.split(':').map(Number)
    const newStart = field === 'start'
        ? moment(shift?.date_time_start).set({ hour: hours, minute: minutes, second: 0 }).format('YYYY-MM-DD HH:mm:ss')
        : shift?.date_time_start
    const newEnd = field === 'end'
        ? moment(shift?.date_time_end).set({ hour: hours, minute: minutes, second: 0 }).format('YYYY-MM-DD HH:mm:ss')
        : shift?.date_time_end

    const userUuid = state.weeklySchedules?.data?.[employeeIndex]?.uuid
    const params = buildScheduleUpdateParams(shift, userUuid, newStart, newEnd)
    updateDutySchedule(shift?.schedule_uuid, params, employeeIndex, weekIndex, shiftIndex)
    cancelQuickEditTime()
}

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
    } catch (error: any) {

    }
}

function closeWarningDialog() {
    state.showWarningDialog = false
    state.shiftWarnings = []
}

function openUserNormPeriodModal(employee: any) {
    if (!isAtLeast('Admin')) return
    state.normHours.selectedEmployee = employee
    state.modal.isUserNormPeriodOpen = true
}

defineExpose({
    refreshSchedule: fetchDutySchedule,
    getScheduleEmployees: () => state.weeklySchedules?.data || [],
})

function openGraphModal(employee: any) {
    state.normHours.selectedEmployee = employee
    state.modal.isGraphOpen = true
}

// Holiday lookup
const dayNameToKey: Record<string, string> = {
    'Mon': 'monday', 'Tue': 'tuesday', 'Wed': 'wednesday',
    'Thu': 'thursday', 'Fri': 'friday', 'Sat': 'saturday', 'Sun': 'sunday'
}

// Danish public holidays for testing
const danishHolidays: Record<string, string> = {
    '2026-01-01': 'Nytårsdag',
    '2026-03-29': 'Palmesøndag',
    '2026-04-02': 'Skærtorsdag',
    '2026-04-03': 'Langfredag',
    '2026-04-05': 'Påskedag',
    '2026-04-06': '2. påskedag',
    '2026-05-01': '1. maj',
    '2026-05-14': 'Kristi himmelfartsdag',
    '2026-05-24': 'Pinsedag',
    '2026-05-25': '2. pinsedag',
    '2026-06-05': 'Grundlovsdag',
    '2026-12-24': 'Juleaften',
    '2026-12-25': 'Juledag',
    '2026-12-26': '2. juledag',
    '2026-12-31': 'Nytårsaften',
}

function getHolidayForDay(longName: string): string | null {
    const key = dayNameToKey[longName]
    if (!key) return null
    // First try API data — always show holiday names regardless of holiday_non_sunday_hours_enabled
    const apiHoliday = state.weeklySchedules?.week_data?.[key]?.holiday?.name
    if (apiHoliday) return apiHoliday
    // Fallback to local Danish holidays
    const startOfWeek = moment(currentDate.value).startOf('isoWeek')
    const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(key)
    const dateStr = moment(startOfWeek).add(dayIndex, 'day').format('YYYY-MM-DD')
    return danishHolidays[dateStr] || null
}

// Resolve a holiday name from an actual date (grid cells / shifts carry dates).
function getHolidayNameByDate(dateStr: string): string | null {
    if (!dateStr) return null
    const wd = state.weeklySchedules?.week_data
    if (wd) {
        for (const k of Object.keys(wd)) {
            if (wd[k]?.date === dateStr && wd[k]?.holiday?.name) return wd[k].holiday.name
        }
    }
    return danishHolidays[dateStr] || null
}

// Non-worked, non-Sunday public holiday where the employee has no shift → 7.4h assigned.
function isNonWorkedHolidayCell(week: any): boolean {
    if (!holidaysEnabled.value || !week?.date) return false
    if (!getHolidayNameByDate(week.date)) return false
    if (moment(week.date).day() === 0) return false // Sundays excluded (matches backend)
    if (week.shifts && week.shifts.length > 0) return false // shift present → not a free holiday
    return true
}

// A shift that falls on a public holiday → counts as both holiday hours + the shift.
function isWorkedHolidayShift(shift: any): boolean {
    if (!holidaysEnabled.value || !shift?.date_time_start) return false
    return !!getHolidayNameByDate(moment(shift.date_time_start).format('YYYY-MM-DD'))
}

function isToday(fullDate: any): boolean {
    return moment().isSame(fullDate, 'day')
}

// ===== DRAG & DROP =====
let _dragShift: any = null
let _dragSourceEmployee: any = null
let _dragSourceWeekIndex: any = null

function onDragStart(e: DragEvent, emp: any, wi: any, sh: any) {
    if (!(hasUpdatePermission || isAtLeast('Admin')) || isShiftLocked(sh?.date_time_start)) { e.preventDefault(); return }
    _dragShift = sh; _dragSourceEmployee = emp; _dragSourceWeekIndex = wi
    state.isDragging = true
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move" }
}

function onDragEnd(e: DragEvent) {
    setTimeout(() => {
        state.isDragging = false
        _dragShift = null; _dragSourceEmployee = null; _dragSourceWeekIndex = null
        document.querySelectorAll(".drag-over-cell").forEach((el: any) => {
            el.style.outline = ""; el.style.background = ""; el.classList.remove("drag-over-cell")
        })
    }, 200)
}

function onDragOver(e: DragEvent) {
    e.preventDefault()
    const t = e.currentTarget as HTMLElement
    if (t) { t.style.outline = "2px dashed #0f4c75"; t.style.background = "rgba(15,76,117,0.06)"; t.classList.add("drag-over-cell") }
}

function onDragLeave(e: DragEvent) {
    const t = e.currentTarget as HTMLElement
    const rel = e.relatedTarget as HTMLElement
    if (t && (!rel || !t.contains(rel))) { t.style.outline = ""; t.style.background = ""; t.classList.remove("drag-over-cell") }
}

async function onDrop(e: DragEvent, tEmp: any, tWi: any) {
    e.preventDefault()
    const t = e.currentTarget as HTMLElement
    if (t) { t.style.outline = ""; t.style.background = ""; t.classList.remove("drag-over-cell") }
    if (!_dragShift) return
    if (_dragSourceEmployee?.uuid === tEmp.uuid && _dragSourceWeekIndex === tWi) {
        state.isDragging = false; _dragShift = null; return
    }
    const sh = _dragShift
    const td = tEmp?.weeks?.[tWi]?.date
    if (!td) return
    const ss = moment(sh.date_time_start), se = moment(sh.date_time_end)
    const dur = se.diff(ss, "minutes")
    const ns = moment(td).set({ hour: ss.hour(), minute: ss.minute(), second: 0, millisecond: 0 })
    const ne = ns.clone().add(dur, "minutes")
    const dayMap: Record<string, string> = {
        monday: language.t('calendar.week.full.Monday'),
        tuesday: language.t('calendar.week.full.Tuesday'),
        wednesday: language.t('calendar.week.full.Wednesday'),
        thursday: language.t('calendar.week.full.Thursday'),
        friday: language.t('calendar.week.full.Friday'),
        saturday: language.t('calendar.week.full.Saturday'),
        sunday: language.t('calendar.week.full.Sunday'),
    }
    state.isDragging = false; _dragShift = null; _dragSourceEmployee = null; _dragSourceWeekIndex = null
    try {
        await dutyScheduleService.moveShift(sh.schedule_uuid, {
            date: ns.format("YYYY-MM-DD"),
            user_uuid: tEmp.uuid
        })
        await fetchDutySchedule()
        const dag = dayMap[String(tWi).toLowerCase()] || String(tWi)
        state.dragSuccessMessage = language.t('dutySchedules.shiftMovedTo') + ' ' + dag
        setTimeout(() => { state.dragSuccessMessage = "" }, 3000)
    } catch (err: any) { state.error = err }
}
// ===== END DRAG & DROP =====
</script>

<style>
.slot-badge {
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    min-height: 20px !important;
    max-width: 20px !important;
    max-height: 20px !important;
    padding: 0 !important;
    line-height: 20px !important;
    text-align: center !important;
    display: block !important;
    font-size: 10px !important;
    color: white !important;
    box-sizing: border-box !important;
    border-radius: 50% !important;
    pointer-events: none !important;
}
</style>