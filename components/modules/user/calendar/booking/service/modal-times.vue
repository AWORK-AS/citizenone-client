<template>
    <Modal size="2xl" :title="$t('bookingServices.times.title', { name: props.service?.name ?? '' })"
        :show="props.isModalOpen" @close="close">
        <template #modal-body>
            <div class="space-y-8">
                <!-- Adding: a period, the weekdays in it, and the times of one day. -->
                <section class="space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('bookingServices.times.addTitle') }}</h3>

                    <Alert type="danger" :text="state.addError.message" v-if="state.addError.message" />

                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div class="space-y-1">
                            <FormLabel for="times_date_start" :label="$t('bookingServices.times.dateFrom')" />
                            <FormDateField id="times_date_start" name="date_start"
                                :placeholder="$t('bookingServices.times.dateFrom')" v-model="state.dateStart" />
                            <FormError :error="state.addError.errors?.date_start?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="times_date_end" :label="$t('bookingServices.times.dateTo')" />
                            <FormDateField id="times_date_end" name="date_end"
                                :placeholder="$t('bookingServices.times.dateTo')" v-model="state.dateEnd" />
                            <FormError :error="state.addError.errors?.date_end?.[0]" />
                        </div>
                    </div>

                    <div class="space-y-1">
                        <p class="text-sm text-gray-600">{{ $t('bookingServices.times.weekdays') }}</p>
                        <div class="flex flex-wrap gap-2" role="group" :aria-label="$t('bookingServices.times.weekdays')">
                            <button v-for="day in WEEKDAYS" :key="day" type="button"
                                :aria-pressed="state.weekdays.includes(day)"
                                class="min-w-12 rounded-lg border px-3 py-1.5 text-sm"
                                :class="state.weekdays.includes(day)
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'"
                                @click="toggleWeekday(day)">
                                {{ $t(`bookingServices.weekdays.${day}`) }}
                            </button>
                        </div>
                    </div>

                    <!-- The generator: cut a window of the day into times. -->
                    <div class="grid grid-cols-2 gap-3 md:grid-cols-6 items-end">
                        <div class="space-y-1">
                            <FormLabel for="times_day_from" :label="$t('bookingServices.times.dayFrom')" />
                            <FormTimeField id="times_day_from" name="day_from" v-model:value="state.dayFrom" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="times_day_to" :label="$t('bookingServices.times.dayTo')" />
                            <FormTimeField id="times_day_to" name="day_to" v-model:value="state.dayTo" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="times_length" :label="$t('bookingServices.times.length')" />
                            <FormNumberField id="times_length" name="length" :min="5"
                                :placeholder="$t('bookingServices.times.length')" v-model="state.length" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="times_gap" :label="$t('bookingServices.times.gap')" />
                            <FormNumberField id="times_gap" name="gap" :min="0"
                                :placeholder="$t('bookingServices.times.gap')" v-model="state.gap" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="times_capacity" :label="$t('bookingServices.times.capacity')" />
                            <FormNumberField id="times_capacity" name="capacity" :min="1"
                                :placeholder="$t('bookingServices.times.capacity')" v-model="state.capacity" />
                        </div>
                        <FormButton type="button" buttonStyle="action" @click="buildRows">
                            <Icon name="ph:magic-wand" class="size-4" aria-hidden="true" />
                            {{ $t('bookingServices.times.build') }}
                        </FormButton>
                    </div>

                    <!-- What will be laid on each day. Editable, since a real day
                         has a lunch break the generator knows nothing about. -->
                    <div class="space-y-2" v-if="state.rows.length">
                        <p class="text-xs text-gray-500">{{ $t('bookingServices.times.rowsHelp') }}</p>
                        <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div v-for="(row, index) in state.rows" :key="index"
                                class="grid grid-cols-[1fr_1fr_64px_32px] items-center gap-2 rounded-lg border border-gray-200 p-2">
                                <FormTimeField :id="`times_row_start_${index}`" :name="`row_start_${index}`"
                                    :aria-label="$t('bookingServices.times.start')" v-model:value="row.start_time" />
                                <FormTimeField :id="`times_row_end_${index}`" :name="`row_end_${index}`"
                                    :aria-label="$t('bookingServices.times.end')" v-model:value="row.end_time" />
                                <FormNumberField :id="`times_row_capacity_${index}`" :name="`row_capacity_${index}`"
                                    :min="1" :placeholder="$t('bookingServices.times.capacity')"
                                    :aria-label="$t('bookingServices.times.capacity')" v-model="row.capacity" />
                                <Tooltip :text="$t('bookingServices.times.removeRow')" position="left">
                                    <button type="button" :aria-label="$t('bookingServices.times.removeRow')"
                                        class="text-gray-500 hover:text-red-600" @click="state.rows.splice(index, 1)">
                                        <Icon name="ph:x" class="size-4" aria-hidden="true" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                        <FormError v-for="(message, key) in rowErrors" :key="key" :error="message" />
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <FormButton type="button" buttonStyle="link" @click="addRow">
                            <Icon name="ph:plus" class="size-4" aria-hidden="true" />
                            {{ $t('bookingServices.times.addRow') }}
                        </FormButton>
                        <div class="flex items-center gap-3">
                            <p class="text-sm text-gray-600" v-if="state.rows.length">
                                {{ $t('bookingServices.times.summary', { times: state.rows.length, days: dayCount }) }}
                            </p>
                            <FormButton type="button" buttonStyle="primary"
                                :disabled="state.isSaving || !state.rows.length || !dayCount" @click="addTimes">
                                {{ $t('bookingServices.times.submit') }}
                            </FormButton>
                        </div>
                    </div>
                </section>

                <!-- What is already there, a day at a time. -->
                <section class="space-y-3 border-t border-gray-200 pt-6">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h3 class="text-sm font-semibold text-gray-900">{{ $t('bookingServices.times.upcomingTitle') }}</h3>
                        <FormButton type="button" buttonStyle="action" buttonSize="xs" v-if="hasUnbooked"
                            :disabled="state.isSaving" @click="state.isClearOpen = true">
                            <Icon name="ph:trash" class="size-4" aria-hidden="true" />
                            {{ $t('bookingServices.times.clearUnbooked') }}
                        </FormButton>
                    </div>

                    <Alert type="danger" :text="state.listError" v-if="state.listError" />

                    <LoadingSpinner :isActive="state.isLoading">
                        <p class="text-sm text-gray-500" v-if="!state.slots.length">
                            {{ $t('bookingServices.times.noUpcoming') }}
                        </p>
                        <div class="max-h-96 space-y-3 overflow-y-auto pr-1" v-else>
                            <div v-for="day in days" :key="day.date" class="space-y-1.5">
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {{ formatDay(day.date) }}
                                </p>
                                <div class="flex flex-wrap gap-2">
                                    <div v-for="slot in day.slots" :key="slot.uuid"
                                        class="flex items-center gap-2 rounded-lg border px-2.5 py-1 text-sm tabular-nums"
                                        :class="slot.booked_count ? 'border-primary/40 bg-primary/5' : 'border-gray-200'">
                                        <span>{{ hhmm(slot.start_time) }}–{{ hhmm(slot.end_time) }}</span>
                                        <span class="text-xs text-primary" v-if="slot.booked_count">
                                            {{ slot.booked_count }} {{ $t('bookingServices.times.booked') }}
                                        </span>
                                        <span class="text-xs text-gray-500" v-if="slot.capacity > 0 && (slot.capacity > 1 || slot.booked_count)">
                                            {{ $t('bookingServices.times.left', { count: slot.capacity }) }}
                                        </span>
                                        <Tooltip :text="slot.booked_count
                                            ? $t('bookingServices.times.bookedCannotDelete')
                                            : $t('bookingServices.times.deleteTime')" position="left">
                                            <button type="button" class="text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                :aria-label="$t('bookingServices.times.deleteTime')"
                                                :disabled="!!slot.booked_count || state.isSaving" @click="deleteSlot(slot)">
                                                <Icon name="ph:x" class="size-3.5" aria-hidden="true" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LoadingSpinner>
                </section>

                <div class="flex justify-end">
                    <FormButton type="button" buttonStyle="action" @click="close">{{ $t('close') }}</FormButton>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.isClearOpen" :message="$t('bookingServices.times.confirmClear')"
                @close="state.isClearOpen = false" @confirm="clearUnbooked" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { bookingTimeSlotService } from '@/components/api/user/BookingTimeSlotService'
import { bookingSlotTimes } from '@/composables/bookingSlotTimes'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    service: {
        type: Object,
        required: false,
        default: null,
    },
})
const emit = defineEmits(['close', 'changed'])

// ISO weekdays, Monday first, the way the API counts them.
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7]

const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    dateStart: moment().format('YYYY-MM-DD'),
    dateEnd: moment().add(4, 'weeks').format('YYYY-MM-DD'),
    weekdays: [1, 2, 3, 4, 5] as number[],
    dayFrom: '08:00',
    dayTo: '12:00',
    length: '20',
    gap: '0',
    capacity: '1',
    rows: [] as { start_time: string, end_time: string, capacity: any }[],
    slots: [] as any[],
    addError: {} as any,
    listError: '',
    isLoading: false,
    isSaving: false,
    isClearOpen: false,
    hasChanged: false,
})

const bookingSettingUuid = computed(() => props.service?.booking_setting?.uuid ?? null)

/** The dates in the period that fall on a chosen weekday, from today on. */
const dayCount = computed(() => {
    const start = moment.max(moment(state.dateStart, 'YYYY-MM-DD', true), moment().startOf('day'))
    const end = moment(state.dateEnd, 'YYYY-MM-DD', true)

    if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) {
        return 0
    }

    let count = 0
    for (const day = start.clone(); !day.isAfter(end, 'day'); day.add(1, 'day')) {
        if (state.weekdays.includes(day.isoWeekday())) count++
    }

    return count
})

const days = computed(() => {
    const grouped = new Map<string, any[]>()

    for (const slot of state.slots) {
        const date = `${slot.date ?? ''}`.substring(0, 10)
        if (!grouped.has(date)) grouped.set(date, [])
        grouped.get(date)!.push(slot)
    }

    return [...grouped.entries()].map(([date, slots]) => ({ date, slots }))
})

const hasUnbooked = computed(() => state.slots.some((slot: any) => !slot.booked_count))

/** The API names a row by index ("slots.2.end_time"); shown once each. */
const rowErrors = computed(() => Object.entries(state.addError.errors ?? {})
    .filter(([key]) => key.startsWith('slots'))
    .map(([, messages]: any) => messages?.[0])
    .filter(Boolean)
    .filter((message, index, all) => all.indexOf(message) === index))

watch(() => props.isModalOpen, (isOpen) => {
    if (!isOpen) return

    state.addError = {}
    state.listError = ''
    state.rows = []
    state.hasChanged = false
    loadSlots()
})

function hhmm(time: string): string {
    return `${time ?? ''}`.substring(0, 5)
}

function formatDay(date: string): string {
    return moment(date).format('dddd DD.MM.YYYY')
}

function toggleWeekday(day: number) {
    state.weekdays = state.weekdays.includes(day)
        ? state.weekdays.filter((chosen) => chosen !== day)
        : [...state.weekdays, day].sort()
}

function buildRows() {
    state.addError = {}
    state.rows = bookingSlotTimes(state.dayFrom, state.dayTo, Number(state.length), Number(state.gap), Number(state.capacity))
}

function addRow() {
    const last = state.rows[state.rows.length - 1]

    state.rows.push({
        start_time: last?.end_time ?? state.dayFrom,
        end_time: '',
        capacity: state.capacity || '1',
    })
}

async function loadSlots() {
    if (!bookingSettingUuid.value) {
        state.slots = []
        return
    }

    state.isLoading = true

    try {
        const response = await bookingTimeSlotService.getTimeSlots(bookingSettingUuid.value)
        state.slots = response?.data || []
    } catch (error: any) {
        state.listError = error?.message || ''
    } finally {
        state.isLoading = false
    }
}

async function addTimes() {
    state.addError = {}

    if (!state.rows.length) {
        state.addError = { message: t('bookingServices.times.noRows') }
        return
    }

    state.isSaving = true

    try {
        const response = await bookingTimeSlotService.createTimeSlots(bookingSettingUuid.value!, {
            date_start: state.dateStart,
            date_end: state.dateEnd,
            weekdays: state.weekdays,
            slots: state.rows.map((row) => ({
                start_time: hhmm(row.start_time),
                end_time: hhmm(row.end_time),
                capacity: Number(row.capacity) || 1,
            })),
        })

        const created = response?.meta?.created ?? 0
        const skipped = response?.meta?.skipped ?? 0
        const message = [
            t('bookingServices.alert.timesCreated', { created }),
            skipped ? t('bookingServices.alert.timesSkipped', { skipped }) : '',
        ].filter(Boolean).join('. ')

        successAlert(`${t('alert.success')}!`, `${message}.`)
        state.rows = []
        state.hasChanged = true
        await loadSlots()
    } catch (error: any) {
        state.addError = error
    } finally {
        state.isSaving = false
    }
}

async function deleteSlot(slot: any) {
    state.listError = ''
    state.isSaving = true

    try {
        await bookingTimeSlotService.deleteTimeSlot(slot.uuid)
        state.slots = state.slots.filter((existing: any) => existing.uuid !== slot.uuid)
        state.hasChanged = true
        successAlert(`${t('alert.success')}!`, `${t('bookingServices.alert.timeDeleted')}.`)
    } catch (error: any) {
        state.listError = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

async function clearUnbooked() {
    state.listError = ''
    state.isSaving = true

    try {
        const response = await bookingTimeSlotService.deleteUnbookedTimeSlots(bookingSettingUuid.value!)
        successAlert(`${t('alert.success')}!`, `${t('bookingServices.alert.timesCleared', { deleted: response?.meta?.deleted ?? 0 })}.`)
        state.hasChanged = true
        await loadSlots()
    } catch (error: any) {
        state.listError = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

function close() {
    if (state.hasChanged) {
        emit('changed')
    }

    emit('close')
}
</script>
