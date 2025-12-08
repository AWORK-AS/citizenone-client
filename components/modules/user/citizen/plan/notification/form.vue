<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" id="formNotification">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date_time" :label="$t('plansandgoals.notifications.form.dateTime')" />
                    <FormDateTimeField id="date_time" name="date_time"
                        :placeholder="$t('plansandgoals.notifications.form.dateTime')"
                        v-model="state.formNotification.date_time" />
                    <FormError :error="v$?.formSchedule?.date_time?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_time?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="user" :label="$t('plansandgoals.notifications.form.users')" />
                    <FormSelectMultiple id="user" :options="state.options.contactPersons"
                        v-model="state.formNotification.user" />
                    <FormError :error="v$?.formNotification?.user?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.user?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('plansandgoals.notifications.form.note') }}
                    </p>
                    <ckeditor :editor="editor" v-model="state.formNotification.note" :config="editorStatusConfig">
                    </ckeditor>
                    <FormError :error="v$?.formNotification?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formNotification.recurring.is_recurring = !state.formNotification.recurring.is_recurring">
                        <FormCheckbox :value="state.formNotification.recurring.is_recurring" />
                        {{ $t('plansandgoals.notifications.form.repeatNotification') }}
                    </div>
                </div>

                <div class="space-y-3" v-if="state.formNotification.recurring.is_recurring">
                    <div class="space-y-1">
                        <FormLabel for="recurring" :label="$t('recurring.repeat')" />
                        <FormSelect id="recurring" :options="state.options.recurring.recurringSchedules"
                            v-model="state.formNotification.recurring.recurring" />
                        <FormError
                            :error="v$?.formNotification?.recurring.recurring?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="recurring_until" :label="$t('recurring.until')" />
                        <FormDateField id="recurring_until" name="recurring_until"
                            :placeholder="`${$t('recurring.until')}`"
                            v-model="state.formNotification.recurring.recurring_until" />
                        <FormError
                            :error="v$?.formNotification.recurring.recurring_until?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_until?.[0]" />
                    </div>
                    <div class="space-y-3" v-if="state.formNotification.recurring.recurring === 'custom'">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="frequency" :label="$t('recurring.frequency.frequency')" />
                                <FormSelect id="frequency" :options="state.options.recurring.frequency"
                                    v-model="state.formNotification.recurring.frequency" />
                                <FormError
                                    :error="v$?.formNotification?.recurring.frequency?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.frequency?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="daily_every" :label="`${$t('recurring.every')} (${state.formNotification.recurring.frequency === 'daily' ? $t('recurring.frequency.daily.days') :
                                    state.formNotification.recurring.frequency === 'weekly' ? $t('recurring.frequency.weekly.weeks') :
                                        state.formNotification.recurring.frequency === 'monthly' ? $t('recurring.frequency.monthly.months') :
                                            $t('recurring.frequency.yearly.years')
                                    })`" />
                                <FormSelect id="daily_every" :options="state.formNotification.recurring.frequency === 'daily' ? state.options.recurring.zeroTo999Days :
                                    state.formNotification.recurring.frequency === 'weekly' ? state.options.recurring.zeroTo999Weeks :
                                        state.formNotification.recurring.frequency === 'monthly' ? state.options.recurring.zeroTo999Months :
                                            state.options.recurring.zeroTo999Years"
                                    v-model="state.formNotification.recurring.every" />
                                <FormError
                                    :error="v$?.formNotification?.recurring.every?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.every?.[0]" />
                            </div>
                        </div>
                        <div>
                            <div class="space-y-1" v-if="state.formNotification.recurring.frequency === 'weekly'">
                                <FormLabel for="weekly_on" :label="$t('recurring.frequency.weekly.weekOn')" />
                                <FormSelectMultiple id="weekly_on" :options="state.options.recurring.weekOn"
                                    v-model="state.formNotification.recurring.weekly_on" />
                                <FormError
                                    :error="v$?.formNotification?.recurring.weekly_on?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.weekly_on?.[0]" />
                            </div>
                            <div class="space-y-1" v-if="state.formNotification.recurring.frequency === 'monthly'">
                                <div class="flex items-center gap-x-2">
                                    <FormSwitch :value="state.formNotification.recurring.monthly_on_the_enabled"
                                        @toggleSwitch="state.formNotification.recurring.monthly_on_the_enabled = !state.formNotification.recurring.monthly_on_the_enabled" />
                                    <p>
                                        <span v-if="!state.formNotification.recurring.monthly_on_the_enabled">
                                            {{ $t('recurring.frequency.monthly.each') }}
                                            ({{ $t('recurring.frequency.monthly.day') }})
                                        </span>
                                        <span v-else>
                                            {{ $t('recurring.frequency.onThe.onThe') }}
                                        </span>
                                    </p>
                                </div>
                                <div class="space-y-1" v-if="!state.formNotification.recurring.monthly_on_the_enabled">
                                    <FormSelectMultiple id="monthly_each" :options="state.options.recurring.monthlyEach"
                                        v-model="state.formNotification.recurring.monthly_each" />
                                    <FormError
                                        :error="v$?.formNotification?.recurring.monthly_each?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.monthly_each?.[0]" />
                                </div>
                                <div v-else>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div class="space-y-1">
                                            <FormSelect id="monthly_on_the_sequence"
                                                :options="state.options.recurring.monthlyOnTheSequences"
                                                v-model="state.formNotification.recurring.monthly_on_the_sequence" />
                                            <FormError
                                                :error="v$?.formNotification?.recurring.monthly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.monthly_on_the_sequence?.[0]" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormSelect id="monthly_on_the_day"
                                                :options="state.options.recurring.monthlyOnTheDays"
                                                v-model="state.formNotification.recurring.monthly_on_the_day" />
                                            <FormError
                                                :error="v$?.formNotification?.recurring.monthly_on_the_day?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.monthly_on_the_day?.[0]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-3" v-if="state.formNotification.recurring.frequency === 'yearly'">
                                <div class="space-y-1">
                                    <FormLabel for="yearly_in_months"
                                        :label="$t('recurring.frequency.yearly.yearIn')" />
                                    <FormSelectMultiple id="yearly_in_months"
                                        :options="state.options.recurring.yearlyMonths"
                                        v-model="state.formNotification.recurring.yearly_in_months" />
                                    <FormError
                                        :error="v$?.formNotification?.recurring.yearly_in_months?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.yearly_in_months?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <div class="space-y-1">
                                        <div class="w-fit flex items-center cursor-pointer"
                                            @click="state.formNotification.recurring.yearly_on_the_enabled = !state.formNotification.recurring.yearly_on_the_enabled">
                                            <FormCheckbox
                                                :value="state.formNotification.recurring.yearly_on_the_enabled" />
                                            {{ $t('recurring.frequency.yearly.onThe') }}
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                        v-if="state.formNotification.recurring.yearly_on_the_enabled">
                                        <div class="space-y-1">
                                            <FormSelect id="yearly_on_the_sequence"
                                                :options="state.options.recurring.yearlyOnTheSequences"
                                                v-model="state.formNotification.recurring.yearly_on_the_sequence" />
                                            <FormError
                                                :error="v$?.formNotification?.recurring.yearly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.yearly_on_the_sequence?.[0]" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormSelect id="yearly_on_the_day"
                                                :options="state.options.recurring.yearlyOnTheDays"
                                                v-model="state.formNotification.recurring.yearly_on_the_day" />
                                            <FormError
                                                :error="v$?.formNotification?.recurring.yearly_on_the_day?.$errors[0]?.$message.toString()" />
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
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
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
    selectedNotification: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const editor = ref(ClassicEditor)
const editorStatusConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    },
    height: 500  // Set the editor height here
}) as any

const state = reactive({
    error: {} as Error,
    formNotification: {
        date_time: '',
        user: [],
        note: '',
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
        },
    } as any,
    isPageLoading: false,
    options: {
        contactPersons: [],
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
    state.formNotification = {
        date_time: props.selectedNotification?.date_time || moment().format('YYYY-MM-DD HH:mm'),
        user: [],
        note: props.selectedNotification?.note,
        recurring: {
            is_recurring: props.selectedNotification?.is_recurring ? true : false,
            recurring: props.selectedNotification?.recurring,
            recurring_until: props.selectedNotification?.recurring_until,
            frequency: props.selectedNotification?.recurring_rules?.frequency,
            every: props.selectedNotification?.recurring_rules?.every,
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
        },
        // is_recurring: props.selectedNotification?.is_recurring ? true : false,
        // recurring: props.selectedNotification?.recurring,
        // recurring_until: props.selectedNotification?.recurring_until,
    }
    fetchOurContactPersons()
    props?.selectedNotification?.notification_users?.forEach((notificationUser: any) => {
        state.formNotification.user.push(notificationUser?.user?.uuid)
    })
})

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

async function fetchOurContactPersons() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
        }
        const response = await citizenContactService.getAllCitizenContactPersons(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.employee?.uuid,
                    label: item?.employee?.firstname + " " + item?.employee?.lastname,
                })
            )
            state.options.contactPersons = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const rules = computed(() => {
    return {
        formNotification: {
            date_time: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            user: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            note: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            recurring: {}
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formNotification)
    }
}
</script>

<style>
#formNotification .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>