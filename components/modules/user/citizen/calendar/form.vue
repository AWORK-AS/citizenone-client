<template>
    <form @submit.prevent="submitForm()" id="formSchedule">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('events.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('events.form.title')"
                    v-model="state.formSchedule.title" />
                <FormError :error="v$?.formSchedule?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('events.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('events.form.description')"
                    v-model="state.formSchedule.description" />
                <FormError :error="v$?.formSchedule?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('events.form.datetimeStart')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('events.form.datetimeStart')" v-model="state.formSchedule.date_time_start" />
                <FormError :error="v$?.formSchedule?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_end" :label="$t('events.form.dateTimeEnd')" />
                <FormDateTimeField id="date_time_end" name="date_time_end" :placeholder="$t('events.form.dateTimeEnd')"
                    v-model="state.formSchedule.date_time_end" />
                <FormError :error="v$?.formSchedule?.date_time_end?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="unit_uuid" :label="`${$t('units.form.doYouWantToReserveAUnit')}?`" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddUnitOpen = true">
                        {{ $t('units.addNewUnit') }}
                    </span>
                </div>
                <FormSelect id="unit_uuid" name="unit_uuid" :options="state.options.units"
                    v-model="state.formSchedule.unit_uuid" />
                <FormError :error="v$?.formSchedule?.unit_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.unit_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formSchedule.is_private = !state.formSchedule.is_private">
                    <FormCheckbox :value="state.formSchedule.is_private" />
                    {{ $t('events.form.private') }}
                </div>
            </div>
            <div class="space-y-1" v-if="props.formType === 'create'">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formSchedule.recurring.is_recurring = !state.formSchedule.recurring.is_recurring">
                    <FormCheckbox :value="state.formSchedule.recurring.is_recurring" />
                    {{ $t('bookings.formEvent.information.createMultipleEvents') }}
                </div>
            </div>
            <div class="space-y-3" v-if="state.formSchedule.recurring.is_recurring">
                <div class="space-y-1">
                    <FormLabel for="recurring" :label="$t('recurring.repeat')" />
                    <FormSelect id="recurring" :options="state.options.recurring.recurringSchedules"
                        v-model="state.formSchedule.recurring.recurring" />
                    <FormError :error="v$?.formSchedule?.recurring.recurring?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="recurring_until" :label="$t('recurring.until')" />
                    <FormDateField id="recurring_until" name="recurring_until" :placeholder="`${$t('recurring.until')}`"
                        v-model="state.formSchedule.recurring.recurring_until" />
                    <FormError :error="v$?.formSchedule.recurring.recurring_until?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.recurring_until?.[0]" />
                </div>
                <div class="space-y-3" v-if="state.formSchedule.recurring.recurring === 'custom'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="frequency" :label="$t('recurring.frequency.frequency')" />
                            <FormSelect id="frequency" :options="state.options.recurring.frequency"
                                v-model="state.formSchedule.recurring.frequency" />
                            <FormError
                                :error="v$?.formSchedule?.recurring.frequency?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.frequency?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="daily_every" :label="`${$t('recurring.every')} (${state.formSchedule.recurring.frequency === 'daily' ? $t('recurring.frequency.daily.days') :
                                state.formSchedule.recurring.frequency === 'weekly' ? $t('recurring.frequency.weekly.weeks') :
                                    state.formSchedule.recurring.frequency === 'monthly' ? $t('recurring.frequency.monthly.months') :
                                        $t('recurring.frequency.yearly.years')
                                })`" />
                            <FormSelect id="daily_every" :options="state.formSchedule.recurring.frequency === 'daily' ? state.options.recurring.zeroTo999Days :
                                state.formSchedule.recurring.frequency === 'weekly' ? state.options.recurring.zeroTo999Weeks :
                                    state.formSchedule.recurring.frequency === 'monthly' ? state.options.recurring.zeroTo999Months :
                                        state.options.recurring.zeroTo999Years"
                                v-model="state.formSchedule.recurring.every" />
                            <FormError :error="v$?.formSchedule?.recurring.every?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.every?.[0]" />
                        </div>
                    </div>
                    <div>
                        <div class="space-y-1" v-if="state.formSchedule.recurring.frequency === 'weekly'">
                            <FormLabel for="weekly_on" :label="$t('recurring.frequency.weekly.weekOn')" />
                            <FormSelectMultiple id="weekly_on" :options="state.options.recurring.weekOn"
                                v-model="state.formSchedule.recurring.weekly_on" />
                            <FormError
                                :error="v$?.formSchedule?.recurring.weekly_on?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.weekly_on?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="state.formSchedule.recurring.frequency === 'monthly'">
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="state.formSchedule.recurring.monthly_on_the_enabled"
                                    @toggleSwitch="state.formSchedule.recurring.monthly_on_the_enabled = !state.formSchedule.recurring.monthly_on_the_enabled" />
                                <p>
                                    <span v-if="!state.formSchedule.recurring.monthly_on_the_enabled">
                                        {{ $t('recurring.frequency.monthly.each') }}
                                        ({{ $t('recurring.frequency.monthly.day') }})
                                    </span>
                                    <span v-else>
                                        {{ $t('recurring.frequency.onThe.onThe') }}
                                    </span>
                                </p>
                            </div>
                            <div class="space-y-1" v-if="!state.formSchedule.recurring.monthly_on_the_enabled">
                                <FormSelectMultiple id="monthly_each" :options="state.options.recurring.monthlyEach"
                                    v-model="state.formSchedule.recurring.monthly_each" />
                                <FormError
                                    :error="v$?.formSchedule?.recurring.monthly_each?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.monthly_each?.[0]" />
                            </div>
                            <div v-else>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormSelect id="monthly_on_the_sequence"
                                            :options="state.options.recurring.monthlyOnTheSequences"
                                            v-model="state.formSchedule.recurring.monthly_on_the_sequence" />
                                        <FormError
                                            :error="v$?.formSchedule?.recurring.monthly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.monthly_on_the_sequence?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormSelect id="monthly_on_the_day"
                                            :options="state.options.recurring.monthlyOnTheDays"
                                            v-model="state.formSchedule.recurring.monthly_on_the_day" />
                                        <FormError
                                            :error="v$?.formSchedule?.recurring.monthly_on_the_day?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.monthly_on_the_day?.[0]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-3" v-if="state.formSchedule.recurring.frequency === 'yearly'">
                            <div class="space-y-1">
                                <FormLabel for="yearly_in_months" :label="$t('recurring.frequency.yearly.yearIn')" />
                                <FormSelectMultiple id="yearly_in_months"
                                    :options="state.options.recurring.yearlyMonths"
                                    v-model="state.formSchedule.recurring.yearly_in_months" />
                                <FormError
                                    :error="v$?.formSchedule?.recurring.yearly_in_months?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.yearly_in_months?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="space-y-1">
                                    <div class="w-fit flex items-center cursor-pointer"
                                        @click="state.formSchedule.recurring.yearly_on_the_enabled = !state.formSchedule.recurring.yearly_on_the_enabled">
                                        <FormCheckbox :value="state.formSchedule.recurring.yearly_on_the_enabled" />
                                        {{ $t('recurring.frequency.yearly.onThe') }}
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="state.formSchedule.recurring.yearly_on_the_enabled">
                                    <div class="space-y-1">
                                        <FormSelect id="yearly_on_the_sequence"
                                            :options="state.options.recurring.yearlyOnTheSequences"
                                            v-model="state.formSchedule.recurring.yearly_on_the_sequence" />
                                        <FormError
                                            :error="v$?.formSchedule?.recurring.yearly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.yearly_on_the_sequence?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormSelect id="yearly_on_the_day"
                                            :options="state.options.recurring.yearlyOnTheDays"
                                            v-model="state.formSchedule.recurring.yearly_on_the_day" />
                                        <FormError
                                            :error="v$?.formSchedule?.recurring.yearly_on_the_day?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.yearly_on_the_day?.[0]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserUnitModalNew :isModalOpen="state.modal.isAddUnitOpen" @close="state.modal.isAddUnitOpen = false"
            @refreshUnits="fetchAllUnits" />
    </form>
</template>

<script setup lang="ts">
import { unitService } from '@/components/api/user/UnitService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
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
    selectedSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()

interface Option {
    value: string
    label: string
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSchedule: {
        id: '',
        uuid: '',
        title: '',
        description: '',
        date_time_start: '',
        date_time_end: '',
        unit_uuid: '',
        is_private: false,
        send_invitation: false,
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
    } as any,
    modal: {
        isAddUnitOpen: false,
    },
    options: {
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
        units: [] as Option[],
    }
})

onMounted(() => {
    fetchAllUnits()
    state.formSchedule = {
        id: props.selectedSchedule.id,
        uuid: props.selectedSchedule.uuid,
        title: props.selectedSchedule.title,
        description: props.selectedSchedule.description,
        date_time_start: props.selectedSchedule.start ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.start) : formatDateToYYYYmmddHHmm('', false),
        date_time_end: props.selectedSchedule.end ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.end) : formatDateToYYYYmmddHHmm('', true),
        unit_uuid: props.selectedSchedule.unit_uuid,
        is_private: props.selectedSchedule.is_private,
        send_invitation: props.selectedSchedule.send_invitation,
        recurring: {
            is_recurring: props.selectedSchedule.recurring.is_recurring,
            recurring: props.selectedSchedule.recurring.recurring,
            recurring_until: props.selectedSchedule.recurring.recurring_until,
            frequency: props.selectedSchedule.recurring.frequency,
            every: props.selectedSchedule.recurring.every,
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
    }
})

const rules = computed(() => {
    return {
        formSchedule: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_start: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            recurring: {},
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formSchedule)
    }
}

function formatDateTimeToYYYYmmddHHmm(inputDate: string): string {
    const date = new Date(inputDate)

    // Extract date components
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // January is 0
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    // Construct formatted date string without semicolons
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`

    return formattedDate
}

function formatDateToYYYYmmddHHmm(dateString: string, is_end_date_time: boolean = false): string {
    let date: Date

    if (!dateString) {
        // If dateString is null or empty, use today's date
        date = new Date() // Current date and time
    } else {
        date = new Date(dateString)
    }

    if (is_end_date_time) {
        // Set time to 11:59:59.999 PM
        date.setHours(23, 59, 59, 999)
    } else {
        // Default behavior: set time to 00:00:00.000 AM
        date.setHours(0, 0, 0, 0)
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2) // Months are zero indexed
    const day = ('0' + date.getDate()).slice(-2)
    const hours = ('0' + date.getHours()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`

    return formattedDate
}

async function fetchAllUnits() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await unitService.getAllUnits()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (unit: any) => options.push({
                    value: unit?.uuid,
                    label: unit?.name,
                })
            )
            state.options.units = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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
</script>

<style>
#formSchedule .multiselect-dropdown {
    max-height: 6rem !important;
}
</style>