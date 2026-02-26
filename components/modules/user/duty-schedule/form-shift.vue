<template>
    <form @submit.prevent="saveShift()" id="formDutySchedule">
        <div class="space-y-3">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div v-if="props?.selectedEmployee?.with_minor && state.showChildProtectionCertificateWarning">
                <div class="bg-red-100 text-black flex items-center px-4 py-3 mb-4 rounded-lg" role="alert">
                    <svg class="flex-shrink-0 w-5 h-5 text-red-700 dark:text-red-800" fill="currentColor"
                        viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <div class="ml-3 text-sm font-medium">
                        <p v-if="language.locale.value === 'en'">
                            <span class="text-red-700">
                                Underaged citizen found and employee has no child protection certificate.
                            </span>
                            <span class="cursor-pointer text-primary hover:text-primary-700"
                                @click="state.showChildProtectionCertificateWarning = false">
                                Upload later.
                            </span>
                        </p>
                        <p v-if="language.locale.value === 'dk'">
                            <span class="text-red-700">
                                OBS: Der er registreret en borger under 18 år, men den tilknyttede medarbejder har ikke
                                en gyldig børneattest uploadet på sin brugerkonto.
                            </span>
                            <span class="cursor-pointer text-primary hover:text-primary-700"
                                @click="state.showChildProtectionCertificateWarning = false">
                                Upload senere.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <Alert type="warning" :text="$t('recurring.youAreEditingARecurringShift')"
                v-if="props.selectedShift?.recurring?.is_recurring" />
            <div class="space-y-1">
                <FormLabel for="shift_type" :label="$t('dutySchedules.typeOfShift')" />
                <FormSelect id="shift_type" name="shift_type" :options="state.options.shifts"
                    v-model="state.formShift.shift_type" />
                <FormError :error="v$?.formShift?.shift_type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.shift_uuid?.[0]" />
            </div>
            <div class="space-y-3" v-if="state.formShift.shift_type">
                <div class="space-y-1"
                    v-if="(['sick-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name))">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formShift.is_sleeping_sick_leave = !state.formShift.is_sleeping_sick_leave">
                        <FormCheckbox :value="state.formShift.is_sleeping_sick_leave" />
                        {{ $t('dutySchedules.form.forSleepingNightShift') }}
                    </div>
                </div>
                <div class="space-y-1"
                    v-if="(['vacation-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name))">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formShift.do_not_count_weekends = !state.formShift.do_not_count_weekends">
                        <FormCheckbox :value="state.formShift.do_not_count_weekends" />
                        {{ $t('dutySchedules.form.doNotCountWeekends') }}
                    </div>
                </div>
                <div
                    v-if="['vacation-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name)">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formShift.use_compensatory_time = !state.formShift.use_compensatory_time">
                        <FormCheckbox :value="state.formShift.use_compensatory_time" />
                        {{ $t('dutySchedules.form.useCompensatoryTime') }}
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="department_uuid" :label="$t('dutySchedules.form.departments')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDepartmentOpen = true">
                            {{ $t('departments.addNewDepartment') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="department_uuid" name="department_uuid" :options="state.options.departments"
                        v-model="state.formShift.department_uuid" />
                    <FormError :error="v$?.formShift?.department_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.department_uuid?.[0]" />
                </div>

                <div class="space-y-1" v-if="isVacationLeave">
                    <div class="w-fit flex items-center cursor-pointer" @click="state.formShift.is_override_vacation_hours = !state.formShift.is_override_vacation_hours">
                        <FormCheckbox id="override_vacation_hours" :value="state.formShift.is_override_vacation_hours" />
                        {{ $t('dutySchedules.form.overrideVacationHours') }}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="!isVacationLeave || (isVacationLeave && state.formShift.is_override_vacation_hours)">
                    <div class="space-y-1">
                        <FormLabel for="date_time_start" :label="$t('dutySchedules.form.datetimeStart')" />
                        <FormDateTimeField id="date_time_start" name="date_time_start"
                            :placeholder="`${$t('dutySchedules.form.datetimeStart')}`"
                            v-model="state.formShift.date_time_start" />
                        <FormError :error="v$?.formShift.date_time_start?.$errors[0]?.$message.toString()" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="date_time_end" :label="$t('dutySchedules.form.dateTimeEnd')" />
                        <FormDateTimeField id="date_time_end" name="date_time_end"
                            :placeholder="`${$t('dutySchedules.form.dateTimeEnd')}`"
                            v-model="state.formShift.date_time_end" />
                        <FormError :error="v$?.formShift.date_time_end?.$errors[0]?.$message.toString()" />
                    </div>
                </div>
                <div class="space-y-1" v-if="props.formType === 'create'">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formShift.recurring.is_recurring = !state.formShift.recurring.is_recurring">
                        <FormCheckbox :value="state.formShift.recurring.is_recurring" />
                        {{ $t('dutySchedules.form.createMultipleSchedules') }}
                    </div>
                </div>
                <div class="space-y-3" v-if="state.formShift.recurring.is_recurring">
                    <div class="space-y-1">
                        <FormLabel for="recurring" :label="$t('recurring.repeat')" />
                        <FormSelect id="recurring" :options="state.options.recurring.recurringSchedules"
                            v-model="state.formShift.recurring.recurring" />
                        <FormError :error="v$?.formShift?.recurring.recurring?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="recurring_until" :label="$t('recurring.until')" />
                        <FormDateField id="recurring_until" name="recurring_until"
                            :placeholder="`${$t('recurring.until')}`"
                            v-model="state.formShift.recurring.recurring_until" />
                        <FormError :error="v$?.formShift.recurring.recurring_until?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_until?.[0]" />
                    </div>
                    <div class="space-y-3" v-if="state.formShift.recurring.recurring === 'custom'">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="frequency" :label="$t('recurring.frequency.frequency')" />
                                <FormSelect id="frequency" :options="state.options.recurring.frequency"
                                    v-model="state.formShift.recurring.frequency" />
                                <FormError
                                    :error="v$?.formShift?.recurring.frequency?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.frequency?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="daily_every" :label="`${$t('recurring.every')} (${state.formShift.recurring.frequency === 'daily' ? $t('recurring.frequency.daily.days') :
                                    state.formShift.recurring.frequency === 'weekly' ? $t('recurring.frequency.weekly.weeks') :
                                        state.formShift.recurring.frequency === 'monthly' ? $t('recurring.frequency.monthly.months') :
                                            $t('recurring.frequency.yearly.years')
                                    })`" />
                                <FormSelect id="daily_every" :options="state.formShift.recurring.frequency === 'daily' ? state.options.recurring.zeroTo999Days :
                                    state.formShift.recurring.frequency === 'weekly' ? state.options.recurring.zeroTo999Weeks :
                                        state.formShift.recurring.frequency === 'monthly' ? state.options.recurring.zeroTo999Months :
                                            state.options.recurring.zeroTo999Years"
                                    v-model="state.formShift.recurring.every" />
                                <FormError :error="v$?.formShift?.recurring.every?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.every?.[0]" />
                            </div>
                        </div>
                        <div>
                            <div class="space-y-1" v-if="state.formShift.recurring.frequency === 'weekly'">
                                <FormLabel for="weekly_on" :label="$t('recurring.frequency.weekly.weekOn')" />
                                <FormSelectMultiple id="weekly_on" :options="state.options.recurring.weekOn"
                                    v-model="state.formShift.recurring.weekly_on" />
                                <FormError
                                    :error="v$?.formShift?.recurring.weekly_on?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.weekly_on?.[0]" />
                            </div>
                            <div class="space-y-1" v-if="state.formShift.recurring.frequency === 'monthly'">
                                <div class="flex items-center gap-x-2">
                                    <FormSwitch :value="state.formShift.recurring.monthly_on_the_enabled"
                                        @toggleSwitch="state.formShift.recurring.monthly_on_the_enabled = !state.formShift.recurring.monthly_on_the_enabled" />
                                    <p>
                                        <span v-if="!state.formShift.recurring.monthly_on_the_enabled">
                                            {{ $t('recurring.frequency.monthly.each') }}
                                            ({{ $t('recurring.frequency.monthly.day') }})
                                        </span>
                                        <span v-else>
                                            {{ $t('recurring.frequency.onThe.onThe') }}
                                        </span>
                                    </p>
                                </div>
                                <div class="space-y-1" v-if="!state.formShift.recurring.monthly_on_the_enabled">
                                    <FormSelectMultiple id="monthly_each" :options="state.options.recurring.monthlyEach"
                                        v-model="state.formShift.recurring.monthly_each" />
                                    <FormError
                                        :error="v$?.formShift?.recurring.monthly_each?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.monthly_each?.[0]" />
                                </div>
                                <div v-else>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div class="space-y-1">
                                            <FormSelect id="monthly_on_the_sequence"
                                                :options="state.options.recurring.monthlyOnTheSequences"
                                                v-model="state.formShift.recurring.monthly_on_the_sequence" />
                                            <FormError
                                                :error="v$?.formShift?.recurring.monthly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.monthly_on_the_sequence?.[0]" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormSelect id="monthly_on_the_day"
                                                :options="state.options.recurring.monthlyOnTheDays"
                                                v-model="state.formShift.recurring.monthly_on_the_day" />
                                            <FormError
                                                :error="v$?.formShift?.recurring.monthly_on_the_day?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.monthly_on_the_day?.[0]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-3" v-if="state.formShift.recurring.frequency === 'yearly'">
                                <div class="space-y-1">
                                    <FormLabel for="yearly_in_months"
                                        :label="$t('recurring.frequency.yearly.yearIn')" />
                                    <FormSelectMultiple id="yearly_in_months"
                                        :options="state.options.recurring.yearlyMonths"
                                        v-model="state.formShift.recurring.yearly_in_months" />
                                    <FormError
                                        :error="v$?.formShift?.recurring.yearly_in_months?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.yearly_in_months?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <div class="space-y-1">
                                        <div class="w-fit flex items-center cursor-pointer"
                                            @click="state.formShift.recurring.yearly_on_the_enabled = !state.formShift.recurring.yearly_on_the_enabled">
                                            <FormCheckbox :value="state.formShift.recurring.yearly_on_the_enabled" />
                                            {{ $t('recurring.frequency.yearly.onThe') }}
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                        v-if="state.formShift.recurring.yearly_on_the_enabled">
                                        <div class="space-y-1">
                                            <FormSelect id="yearly_on_the_sequence"
                                                :options="state.options.recurring.yearlyOnTheSequences"
                                                v-model="state.formShift.recurring.yearly_on_the_sequence" />
                                            <FormError
                                                :error="v$?.formShift?.recurring.yearly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.yearly_on_the_sequence?.[0]" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormSelect id="yearly_on_the_day"
                                                :options="state.options.recurring.yearlyOnTheDays"
                                                v-model="state.formShift.recurring.yearly_on_the_day" />
                                            <FormError
                                                :error="v$?.formShift?.recurring.yearly_on_the_day?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.yearly_on_the_day?.[0]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="space-y-1"
                    v-if="props.formType === 'update' && props.selectedShift?.recurring?.is_recurring">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formShift.recurring.is_apply_to_all = !state.formShift.recurring.is_apply_to_all">
                        <FormCheckbox :value="state.formShift.recurring.is_apply_to_all" />
                        {{ $t('recurring.applyChangesToAllRecurringShifts') }}
                    </div>
                </div>
                <div class="space-y-1"
                    v-if="!(['vacation-leave', 'sick-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name))">
                    <FormLabel for="citizens" :label="$t('dutySchedules.form.citizens')" />
                    <FormSelectMultiple id="citizens" :options="state.options.citizens"
                        v-model="state.formShift.citizens" />
                    <FormError :error="v$?.formShift?.citizens?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="schedule_tag_uuid" :label="$t('dutySchedules.form.tags')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddNewScheduleTagOpen = true">
                            {{ $t('scheduleTags.addNewScheduleTag') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="schedule_tag_uuid" name="schedule_tag_uuid"
                        :options="state.options.scheduleTags" v-model="state.formShift.schedule_tag_uuid" />
                    <FormError :error="v$?.formShift?.schedule_tag_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.schedule_tag_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="`${$t('dutySchedules.form.note')}.`" />
                    <FormTextArea id="note" name="note" :placeholder="$t('dutySchedules.form.note')"
                        v-model="state.formShift.note" />
                    <FormError :error="v$?.formShift?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.note?.[0]" />
                </div>
                <div class="space-y-1"
                    v-if="(['sick-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name))">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formShift.do_not_count_sick_leave = !state.formShift.do_not_count_sick_leave">
                        <FormCheckbox id="do_not_count_sick_leave" :value="state.formShift.do_not_count_sick_leave" />
                        {{ $t('dutySchedules.form.doNotCountSickLeaveAsWorkingHours') }}
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserScheduleTagModalNew :isModalOpen="state.modal.isAddNewScheduleTagOpen"
            @close="state.modal.isAddNewScheduleTagOpen = false" @refreshScheduleTags="fetchAllScheduleTags" />
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchAllDepartments" />
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
import { departmentService } from '@/components/api/user/DepartmentService'
import { scheduleTagService } from '@/components/api/user/ScheduleTagService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { shiftService } from '@/components/api/user/ShiftService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
    selectedShift: {
        type: Object,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'isPageLoading', 'saveShift', 'dateTimeChange'])
const language = useI18n()
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    formShift: {
        shift_type: '',
        is_sleeping_sick_leave: false,
        do_not_count_weekends: false,
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        recurring: {
            is_recurring: false,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
        },
        citizens: [],
        schedule_tag_uuid: [],
        department_uuid: [],
        use_compensatory_time: false,
        note: '',
        do_not_count_sick_leave: false,
        is_override_vacation_hours: false,
    } as any,
    modal: {
        isAddDepartmentOpen: false,
        isAddNewScheduleTagOpen: false,
    },
    showChildProtectionCertificateWarning: false,
    options: {
        citizens: [],
        departments: [],
        recurring: {
            frequency: [
                { value: 'daily', label: `${t('recurring.frequency.daily.daily')}` },
                { value: 'weekly', label: `${t('recurring.frequency.weekly.weekly')}` },
                { value: 'monthly', label: `${t('recurring.frequency.monthly.monthly')}` },
                { value: 'yearly', label: `${t('recurring.frequency.yearly.yearly')}` },
            ],
            monthlyEach: generateMonthlyDaysOptions() as any,
            monthlyOnTheDays: [
                { value: 'monday', label: `${t('recurring.days.monday')}` },
                { value: 'tuesday', label: `${t('recurring.days.tuesday')}` },
                { value: 'wednesday', label: `${t('recurring.days.wednesday')}` },
                { value: 'thursday', label: `${t('recurring.days.thursday')}` },
                { value: 'friday', label: `${t('recurring.days.friday')}` },
                { value: 'saturday', label: `${t('recurring.days.saturday')}` },
                { value: 'sunday', label: `${t('recurring.days.sunday')}` },
                { value: 'weekday', label: `${t('recurring.days.weekday')}` },
                { value: 'weekend_day', label: `${t('recurring.days.weekendDay')}` },
            ],
            monthlyOnTheSequences: [
                { value: 'first', label: `${t('recurring.frequency.onThe.first')}` },
                { value: 'second', label: `${t('recurring.frequency.onThe.second')}` },
                { value: 'third', label: `${t('recurring.frequency.onThe.third')}` },
                { value: 'fourth', label: `${t('recurring.frequency.onThe.fourth')}` },
                { value: 'fifth', label: `${t('recurring.frequency.onThe.fifth')}` },
                { value: 'next_to_last', label: `${t('recurring.frequency.onThe.nextToLast')}` },
                { value: 'last', label: `${t('recurring.frequency.onThe.last')}` },
            ],
            recurringSchedules: [
                { value: 'everyday', label: `${t('recurring.everyDay')}` },
                { value: 'every_week', label: `${t('recurring.everyWeek')}` },
                { value: 'every_second_week', label: `${t('recurring.everySecondWeek')}` },
                { value: 'every_third_week', label: `${t('recurring.everyThirdWeek')}` },
                { value: 'every_fourth_week', label: `${t('recurring.everyFourthWeek')}` },
                { value: 'every_month', label: `${t('recurring.everyMonth')}` },
                { value: 'every_year', label: `${t('recurring.everyYear')}` },
                { value: 'custom', label: `${t('recurring.custom')}` },
            ],
            weekOn: [
                { value: 'monday', label: `${t('recurring.days.monday')}` },
                { value: 'tuesday', label: `${t('recurring.days.tuesday')}` },
                { value: 'wednesday', label: `${t('recurring.days.wednesday')}` },
                { value: 'thursday', label: `${t('recurring.days.thursday')}` },
                { value: 'friday', label: `${t('recurring.days.friday')}` },
                { value: 'saturday', label: `${t('recurring.days.saturday')}` },
                { value: 'sunday', label: `${t('recurring.days.sunday')}` },
            ],
            yearlyMonths: [
                { value: 'january', label: `${t('recurring.frequency.yearly.january')}` },
                { value: 'february', label: `${t('recurring.frequency.yearly.february')}` },
                { value: 'march', label: `${t('recurring.frequency.yearly.march')}` },
                { value: 'april', label: `${t('recurring.frequency.yearly.april')}` },
                { value: 'may', label: `${t('recurring.frequency.yearly.may')}` },
                { value: 'june', label: `${t('recurring.frequency.yearly.june')}` },
                { value: 'july', label: `${t('recurring.frequency.yearly.july')}` },
                { value: 'august', label: `${t('recurring.frequency.yearly.august')}` },
                { value: 'september', label: `${t('recurring.frequency.yearly.september')}` },
                { value: 'october', label: `${t('recurring.frequency.yearly.october')}` },
                { value: 'november', label: `${t('recurring.frequency.yearly.november')}` },
                { value: 'december', label: `${t('recurring.frequency.yearly.december')}` },
            ],
            yearlyOnTheDays: [
                { value: 'monday', label: `${t('recurring.days.monday')}` },
                { value: 'tuesday', label: `${t('recurring.days.tuesday')}` },
                { value: 'wednesday', label: `${t('recurring.days.wednesday')}` },
                { value: 'thursday', label: `${t('recurring.days.thursday')}` },
                { value: 'friday', label: `${t('recurring.days.friday')}` },
                { value: 'saturday', label: `${t('recurring.days.saturday')}` },
                { value: 'sunday', label: `${t('recurring.days.sunday')}` },
                { value: 'weekday', label: `${t('recurring.days.weekday')}` },
                { value: 'weekend_day', label: `${t('recurring.days.weekendDay')}` },
            ],
            yearlyOnTheSequences: [
                { value: 'first', label: `${t('recurring.frequency.onThe.first')}` },
                { value: 'second', label: `${t('recurring.frequency.onThe.second')}` },
                { value: 'third', label: `${t('recurring.frequency.onThe.third')}` },
                { value: 'fourth', label: `${t('recurring.frequency.onThe.fourth')}` },
                { value: 'fifth', label: `${t('recurring.frequency.onThe.fifth')}` },
                { value: 'next_to_last', label: `${t('recurring.frequency.onThe.nextToLast')}` },
                { value: 'last', label: `${t('recurring.frequency.onThe.last')}` },
            ],
            zeroTo999Days: generateZeroTo999DaysOptions() as any,
            zeroTo999Weeks: generateZeroTo999WeeksOptions() as any,
            zeroTo999Months: generateZeroTo999MonthsOptions() as any,
            zeroTo999Years: generateZeroTo999YearsOptions() as any,
        },
        scheduleTags: [],
        shifts: [] as any
    }
})

onMounted(() => {
    state.showChildProtectionCertificateWarning = false
    v$.value.$reset()
    fetchAllShifts()
    fetchAllDepartments()
    fetchAllScheduleTags()
    fetchAllCitizensPerUserDepartment()
    state.formShift.shift_type = props.selectedShift.shift_type
    state.formShift.is_sleeping_sick_leave = props.selectedShift.is_sleeping_sick_leave
    state.formShift.do_not_count_weekends = props.selectedShift.do_not_count_weekends
    state.formShift.date_time_start = props.selectedShift.date_time_start
    state.formShift.date_time_end = props.selectedShift.date_time_end
    state.formShift.citizens = props.selectedShift.citizens
    state.formShift.schedule_tag_uuid = props.selectedShift.schedule_tag_uuid
    state.formShift.department_uuid = props.selectedShift.department_uuid
    state.formShift.note = props.selectedShift.note
    state.formShift.do_not_count_sick_leave = props.selectedShift.do_not_count_sick_leave
    state.formShift.use_compensatory_time = props.selectedShift.use_compensatory_time
})

watch(() => state.formShift.shift_type, (selectedShift) => {
    const selectShiftIndex = state.options.shifts.findIndex((shift: any) => shift.value === selectedShift)
    if (![3, 4].includes(selectShiftIndex)) {
        state.showChildProtectionCertificateWarning = true
    } else {
        state.showChildProtectionCertificateWarning = false
    }

    if (props.formType === 'create') {
        const startDate = moment(props.selectedShift.date_time_start, 'YYYY-MM-DD H:mm')
        const endDate = moment(props.selectedShift.date_time_end, 'YYYY-MM-DD H:mm')

        state.formShift.date_time_start = moment(
            startDate.format('YYYY-MM-DD') + ' ' + state.options.shifts[selectShiftIndex]?.time_in,
            'YYYY-MM-DD HH:mm'
        ).format('YYYY-MM-DD H:mm')

        state.formShift.date_time_end = moment(
            endDate.format('YYYY-MM-DD') + ' ' + state.options.shifts[selectShiftIndex]?.time_out,
            'YYYY-MM-DD HH:mm'
        ).format('YYYY-MM-DD H:mm')
    }

    emit('dateTimeChange', props.selectedEmployee.uuid, state.formShift.date_time_start, state.formShift.date_time_end)
})

watch(() => state.formShift.date_time_start, () => {
    if (!state.formShift.shift_type) return
    emit('dateTimeChange', props.selectedEmployee.uuid, state.formShift.date_time_start, state.formShift.date_time_end)
})

watch(() => state.formShift.date_time_end, () => {
    if (!state.formShift.shift_type) return
    emit('dateTimeChange', props.selectedEmployee.uuid, state.formShift.date_time_start, state.formShift.date_time_end)
})

watch(() => state.formShift.shift_type, () => {
    if (isVacationLeave.value) {
        state.formShift.date_time_start = moment(props.selectedShift.date_time_start).startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm')
        state.formShift.date_time_end = moment(props.selectedShift.date_time_start).startOf('day').add(15.4, 'hours').format('YYYY-MM-DD H:mm')
    }
})

const isVacationLeave = computed(() => {
    return ['vacation-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name)
})

const rules = computed(() => {
    if (isVacationLeave.value) {
        return {
            formShift: {
                shift_type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                department_uuid: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }

    if (state.formShift.recurring.is_recurring) {
        return {
            formShift: {
                shift_type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date_time_start: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date_time_end: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring: {
                    recurring: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    recurring_until: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                }
            },
        }
    } else {
        return {
            formShift: {
                shift_type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date_time_start: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date_time_end: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function generateZeroTo999DaysOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.daily.day').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.daily.days').toLocaleLowerCase()}` })
    }
    return options;
}

function generateZeroTo999WeeksOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.weekly.week').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.weekly.weeks').toLocaleLowerCase()}` })
    }
    return options;
}

function generateZeroTo999MonthsOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.monthly.month').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.monthly.months').toLocaleLowerCase()}` })
    }
    return options;
}

function generateZeroTo999YearsOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.yearly.year').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.yearly.years').toLocaleLowerCase()}` })
    }
    return options;
}

function generateMonthlyDaysOptions() {
    let options = []
    for (let i = 1; i <= 31; i++) {
        options.push({ value: String(i), label: String(i) })
    }
    return options;
}

async function fetchAllShifts() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await shiftService.getAllShifts(params)
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (shift: any) => options.push({
                    value: shift?.uuid,
                    label: language.locale.value === 'en' ? shift?.en_name : shift?.dk_name,
                    system_name: shift?.system_name,
                    time_in: shift?.time_in,
                    time_out: shift?.time_out,
                })
            )
            state.options.shifts = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            employee_uuid: props?.selectedEmployee?.uuid
        }
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
            if (props.formType === 'create') {
                state.formShift.department_uuid = []
                if (!['All departments', 'Alle afdelinger'].includes(departmentStore.getSelectedDepartmentName)) {
                    state.formShift.department_uuid.push(departmentStore.getSelectedDepartment?.uuid)
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllScheduleTags() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await scheduleTagService.getAllScheduleTags(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (tag: any) => options.push({
                    value: tag?.uuid,
                    label: tag?.tag,
                })
            )
            state.options.scheduleTags = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllCitizensPerUserDepartment() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid
        }
        const response = await citizenService.getAllCitizensPerUserDepartment(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + (citizen?.lastname ?? ''),
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function saveShift() {
    v$.value.$validate()
    if (!v$.value.$error) {
        console.log('Form is valid. Submitting data...', state.formShift)
        emit('saveShift', state.formShift)
    }
}
</script>

<style>
#formDutySchedule .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>