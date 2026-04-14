<template>
    <div class="space-y-5">
        <!-- Teleport datovælger til breadcrumb-rækken -->
        <Teleport to="#schedule-date-picker-target" v-if="teleportReady">
            <div class="flex items-center gap-1.5">
                <div class="relative flex items-center rounded-lg bg-white ring-1 ring-gray-200 overflow-hidden h-[32px]">
                    <button @click="previousWeek()" type="button"
                        class="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                        <Icon name="heroicons:chevron-left" class="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                        dateType="duty-schedule" v-model="state.selectedDate" />
                    <button @click="nextWeek()" type="button"
                        class="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                        <Icon name="heroicons:chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>
                <button @click="setToday()" class="text-primary text-xs font-semibold hover:text-primary-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors">{{ $t('goToToday') }}</button>
            </div>
        </Teleport>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="state?.errorUpdateShift?.message"
            v-if="state.errorUpdateShift?.message && state.errorUpdateShift.message.length > 0" />
        <Alert type="danger" :text="state?.copyShiftError?.message"
            v-if="state.copyShiftError?.message && state.copyShiftError.message.length > 0" />

        <!-- Workflow guide banner -->
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
                            <FormSwitch :value="draftDutyScheduleStore.getShowEmployeesWorkingToday"
                                @toggleSwitch="draftDutyScheduleStore.setShowEmployeesWorkingToday(!draftDutyScheduleStore.getShowEmployeesWorkingToday)" />
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
                    <div class="flex items-center justify-between gap-3 py-3 flex-wrap">
                        <div class="flex items-center gap-3 flex-shrink-0">
                            <h3 class="text-sm font-semibold bg-blue-50 ring-1 ring-blue-200 rounded-lg px-3 py-1 text-gray-900">
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
                            <div class="space-y-1 flex items-center gap-x-2">
                                <FormSwitch :value="userStore.getUser?.is_draft_schedule_pinned ? true : false"
                                    @toggleSwitch="pinSelfToTopOfSchedule()" />
                                <span class="text-xs text-gray-600">{{ $t('dutySchedules.pinSelfToTopOfSchedule') }}</span>
                            </div>
                            <label class="flex items-center gap-2 cursor-pointer select-none">
                                <FormSwitch :value="state.showWorkingToday" @toggleSwitch="() => { state.showWorkingToday = !state.showWorkingToday; fetchDraftDutySchedule() }" />
                                <span class="text-xs text-gray-600">{{ $t('dutySchedules.showEmployeesWorkingToday') }}</span>
                            </label>
                        </div>
                        <div class="flex items-center gap-x-2 flex-shrink-0">
                            <button v-if="state.hideBanner"
                                class="flex items-center gap-1.5 outline-none rounded-md text-xs font-medium bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-2 text-blue-600"
                                @click="() => { state.hideBanner = false; localStorage.removeItem('draftBannerHidden') }">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Vis guide
                            </button>
                            <button class="flex items-center gap-1.5 outline-none rounded-md text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 text-gray-600"
                                @click="state.modal.isFilterDutyScheduleOpen = !state.modal.isFilterDutyScheduleOpen">
                                <Icon name="ic:outline-filter-list" class="h-4 w-4" />
                                {{ $t('filter') }}
                            </button>
                            <Tooltip
                                :text="state.sortData.sortOrder === 'ascend' ? $t('dutySchedules.sort.sortNamesInDescendingOrder') : $t('dutySchedules.sort.sortNamesInAscendingOrder')"
                                position="left">
                                <button
                                    class="flex items-center justify-center outline-none rounded-full bg-primary text-white hover:bg-primary-800 p-2 w-9 h-9"
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
                            <div class="[&_input]:!h-[38px] [&_button]:!h-[38px] [&_form]:!h-[38px]">
                                <TableSearch @search="handleSearch" :placeholder="$t('dutySchedules.findEmployee')" />
                            </div>
                        </div>
                    </div>
                </div>
        <div v-if="!state.hideBanner" class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-blue-900 mb-1.5">Sådan arbejder du med vagtplanskladden</p>
                <div class="flex flex-wrap items-center gap-2 text-xs">
                    <div class="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-2.5 py-1">
                        <span class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</span>
                        <span class="text-blue-800 font-medium">Opret kladdevagter</span>
                    </div>
                    <svg class="w-3 h-3 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    <div class="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-2.5 py-1">
                        <span class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</span>
                        <span class="text-blue-800 font-medium">Gem forudindstilling (valgfrit)</span>
                    </div>
                    <svg class="w-3 h-3 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    <div class="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-2.5 py-1">
                        <span class="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</span>
                        <span class="text-green-800 font-medium">Offentliggør til vagtplan</span>
                    </div>
                </div>
                <p class="text-xs text-blue-600 mt-1.5">💡 Tip: Brug <strong>skabeloner</strong> til faste vagtrulleringer, og <strong>forudindstillinger</strong> til at genbruge en kladde du har lavet før.</p>
            </div>
            <button @click="() => { state.hideBanner = true; localStorage.setItem('draftBannerHidden', 'true'); emit('bannerClosed') }" class="flex-shrink-0 text-blue-300 hover:text-blue-500 mt-0.5">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
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
                                    <div v-for="day in weekDays" :key="day.date"
                                        class="flex items-center justify-center py-4 border-0.5"
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
                                                        <div class="flex items-center gap-1">
                                                            <Tooltip position="left"
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
                                                                :text="$t('dutySchedules.copy.copyEmployeeSchedule')">
                                                                <button
                                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                                    @click="copyEmployeeWeeklySchedule(employee)">
                                                                    <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                    <div :class="[
                                                        expandedRecords[employeeIndex] && 'hidden',
                                                        '-mt-1 ml-10'
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
                                                            {{
                                                                $t('dutySchedules.averageWeeklyHours.averageWeeklyHours')
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

                                                    <div class="text-xs grid grid-cols-7 border-t-2 border-gray-200">
                                                        <div class="col-span-3 border-gray-200">
                                                            <div class="pl-3 py-2 font-semibold">
                                                                {{ $t('dutySchedules.total') }}:
                                                            </div>
                                                        </div>
                                                        <div class="col-span-2 border-gray-200">
                                                            <div class="text-right py-2 pr-2 font-semibold">
                                                                {{ employee?.total_weekly_hours }}
                                                            </div>
                                                        </div>
                                                        <div class="col-span-2 border-l-0.5 border-gray-200">
                                                            <div class="text-right py-2 pr-2 font-semibold">
                                                                {{ employee?.total_yearly_hours }}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="text-xs grid grid-cols-7">
                                                        <div
                                                            class="px-3 col-span-7 space-y-2 border-t-0.5 border-gray-200 pt-3">
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
                                                    <button @click="toggleExpanded(employeeIndex)"
                                                        class="text-primary text-xs hover:text-primary-700">
                                                        {{ !expandedRecords[employeeIndex] ?
                                                            $t('showLess') :
                                                            $t('showMore') }}
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="p-3 border-0.5 relative" v-for="(week, weekIndex) in employee?.weeks"
                                                :key="weekIndex" :class="[
                                                    isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                                    !isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty() && 'cursor-copy relative group',
                                                    hasConflict(week) && 'border-1.5 border-red-500 rounded-md',
                                                ]"
                                                @click="!isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber) && !isDailyScheduleCopiedEmpty() && pasteEmployeeDailySchedule(employeeIndex, weekIndex)">
                                                <!-- Drop-zone overlay - præcis som udgivet vagtplan -->
                                                <div
                                                    :class="['absolute inset-0 z-10', state.isDragging ? 'pointer-events-auto' : 'pointer-events-none']"
                                                    @dragover.prevent="onDragOver($event)"
                                                    @dragleave="onDragLeave($event)"
                                                    @drop.prevent="onDrop($event, employee, weekIndex)">
                                                </div>
                                                <div class="space-y-2"
                                                    v-if="!isDailyScheduleCopied(employeeIndex, weekIndex, weekNumber)">
                                                    <div class="flex justify-end gap-2"
                                                        v-if="isAdmin(userStore.getUser?.role)">
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
                                                                'rounded-xl overflow-hidden relative mb-2.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing z-20'
                                                            ]" :style="{
                                                                backgroundColor: `${shift?.type?.color}`,
                                                                width: `${calculateShiftWidth(shift, weekIndex.toString())}`,
                                                                marginTop: `${calculateMarginTop(employee?.weeks, weekIndex.toString(), shiftIndex)}rem`
                                                            }"
                                                            draggable="true"
                                                            @dragstart="onDragStart($event, employee, weekIndex, shift)"
                                                            @dragend="onDragEnd($event)"
                                                            >
                                                            <div class="absolute -left-3 -top-3 z-10 w-6 h-6 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center text-sm"
                                                                v-if="shift?.type?.system_name === 'sick-leave'">🤒
                                                            </div>
                                                            <div class="absolute -left-3 -top-3 z-10 w-6 h-6 rounded-full bg-white border-0.5 border-gray-300 flex items-center justify-center text-sm"
                                                                v-if="shift?.type?.system_name === 'vacation-leave'">🏖️
                                                            </div>
                                                            <div class="flex items-center justify-between text-white cursor-pointer px-2.5 pt-2.5 pb-2"
                                                                @click="editSchedule(employee, employeeIndex, weekIndex, shift, shiftIndex)">
                                                                <div v-if="shift?.is_from_lastweek" class="bg-white/20 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <Icon name="ph:arrow-left" class="w-3 h-3 text-white" />
                                                                </div>
                                                                <span class="text-base font-bold text-white tracking-tight leading-none">{{ moment(shift?.date_time_start).format('HH:mm') }}</span>
                                                                <Icon name="ph:arrow-right" class="w-3.5 h-3.5 text-white/70 flex-shrink-0 mx-1" />
                                                                <span class="text-base font-bold text-white tracking-tight leading-none">{{ moment(shift?.date_time_end).format('HH:mm') }}</span>
                                                                <div v-if="shift?.is_until_nextweek" class="bg-white/20 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <Icon name="ph:arrow-right" class="w-3 h-3 text-white" />
                                                                </div>
                                                            </div>
                                                            <div class="mx-2.5 border-t border-white/20 mb-1.5"></div>
                                                            <div class="flex items-center gap-1 px-2.5 pb-1.5" v-if="shift?.shift_span_position">
                                                                <div v-if="shift.shift_span_position==='start'" class="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                                                                    <Icon name="ph:arrow-right" class="w-3 h-3 text-white flex-shrink-0" />
                                                                    <span class="text-xxs font-medium" style="color:white">{{ $t('dutySchedules.shiftSpan.start') }}</span>
                                                                </div>
                                                                <div v-if="shift.shift_span_position==='middle'" class="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                                                                    <Icon name="ph:arrows-horizontal" class="w-3 h-3 text-white flex-shrink-0" />
                                                                    <span class="text-xxs font-medium" style="color:white">{{ $t('dutySchedules.shiftSpan.middle') }}</span>
                                                                </div>
                                                                <div v-if="shift.shift_span_position==='end'" class="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                                                                    <Icon name="ph:arrow-left" class="w-3 h-3 text-white flex-shrink-0" />
                                                                    <span class="text-xxs font-medium" style="color:white">{{ $t('dutySchedules.shiftSpan.end') }}</span>
                                                                </div>
                                                            </div>
                                                            <div v-if="shift&&shift.citizen_schedules&&shift.citizen_schedules.length>0" class="flex flex-wrap gap-1 px-2.5 pb-1.5">
                                                                <div v-for="(cs,csIdx) in shift.citizen_schedules" :key="csIdx" class="flex items-center gap-1 bg-white rounded-full pl-0.5 pr-2 py-0.5">
                                                                    <div class="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                                        <span class="font-bold text-gray-600" style="font-size:9px">{{ (cs?.citizen?.firstname?.charAt(0)||'')+(cs?.citizen?.lastname?.charAt(0)||'') }}</span>
                                                                    </div>
                                                                    <span class="text-xxs font-semibold text-gray-700 leading-none">{{ cs?.citizen?.firstname }} {{ cs?.citizen?.lastname?.charAt(0) }}.</span>
                                                                </div>
                                                            </div>
                                                            <div class="flex flex-col gap-0.5 px-2.5 pb-1.5" v-if="shift?.departments?.length > 0">
                                                                <div v-for="(dept, dIdx) in shift.departments" :key="dIdx" class="flex items-center gap-1">
                                                                    <Icon name="ph:house" class="w-3 h-3 flex-shrink-0 text-white" />
                                                                    <span class="text-xxs font-medium" style="color:white">{{ dept.name }}</span>
                                                                </div>
                                                            </div>
                                                            <div class="flex items-center flex-wrap gap-1 px-2.5 pb-2" v-if="shift?.tags?.length > 0">
                                                                <Tooltip :text="tag&&tag.tag?tag.tag:''"
                                                                    v-for="(tag, tagIndex) in shift?.tags"
                                                                    :key="tagIndex">
                                                                    <div class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                                                                        :style="{ backgroundColor: tag&&tag.tag?tag.color:'#888', fontSize: '10px' }">
                                                                        <span v-if="tag&&tag.tag">{{ tag.tag.charAt(0) }}</span>
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                            <Tooltip v-if="shift && shift.note && shift.note.trim()"
                                                                :text="`${$t('dutySchedules.shiftNote')}: ${shift.note}`"
                                                                position="left" :wrap="true">
                                                                <div class="flex items-center gap-1 px-2.5 pb-1.5 cursor-help">
                                                                    <Icon name="ph:note" class="w-3 h-3 flex-shrink-0" style="color:white" />
                                                                    <span class="text-xxs font-medium truncate" style="color:white;max-width:120px">{{ shift.note }}</span>
                                                                </div>
                                                            </Tooltip>
                                                            <button
                                                                class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                                @click="removeShift(week, employeeIndex, weekIndex, shift, shiftIndex)"
                                                                v-if="isAdmin(userStore.getUser?.role)">
                                                                <Tooltip position="left"
                                                                    :text="$t('dutySchedules.removeSchedule.removeSchedule')">
                                                                    <Icon name="ph:x" class="h-2 w-2"
                                                                        aria-hidden="true" />
                                                                </Tooltip>
                                                            </button>
                                                        </div>
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
            <ModulesUserDutyScheduleDraftNormHoursModalGraph :isModalOpen="state.modal.isGraphOpen"
                :selectedEmployee="state.normHours.selectedEmployee" @close="state.modal.isGraphOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalVacationHours :isModalOpen="state.modal.isVacationHoursOpen"
                :selectedEmployee="state.normHours.selectedEmployeeSchedule"
                @close="state.modal.isVacationHoursOpen = false" />
            <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isDepartmentSickLeaveDateRangeOpen"
                :dateRange="state.shiftDateRange" @close="state.modal.isDepartmentSickLeaveDateRangeOpen = false"
                @filterDate="filterDutyScheduleDate" />
            <ModulesUserDutyScheduleModalNewShift :isModalOpen="state.modal.isAddShiftOpen"
                :isModalLoading="state.isModalLoading" :error="state.newShiftError"
                :selectedDate="state.newShift.selectedDate" :selectedEmployee="state.newShift.selectedEmployee"
                :shiftWarnings="state.shiftWarnings"
                @dateTimeChange="dateTimeChange"
                @close="state.modal.isAddShiftOpen = false" @saveShift="saveShift"
                @resetNewShiftError="state.newShiftError = {}" />
            <ModulesUserDutyScheduleModalEditShift :isModalOpen="state.modal.isEditShiftOpen"
                :isModalLoading="state.isModalLoading" :error="state.editShiftError"
                :selectedEmployee="state.editShift.selectedEmployee"
                :selectedEmployeeSchedule="state.editShift.selectedEmployeeSchedule"
                :shiftWarnings="state.shiftWarnings"
                @dateTimeChange="dateTimeChange"
                @close="state.modal.isEditShiftOpen = false" @resetEditShiftError="state.editShiftError = {}"
                @updateShift="updateSelectedSchedule" />
            <ModulesUserDutyScheduleDraftModalCopyMultipleWeeks
                :isModalOpen="state.modal.isCopyMultipleWeeklyScheduleOpen"
                @close="state.modal.isCopyMultipleWeeklyScheduleOpen = false"
                @refreshDutySchedules="fetchDraftDutySchedule()" />
            <ModulesUserDutyScheduleExtraHoursModalView :isModalOpen="state.modal.isManageExtraHoursOpen"
                :selectedEmployee="state.manageExtraHours.selectedEmployee"
                @close="state.modal.isManageExtraHoursOpen = false" @refreshDutySchedules="fetchDraftDutySchedule()" />
            <ModulesUserDutyScheduleDraftScheduleSlotsModalScheduleSlots :isModalOpen="state.modal.isManageScheduleSlotOpen"
                :selectedDay="state.manageScheduleSlot.selectedDay"
                @close="state.modal.isManageScheduleSlotOpen = false" @refreshDutySchedules="fetchDraftDutySchedule()" />
        </LoadingSpinner>
    </div>
</template>


<script setup lang="ts">
const emit = defineEmits(['openPresets', 'openSavePreset', 'bannerClosed'])
import moment from 'moment'
import { draftScheduleService } from '@/components/api/user/DraftScheduleService'
import { useDepartmentStore } from '@/store/department'
import { useDraftDutyScheduleStore } from '@/store/draft-duty-schedule'
import { useUserStore } from '@/store/user'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const language = useI18n()
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore()
const draftDutyScheduleStore = useDraftDutyScheduleStore() as any
const { formatNumber } = useNumberFormatter()
const currentDate = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))
const expandedRecords = reactive([] as boolean[])

const teleportReady = ref(false)
let _dragShift: any = null
let _dragSourceEmployee: any = null
let _dragSourceWeekIndex: any = null
onMounted(() => {
    // Global dragover preventDefault for at aktivere drop
    const handleDragOver = (e: DragEvent) => {
        if (state.isDragging) e.preventDefault()
    }
    document.addEventListener('dragover', handleDragOver)
    onUnmounted(() => document.removeEventListener('dragover', handleDragOver))
    nextTick(() => { teleportReady.value = true })
})

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
    hideBanner: typeof localStorage !== 'undefined' ? localStorage.getItem('draftBannerHidden') === 'true' : false,
    showWorkingToday: false,
    isDragging: false,
    dragSuccessMessage: '',
    dataFilter: {
        search: ''
    },
    editShiftError: {} as Error,
    filter: {
        department_uuids: [],
        employment_status: [],
        employee_uuids: [],
    },
    editShift: {
        selectedEmployee: {},
        selectedEmployeeSchedule: {},
    } as any,
    error: {} as Error,
    errorUpdateShift: {} as Error,
    isPageLoading: false,
    isModalLoading: false,
    manageExtraHours: {
        selectedEmployee: {},
    },
    manageScheduleSlot: {
        selectedDay: [],
    } as any,
    modal: {
        isAddShiftOpen: false,
        isFilterDutyScheduleOpen: false,
        isCompensatoryHoursOpen: false,
        isCopyMultipleWeeklyScheduleOpen: false,
        isDepartmentSickLeaveDateRangeOpen: false,
        isEditShiftOpen: false,
        isGraphOpen: false,
        isManageExtraHoursOpen: false,
        isManageScheduleSlotOpen: false,
        isPublishDraftOpen: false,
        isVacationHoursOpen: false,
        isAnnualNormHoursInfoOpen: false,
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
    selectedDate: moment().format('YYYY-MM-DD'),
    showAllShifts: false,
    showAllShiftTypes: false,
    showWarningDialog: false,
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
    isRemoveShift: false,
    isUpdateShift: false,
    originalWeeklySchedules: [] as any,
    weeklySchedules: [] as any,
    shiftWarnings: [] as any,
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

watch(() => draftDutyScheduleStore.getShowEmployeesWorkingToday, (status: boolean) => {
    draftDutyScheduleStore.setShowEmployeesWorkingToday(status)
    fetchDraftDutySchedule()
})

onMounted(() => {
    fetchDraftDutySchedule()
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

function filterDutyScheduleDate(formDateRange: any) {
    state.shiftDateRange.formDateRange.start_date = formDateRange?.[0]
    state.shiftDateRange.formDateRange.end_date = formDateRange?.[1]
    fetchDraftDutySchedule()
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
    return shifts?.find((shift: any) => {
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
        const response = await draftScheduleService.getDraftDutyScheduleAbsencePercentage(params)
        if (response) {
            state.shiftPercentage = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchDraftDutySchedule() {
    state.error = {}
    // state.weeklySchedules = []
    // state.originalWeeklySchedules = []
    // state.isPageLoading = true
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
            page: draftDutyScheduleStore.getCurrentPageNumber,
            page_length: draftDutyScheduleStore.getCurrentPageLength,
            date_start: startOfWeekFormatted,
            date_end: endOfWeekFormatted,
            filter_date_start: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            filter_date_end: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
            show_employees_working_today: state.showWorkingToday ? 'true' : 'false',
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
        const response = await draftScheduleService.getDraftDutySchedules(params)
        if (response) {
            state.weeklySchedules = response
            state.originalWeeklySchedules = JSON.parse(JSON.stringify(response?.data))
            fetchDutySchedulePercentage()
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
    // Update the expanded records only if the number of records changes.
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

function openManageScheduleSlotModal(day: any) {
    state.manageScheduleSlot.selectedDay = day
    state.modal.isManageScheduleSlotOpen = true
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

function onDragStart(e: DragEvent, emp: any, wi: any, sh: any) {
    if (!isAdmin(userStore.getUser?.role)) { e.preventDefault(); return }
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
    if (t) { t.style.outline = "2px dashed #2dbab2"; t.style.background = "rgba(45,186,178,0.08)"; t.classList.add("drag-over-cell") }
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
    // Find dato fra weekDays computed array (virker uanset om medarbejder har vagter)
    // Hent dato fra weekDays computed (primær) eller DOM data-attribut (fallback)
    const weekDaysOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
    const dayIdx = weekDaysOrder.indexOf(String(tWi))
    const fromWeekDays = weekDays.value?.[dayIdx]?.fullDate?.format('YYYY-MM-DD')
    const fromWeeks = tEmp?.weeks?.[tWi]?.date
    const fromDOM = (e.currentTarget as HTMLElement)?.dataset?.date
    const td = fromWeekDays || fromWeeks || fromDOM
    if (!td) return
    state.isDragging = false; _dragShift = null; _dragSourceEmployee = null; _dragSourceWeekIndex = null
    try {
        await draftScheduleService.updateDraftDutySchedule(sh.schedule_uuid, {
            date: td,
            user_uuid: tEmp.uuid,
            date_time_start: moment(td).set({ hour: moment(sh.date_time_start).hour(), minute: moment(sh.date_time_start).minute(), second: 0 }).format('YYYY-MM-DD HH:mm:ss'),
            date_time_end: moment(td).clone().set({ hour: moment(sh.date_time_end).hour(), minute: moment(sh.date_time_end).minute(), second: 0 }).format('YYYY-MM-DD HH:mm:ss'),
            time_in: moment(sh.date_time_start).format('HH:mm'),
            time_out: moment(sh.date_time_end).format('HH:mm'),
            shift_type_uuid: sh?.type?.uuid,
        })
        await fetchDraftDutySchedule()
    } catch (err: any) { state.error = err }
}


async function pinSelfToTopOfSchedule() {
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await draftScheduleService.pinSelfToTopOfSchedule()
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDraftDutySchedule()
            userStore.setUserIsDraftSchedulePinned(!userStore.getUser?.is_draft_schedule_pinned)
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
        const response = await draftScheduleService.saveDraftDutySchedule(params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDraftDutySchedule()
            state.modal.isAddShiftOpen = false
        }
    } catch (error: any) {
        state.newShiftError = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    } finally {
        setTimeout(() => {
            state.isModalLoading = false
        }, 300)
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
        const response = await draftScheduleService.saveDraftDutySchedule(params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDraftDutySchedule()
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
    return state.copy.selectedEmployeeWeeklySchedule?.uuid === weeklySchedule?.uuid
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
        const response = await draftScheduleService.copyEmployeeWeeklyDraftDutySchedule(params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDraftDutySchedule()
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
        const response = await draftScheduleService.saveDraftDutySchedule(params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDraftDutySchedule()
        }
    } catch (error: any) {
        state.error = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    }
}

async function removeShift(week: any, employeeIndex: number, weekIndex: number, shift: any, shiftIndex: number) {
    state.isRemoveShift = true
    const scheduleUuid = shift.schedule_uuid
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await draftScheduleService.deleteDraftDutySchedule(scheduleUuid)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            identifyTheProgressPercentage()
            fetchDraftDutySchedule()
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
            is_recurring: shift?.is_recurring,
        },
        user_uuid: userUuid,
        date: date,
        shift_type: shift?.type,
        tags: shift?.tags,
        departments: shift?.departments,
        note: shift?.note,
        do_not_count_sick_leave: shift?.do_not_count_sick_leave,
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
    }
    updateDutySchedule(scheduleUuid, params, employeeIndex, weekIndex, shiftIndex)
}

async function updateDutySchedule(scheduleUuid: any, params: object, employeeIndex: number, weekIndex: any, shiftIndex: number) {
    state.isModalLoading = true
    state.isUpdateShift = true
    let errorUpdateShift = {}
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await draftScheduleService.updateDraftDutySchedule(scheduleUuid, params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
            state.modal.isEditShiftOpen = false
            identifyTheProgressPercentage()
            fetchDraftDutySchedule()
        }
    } catch (error: any) {
        errorUpdateShift = error
        state.progress.totalRequests = state.progress.totalRequests - 1
        state.progress.pendingRequests = state.progress.pendingRequests - 1
        identifyTheProgressPercentage()
    } finally {
        state.errorUpdateShift = errorUpdateShift
        state.isUpdateShift = false
        fetchDraftDutySchedule()
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
const headerHeight = 305  // The height of the header

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
        const response = await draftScheduleService.scheduleValidation(params)
        if (response.data && !response.data.valid) {
            state.shiftWarnings = response.data.warnings
        }
    } catch (error: any) {

    }
}

function closeWarningDialog() {
    state.showWarningDialog = false
    state.shiftWarnings = []
}

function viewExtraHours(employee: any) {
    state.manageExtraHours.selectedEmployee = employee
    state.modal.isManageExtraHoursOpen = true
}

function openGraphModal(employee: any) {
    state.normHours.selectedEmployee = employee
    state.modal.isGraphOpen = true
}

function setFilter(filter: any) {
    state.filter.department_uuids = filter.department_uuids
    state.filter.employment_status = filter.employment_status
    state.filter.employee_uuids = filter.employee_uuids
    fetchDraftDutySchedule()
}
</script>
