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
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isPublishScheduleOpen = true">
                    <Icon name="ph:check" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('dutySchedules.draft.publish') }}
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
                        <!-- <div class="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5">
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
                        </div> -->
                        <div>
                            <div>
                                <div class="shadow grid grid-cols-9">
                                    <div class="col-span-2 border-0.5">
                                        <div class="flex items-center gap-x-3 px-3 py-4 border-0.5">
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
                                    </div>
                                    <Tooltip :text="$t('dutySchedules.scheduleSlots.scheduleSlots')"
                                        v-for="day in weekDays" :key="day.date"
                                        class="cursor-pointer hover:bg-gray-200 flex items-center justify-center py-4 border-0.5"
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
                                            <div class="relative">
                                                <div class="flex items-center gap-x-2">
                                                    <img :src="weeklySchedule?.employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${weeklySchedule?.employee?.firstname + ' ' + weeklySchedule?.employee?.lastname}`"
                                                        class="h-8 w-8 rounded-full bg-gray-50 object-cover" />
                                                    <p class="text-sm font-medium">
                                                        {{ weeklySchedule?.employee?.firstname }}
                                                        {{ weeklySchedule?.employee?.lastname }}
                                                    </p>
                                                </div>
                                                <button
                                                    class="absolute left-10 top-7 text-xxs text-primary hover:text-primary-700"
                                                    @click="navigateTo(`/calendar?employee_uuid=${weeklySchedule?.employee?.uuid}`)">
                                                    {{ $t('dutySchedules.viewCalendar') }}
                                                </button>
                                            </div>
                                            <div class="text-xs grid grid-cols-7">
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
                                                    class="col-span-2 flex gap-2 flex-col items-end border-l-2 border-gray-200 ml-3">
                                                    <p class="text-xxs py-2">
                                                        {{ $t('dutySchedules.yearToDate') }}
                                                    </p>
                                                </div>
                                                <div :class="[
                                                    expandedRecords[weeklyScheduleIndex] && 'max-h-[2.5rem] overflow-hidden',
                                                    'col-span-7 grid grid-cols-7'
                                                ]">
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
                                                        class="col-span-2 flex gap-2 flex-col items-end border-l-2 border-gray-200 ml-3">
                                                        <p v-for="(time, timeIndex) in weeklySchedule?.employee?.hours"
                                                            :key="timeIndex">
                                                            {{ time?.yearly_hours }}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="col-span-7 flex justify-start mt-1">
                                                    <button @click="toggleExpanded(weeklyScheduleIndex)"
                                                        class="text-primary text-xs hover:text-primary-700">
                                                        {{ !expandedRecords[weeklyScheduleIndex] ?
                                                            $t('showLess') :
                                                            $t('showMore') }}
                                                    </button>
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
                                                    <Tooltip :text="$t('dutySchedules.copy.copy')">
                                                        <button
                                                            class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                                            @click="copyEmployeeSchedule(weeklyScheduleIndex, weekIndex, weeklySchedule, weekNumber)">
                                                            <Icon name="mdi:content-copy" class="h-3 w-3"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip :text="$t('dutySchedules.newSchedule')">
                                                        <button
                                                            class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200"
                                                            @click="openAddNewShiftModal(weeklyScheduleIndex, weekIndex, week)">
                                                            +
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                                <div class="text-xs">
                                                    <div v-for="(shift, shiftIndex) in sortMultiDayShiftsFirst(week?.shifts)"
                                                        :key="shiftIndex" class="rounded-md p-1 relative" :style="{
                                                            backgroundColor: `${shift?.type?.color}`,
                                                            width: `${calculateShiftWidth(shift, weekIndex.toString())}`,
                                                            marginTop: `${calculateMarginTop(weeklySchedule?.weeks, weekIndex.toString(), shiftIndex)}rem`
                                                        }">
                                                        <div class="flex">
                                                            <FormTimeFieldTransparent name="time_in"
                                                                class="rounded-tl-md rounded-bl-md"
                                                                :class="isAdmin(userStore.getUser?.roles) ? 'cursor-pointer' : 'cursor-not-allowed'"
                                                                :value="moment(shift?.date_time_start).format('HH:mm')"
                                                                @change="(event: any) => changeShiftTimeIn(event, weeklyScheduleIndex, weekIndex, shift, shiftIndex)"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                            <FormTimeFieldTransparent name="time_out"
                                                                class="rounded-tr-md rounded-br-md"
                                                                :class="isAdmin(userStore.getUser?.roles) ? 'cursor-pointer' : 'cursor-not-allowed'"
                                                                :value="moment(shift?.date_time_end).format('HH:mm')"
                                                                @change="(event: any) => changeShiftTimeOut(event, weeklyScheduleIndex, weekIndex, shift, shiftIndex)"
                                                                :disabled="!isAdmin(userStore.getUser?.roles)" />
                                                        </div>
                                                        <button
                                                            class="bg-gray-800 text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center absolute -left-1 -top-1"
                                                            v-if="shift?.in_meeting">
                                                            M
                                                        </button>
                                                        <button
                                                            class="bg-gray-200 w-4 h-4 text-sm text-gray-600 rounded-full flex items-center justify-center absolute -right-1 -top-1"
                                                            @click="removeShift(week, weeklyScheduleIndex, weekIndex, shift, shiftIndex)"
                                                            v-if="isAdmin(userStore.getUser?.roles)">
                                                            <Tooltip :text="$t('dutySchedules.removeSchedule')">
                                                                <Icon name="ph:x" class="h-2 w-2" aria-hidden="true" />
                                                            </Tooltip>
                                                        </button>
                                                    </div>
                                                    <ModulesUserDutyScheduleScheduleSlotsRequestAvailableSlots
                                                        :week="week" :employee="weeklySchedule?.employee"
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
            <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isDepartmentSickLeaveDateRangeOpen"
                :dateRange="state.shiftDateRange" @close="state.modal.isDepartmentSickLeaveDateRangeOpen = false"
                @filterDate="filterDutyScheduleDate" />
            <ModulesUserDutyScheduleModalNewShift :isModalOpen="state.modal.isAddShiftOpen" :error="state.newShiftError"
                :selectedDate="state.newShift.selectedDate" @close="state.modal.isAddShiftOpen = false"
                @saveShift="saveShift" @resetNewShiftError="state.newShiftError = {}" />
            <ModulesUserDutyScheduleScheduleSlotsModalScheduleSlots :isModalOpen="state.modal.isManageScheduleSlotOpen"
                :selectedDay="state.manageScheduleSlot.selectedDay"
                @close="state.modal.isManageScheduleSlotOpen = false" @refreshDutySchedules="fetchDutySchedule()" />
            <ModulesUserDutyScheduleDraftModalCopyMultipleWeeks
                :isModalOpen="state.modal.isCopyMultipleWeeklyScheduleOpen"
                @close="state.modal.isCopyMultipleWeeklyScheduleOpen = false"
                @refreshDutySchedules="fetchDutySchedule()" />
            <DialogConfirmation :isModalOpen="state.modal.isPublishScheduleOpen"
                :message="['All departments', 'Alle afdelinger'].includes(departmentStore.getSelectedDepartmentName) ?
                    $t('dutySchedules.draft.confirmation.publishForAllDepartmentConfirmation') + '?' :
                    $t('dutySchedules.draft.confirmation.publishForSpecificDepartmentConfirmation') + ' ' + departmentStore.getSelectedDepartmentName + '?'"
                @close="state.modal.isPublishScheduleOpen = false" @confirm="publishSchedule" />
        </LoadingSpinner>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { draftScheduleService } from '@/components/api/user/DraftScheduleService'
import { useDepartmentStore } from '@/store/department'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore()
const currentDate = ref(moment())
const selectedDay = ref(moment())
const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))
const language = useI18n()
const expandedRecords = reactive([] as boolean[])

const state = reactive({
    addShift: {
        selectedEmployeeSchedules: {}
    } as any,
    copy: {
        allEmployeeSchedules: {},
        selectedEmployeeSchedules: {}
    } as any,
    copyShiftError: {} as Error,
    customWeekLabel: 'week',
    shiftPercentage: {} as any,
    shiftDateRange: {
        formDateRange: {
            start_date: moment(),
            end_date: moment(),
        },
    } as any,
    employees: [] as any,
    error: {} as Error,
    errorUpdateShift: {} as Error,
    isPageLoading: false,
    manageScheduleSlot: {
        selectedDay: [],
    },
    modal: {
        isAddShiftOpen: false,
        isCopyMultipleWeeklyScheduleOpen: false,
        isDepartmentSickLeaveDateRangeOpen: false,
        isDownloadOpen: false,
        isManageScheduleSlotOpen: false,
        isPublishScheduleOpen: false,
    } as any,
    newShift: {
        selectedDate: '',
    },
    newShiftError: {} as Error,
    progress: {
        percentage: 100,
        pendingRequests: 0,
        showProgressBar: false,
        totalRequests: 0,
    },
    isRemoveShift: false,
    isUpdateShift: false,
    originalWeeklySchedules: [] as any,
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
        fetchDutySchedule()
    }
})

onMounted(() => {
    fetchDutySchedule()
})

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
    const startDay = moment(shift?.date_time_start).startOf('day')
    const endDay = moment(shift?.date_time_end).startOf('day')
    const dayDifference = endDay.diff(startDay, 'days')

    if (weekIndex === 'sunday') {
        return 'auto'
    }

    if (dayDifference === 1) {
        if (moment(shift?.date_time_end).format('HH:mm:ss') === '00:00:00') {
            return 'auto'

        } else {
            return '17.5rem' // Width for shifts spanning 2 days
        }
    } else if (dayDifference === 2) {
        return '27rem' // Width for shifts spanning 3 days
    } else if (dayDifference === 3) {
        return '36.5rem' // Width for shifts spanning 4 days
    } else if (dayDifference === 4) {
        return '46rem' // Width for shifts spanning 5 days
    } else if (dayDifference === 5) {
        return '55.5rem' // Width for shifts spanning 6 days
    } else if (dayDifference >= 6) {
        return '65rem' // Width for shifts spanning 7 days
    }
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
        const response = await draftScheduleService.getDraftDutyScheduleAbsencePercentage(params)
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
        const response = await draftScheduleService.getScheduleDrafts(params)
        if (response) {
            state.weeklySchedules = response?.data
            state.originalWeeklySchedules = JSON.parse(JSON.stringify(response?.data))
            expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => true))
            fetchDutySchedulePercentage()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
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
    state.newShift.selectedDate = week?.date
}

function openManageScheduleSlotModal(day: any) {
    state.manageScheduleSlot.selectedDay = day
    state.modal.isManageScheduleSlotOpen = true
}

async function saveShift(shiftDetails: any) {
    const weeklyScheduleIndex = state.addShift.selectedEmployeeSchedules.weeklyScheduleIndex
    const shiftType = shiftDetails.shift_type
    const params = {
        shift_type_uuid: shiftType,
        date_time_start: shiftDetails.date_time_start,
        date_time_end: shiftDetails.date_time_end,
        user_uuid: state.weeklySchedules[weeklyScheduleIndex].employee.uuid,
        in_meeting: shiftDetails.in_meeting,
    }
    saveDutySchedule(params)
}

async function publishSchedule(params: object) {
    try {
        const response = await draftScheduleService.publishSchedule()
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.draft.alert.successfullyPublished')}.`)
            navigateTo('/schedules')
        }
    } catch (error: any) {
        state.error = error
    }
}

async function saveDutySchedule(params: object) {
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await draftScheduleService.saveScheduleDraft(params)
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
    pasteDutySchedule(params)
}

async function pasteDutySchedule(params: object) {
    state.copyShiftError = {}
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await draftScheduleService.saveScheduleDraft(params)
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
        const response = await draftScheduleService.saveScheduleDraft(params)
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
    state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts.splice(shiftIndex, 1)
    try {
        state.progress.totalRequests = state.progress.totalRequests + 1
        state.progress.pendingRequests = state.progress.pendingRequests + 1
        identifyTheProgressPercentage()
        const response = await draftScheduleService.deleteScheduleDraft(scheduleUuid)
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

function changeShiftTimeIn(event: any, weeklyScheduleIndex: number, weekIndex: any, shift: any, shiftIndex: number) {
    if (!isScheduleCopiedEmpty() || !isAllWeeklyScheduleCopiedEmpty()) return

    if (state.isRemoveShift || state.isUpdateShift) return

    const timeIn = event.target.value
    const timeOut = shift?.time_out
    const scheduleUuid = shift?.schedule_uuid
    const date = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules[weeklyScheduleIndex].employee.uuid
    state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftIndex].time_in = timeIn
    const params = {
        time_in: timeIn,
        time_out: timeOut,
        user_uuid: userUuid,
        date: date,
        shift_type: shift?.name,
    }
    updateDutySchedule(scheduleUuid, params, weeklyScheduleIndex, weekIndex, shiftIndex)
}

function changeShiftTimeOut(event: any, weeklyScheduleIndex: number, weekIndex: any, shift: any, shiftIndex: number) {
    if (!isScheduleCopiedEmpty() || !isAllWeeklyScheduleCopiedEmpty()) return

    if (state.isRemoveShift || state.isUpdateShift) return

    const timeOut = event.target.value
    const timeIn = shift?.time_in
    const scheduleUuid = shift?.schedule_uuid
    const date = state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].date
    const userUuid = state.weeklySchedules[weeklyScheduleIndex].employee.uuid
    state.weeklySchedules[weeklyScheduleIndex].weeks[weekIndex].shifts[shiftIndex].time_out = timeOut
    const params = {
        time_in: timeIn,
        time_out: timeOut,
        user_uuid: userUuid,
        date: date,
        shift_type: shift?.name,
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
        const response = await draftScheduleService.updateScheduleDraft(scheduleUuid, params)
        if (response) {
            state.progress.totalRequests = state.progress.totalRequests - 1
            state.progress.pendingRequests = state.progress.pendingRequests - 1
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
