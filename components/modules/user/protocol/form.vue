<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div>
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('protocols.form.protocolName')" />
                    <FormTextField id="name" name="name" :placeholder="$t('protocols.form.protocolName')"
                        v-model="state.formProtocol.name" />
                    <FormError :error="v$?.formProtocol?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="start_date" :label="$t('protocols.form.startDate')" />
                    <FormDateField id="start_date" name="start_date" :placeholder="$t('protocols.form.startDate')"
                        v-model="state.formProtocol.start_date" />
                    <FormError :error="v$?.formProtocol?.start_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.start_date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="end_date" :label="$t('protocols.form.endDate')" />
                    <FormDateField id="end_date" name="end_date" :placeholder="$t('protocols.form.endDate')"
                        v-model="state.formProtocol.end_date" />
                    <FormError :error="v$?.formProtocol?.end_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.end_date?.[0]" />
                </div>
            </div>
            <!-- Task 339: record once a day, or once per time slot on each day.
                 Fixed at creation: the entries are generated from it. -->
            <div class="space-y-2" v-if="props.formType === 'create'">
                <FormLabel for="recording_mode" :label="$t('protocols.form.recordingMode')" />
                <div>
                <div class="inline-flex rounded-lg bg-gray-100 p-0.5" id="recording_mode" role="radiogroup">
                    <button type="button" v-for="option in recordingModes" :key="option.value"
                        role="radio" :aria-checked="state.formProtocol.recording_mode === option.value"
                        @click="state.formProtocol.recording_mode = option.value" :class="[
                            'rounded-md px-4 py-1.5 text-sm font-medium transition',
                            state.formProtocol.recording_mode === option.value
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        ]">
                        {{ option.label }}
                    </button>
                </div>
                </div>
                <p class="text-xs text-gray-500">
                    {{ state.formProtocol.recording_mode === 'hour'
                        ? $t('protocols.form.recordingModeHourHelp')
                        : $t('protocols.form.recordingModeDayHelp') }}
                </p>
            </div>

            <div class="space-y-3 border border-gray-200 rounded-2xl p-4"
                v-if="props.formType === 'create' && state.formProtocol.recording_mode === 'hour'">
                <div>
                    <p class="text-sm font-medium text-gray-900">{{ $t('protocols.form.timeSlots') }}</p>
                    <p class="text-xs text-gray-500">{{ $t('protocols.form.timeSlotsHelp') }}</p>
                </div>

                <!-- Quick fill: one slot per hour across a range. -->
                <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div class="space-y-1">
                        <FormLabel for="slot_range_from" :label="$t('protocols.form.fromHour')" />
                        <FormTimeField id="slot_range_from" name="slot_range_from"
                            v-model:value="state.slotRange.from" placeholder="08:00" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="slot_range_to" :label="$t('protocols.form.toHour')" />
                        <FormTimeField id="slot_range_to" name="slot_range_to"
                            v-model:value="state.slotRange.to" placeholder="16:00" />
                    </div>
                    <FormButton type="button" buttonStyle="action" @click="fillHourlySlots"
                        :disabled="!canFillHourlySlots">
                        {{ $t('protocols.form.fillHourly') }}
                    </FormButton>
                </div>

                <ul class="space-y-2" v-if="state.formProtocol.time_slots.length">
                    <li v-for="(slot, index) in state.formProtocol.time_slots" :key="index"
                        class="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                        <FormTimeField :id="`slot_start_${index}`" :name="`slot_start_${index}`"
                            v-model:value="slot.start_time" :placeholder="$t('protocols.form.slotStart')" />
                        <span class="text-gray-400">&ndash;</span>
                        <FormTimeField :id="`slot_end_${index}`" :name="`slot_end_${index}`"
                            v-model:value="slot.end_time" :placeholder="$t('protocols.form.slotEnd')" />
                        <button type="button" @click="state.formProtocol.time_slots.splice(index, 1)"
                            :aria-label="$t('protocols.form.removeSlot')"
                            class="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-600">
                            <Icon name="ph:trash" class="size-4" />
                        </button>
                    </li>
                </ul>
                <p class="text-sm text-gray-500" v-else>{{ $t('protocols.form.noTimeSlots') }}</p>

                <button type="button" @click="addSlot"
                    class="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    <Icon name="ph:plus" class="size-4" />
                    {{ $t('protocols.form.addSlot') }}
                </button>
                <FormError :error="slotError" />
                <FormError :error="props?.error?.errors?.time_slots?.[0]" />
            </div>

            <div class="space-y-1" v-if="props.formType === 'create'">
                <FormLabel for="citizens" :label="$t('protocols.form.citizens')" />
                <FormSelectMultiple id="citizens" name="citizens" :options="state.citizenOptions"
                    :disabled="!state.formProtocol.start_date || !state.formProtocol.end_date"
                    v-model="state.formProtocol.citizens" />
                <p v-if="!state.formProtocol.start_date || !state.formProtocol.end_date"
                    class="text-xs text-gray-400 mt-1">
                    {{ $t('protocols.form.selectDatesFirst') }}
                </p>
                <FormError :error="v$?.formProtocol?.citizens?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.citizens?.[0]" />
            </div>

            <!-- Recurring toggle -->
            <div class="space-y-1" v-if="props.formType === 'create'">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formProtocol.is_recurring = !state.formProtocol.is_recurring">
                    <FormCheckbox :value="state.formProtocol.is_recurring" />
                    {{ $t('protocols.form.isRecurring') }}
                </div>
            </div>

            <!-- Exclude weekends (only when not recurring) -->
            <div class="space-y-1" v-if="!state.formProtocol.is_recurring">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formProtocol.exclude_weekends = !state.formProtocol.exclude_weekends">
                    <FormCheckbox :value="state.formProtocol.exclude_weekends" />
                    {{ $t('protocols.form.excludeWeekends') }}
                </div>
            </div>

            <!-- Recurrence settings -->
            <div class="space-y-3 border border-gray-200 rounded-2xl p-4" v-if="state.formProtocol.is_recurring && props.formType === 'create'">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="recurring" :label="$t('protocols.form.recurringType')" />
                        <FormSelect id="recurring" :options="state.options.recurringPresets"
                            v-model="state.formProtocol.recurring" />
                        <FormError :error="props?.error?.errors?.recurring?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="recurring_until" :label="$t('protocols.form.recurringUntil')" />
                        <FormDateField id="recurring_until" name="recurring_until"
                            :placeholder="$t('protocols.form.recurringUntil')"
                            v-model="state.formProtocol.recurring_until" />
                        <FormError :error="v$?.formProtocol?.recurring_until?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.recurring_until?.[0]" />
                    </div>
                </div>

                <!-- Custom recurrence fields -->
                <div class="space-y-3" v-if="state.formProtocol.recurring === 'custom'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="frequency" :label="$t('recurring.frequency.frequency')" />
                            <FormSelect id="frequency" :options="state.options.frequencies"
                                v-model="state.formProtocol.frequency" />
                            <FormError :error="v$?.formProtocol?.frequency?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.frequency?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="every" :label="$t('recurring.every')" />
                            <FormNumberField id="every" name="every" :placeholder="$t('recurring.every')"
                                :min="1" v-model="state.formProtocol.every" />
                            <FormError :error="props?.error?.errors?.every?.[0]" />
                        </div>
                    </div>

                    <!-- Weekly: days of week -->
                    <div class="space-y-1" v-if="state.formProtocol.frequency === 'weekly'">
                        <FormLabel for="weekly_on" :label="$t('recurring.frequency.weekly.weekOn')" />
                        <FormSelectMultiple id="weekly_on" name="weekly_on" :options="state.options.weekDays"
                            v-model="state.formProtocol.weekly_on" />
                        <FormError :error="v$?.formProtocol?.weekly_on?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.weekly_on?.[0]" />
                    </div>

                    <!-- Monthly settings -->
                    <div class="space-y-3" v-if="state.formProtocol.frequency === 'monthly'">
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.formProtocol.monthly_on_the_enabled = !state.formProtocol.monthly_on_the_enabled">
                            <FormCheckbox :value="state.formProtocol.monthly_on_the_enabled" />
                            {{ $t('recurring.frequency.onThe.onThe') }}
                        </div>
                        <div v-if="!state.formProtocol.monthly_on_the_enabled" class="space-y-1">
                            <FormLabel for="monthly_each" :label="$t('recurring.frequency.monthly.each')" />
                            <FormSelectMultiple id="monthly_each" name="monthly_each"
                                :options="state.options.monthlyDays" v-model="state.formProtocol.monthly_each" />
                            <FormError :error="props?.error?.errors?.monthly_each?.[0]" />
                        </div>
                        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="monthly_on_the_sequence"
                                    :label="$t('recurring.frequency.onThe.onThe')" />
                                <FormSelect id="monthly_on_the_sequence" :options="state.options.sequences"
                                    v-model="state.formProtocol.monthly_on_the_sequence" />
                                <FormError :error="props?.error?.errors?.monthly_on_the_sequence?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="monthly_on_the_day" :label="$t('recurring.frequency.monthly.day')" />
                                <FormSelect id="monthly_on_the_day" :options="state.options.onTheDays"
                                    v-model="state.formProtocol.monthly_on_the_day" />
                                <FormError :error="props?.error?.errors?.monthly_on_the_day?.[0]" />
                            </div>
                        </div>
                    </div>

                    <!-- Yearly settings -->
                    <div class="space-y-3" v-if="state.formProtocol.frequency === 'yearly'">
                        <div class="space-y-1">
                            <FormLabel for="yearly_in_months" :label="$t('recurring.frequency.yearly.yearIn')" />
                            <FormSelectMultiple id="yearly_in_months" name="yearly_in_months"
                                :options="state.options.months" v-model="state.formProtocol.yearly_in_months" />
                            <FormError :error="props?.error?.errors?.yearly_in_months?.[0]" />
                        </div>
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.formProtocol.yearly_on_the_enabled = !state.formProtocol.yearly_on_the_enabled">
                            <FormCheckbox :value="state.formProtocol.yearly_on_the_enabled" />
                            {{ $t('recurring.frequency.onThe.onThe') }}
                        </div>
                        <div v-if="state.formProtocol.yearly_on_the_enabled" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="yearly_on_the_sequence"
                                    :label="$t('recurring.frequency.onThe.onThe')" />
                                <FormSelect id="yearly_on_the_sequence" :options="state.options.sequences"
                                    v-model="state.formProtocol.yearly_on_the_sequence" />
                                <FormError :error="props?.error?.errors?.yearly_on_the_sequence?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="yearly_on_the_day"
                                    :label="$t('recurring.frequency.yearly.daysOfWeek')" />
                                <FormSelect id="yearly_on_the_day" :options="state.options.onTheDays"
                                    v-model="state.formProtocol.yearly_on_the_day" />
                                <FormError :error="props?.error?.errors?.yearly_on_the_day?.[0]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/protocols')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
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
    selectedProtocol: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    citizenOptions: [],
    error: {} as Error,
    formProtocol: {
        name: '',
        start_date: '',
        end_date: '',
        citizens: [],
        exclude_weekends: false,
        recording_mode: 'day' as 'day' | 'hour',
        time_slots: [] as { start_time: string, end_time: string }[],
        is_recurring: false,
        recurring: 'every_week',
        recurring_until: '',
        frequency: 'weekly',
        every: '1',
        weekly_on: [] as string[],
        monthly_on_the_enabled: false,
        monthly_each: [] as number[],
        monthly_on_the_sequence: 'first',
        monthly_on_the_day: 'monday',
        yearly_in_months: [] as string[],
        yearly_on_the_enabled: false,
        yearly_on_the_sequence: 'first',
        yearly_on_the_day: 'monday',
    },
    slotRange: { from: '08:00', to: '16:00' },
    submitted: false,
    options: {
        recurringPresets: [] as any[],
        frequencies: [] as any[],
        weekDays: [] as any[],
        monthlyDays: [] as any[],
        sequences: [] as any[],
        onTheDays: [] as any[],
        months: [] as any[],
    },
})

const recordingModes = computed(() => [
    { value: 'day' as const, label: t('protocols.form.perDay') },
    { value: 'hour' as const, label: t('protocols.form.perHour') },
])

const toMinutes = (time: string) => {
    const [hours, minutes] = (time || '').split(':').map(Number)
    return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : NaN
}

const toTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const canFillHourlySlots = computed(() =>
    toMinutes(state.slotRange.to) - toMinutes(state.slotRange.from) >= 60)

// One slot per whole hour from "from" to "to"; a part-hour left at the end is
// dropped rather than turned into a short slot nobody asked for.
function fillHourlySlots() {
    const from = toMinutes(state.slotRange.from)
    const to = toMinutes(state.slotRange.to)
    const slots = []

    for (let start = from; start + 60 <= to; start += 60) {
        slots.push({ start_time: toTime(start), end_time: toTime(start + 60) })
    }

    state.formProtocol.time_slots = slots
}

// A new slot starts where the last one ended, so adding hours is one tap each.
function addSlot() {
    const last = state.formProtocol.time_slots[state.formProtocol.time_slots.length - 1]
    const start = last ? toMinutes(last.end_time) : toMinutes(state.slotRange.from)
    const safeStart = Number.isFinite(start) && start + 60 <= 24 * 60 ? start : 8 * 60

    state.formProtocol.time_slots.push({ start_time: toTime(safeStart), end_time: toTime(safeStart + 60) })
}

// The server checks the same rules; checking here saves a round trip.
const slotError = computed(() => {
    if (state.formProtocol.recording_mode !== 'hour' || !state.submitted) return ''

    const slots = [...state.formProtocol.time_slots]
        .filter((slot) => slot.start_time && slot.end_time)
        .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time))

    if (slots.length === 0) return t('protocols.form.errors.timeSlotsRequired')
    if (slots.some((slot) => toMinutes(slot.end_time) <= toMinutes(slot.start_time))) {
        return t('protocols.form.errors.timeSlotEndAfterStart')
    }
    if (slots.some((slot, i) => i > 0 && toMinutes(slot.start_time) < toMinutes(slots[i - 1].end_time))) {
        return t('protocols.form.errors.timeSlotsOverlap')
    }

    return ''
})

function buildOptions() {
    state.options.recurringPresets = [
        { value: 'everyday', label: t('recurring.everyDay') },
        { value: 'every_week', label: t('recurring.everyWeek') },
        { value: 'every_second_week', label: t('recurring.everySecondWeek') },
        { value: 'every_third_week', label: t('recurring.everyThirdWeek') },
        { value: 'every_fourth_week', label: t('recurring.everyFourthWeek') },
        { value: 'every_month', label: t('recurring.everyMonth') },
        { value: 'every_year', label: t('recurring.everyYear') },
        { value: 'custom', label: t('recurring.custom') },
    ]
    state.options.frequencies = [
        { value: 'daily', label: t('recurring.frequency.daily.daily') },
        { value: 'weekly', label: t('recurring.frequency.weekly.weekly') },
        { value: 'monthly', label: t('recurring.frequency.monthly.monthly') },
        { value: 'yearly', label: t('recurring.frequency.yearly.yearly') },
    ]
    state.options.weekDays = [
        { value: 'monday', label: t('recurring.days.monday') },
        { value: 'tuesday', label: t('recurring.days.tuesday') },
        { value: 'wednesday', label: t('recurring.days.wednesday') },
        { value: 'thursday', label: t('recurring.days.thursday') },
        { value: 'friday', label: t('recurring.days.friday') },
        { value: 'saturday', label: t('recurring.days.saturday') },
        { value: 'sunday', label: t('recurring.days.sunday') },
    ]
    state.options.monthlyDays = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
    state.options.sequences = [
        { value: 'first', label: t('recurring.frequency.onThe.first') },
        { value: 'second', label: t('recurring.frequency.onThe.second') },
        { value: 'third', label: t('recurring.frequency.onThe.third') },
        { value: 'fourth', label: t('recurring.frequency.onThe.fourth') },
        { value: 'fifth', label: t('recurring.frequency.onThe.fifth') },
        { value: 'last', label: t('recurring.frequency.onThe.last') },
        { value: 'next_to_last', label: t('recurring.frequency.onThe.nextToLast') },
    ]
    state.options.onTheDays = [
        { value: 'monday', label: t('recurring.days.monday') },
        { value: 'tuesday', label: t('recurring.days.tuesday') },
        { value: 'wednesday', label: t('recurring.days.wednesday') },
        { value: 'thursday', label: t('recurring.days.thursday') },
        { value: 'friday', label: t('recurring.days.friday') },
        { value: 'saturday', label: t('recurring.days.saturday') },
        { value: 'sunday', label: t('recurring.days.sunday') },
        { value: 'weekday', label: t('recurring.days.weekday') },
        { value: 'weekend_day', label: t('recurring.days.weekendDay') },
    ]
    state.options.months = [
        { value: 'january', label: t('recurring.frequency.yearly.january') },
        { value: 'february', label: t('recurring.frequency.yearly.february') },
        { value: 'march', label: t('recurring.frequency.yearly.march') },
        { value: 'april', label: t('recurring.frequency.yearly.april') },
        { value: 'may', label: t('recurring.frequency.yearly.may') },
        { value: 'june', label: t('recurring.frequency.yearly.june') },
        { value: 'july', label: t('recurring.frequency.yearly.july') },
        { value: 'august', label: t('recurring.frequency.yearly.august') },
        { value: 'september', label: t('recurring.frequency.yearly.september') },
        { value: 'october', label: t('recurring.frequency.yearly.october') },
        { value: 'november', label: t('recurring.frequency.yearly.november') },
        { value: 'december', label: t('recurring.frequency.yearly.december') },
    ]
}

onMounted(() => {
    buildOptions()
})

watch(() => props.selectedProtocol, (newValue: any) => {
    if (newValue != null) {
        state.formProtocol = {
            ...state.formProtocol,
            name: newValue.name,
            start_date: newValue.start_date,
            end_date: newValue.end_date,
            citizens: newValue.citizens,
            exclude_weekends: newValue.exclude_weekends,
        }
    }
})

const rules = computed(() => {
    const base: any = {
        formProtocol: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            start_date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            end_date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }

    if (props.formType === 'create') {
        base.formProtocol.citizens = {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        }

        if (state.formProtocol.is_recurring) {
            base.formProtocol.recurring_until = {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            }

            if (state.formProtocol.recurring === 'custom') {
                base.formProtocol.frequency = {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                }

                if (state.formProtocol.frequency === 'weekly') {
                    base.formProtocol.weekly_on = {
                        required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                    }
                }
            }
        }
    }

    return base
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.submitted = true
    v$.value.$validate()
    if (!v$.value.$error && !slotError.value) {
        emit('submitForm', state.formProtocol)
    }
}

watch(() => state.formProtocol.start_date, () => {
    fetchAvailableCitizens()
})

watch(() => state.formProtocol.end_date, () => {
    fetchAvailableCitizens()
})

async function fetchAvailableCitizens() {
    if (state.formProtocol.start_date && state.formProtocol.end_date) {
        state.error = {}
        emit('isPageLoading', true)
        try {
            const params = {
                start_date: state.formProtocol.start_date,
                end_date: state.formProtocol.end_date,
            }
            const response = await citizenService.getAllAvailableCitizens(params)
            if (response.data) {
                let options: any = []
                response.data.forEach(
                    (citizen: any) => options.push({
                        value: citizen?.id,
                        label: citizen?.firstname + " " + citizen?.lastname,
                    })
                )
                state.citizenOptions = options
            }
        } catch (error: any) {
            state.error = error
        }
        emit('isPageLoading', false)
    }
}
</script>
