<template>
    <div class="space-y-5">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <!-- <div class="flex justify-end">
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isDownloadOpen = true">
                    <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('dutySchedules.download.download') }}
                </FormButton>
            </div> -->
            <div class="flex h-full flex-col">
                <header class="flex flex-none items-center justify-between py-4">
                    <div>
                        <p>{{ $t('dutySchedules.typeofShifts') }}:</p>
                        <div class="grid grid-cols-2 gap-x-4">
                            <div class="col-span-2 flex items-center gap-x-2">
                                <div class="w-3 h-3 rounded-sm bg-shifts-regular"></div>
                                <span>{{ $t('dutySchedules.shifts.regularShift') }}</span>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <div class="w-3 h-3 rounded-sm bg-shifts-awake_night"></div>
                                <span>{{ $t('dutySchedules.shifts.awakeNightShift') }}</span>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <div class="w-3 h-3 rounded-sm bg-shifts-sleeping_night"></div>
                                <span>{{ $t('dutySchedules.shifts.sleepingNightShift') }}</span>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <div class="w-3 h-3 rounded-sm bg-shifts-vacation"></div>
                                <span>{{ $t('dutySchedules.shifts.vacationLeave') }}</span>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <div class="w-3 h-3 rounded-sm bg-shifts-sickleave"></div>
                                <span>{{ $t('dutySchedules.shifts.sickLeave') }}</span>
                            </div>
                        </div>
                    </div>
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
                    <div class="flex items-center">
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
                <div class="isolate flex flex-auto flex-col overflow-auto bg-white">
                    <div style="width: 165%" class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                        <div class="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5">
                            <div class="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                                <button v-for="day in weekDays" :key="day.date" type="button"
                                    class="flex flex-col items-center pb-3 pt-2" @click="setSelectedDay(day)">
                                    <span v-if="day.longName === 'Mon'">
                                        {{ $t('calendar.week.oneLetter.Monday') }}
                                    </span>
                                    <span v-if="day.longName === 'Tue'">
                                        {{ $t('calendar.week.oneLetter.Tuesday') }}
                                    </span>
                                    <span v-if="day.longName === 'Wed'">
                                        {{ $t('calendar.week.oneLetter.Wednesday') }}
                                    </span>
                                    <span v-if="day.longName === 'Thu'">
                                        {{ $t('calendar.week.oneLetter.Thursday') }}
                                    </span>
                                    <span v-if="day.longName === 'Fri'">
                                        {{ $t('calendar.week.oneLetter.Friday') }}
                                    </span>
                                    <span v-if="day.longName === 'Sat'">
                                        {{ $t('calendar.week.oneLetter.Saturday') }}
                                    </span>
                                    <span v-if="day.longName === 'Sun'">
                                        {{ $t('calendar.week.oneLetter.Sunday') }}
                                    </span>
                                    <span
                                        :class="moment(selectedDay).format('YYYY-MM-DD') === moment(day.fullDate).format('YYYY-MM-DD') ? 'mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-tertiary font-semibold text-white' : 'mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900'">
                                        {{ day.date }}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div>
                                <div class="shadow grid grid-cols-9">
                                    <div class="col-span-2 border-0.5">
                                        <div class="flex items-center px-3 py-4 border-0.5">
                                            <p class="text-sm font-medium">
                                                {{ $t('dutySchedules.week') }} {{ weekNumber }}
                                            </p>
                                            <div class="flex-1 flex justify-end"
                                                v-if="isAdmin(userStore.getUser?.roles)">
                                                <button
                                                    class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                    @click="copyWeeklySchedule(weekNumber)">
                                                    <Icon name="mdi:content-copy" class="h-3 w-3" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-for="day in weekDays" :key="day.date" :class="[
                                        isAdmin(userStore.getUser?.roles) && 'cursor-pointer hover:bg-gray-200',
                                        'flex items-center justify-center py-4 border-0.5'
                                    ]" @click="isAdmin(userStore.getUser?.roles) && openManageScheduleSlotModal(day)">
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
                                    <div v-for="(weeklySchedule, weeklyScheduleIndex) in state.weeklySchedules"
                                        :key="weeklyScheduleIndex" class="grid grid-cols-9"
                                        v-if="!isWeeklyScheduleCopied(weekNumber)">
                                        <div class="p-3 col-span-2 space-y-2 border-0.5">
                                            <div>
                                                <p class="text-sm font-medium">
                                                    {{ weeklySchedule?.employee?.firstname }}
                                                    {{ weeklySchedule?.employee?.lastname }}
                                                </p>
                                            </div>
                                            <div class="text-xs grid grid-cols-7">
                                                <div class="col-span-3 space-y-2" />
                                                <div class="col-span-2 flex gap-2 flex-col items-end">
                                                    <p class="text-xxs py-2">
                                                        {{ $t('dutySchedules.week') }}
                                                    </p>
                                                </div>
                                                <div
                                                    class="col-span-2 flex gap-2 flex-col items-end border-l-2 border-gray-200 ml-3">
                                                    <p class="text-xxs py-2">
                                                        {{ $t('dutySchedules.yearToDate') }}
                                                    </p>
                                                </div>
                                                <div class="col-span-3 space-y-2">
                                                    <p>{{ $t('dutySchedules.table.timer') }}</p>
                                                    <p>{{ $t('dutySchedules.table.holidayHours') }}</p>
                                                    <p>{{ $t('dutySchedules.table.awakeNightShiftHours') }}</p>
                                                    <p>{{ $t('dutySchedules.table.sleepingNightShiftHours') }}</p>
                                                    <p>{{ $t('dutySchedules.table.sickLeaveHours') }}</p>
                                                </div>
                                                <div class="col-span-2 flex gap-2 flex-col items-end">
                                                    <p>
                                                        {{ weeklySchedule?.employee?.total_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.holiday_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.awake_night_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.sleep_night_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.sick_hours ?? 0 }}
                                                    </p>
                                                </div>
                                                <div
                                                    class="col-span-2 flex gap-2 flex-col items-end border-l-2 border-gray-200 ml-3">
                                                    <p>
                                                        {{ weeklySchedule?.employee?.yearly_total_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.yearly_holiday_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.yearly_awake_night_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.yearly_sleep_night_hours ?? 0 }}
                                                    </p>
                                                    <p>
                                                        {{ weeklySchedule?.employee?.yearly_sick_hours ?? 0 }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="p-3 border-0.5" v-for="(week, weekIndex) in weeklySchedule?.weeks"
                                            :key="weekIndex" :class="[
                                                isScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && 'border-1.5 border-dashed border-gray-700',
                                                !isScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && !isScheduleCopiedEmpty() && 'cursor-copy relative group'
                                            ]"
                                            @click="!isScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && !isScheduleCopiedEmpty() && pasteEmployeeSchedule(weeklyScheduleIndex, weekIndex)">
                                            <div class="space-y-2"
                                                v-if="!isScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber)">
                                                <div class="flex justify-end gap-2"
                                                    v-if="isAdmin(userStore.getUser?.roles)">
                                                    <button
                                                        class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                        @click="copyEmployeeSchedule(weeklyScheduleIndex, weekIndex, weeklySchedule, weekNumber)">
                                                        <Icon name="mdi:content-copy" class="h-3 w-3"
                                                            aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200"
                                                        @click="openAddNewShiftModal(weeklyScheduleIndex, weekIndex, week)">
                                                        +
                                                    </button>
                                                </div>
                                                <div class="space-y-2 text-xs">
                                                    <div class="bg-shifts-regular rounded-md p-1 relative"
                                                        v-if="week?.shifts.find((shift: any) => shift.name === 'regular_shift')">
                                                        <div class="flex">
                                                            <FormTimeFieldTransparent name="time_in"
                                                                class="rounded-tl-md rounded-bl-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'regular_shift')?.time_in"
                                                                @change="(event: any) => changeShiftTimeIn(event, weeklyScheduleIndex, weekIndex, 'regular_shift')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                            <FormTimeFieldTransparent name="time_out"
                                                                class="rounded-tr-md rounded-br-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'regular_shift')?.time_out"
                                                                @change="(event: any) => changeShiftTimeOut(event, weeklyScheduleIndex, weekIndex, 'regular_shift')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                        </div>
                                                        <button
                                                            class="bg-gray-800 text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center absolute -left-1 -top-1"
                                                            v-if="week?.shifts.find((shift: any) => shift.name === 'regular_shift')?.in_meeting">
                                                            M
                                                        </button>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            @click="removeShift(week, weeklyScheduleIndex, weekIndex, 'regular_shift')"
                                                            v-if="isAdmin(userStore.getUser?.roles)">
                                                            <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="bg-shifts-awake_night rounded-md p-1 relative"
                                                        v-if="week?.shifts.find((shift: any) => shift.name === 'awake_night_shift')">
                                                        <div class="flex">
                                                            <FormTimeFieldTransparent name="time_in"
                                                                class="rounded-tl-md rounded-bl-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'awake_night_shift')?.time_in"
                                                                @change="(event: any) => changeShiftTimeIn(event, weeklyScheduleIndex, weekIndex, 'awake_night_shift')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                            <FormTimeFieldTransparent name="time_out"
                                                                class="rounded-tr-md rounded-br-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'awake_night_shift')?.time_out"
                                                                @change="(event: any) => changeShiftTimeOut(event, weeklyScheduleIndex, weekIndex, 'awake_night_shift')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                        </div>
                                                        <button
                                                            class="bg-gray-800 text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center absolute -left-1 -top-1"
                                                            v-if="week?.shifts.find((shift: any) => shift.name === 'awake_night_shift')?.in_meeting">
                                                            M
                                                        </button>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            @click="removeShift(week, weeklyScheduleIndex, weekIndex, 'awake_night_shift')"
                                                            v-if="isAdmin(userStore.getUser?.roles)">
                                                            <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="bg-shifts-sleeping_night rounded-md p-1 relative"
                                                        v-if="week?.shifts.find((shift: any) => shift.name === 'sleeping_night_shift')">
                                                        <div class="flex">
                                                            <FormTimeFieldTransparent name="time_in"
                                                                class="rounded-tl-md rounded-bl-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'sleeping_night_shift')?.time_in"
                                                                @change="(event: any) => changeShiftTimeIn(event, weeklyScheduleIndex, weekIndex, 'sleeping_night_shift')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                            <FormTimeFieldTransparent name="time_out"
                                                                class="rounded-tr-md rounded-br-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'sleeping_night_shift')?.time_out"
                                                                @change="(event: any) => changeShiftTimeOut(event, weeklyScheduleIndex, weekIndex, 'sleeping_night_shift')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                        </div>
                                                        <button
                                                            class="bg-gray-800 text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center absolute -left-1 -top-1"
                                                            v-if="week?.shifts.find((shift: any) => shift.name === 'sleeping_night_shift')?.in_meeting">
                                                            M
                                                        </button>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            @click="removeShift(week, weeklyScheduleIndex, weekIndex, 'sleeping_night_shift')"
                                                            v-if="isAdmin(userStore.getUser?.roles)">
                                                            <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="bg-shifts-vacation rounded-md p-1 relative"
                                                        v-if="week?.shifts.find((shift: any) => shift.name === 'vacation_leave')">
                                                        <div class="flex">
                                                            <FormTimeFieldTransparent name="time_in"
                                                                class="rounded-tl-md rounded-bl-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'vacation_leave')?.time_in"
                                                                @change="(event: any) => changeShiftTimeIn(event, weeklyScheduleIndex, weekIndex, 'vacation_leave')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                            <FormTimeFieldTransparent name="time_out"
                                                                class="rounded-tr-md rounded-br-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'vacation_leave')?.time_out"
                                                                @change="(event: any) => changeShiftTimeOut(event, weeklyScheduleIndex, weekIndex, 'vacation_leave')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                        </div>
                                                        <button
                                                            class="bg-gray-800 text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center absolute -left-1 -top-1"
                                                            v-if="week?.shifts.find((shift: any) => shift.name === 'vacation_leave')?.in_meeting">
                                                            M
                                                        </button>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            @click="removeShift(week, weeklyScheduleIndex, weekIndex, 'vacation_leave')"
                                                            v-if="isAdmin(userStore.getUser?.roles)">
                                                            <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="bg-shifts-sickleave rounded-md p-1 relative"
                                                        v-if="week?.shifts.find((shift: any) => shift.name === 'sick_leave')">
                                                        <div class="flex">
                                                            <FormTimeFieldTransparent name="time_in"
                                                                class="rounded-tl-md rounded-bl-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'sick_leave')?.time_in"
                                                                @change="(event: any) => changeShiftTimeIn(event, weeklyScheduleIndex, weekIndex, 'sick_leave')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                            <FormTimeFieldTransparent name="time_out"
                                                                class="rounded-tr-md rounded-br-md"
                                                                :value="week?.shifts.find((shift: any) => shift.name === 'sick_leave')?.time_out"
                                                                @change="(event: any) => changeShiftTimeOut(event, weeklyScheduleIndex, weekIndex, 'sick_leave')"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                        </div>
                                                        <button
                                                            class="bg-gray-800 text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center absolute -left-1 -top-1"
                                                            v-if="week?.shifts.find((shift: any) => shift.name === 'sick_leave')?.in_meeting">
                                                            M
                                                        </button>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            @click="removeShift(week, weeklyScheduleIndex, weekIndex, 'sick_leave')"
                                                            v-if="isAdmin(userStore.getUser?.roles)">
                                                            <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <ModulesDutyScheduleScheduleSlotsRequestAvailableSlots :week="week"
                                                        :employee="weeklySchedule?.employee"
                                                        @error="(error: any) => state.error = error" />
                                                </div>
                                            </div>
                                            <div class="flex flex-col items-center space-y-2 mt-3 cursor-pointer" v-else
                                                @click="stopCopying()">
                                                <p class="text-center text-sm">
                                                    {{ $t('dutySchedules.copyPaste.stopCopying') }}
                                                </p>
                                                <p class="text-center text-xxs">
                                                    {{ $t('dutySchedules.copyPaste.clickHereToStopCopyingTheSchedule')
                                                    }}
                                                </p>
                                            </div>
                                            <div class="absolute inset-0 bg-primary bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                v-if="!isScheduleCopied(weeklyScheduleIndex, weekIndex, weekNumber) && !isScheduleCopiedEmpty()">
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
            <ModulesDutyScheduleModalDownload :isModalOpen="state.modal.isDownloadOpen"
                @close="state.modal.isDownloadOpen = false" />
            <ModulesDutyScheduleModalNewShift :isModalOpen="state.modal.isAddShiftOpen"
                @close="state.modal.isAddShiftOpen = false" @saveShift="saveShift" />
            <ModulesDutyScheduleScheduleSlotsModalScheduleSlots :isModalOpen="state.modal.isManageScheduleSlotOpen"
                :selectedDay="state.manageScheduleSlot.selectedDay"
                @close="state.modal.isManageScheduleSlotOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
        </LoadingSpinner>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/DutyScheduleService'
import type { Error } from '@/types'
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
const currentDate = ref(moment())
const selectedDay = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))

const state = reactive({
    addShift: {
        selectedEmployeeSchedules: {}
    } as any,
    copy: {
        allEmployeeSchedules: {},
        selectedEmployeeSchedules: {}
    } as any,
    employees: [] as any,
    error: {} as Error,
    isPageLoading: false,
    manageScheduleSlot: {
        selectedDay: [],
    },
    modal: {
        isAddShiftOpen: false,
        isDownloadOpen: false,
        isManageScheduleSlotOpen: false,
    } as any,
    progress: {
        percentage: 100,
        pendingRequests: 0,
        showProgressBar: false,
        totalRequests: 0,
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

onMounted(() => {
    fetchDutySchedule()
})

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

async function fetchDutySchedule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const dateMoment = moment(currentDate.value)
        const startOfWeek = dateMoment.clone().startOf('isoWeek')
        const endOfWeek = dateMoment.clone().endOf('isoWeek')
        const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
        const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
        const params = {
            date_start: startOfWeekFormatted,
            date_end: endOfWeekFormatted
        }
        const response = await dutyScheduleService.getDutySchedules(params)
        if (response) {
            state.weeklySchedules = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previousWeek() {
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    fetchDutySchedule()
}

function setToday() {
    currentDate.value = moment()
    fetchDutySchedule()
}

function nextWeek() {
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

function openAddNewShiftModal(weeklyScheduleIndex: number, weekIndex: any, week: any) {
    state.modal.isAddShiftOpen = true
    state.addShift.selectedEmployeeSchedules = {
        weeklyScheduleIndex: weeklyScheduleIndex,
        weekIndex: weekIndex,
        ...week
    }
}

function openManageScheduleSlotModal(day: any) {
    state.manageScheduleSlot.selectedDay = day
    state.modal.isManageScheduleSlotOpen = true
}

async function saveShift(shiftDetails: any) {
    const weeklyScheduleIndex = state.addShift.selectedEmployeeSchedules.weeklyScheduleIndex
    const weekIndex = state.addShift.selectedEmployeeSchedules.weekIndex
    const shiftType = shiftDetails.shift_type
    // Check if shift already existed
    if (!(state.weeklySchedules[state.addShift.selectedEmployeeSchedules.weeklyScheduleIndex].weeks[state.addShift.selectedEmployeeSchedules.weekIndex].shifts.find((shift: any) => shift.name === shiftDetails.shift_type))) {
        const params = {
            shift_type: shiftType,
            date: state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date,
            time_in: '08:00',
            time_out: '17:00',
            user_uuid: state.weeklySchedules[weeklyScheduleIndex].employee.uuid,
            in_meeting: shiftDetails.in_meeting,
        }
        saveDutySchedule(params, weeklyScheduleIndex, weekIndex, 'new_shift')
    }
}

async function saveDutySchedule(params: object, weeklyScheduleIndex: number, weekIndex: any, action: string) {
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
            // if (action === 'new_shift') {
            //     state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts.push({
            //         name: response?.data?.shift_type,
            //         time_in: response?.data?.time_in,
            //         time_out: response?.data?.time_out,
            //         schedule_uuid: response?.data?.uuid,
            //     })
            // } else if (action === 'paste_shifts') {
            //     state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts = []
            //     response?.data.forEach((shift: any) => {
            //         state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts.push({
            //             name: shift?.shift_type,
            //             time_in: shift?.time_in,
            //             time_out: shift?.time_out,
            //             schedule_uuid: shift?.uuid,
            //         })
            //     })
            // }
        }
    } catch (error: any) {
        state.error = error
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

function isScheduleCopiedEmpty() {
    return Object.keys(state.copy.selectedEmployeeSchedules).length === 0
}

function isScheduleCopied(weeklyScheduleIndex: number, weekIndex: number, weekNumber: number) {
    return state.copy.selectedEmployeeSchedules.weeklyScheduleIndex === weeklyScheduleIndex && state.copy.selectedEmployeeSchedules.weekIndex === weekIndex && state.copy.selectedEmployeeSchedules.weekNumber === weekNumber
}

function copyEmployeeSchedule(weeklyScheduleIndex: number, weekIndex: any, weeklySchedule: any, weekNumber: number) {
    state.copy.selectedEmployeeSchedules = {
        weeklyScheduleIndex: weeklyScheduleIndex,
        weekNumber: weekNumber,
        weekIndex: weekIndex,
        weeklySchedule: weeklySchedule,
    }
}

function stopCopying() {
    state.copy.allEmployeeSchedules = {}
    state.copy.selectedEmployeeSchedules = {}
}

async function pasteEmployeeSchedule(weeklyScheduleIndex: number, weekIndex: number) {
    const copiedSelectedEmployeeSchedule = state.copy.selectedEmployeeSchedules
    const copiedWeekIndex = copiedSelectedEmployeeSchedule.weekIndex
    const shiftsToPaste = copiedSelectedEmployeeSchedule.weeklySchedule.weeks[copiedWeekIndex].shifts

    // Create a deep copy of the shifts to paste
    const copiedShifts = shiftsToPaste.map((shift: any) => ({ ...shift }))

    state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts = copiedShifts

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
    saveDutySchedule(params, weeklyScheduleIndex, weekIndex, 'paste_shifts')
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

async function removeShift(week: any, weeklyScheduleIndex: number, weekIndex: number, shiftType: any) {
    const scheduleUuid = week.shifts.find((shift: any) => shift.name === shiftType).schedule_uuid
    const shiftIndexToRemove = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts.findIndex((shift: any) => shift.name === shiftType)
    state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts.splice(shiftIndexToRemove, 1)
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

function changeShiftTimeIn(event: any, weeklyScheduleIndex: number, weekIndex: any, shiftType: string) {
    if (!isScheduleCopiedEmpty() || !isAllWeeklyScheduleCopiedEmpty()) return

    const timeIn = event.target.value
    const shiftTimeIndexToReplace = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts.findIndex((shift: any) => shift.name === shiftType)
    state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftTimeIndexToReplace].time_in = timeIn
    const timeOut = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftTimeIndexToReplace].time_out
    const scheduleUuid = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftTimeIndexToReplace].schedule_uuid
    const date = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules[weeklyScheduleIndex].employee.uuid
    const params = {
        time_in: timeIn,
        time_out: timeOut,
        user_uuid: userUuid,
        date: date,
        shift_type: shiftType,
    }
    updateDutySchedule(scheduleUuid, params)
}

function changeShiftTimeOut(event: any, weeklyScheduleIndex: number, weekIndex: any, shiftType: string) {
    if (!isScheduleCopiedEmpty() || !isAllWeeklyScheduleCopiedEmpty()) return

    const timeOut = event.target.value
    const shiftTimeIndexToReplace = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts.findIndex((shift: any) => shift.name === shiftType)
    state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftTimeIndexToReplace].time_out = timeOut
    const timeIn = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftTimeIndexToReplace].time_in
    const scheduleUuid = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftTimeIndexToReplace].schedule_uuid
    const date = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules[weeklyScheduleIndex].employee.uuid
    const params = {
        time_in: timeIn,
        time_out: timeOut,
        user_uuid: userUuid,
        date: date,
        shift_type: shiftType,
    }
    updateDutySchedule(scheduleUuid, params)
}

async function updateDutySchedule(scheduleUuid: any, params: object) {
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await dutyScheduleService.updateDutySchedule(scheduleUuid, params)
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
</script>
