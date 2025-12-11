<template>
    <div>
        <form @submit.prevent="submitForm()" id="formTemplate">
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('dutySchedules.draftTemplates.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('dutySchedules.draftTemplates.form.name')"
                        v-model="state.formTemplate.name" />
                    <FormError :error="v$?.formTemplate?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>

                <div class="space-y-1" v-if="props.formType === 'create'">
                    <div class="w-fit flex items-center cursor-pointer" @click="state.formTemplate.recurring.is_recurring = !state.formTemplate.recurring.is_recurring">
                        <FormCheckbox :value="state.formTemplate.recurring.is_recurring" />
                        {{ $t('dutySchedules.draftTemplates.form.isRecurring') }}
                    </div>
                </div>

                <div class="space-y-3" v-if="state.formTemplate.recurring.is_recurring">
                    <div class="space-y-1">
                        <FormLabel for="recurring" :label="$t('dutySchedules.draftTemplates.form.repeat')" />
                        <FormSelect id="recurring" :options="state.options.recurring.recurringSchedules"
                            v-model="state.formTemplate.recurring.recurring" />
                        <FormError :error="v$?.formTemplate?.recurring.recurring?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="recurring_until" :label="$t('dutySchedules.draftTemplates.form.recurringUntil')" />
                        <FormDateField id="recurring_until"   name="recurring_until"
                            :placeholder="$t('dutySchedules.draftTemplates.form.recurringUntil')" v-model="state.formTemplate.recurring.recurring_until" />
                        <FormError :error="v$?.formTemplate?.recurring?.recurring_until?.$errors[0]?.$message.toString()" />
                    </div>
                </div>

                <div class="space-y-3" v-if="state.formTemplate.recurring.recurring === 'custom'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="frequency" :label="$t('recurring.frequency.frequency')" />
                            <FormSelect id="frequency" :options="state.options.recurring.frequency"
                                v-model="state.formTemplate.recurring.frequency" />
                            <FormError
                                :error="v$?.formSchedule?.recurring.frequency?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.frequency?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="daily_every" :label="`${$t('recurring.every')} (${state.formTemplate.recurring.frequency === 'daily' ? $t('recurring.frequency.daily.days') :
                                state.formTemplate.recurring.frequency === 'weekly' ? $t('recurring.frequency.weekly.weeks') :
                                    state.formTemplate.recurring.frequency === 'monthly' ? $t('recurring.frequency.monthly.months') :
                                        $t('recurring.frequency.yearly.years')
                                })`" />
                            <FormSelect id="daily_every" :options="state.formTemplate.recurring.frequency === 'daily' ? state.options.recurring.zeroTo999Days :
                                state.formTemplate.recurring.frequency === 'weekly' ? state.options.recurring.zeroTo999Weeks :
                                    state.formTemplate.recurring.frequency === 'monthly' ? state.options.recurring.zeroTo999Months :
                                        state.options.recurring.zeroTo999Years"
                                v-model="state.formTemplate.recurring.every" />
                            <FormError :error="v$?.formSchedule?.recurring.every?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.every?.[0]" />
                        </div>
                    </div>
                    <div>
                        <div class="space-y-1" v-if="state.formTemplate.recurring.frequency === 'weekly'">
                            <FormLabel for="weekly_on" :label="$t('recurring.frequency.weekly.weekOn')" />
                            <FormSelectMultiple id="weekly_on" :options="state.options.recurring.weekOn"
                                v-model="state.formTemplate.recurring.weekly_on" />
                            <FormError
                                :error="v$?.formSchedule?.recurring.weekly_on?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.weekly_on?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="state.formTemplate.recurring.frequency === 'monthly'">
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="state.formTemplate.recurring.monthly_on_the_enabled"
                                    @toggleSwitch="state.formTemplate.recurring.monthly_on_the_enabled = !state.formTemplate.recurring.monthly_on_the_enabled" />
                                <p>
                                    <span v-if="!state.formTemplate.recurring.monthly_on_the_enabled">
                                        {{ $t('recurring.frequency.monthly.each') }}
                                        ({{ $t('recurring.frequency.monthly.day') }})
                                    </span>
                                    <span v-else>
                                        {{ $t('recurring.frequency.onThe.onThe') }}
                                    </span>
                                </p>
                            </div>
                            <div class="space-y-1" v-if="!state.formTemplate.recurring.monthly_on_the_enabled">
                                <FormSelectMultiple id="monthly_each" :options="state.options.recurring.monthlyEach"
                                    v-model="state.formTemplate.recurring.monthly_each" />
                                <FormError
                                    :error="v$?.formSchedule?.recurring.monthly_each?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.monthly_each?.[0]" />
                            </div>
                            <div v-else>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormSelect id="monthly_on_the_sequence"
                                            :options="state.options.recurring.monthlyOnTheSequences"
                                            v-model="state.formTemplate.recurring.monthly_on_the_sequence" />
                                        <FormError
                                            :error="v$?.formSchedule?.recurring.monthly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.monthly_on_the_sequence?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormSelect id="monthly_on_the_day"
                                            :options="state.options.recurring.monthlyOnTheDays"
                                            v-model="state.formTemplate.recurring.monthly_on_the_day" />
                                        <FormError
                                            :error="v$?.formSchedule?.recurring.monthly_on_the_day?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.monthly_on_the_day?.[0]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-3" v-if="state.formTemplate.recurring.frequency === 'yearly'">
                            <div class="space-y-1">
                                <FormLabel for="yearly_in_months" :label="$t('recurring.frequency.yearly.yearIn')" />
                                <FormSelectMultiple id="yearly_in_months"
                                    :options="state.options.recurring.yearlyMonths"
                                    v-model="state.formTemplate.recurring.yearly_in_months" />
                                <FormError
                                    :error="v$?.formSchedule?.recurring.yearly_in_months?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.yearly_in_months?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="space-y-1">
                                    <div class="w-fit flex items-center cursor-pointer"
                                        @click="state.formTemplate.recurring.yearly_on_the_enabled = !state.formTemplate.recurring.yearly_on_the_enabled">
                                        <FormCheckbox :value="state.formTemplate.recurring.yearly_on_the_enabled" />
                                        {{ $t('recurring.frequency.yearly.onThe') }}
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="state.formTemplate.recurring.yearly_on_the_enabled">
                                    <div class="space-y-1">
                                        <FormSelect id="yearly_on_the_sequence"
                                            :options="state.options.recurring.yearlyOnTheSequences"
                                            v-model="state.formTemplate.recurring.yearly_on_the_sequence" />
                                        <FormError
                                            :error="v$?.formSchedule?.recurring.yearly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.yearly_on_the_sequence?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormSelect id="yearly_on_the_day"
                                            :options="state.options.recurring.yearlyOnTheDays"
                                            v-model="state.formTemplate.recurring.yearly_on_the_day" />
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
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
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
    selectedDraftTemplate: {
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
    formTemplate: {
        name: '',
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
    },
    
})

onMounted(() => {
    if (props.formType === 'update') {
        state.formTemplate.name = props.selectedDraftTemplate.name
        state.formTemplate.recurring.is_recurring = props.selectedDraftTemplate.is_recurring
        state.formTemplate.recurring.recurring = props.selectedDraftTemplate.recurring
        state.formTemplate.recurring.recurring_until = props.selectedDraftTemplate.recurring_until

        if (props.selectedDraftTemplate.recurring === 'custom') {
            state.formTemplate.recurring.frequency = props.selectedDraftTemplate.frequency
            state.formTemplate.recurring.every = props.selectedDraftTemplate.every
            if (props.selectedDraftTemplate.frequency === 'weekly') {
                state.formTemplate.recurring.weekly_on = props.selectedDraftTemplate.weekly_on
            } else if (props.selectedDraftTemplate.frequency === 'monthly') {
                state.formTemplate.recurring.monthly_on_the_enabled = props.selectedDraftTemplate.monthly_on_the_enabled
                state.formTemplate.recurring.monthly_each = props.selectedDraftTemplate.monthly_each
                state.formTemplate.recurring.monthly_on_the_sequence = props.selectedDraftTemplate.monthly_on_the_sequence
                state.formTemplate.recurring.monthly_on_the_day = props.selectedDraftTemplate.monthly_on_the_day
            } else if (props.selectedDraftTemplate.frequency === 'yearly') {
                state.formTemplate.recurring.yearly_in_months = props.selectedDraftTemplate.yearly_in_months
                state.formTemplate.recurring.yearly_on_the_enabled = props.selectedDraftTemplate.yearly_on_the_enabled
                state.formTemplate.recurring.yearly_on_the_sequence = props.selectedDraftTemplate.yearly_on_the_sequence
                state.formTemplate.recurring.yearly_on_the_day = props.selectedDraftTemplate.yearly_on_the_day
            }
        }
    }
})

const rules = computed(() => {
    if (state.formTemplate.recurring.is_recurring) {
        return {
            formTemplate: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring: {
                    recurring: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    recurring_until: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                },
            },
        }
    } else {
        return {
            formTemplate: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring: {},
            },
        }
    }
    
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    console.log(v$.value.$error)
    if (!v$.value.$error) {
        console.log(state.formTemplate)
        emit('submitForm', state.formTemplate)
    }
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
#formTemplate .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>