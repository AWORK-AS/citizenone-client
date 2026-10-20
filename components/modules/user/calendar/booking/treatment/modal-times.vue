<template>
    <Modal size="xl" :title="$t('bookableTreatments.times.title', { name: props.treatment?.name ?? '' })"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <div class="space-y-6">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && !state.error?.errors" />

                    <!-- Add times: the same times on every chosen day in a date range -->
                    <form @submit.prevent="addTimes" class="space-y-4 rounded-lg border border-gray-100 p-4"
                        id="formBookableTreatmentTimes">
                        <h4 class="text-sm font-semibold text-gray-900">{{ $t('bookableTreatments.times.add') }}</h4>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <FormLabel for="times_date_start" :label="$t('bookableTreatments.times.from')" />
                                <FormDateField id="times_date_start" name="times_date_start"
                                    v-model="state.form.date_start" />
                                <FormError :error="state.error?.errors?.date_start?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="times_date_end" :label="$t('bookableTreatments.times.to')" />
                                <FormDateField id="times_date_end" name="times_date_end"
                                    v-model="state.form.date_end" />
                                <FormError :error="state.error?.errors?.date_end?.[0]" />
                            </div>
                        </div>

                        <div class="space-y-1">
                            <FormLabel :label="$t('bookableTreatments.times.weekdays')" />
                            <div class="flex flex-wrap gap-2">
                                <button v-for="day in weekdays" :key="day.value" type="button"
                                    class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                                    :class="state.form.weekdays.includes(day.value)
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-200 text-gray-700 hover:border-primary'"
                                    :aria-pressed="state.form.weekdays.includes(day.value)"
                                    @click="toggleWeekday(day.value)">
                                    {{ day.label }}
                                </button>
                            </div>
                            <p class="text-xs text-gray-500">{{ $t('bookableTreatments.times.weekdaysHint') }}</p>
                            <FormError :error="state.error?.errors?.weekdays?.[0]" />
                        </div>

                        <div class="space-y-2">
                            <div v-for="(slot, idx) in state.form.slots" :key="idx"
                                class="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_30px] items-end gap-3">
                                <div class="space-y-1">
                                    <FormLabel :for="`slot_start_${idx}`" :label="$t('bookableTreatments.times.start')" />
                                    <FormTimeField :id="`slot_start_${idx}`" :name="`slot_start_${idx}`"
                                        v-model:value="slot.start_time" />
                                    <FormError :error="state.error?.errors?.[`slots.${idx}.start_time`]?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :for="`slot_end_${idx}`" :label="$t('bookableTreatments.times.end')" />
                                    <FormTimeField :id="`slot_end_${idx}`" :name="`slot_end_${idx}`"
                                        v-model:value="slot.end_time" />
                                    <FormError :error="state.error?.errors?.[`slots.${idx}.end_time`]?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :for="`slot_capacity_${idx}`" :label="$t('bookableTreatments.times.seats')" />
                                    <FormNumberField :id="`slot_capacity_${idx}`" :name="`slot_capacity_${idx}`" :min="1"
                                        v-model="slot.capacity" />
                                    <FormError :error="state.error?.errors?.[`slots.${idx}.capacity`]?.[0]" />
                                </div>
                                <div class="pb-2">
                                    <Tooltip v-if="state.form.slots.length > 1" :text="$t('bookableTreatments.times.removeRow')" position="left">
                                        <button type="button" :aria-label="$t('bookableTreatments.times.removeRow')"
                                            @click="state.form.slots.splice(idx, 1)">
                                            <Icon name="ph:trash" class="h-5 w-5 text-red-700 hover:text-red-600" aria-hidden="true" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                            <FormError :error="state.error?.errors?.slots?.[0]" />
                            <FormButton type="button" buttonStyle="cancel" buttonSize="xs" @click="addRow">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('bookableTreatments.times.addRow') }}
                            </FormButton>
                        </div>

                        <FormButton type="submit" buttonStyle="primary" class="w-full">
                            {{ $t('bookableTreatments.times.create') }}
                        </FormButton>
                    </form>

                    <!-- Upcoming times -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <h4 class="text-sm font-semibold text-gray-900">
                                {{ $t('bookableTreatments.times.upcoming', { count: state.slots.length }) }}
                            </h4>
                            <FormButton v-if="state.slots.some(slot => !slot.booked)" type="button" buttonStyle="danger"
                                buttonSize="xs" @click="state.isClearOpen = true">
                                {{ $t('bookableTreatments.times.clear') }}
                            </FormButton>
                        </div>
                        <p v-if="!state.slots.length" class="text-sm text-gray-500">
                            {{ $t('bookableTreatments.times.none') }}
                        </p>
                        <div v-else class="max-h-80 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-100">
                            <div v-for="slot in state.slots" :key="slot.uuid"
                                class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                <div class="flex items-center gap-3">
                                    <span class="w-36 text-gray-900">{{ formatDate(slot.date) }}</span>
                                    <span class="text-gray-700">{{ formatTime(slot.start_time) }}–{{ formatTime(slot.end_time) }}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <Badge v-if="slot.booked" type="primary" class="text-xxs">
                                        {{ $t('bookableTreatments.times.booked', slot.booked) }}
                                    </Badge>
                                    <span class="text-xs text-gray-500">
                                        {{ $t('bookableTreatments.times.seatsLeft', Number(slot.capacity)) }}
                                    </span>
                                    <Tooltip :text="slot.booked ? $t('bookableTreatments.times.cannotDelete') : $t('bookableTreatments.times.delete')" position="left">
                                        <button type="button" :disabled="!!slot.booked"
                                            :aria-label="$t('bookableTreatments.times.delete')"
                                            class="disabled:opacity-30 disabled:cursor-not-allowed"
                                            @click="deleteSlot(slot)">
                                            <Icon name="ph:trash" class="h-4 w-4 text-red-700" aria-hidden="true" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>

    <DialogConfirmation :isModalOpen="state.isClearOpen" :message="$t('bookableTreatments.times.clearConfirm')"
        @close="state.isClearOpen = false" @confirm="clearAll" />
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { bookingServiceService } from '@/components/api/user/BookingServiceService'
import { useAlert } from '@/composables/alert'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    treatment: { type: Object, default: null },
})
const emit = defineEmits(['close', 'changed'])

const { t, locale } = useI18n()
const { successAlert } = useAlert()

// ISO weekdays, as the server takes them: 1 = Monday ... 7 = Sunday.
const weekdays = computed(() => [1, 2, 3, 4, 5, 6, 7].map(value => ({
    value,
    label: moment().locale(locale.value === 'dk' ? 'da' : locale.value).isoWeekday(value).format('ddd'),
})))

const newRow = () => ({ start_time: '09:00', end_time: '09:30', capacity: 1 as number | string })
const emptyForm = () => ({
    date_start: moment().format('YYYY-MM-DD'),
    date_end: moment().add(4, 'weeks').format('YYYY-MM-DD'),
    weekdays: [1, 2, 3, 4, 5] as number[],
    slots: [newRow()],
})

const state = reactive({
    form: emptyForm(),
    slots: [] as any[],
    error: {} as any,
    isLoading: false,
    isClearOpen: false,
})

const settingUuid = computed(() => (props.treatment as any)?.booking_setting?.uuid as string | undefined)

watch(() => props.isModalOpen, (open) => {
    if (!open) return
    state.form = emptyForm()
    state.error = {}
    fetchSlots()
})

function toggleWeekday(day: number) {
    const i = state.form.weekdays.indexOf(day)
    if (i === -1) state.form.weekdays.push(day)
    else state.form.weekdays.splice(i, 1)
}

// A new row starts where the last one ended, so a run of 30-minute times is
// quick to type in.
function addRow() {
    const last = state.form.slots[state.form.slots.length - 1]
    if (!last?.end_time) {
        state.form.slots.push(newRow())
        return
    }
    const start = moment(last.end_time, 'HH:mm')
    const length = moment(last.end_time, 'HH:mm').diff(moment(last.start_time, 'HH:mm'), 'minutes') || 30
    state.form.slots.push({
        start_time: start.format('HH:mm'),
        end_time: start.clone().add(length, 'minutes').format('HH:mm'),
        capacity: last.capacity,
    })
}

function formatDate(date: string) {
    return moment(date).locale(locale.value === 'dk' ? 'da' : locale.value).format('ddd D. MMM YYYY')
}

function formatTime(time: string) {
    return (time ?? '').slice(0, 5)
}

async function fetchSlots() {
    if (!settingUuid.value) return
    state.isLoading = true
    try {
        const response = await bookingServiceService.getTimeSlots(settingUuid.value)
        state.slots = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function addTimes() {
    if (!settingUuid.value) return
    state.error = {}
    state.isLoading = true
    try {
        const response = await bookingServiceService.createTimeSlots(settingUuid.value, {
            date_start: state.form.date_start,
            date_end: state.form.date_end,
            weekdays: state.form.weekdays,
            slots: state.form.slots.map(slot => ({
                start_time: slot.start_time,
                end_time: slot.end_time,
                capacity: Number(slot.capacity) || 1,
            })),
        })
        const created = (response?.data ?? []).length
        successAlert(`${t('alert.success')}!`, t('bookableTreatments.times.created', created))
        emit('changed')
        await fetchSlots()
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function deleteSlot(slot: any) {
    if (slot.booked) return
    state.error = {}
    state.isLoading = true
    try {
        await bookingServiceService.deleteTimeSlot(slot.uuid)
        state.slots = state.slots.filter(item => item.uuid !== slot.uuid)
        emit('changed')
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function clearAll() {
    state.isClearOpen = false
    if (!settingUuid.value) return
    state.error = {}
    state.isLoading = true
    try {
        await bookingServiceService.deleteAllTimeSlots(settingUuid.value)
        successAlert(`${t('alert.success')}!`, t('bookableTreatments.times.cleared'))
        emit('changed')
        await fetchSlots()
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
